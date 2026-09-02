---
'@toolpath/tool-scraper': patch
---

Fix two faults that made measuring a holder family unrepeatable.

**A rate limit ended the run.** The Engine budgets requests per key and answers
`429` with `Retry-After`; `createHolderApi` treated every non-2xx alike, so a
family large enough to spend the window died partway through — a 217-holder
CAT40 batch, on the poll call. A `429` is the API scheduling the client rather
than refusing it, so `request` now waits and retries, preferring the API's own
`Retry-After` and backing off where it cannot read one. `retryAfterMs` is
exported, `RATE_LIMIT_ATTEMPTS` bounds the retries, and `rateLimitAttempts` on
`HolderApiOptions` sets it. Every other non-2xx still stops the run.

**The idempotency key named the part, and the API binds it to the holder.**
`measureHolder` creates a fresh holder on every call, so a key derived from the
catalog number was the same string naming a different holder on the second run,
which the API refuses with `idempotency_key_reused` — the second measurement of
any family failed on its first part, permanently, for that organisation.
`idempotencyKey` now takes the `holderId` the run just created, which is the
scope the API actually enforces.

That narrows what the key can promise: it stops a retried `PATCH` inside one run
dispatching a second import, and it cannot make re-running an interrupted family
free, because there is no way to ask the API for the holder a previous run
created. The old docstring claimed the second thing and never delivered it.
Resuming cheaply belongs to the caller, by not re-measuring what its store
already holds.
