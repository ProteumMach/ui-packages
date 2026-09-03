---
'@toolpath/ui': minor
---

Export `useUnit`, the React state around `loadUnit`/`saveUnit` this package
already ships. It takes the storage key, like they do, so two applications on
one origin keep their own units; it opens on millimetres and reads the stored
preference on the first effect, so a server render and its hydration agree.

The Toolpath template had written those three lines twice, character for
character in both applications and differing only in the key. This is the copy
that stops the third one being made.
