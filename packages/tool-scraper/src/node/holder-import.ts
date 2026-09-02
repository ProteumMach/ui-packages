/**
 * Measuring a mirrored holder through the Toolpath Engine API.
 *
 * The step between `node/cad-mirror.ts`, which puts a vendor's STEP file on
 * disk, and `profiles.ts`, which turns a measurement into a drawing's
 * silhouette. Five calls per holder: create, upload, queue, poll, read.
 *
 * **This is what deleted the Fusion dependency.** The pipeline this replaces
 * could only measure a holder on a machine running Fusion 360 with an MCP
 * bridge attached to it — roughly 1,800 lines of Python driving a GUI
 * application. The same numbers now come back in about two seconds over HTTP,
 * to nanometre agreement, from something that can run in CI.
 *
 * ## Why it is in `node/` and not in the library half
 *
 * The same three reasons `cad-mirror.ts` gives for itself, and they all hold
 * here: it reads a mirrored binary off disk, it is a batch job with pacing
 * rather than a request-scoped call, and it is a maintainer's command rather
 * than something a backend embeds.
 *
 * ## Why it does not go through `fetch.Fetcher`
 *
 * `Fetcher` is four GET-and-decode shapes for anonymous vendor endpoints. This
 * needs a bearer token, a PUT of raw bytes to a presigned URL and a PATCH with
 * an idempotency header, and widening a public interface every consumer may
 * have implemented — to serve one maintainer's command — is a break bought for
 * nothing. So the transport is small and local, and injectable the same way
 * `fetch.FetcherOptions.fetch` is, which is what lets a test drive the whole
 * five-call flow with no stack behind it.
 *
 * **`@toolpath/api` is deliberately not a dependency.** This package takes one
 * runtime dependency today and a second is a decision every consumer inherits;
 * the generated SDK is pinned to `openapi/openapi.json` at v1.1.0, which has no
 * holder routes at all, so it could not make these calls until that pin moves.
 *
 * ## What refuses, and what is survivable
 *
 * The split is `holding.ts`'s, for the same reason: a failed **job** is one
 * holder's model the kernel could not read, so it is an `IncompletePartError`
 * and {@link measureFamily} warns and drops it — losing a 431-holder batch to
 * one bad STEP file is not a trade worth making. Anything else — a transport
 * failure, a non-2xx, a response whose shape this cannot read — is a
 * `VendorResponseError` and stops the run.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { IncompletePartError, VendorResponseError } from '../errors.js'
import type { HolderRecord } from '../holding.js'
import type { HolderLayer, ImportOptions, MeasuredHolder, TaperFamily } from '../profiles.js'
import { TAPER_FAMILIES } from '../profiles.js'
import { REQUEST_DELAY_MS, consoleWarn, pause, type Warn } from '../scrape.js'
import { stepFileName } from './cad-mirror.js'

/** Where the holder routes are. Set it to `http://localhost:4000` for development. */
export const API_URL_ENV = 'TOOLPATH_API_URL'

/**
 * The bearer token, **from the environment only**.
 *
 * Never a flag, never a file path this package reads, never logged, never
 * written into a receipt and never echoed in an error — an API key that reaches
 * a terminal reaches a shell history and a CI log with it.
 */
export const API_KEY_ENV = 'TOOLPATH_API_KEY'

/** Where the API is when nothing says otherwise. */
export const DEFAULT_API_URL = 'https://api.toolpath.com'

/**
 * The import options this pipeline measures with.
 *
 * `tolerance` matches the reference implementation's, and there is deliberately
 * no segment budget behind it: a real BT30-ER16 is 69 segments at 0.01 mm and
 * still 51 at 1.0 mm, because those are grooves and thread reliefs rather than
 * sampling noise, and relaxing toward a budget inflates the holder until the
 * flange-to-taper step is swallowed and the cone stops being detectable.
 *
 * **`fillBays` is off, and that is the fork.** Raising each solid's enclosed
 * bays to their brims — the V-flange groove, the thread relief — is right for a
 * collision envelope and wrong for a drawing: the groove and the relief are
 * what a machinist looks for, so the literal silhouette is the honest thing to
 * store. The consumer here is `@toolpath/tool-drawing`, so it is off, and the
 * option is recorded in the document so nothing downstream has to guess which
 * it got. A second run with it on, for a Fusion collision library, is a later
 * optional step rather than a fork in this code.
 *
 * `flipped` is an override for a holder the automatic orientation reads
 * backwards, not a setting: the automatic pass reads the 7:24 taper and got
 * every validated holder right.
 */
