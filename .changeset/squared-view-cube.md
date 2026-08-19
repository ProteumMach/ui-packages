---
'@toolpath/viewer': minor
---

Square the view when a view cube panel or a named view is chosen. The camera's
up vector was never set, so with free orbit re-deriving it from the pose being
left, the roll built up by dragging survived the jump and the part arrived at
the right angle but tilted. Adds `squaredUp`, which picks whichever of a view's
four square rolls is nearest the camera's current one, so a view is reached
without the part spinning on the way to it.
