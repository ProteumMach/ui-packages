import { describe, expect, test } from 'vitest'
import { listHighlight } from './highlighting'

const OPEN_TYPE = ['wall-1', 'wall-2']

describe('listHighlight', () => {
  test('lights the open type while nothing more specific is being asked', () => {
    expect(
      listHighlight({ selected: null, hovered: [], ofType: OPEN_TYPE, pointerOnPart: false }),
    ).toEqual(OPEN_TYPE)
  })

  test('drops the type the moment something is selected', () => {
    // The click is the most recent thing somebody said, and sixty walls painted
    // over it is the summary shouting down the answer it was opened to find.
    expect(
      listHighlight({ selected: 'hole-1', hovered: [], ofType: OPEN_TYPE, pointerOnPart: false }),
    ).toEqual([])
  })

  test('drops it while the pointer is over the part, selection or not', () => {
    // Reaching for a face through a lit type is reaching through the type.
    expect(
      listHighlight({ selected: null, hovered: [], ofType: OPEN_TYPE, pointerOnPart: true }),
    ).toEqual([])
  })

  test('lets a row under the pointer replace it', () => {
    expect(
      listHighlight({
        selected: 'hole-1',
        hovered: ['wall-2'],
        ofType: OPEN_TYPE,
        pointerOnPart: false,
      }),
    ).toEqual(['wall-2'])
  })
})