export const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  tolerance: 0.05,
  fillBays: false,
  flipped: false,
}

/** Milliseconds between polls of an import job. Imports finish in about two seconds. */
export const POLL_INTERVAL_MS = 500

/** Milliseconds before an import job that never settles is abandoned. */
export const POLL_TIMEOUT_MS = 120_000

/** The resolved API base URL, without its trailing slash. */
export function apiUrl(): string {
  return (process.env[API_URL_ENV] || DEFAULT_API_URL).replace(/\/+$/, '')
}

/**
 * One line naming the resolved API base URL and how it was resolved.
 *
 * Printed by every command that measures, for the reason `paths.describeRoot`
 * is printed by every command that scrapes: production is still Engine API
 * v1.1.0 and carries none of these routes, so a run that went somewhere
 * surprising should say so on the way rather than be discovered in a 404.
 */
export function describeApi(): string {
  const how = process.env[API_URL_ENV] ? 'set' : 'default'
  return `holder API: ${apiUrl()} (${API_URL_ENV} ${how})`
}

/** How to reach the API. Every field has an environment or a constant behind it. */
export interface HolderApiOptions {
  /** Defaults to {@link apiUrl}. */
  baseUrl?: string
  /** Defaults to `process.env[API_KEY_ENV]`. */
  apiKey?: string
  /** Injectable, so a test drives the five calls with no stack behind them. */
  fetch?: typeof globalThis.fetch
  timeoutMs?: number
  pollIntervalMs?: number
  pollTimeoutMs?: number
}

/** The transport {@link measureHolder} makes its five calls through. */
export interface HolderApi {
  /** One authenticated call to a path under the base URL, decoded as JSON. */
  call<T>(method: string, path: string, headers?: Record<string, string>): Promise<T>
  /** One PUT of raw bytes to a presigned URL, which carries its own authentication. */
  put(url: string, body: Uint8Array): Promise<void>
  readonly pollIntervalMs: number
  readonly pollTimeoutMs: number
}

/**
 * The transport, authenticated and timed out.
 *
 * Refuses at construction when no key is set rather than at the first request:
 * a batch that authenticated per holder would fail on holder one after mirroring
 * the whole family, and the message would be about a 401 instead of about an
 * unset variable.
 */
export function createHolderApi(options: HolderApiOptions = {}): HolderApi {
  const {
    baseUrl = apiUrl(),
    apiKey = process.env[API_KEY_ENV] ?? '',
    fetch: send = globalThis.fetch,
    timeoutMs = 60_000,
    pollIntervalMs = POLL_INTERVAL_MS,
    pollTimeoutMs = POLL_TIMEOUT_MS,
  } = options

  if (!apiKey) {
    throw new VendorResponseError(
      API_KEY_ENV,
      'is not set — the holder routes are authenticated, and this package ' +
        'reads the key from the environment and from nowhere else',
    )
  }

  async function request(url: string, init: RequestInit): Promise<Response> {
    const response = await send(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) {
      // The status and the path, never the body: an error body from an
      // authenticated endpoint is the one place a token could be echoed back.
      throw new VendorResponseError(
        `${init.method ?? 'GET'} ${new URL(url).pathname}`,
        `the holder API answered ${response.status}`,
      )
    }
    return response
  }

  return {
    pollIntervalMs,
    pollTimeoutMs,

    async call<T>(method: string, path: string, headers: Record<string, string> = {}) {
      const response = await request(`${baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${apiKey}`, ...headers },
      })
      return (await response.json()) as T
    },

    async put(url, body) {
      await request(url, { method: 'PUT', body })
    },
  }
}

/** `?tolerance=…&fillBays=…&flipped=…`, in the order the API documents them. */
function importQuery(options: ImportOptions): string {
  return (
    `?tolerance=${options.tolerance}` +
    `&fillBays=${options.fillBays}` +
    `&flipped=${options.flipped}`
  )
}

