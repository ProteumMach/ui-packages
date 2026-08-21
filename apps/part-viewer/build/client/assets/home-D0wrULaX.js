import { a as r, p as s, t as y, w as g } from './chunk-62JRHF6Z-BcGjj7J7.js'
import { B as f, C as b, A as C } from './index-B42bokgZ.js'
import './index-Bm4wH5ZD.js'
const w = ({ error: e, isConnecting: t, onConnect: n }) => {
    const a = r.useRef(null),
      i = async (o) => {
        o.preventDefault()
        const l = new FormData(o.currentTarget).get('apiKey')
        if (typeof l == 'string')
          try {
            ;(await n(l), a.current?.reset())
          } catch {}
      }
    return s.jsxs('form', {
      ref: a,
      onSubmit: i,
      className: 'mt-8 space-y-4',
      children: [
        s.jsxs('label', {
          className: 'block text-sm font-semibold text-zinc-100',
          htmlFor: 'apiKey',
          children: [
            'Toolpath Engine API key',
            s.jsx('input', {
              id: 'apiKey',
              name: 'apiKey',
              type: 'text',
              required: !0,
              autoComplete: 'off',
              autoCapitalize: 'off',
              autoCorrect: 'off',
              spellCheck: !1,
              'data-1p-ignore': 'true',
              'data-lpignore': 'true',
              className:
                'api-key-input mt-2 block w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-3 font-mono text-sm text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-info/75',
            }),
          ],
        }),
        e ? s.jsx('p', { role: 'alert', className: 'text-sm text-red-200', children: e }) : null,
        s.jsx(f, {
          type: 'submit',
          variant: 'primary',
          size: 'lg',
          isLoading: t,
          disabled: t,
          children: 'Connect',
        }),
      ],
    })
  },
  j = 100 * 1024 * 1024,
  h = ['.iges', '.igs', '.sldprt', '.step', '.stp', '.x_b', '.x_t'],
  S = (e) => h.some((t) => e.toLowerCase().endsWith(t)),
  k = (e) =>
    e.size
      ? S(e.name)
        ? e.size > j
          ? 'CAD files must be 100 MiB or smaller.'
          : null
        : `Supported files: ${h.join(', ')}.`
      : 'Choose a non-empty CAD file to analyze.',
  z = (e) => {
    switch (e) {
      case 'creating-part':
        return 'Creating part…'
      case 'uploading-file':
        return 'Uploading file…'
      case 'starting-analysis':
        return 'Starting analysis…'
      default:
        return 'Analyze part'
    }
  },
  A = ({ error: e, status: t, onUpload: n, onDisconnect: a, isDisconnecting: i }) => {
    const [o, l] = r.useState(null),
      d = t !== 'idle',
      c = d || i
    return s.jsxs('div', {
      className: 'mt-8 space-y-6',
      children: [
        s.jsxs('div', {
          className: 'space-y-4',
          children: [
            s.jsxs('label', {
              className: 'block text-sm font-semibold text-zinc-100',
              htmlFor: 'part',
              children: [
                'CAD file',
                s.jsx('input', {
                  id: 'part',
                  name: 'part',
                  type: 'file',
                  required: !0,
                  accept: h.join(','),
                  onChange: (m) => l(m.currentTarget.files?.item(0) ?? null),
                  className:
                    'mt-2 block w-full cursor-pointer rounded-lg border border-zinc-700 bg-transparent px-3 py-3 text-sm text-zinc-300 file:mr-4 file:rounded file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-800',
                }),
              ],
            }),
            s.jsx('p', {
              className: 'text-xs text-zinc-500',
              children: 'Supported: STEP, IGES, SolidWorks part, Parasolid. Maximum 100 MiB.',
            }),
            e
              ? s.jsx('p', { role: 'alert', className: 'text-sm text-red-200', children: e })
              : null,
            s.jsx(f, {
              type: 'button',
              variant: 'primary',
              size: 'lg',
              isLoading: d,
              disabled: !o || c,
              onClick: () => {
                o && n(o)
              },
              children: z(t),
            }),
          ],
        }),
        s.jsx(f, {
          type: 'button',
          variant: 'muted',
          isLoading: i,
          disabled: c,
          onClick: () => {
            a()
          },
          children: 'Disconnect API key',
        }),
      ],
    })
  }
