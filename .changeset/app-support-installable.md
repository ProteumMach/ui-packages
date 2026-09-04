---
'@toolpath/app-support': patch
---

Republish with a resolvable dependency range. `0.1.0` declares
`"@toolpath/tool-support": "workspace:^"`, which is pnpm's workspace protocol
and not a version any registry client can resolve — `npm install
@toolpath/app-support` fails outright with `EUNSUPPORTEDPROTOCOL`. Nothing else
about the package changes.

`0.1.0` reached npm through the one-off bootstrap publish a package needs before
npm will accept a trusted publisher, and that publish ran `npm publish` rather
than `pnpm publish`. Only pnpm rewrites the range at pack time, which is why
every package released through `changeset publish` is unaffected.
`scripts/check-bootstrap-publish.mjs` is the check that keeps the two publish
paths agreeing.