/**
 * A key that makes re-running an interrupted family free rather than expensive.
 *
 * Derived from the part and the options it is being measured with, so the same
 * holder queued twice with the same settings is one import — which is what
 * stops a batch that died at holder 400 of 431 from queueing 400 duplicates on
 * the way back to where it stopped.
 */
export function idempotencyKey(catalogNumber: string, options: ImportOptions): string {
  return `${catalogNumber} ${options.tolerance} ${options.fillBays} ${options.flipped}`.replaceAll(
    /[^\x20-\x7e]/g,
    '-',
  )
}

/** A field of a JSON response, named so a shape change says which one moved. */
function field(body: unknown, key: string, what: string): unknown {
  const value = (body as Record<string, unknown> | null)?.[key]
  if (value === undefined) {
    throw new VendorResponseError(what, `the holder API response carries no ${key}`)
  }
  return value
}

function stringField(body: unknown, key: string, what: string): string {
  const value = field(body, key, what)
  if (typeof value !== 'string') {
    throw new VendorResponseError(what, `${key} is ${typeof value}, expected a string`)
  }
  return value
}

function numberOrNull(body: unknown, key: string, what: string): number | null {
  const value = field(body, key, what)
  if (value !== null && typeof value !== 'number') {
    throw new VendorResponseError(what, `${key} is ${typeof value}, expected a number or null`)
  }
  return value
}

/**
 * A `HolderResponse` as the fields a profile needs, and nothing else.
 *
 * **The one place the API's shape is read**, so a route that changes fails here
 * naming the field rather than as an undefined three transforms downstream. The
 * quality signals it drops — `axisAreaFraction`, `faceCount`, `sampleCount` —
 * are read and reported by {@link measureFamily} rather than carried, because
 * they say something about a run and nothing about the shape of the holder.
 */
export function parseHolderResponse(
  body: unknown,
  part: { brand: MeasuredHolder['brand']; catalogNumber: string },
): MeasuredHolder {
  const what = part.catalogNumber

  const layers = field(body, 'layers', what)
  if (!Array.isArray(layers)) {
    throw new VendorResponseError(what, 'layers is not an array')
  }

  const taperFamily = field(body, 'taperFamily', what)
  if (taperFamily !== null && !TAPER_FAMILIES.includes(taperFamily as TaperFamily)) {
    throw new VendorResponseError(
      what,
      `taperFamily is ${JSON.stringify(taperFamily)} (known: ${TAPER_FAMILIES.join(', ')})`,
    )
  }

  const options = field(body, 'options', what)

  return {
    brand: part.brand,
    catalogNumber: part.catalogNumber,
    layers: layers.map((layer, index) => cone(layer, `${what} layer ${index}`)),
    gaugeLength: numberOrNull(body, 'gaugeLength', what),
    sizeClass: numberOrNull(body, 'sizeClass', what),
    taperFamily: taperFamily as TaperFamily | null,
    kernelVersion: stringField(body, 'kernelVersion', what),
    options: {
      tolerance: numberOrNull(options, 'tolerance', what) ?? 0,
      fillBays: field(options, 'fillBays', what) === true,
      flipped: field(options, 'flipped', what) === true,
    },
  }
}

function cone(layer: unknown, what: string): HolderLayer {
  const read = (key: keyof HolderLayer): number => {
    const value = field(layer, key, what)
    if (typeof value !== 'number') {
      throw new VendorResponseError(what, `${key} is ${typeof value}, expected a number`)
    }
    return value
  }
  return {
    thickness: read('thickness'),
    bottomDiameter: read('bottomDiameter'),
    topDiameter: read('topDiameter'),
  }
}

/**
 * One mirrored STEP file, measured.
 *
 * The five calls of the contract, in order, with the poll in the middle: create
 * a holder and take its presigned upload URL, PUT the bytes, queue the import,
 * wait for the job, read the result.
 *
 * Polling rather than the job's SSE stream, because a batch of 431 wants a
 * simple loop and every validated import settled in about two seconds.
 */
