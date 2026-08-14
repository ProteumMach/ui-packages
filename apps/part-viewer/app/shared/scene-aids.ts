const STORAGE_KEY = 'part-viewer:scene-aids'

/**
 * Whether the scene's reference furniture — the ground grid and the axis triad
 * — is drawn.
 *
 * One switch for both: they answer the same question, which is where the part
 * sits and how big it is, and they are answering it behind the part rather than
 * on it. On by default, because that question is usually worth a glance; off
 * when it stops being, since a grid line read through a bore is worse than no
 * grid at all.
 *
 * The view cube is not in here. It is a control, not furniture: it does
 * something when clicked.
 */
export function loadShowAids(storage: Pick<Storage, 'getItem'> | null): boolean {
  return storage?.getItem(STORAGE_KEY) !== 'off'
}

export function saveShowAids(storage: Pick<Storage, 'setItem'> | null, shown: boolean): void {
  storage?.setItem(STORAGE_KEY, shown ? 'on' : 'off')
}