class p extends Error {
  constructor(t, n) {
    ;(super(t), (this.status = n), (this.name = 'AppApiError'))
  }
  status
}
const u = async (e, t) => {
    const n = await fetch(e, { credentials: 'same-origin', ...t })
    if (!n.ok) {
      const a = await n.json().catch(() => null)
      throw new p(a?.message ?? 'Request failed.', n.status)
    }
    return n.status === 204 ? void 0 : await n.json()
  },
  N = () => u('/api/session', { signal: AbortSignal.timeout(5e3) }),
  v = (e) =>
    u('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: e }),
    }),
  E = () => u('/api/session', { method: 'DELETE' }),
  T = async (e, t) => {
    let n
    try {
      n = await fetch(t, {
        method: 'PUT',
        headers: e.type ? { 'Content-Type': e.type } : void 0,
        body: e,
      })
    } catch {
      throw new p('Could not upload the CAD file. Check your connection and try again.', 502)
    }
    if (!n.ok) throw new p(`Could not upload the CAD file (HTTP ${n.status}).`, n.status)
  },
  P = async (e, { onPhaseChange: t } = {}) => {
    const n = k(e)
    if (n) throw new p(n, 400)
    t?.('creating-part')
    const { partId: a, uploadUrl: i } = await u('/api/parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: e.name }),
    })
    return (
      t?.('uploading-file'),
      await T(e, i),
      t?.('starting-analysis'),
      u(`/api/parts/${encodeURIComponent(a)}/analyze`, { method: 'POST' })
    )
  },
  x = (e) => (e instanceof p ? e.message : 'Could not complete that request. Try again.'),
  D = () => {
    const e = y(),
      [t, n] = r.useState('idle'),
      [a, i] = r.useState(null),
      o = r.useCallback(
        async (l) => {
          i(null)
          try {
            const { partId: d, jobId: c } = await P(l, { onPhaseChange: n })
            await e(`/parts/${encodeURIComponent(d)}?job=${encodeURIComponent(c)}`)
          } catch (d) {
            ;(n('idle'), i(x(d)))
          }
        },
        [e],
      )
    return { status: t, error: a, upload: o }
  },
  U = () => {
    const [e, t] = r.useState('checking'),
      [n, a] = r.useState('idle'),
      [i, o] = r.useState(null)
    r.useEffect(() => {
      N()
        .then(({ connected: c }) => t(c ? 'connected' : 'disconnected'))
        .catch(() => t('disconnected'))
    }, [])
    const l = r.useCallback(async (c) => {
        ;(a('connecting'), o(null))
        try {
          ;(await v(c), t('connected'))
        } catch (m) {
          throw (o(x(m)), m)
        } finally {
          a('idle')
        }
      }, []),
      d = r.useCallback(async () => {
        ;(a('disconnecting'), o(null))
        try {
          ;(await E(), t('disconnected'))
        } catch (c) {
          o(x(c))
        } finally {
          a('idle')
        }
      }, [])
    return { status: e, action: n, error: i, connectWithKey: l, disconnectSession: d }
  },
  O = g(function () {
    const t = U(),
      n = D()
    return s.jsx('main', {
      className: 'flex min-h-screen items-center bg-gray-50 p-6 dark:bg-zinc-950',
      children: s.jsxs(b, {
        className: 'mx-auto w-full max-w-3xl p-6 shadow-sm sm:p-10',
        children: [
          s.jsxs(C, {
            children: [
              s.jsx('p', {
                className: 'mb-2 text-xs font-bold uppercase tracking-[0.2em] text-info',
                children: 'Toolpath',
              }),
              s.jsx('h1', {
                className: 'font-display text-4xl font-bold text-gray-900 dark:text-white',
                children: 'Part Viewer',
              }),
              s.jsx('p', {
                className: 'mt-3 max-w-xl text-sm leading-6 text-zinc-400',
                children:
                  'Upload a CAD part and inspect its recognized features in 3D. Your API key stays in an encrypted, short-lived server session.',
              }),
            ],
          }),
          t.status === 'checking'
            ? s.jsx('p', {
                className: 'mt-8 text-sm text-zinc-400',
                children: 'Checking local session…',
              })
            : t.status === 'connected'
              ? s.jsx(A, {
                  error: n.error ?? t.error,
                  status: n.status,
                  onUpload: n.upload,
                  onDisconnect: t.disconnectSession,
                  isDisconnecting: t.action === 'disconnecting',
                })
              : s.jsx(w, {
                  error: t.error,
                  isConnecting: t.action === 'connecting',
                  onConnect: t.connectWithKey,
                }),
        ],
      }),
    })
  })
export { O as default }