export async function measureHolder(
  api: HolderApi,
  part: { brand: MeasuredHolder['brand']; catalogNumber: string },
  step: Uint8Array,
  options: ImportOptions = DEFAULT_IMPORT_OPTIONS,
): Promise<MeasuredHolder> {
  const what = part.catalogNumber
  const file = stepFileName(part.catalogNumber)

  const created = await api.call<unknown>(
    'POST',
    `/v1/holders?filename=${encodeURIComponent(file)}`,
  )
  const holderId = stringField(created, 'holderId', what)
  await api.put(stringField(created, 'uploadUrl', what), step)

  const queued = await api.call<unknown>(
    'PATCH',
    `/v1/holders/${holderId}${importQuery(options)}`,
    { 'Idempotency-Key': idempotencyKey(part.catalogNumber, options) },
  )
  const jobId = stringField(queued, 'jobId', what)

  await awaitJob(api, jobId, what)

  return parseHolderResponse(
    await api.call<unknown>('GET', `/v1/holders/${holderId}?jobId=${jobId}`),
    part,
  )
}

/**
 * Wait for one import job to settle.
 *
 * A `failed` job is an `IncompletePartError` — one holder whose model the
 * kernel could not read, which {@link measureFamily} warns about and drops. A
 * job that never settles is a `VendorResponseError`, because a batch that hung
 * on holder one is a stack that is not working rather than a holder that is not
 * measurable.
 */
async function awaitJob(api: HolderApi, jobId: string, what: string): Promise<void> {
  const deadline = Date.now() + api.pollTimeoutMs

  for (;;) {
    const job = await api.call<unknown>('GET', `/v1/jobs/${jobId}`)
    const status = stringField(job, 'status', what)

    if (status === 'succeeded') return
    if (status === 'failed') {
      const error = (job as { error?: unknown }).error
      throw new IncompletePartError(
        what,
        `the holder import failed: ${typeof error === 'string' && error ? error : 'no reason given'}`,
      )
    }
    if (Date.now() >= deadline) {
      throw new VendorResponseError(
        what,
        `the holder import was still ${status} after ${Math.round(api.pollTimeoutMs / 1000)}s`,
      )
    }
    await pause(api.pollIntervalMs)
  }
}

/** One holder's mirrored STEP file, or null where the vendor published none. */
export function readMirroredStep(stepRoot: string, catalogNumber: string): Uint8Array | null {
  try {
    return readFileSync(join(stepRoot, stepFileName(catalogNumber)))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

/** What one family's measurement run produced, and what it did not. */
export interface MeasuredFamily {
  readonly measured: MeasuredHolder[]
  /** Holders whose STEP file is not mirrored on this machine. */
  readonly unmirrored: string[]
  /** Holders whose import the kernel refused. */
  readonly failed: string[]
}

/**
 * Every holder of one family that has a mirrored model, measured, paced.
 *
 * **A holder with no mirrored file is counted, not failed.** MariTool publishes
 * no STEP model for about a third of its parts and none at all for its CAT50
 * line, so an absent file is the ordinary case rather than a fault, and
 * `cad-mirror.cadCoverage` is what says how many there will be before any of
 * this runs.
 *
 * The pace is the mirror's, and for the same reason: this is a maintainer's
 * batch against a service, and 431 imports arriving as fast as a loop can issue
 * them is a different kind of request than one holder being measured.
 */
export async function measureFamily(
  api: HolderApi,
  holders: readonly HolderRecord[],
  stepRoot: string,
  options: ImportOptions = DEFAULT_IMPORT_OPTIONS,
  delayMs: number = REQUEST_DELAY_MS,
  warn: Warn = consoleWarn,
): Promise<MeasuredFamily> {
  const measured: MeasuredHolder[] = []
  const unmirrored: string[] = []
  const failed: string[] = []

  for (const holder of holders) {
    const step = readMirroredStep(stepRoot, holder.catalogNumber)
    if (step === null) {
      unmirrored.push(holder.catalogNumber)
      continue
    }

    if (measured.length + failed.length > 0) await pause(delayMs)
    try {
      measured.push(await measureHolder(api, holder, step, options))
    } catch (error) {
      if (!(error instanceof IncompletePartError)) throw error
      warn(`  WARNING: ${error.message} — no profile written for it`)
      failed.push(holder.catalogNumber)
    }
  }

  return { measured, unmirrored, failed }
}
