import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToolDrawing } from '../src/index.js'
import type { ViewerAssembly, ViewerHolderProfile } from '../src/index.js'

const assembly: ViewerAssembly = {
  tool: {
    form: 'flat end mill',
    label: 'TDMX0600',
    geometry: { DC: 6, LCF: 13, OAL: 57, SFDM: 6, LBH: 19 },
    provenance: { LBH: 'derived' },
  },
  holder: {
    gaugeLength: 50,
    colletSeries: 'PG6',
    noseDiameter: 28,
    noseLength: null,
    bodyDiameter: null,
    bodyLength: null,
    projection: null,
    flangeDiameter: null,
    colletProtrusion: null,
    provenance: {},
  },
  stickout: 25,
}

/**
 * The distinct parts drawn, in the order each first appears.
 *
 * **One part may emit several segments**, so this is deliberately not the
 * segment sequence: a slot mill's cutting disc emits two `flutes` (a straight
 * side and a corner arc), and a holder whose flange stands above its stated
 * body emits two `body` (the stated one, and the last stated diameter carried
 * up). A test that does not specifically care about segmentation asserts on
 * the set of parts, so it does not break the next time segmentation changes.
 */
const partsDrawn = (container: HTMLElement) => [
  ...new Set(
    [...container.querySelectorAll('[data-part]')].map((each) => each.getAttribute('data-part')),
  ),
]

/** One polygon per segment, not per part. */
const segmentCount = (container: HTMLElement) => container.querySelectorAll('[data-part]').length

describe('the assembly, drawn', () => {
  it('draws every part from the stated dimensions', () => {
    const { container } = render(<ToolDrawing assembly={assembly} />)

    expect(container.querySelector('[role="img"]')).not.toBeNull()
    expect(partsDrawn(container)).toEqual(['tip', 'flutes', 'shank', 'nose'])
  })

  it('draws the tool alone when there is no holder', () => {
    const { container } = render(<ToolDrawing assembly={{ ...assembly, holder: null }} />)

    expect(partsDrawn(container)).toEqual(['tip', 'flutes', 'shank'])
  })

  it('draws every line solid, keeps the provenance on the element, and names what was assumed', () => {
    const drill = { ...assembly, tool: { ...assembly.tool, form: 'drill' } }
    const { container } = render(<ToolDrawing assembly={drill} />)

    const tip = container.querySelector('[data-part="tip"]')
    expect(tip?.getAttribute('stroke-dasharray')).toBeNull()
    expect(tip?.getAttribute('data-provenance')).toBe('assumed')
    expect(container.querySelector('[data-provenance-note]')?.textContent).toMatch(
      /tip angle assumed/,
    )
  })

  it('says the holder length is not stated when it is not', () => {
    const { container } = render(
      <ToolDrawing
        assembly={{ ...assembly, holder: { ...assembly.holder!, gaugeLength: null } }}
      />,
    )

    expect(container.querySelector('[data-provenance-note]')?.textContent).toMatch(
      /The holder length is not stated\./,
    )
  })

  /**
   * A measured holder answers the same question from a different field: a
   * `gage-line` profile *is* referenced to the spindle face, and a `nose` one
   * had no gauge plane to solve.
   */
  it('reads a measured holder\u2019s length off its datum', () => {
    const measured: ViewerHolderProfile = {
      points: [
        [-40, 11],
        [-10, 20],
        [30, 16],
        [50, 8],
      ],
      datum: 'gage-line',
      colletSeries: null,
      colletProtrusion: null,
    }
    const { container, rerender } = render(
      <ToolDrawing assembly={{ ...assembly, holder: measured }} />,
    )

    expect(partsDrawn(container)).toEqual(['tip', 'flutes', 'shank', 'body', 'flange'])
    expect(container.querySelector('[data-provenance-note]')?.textContent).not.toMatch(
      /The holder length is not stated\./,
    )

    rerender(
      <ToolDrawing
        assembly={{
          ...assembly,
          holder: {
            ...measured,
            datum: 'nose',
            points: [
              [-40, 11],
              [0, 8],
            ],
          },
        }}
      />,
    )
    expect(container.querySelector('[data-provenance-note]')?.textContent).toMatch(
      /The holder length is not stated\./,
    )
  })
})

/**
 * **A drawing sheet, in its own colours.** Gold flutes, a steel body, the
 * holder behind it in a grey of its own — hard values rather than the
 * application's ramp, because the ramp flips under light mode and a drawing is
 * a drawing in either theme (Paul, 2026-09-01).
 */
describe('the sheet and its ink', () => {
  /** Nose, body, the carry above it, and the flange: every holder section drawn. */
  const carried: ViewerAssembly = {
    ...assembly,
    stickout: 30,
    holder: {
      ...assembly.holder!,
      noseLength: 10.55,
      bodyDiameter: 12.02,
      bodyLength: 9.6,
      projection: 50,
      flangeDiameter: 46,
      colletProtrusion: 2.5,
    },
  }

  const connected: ViewerAssembly = {
    ...assembly,
    holder: {
      ...assembly.holder!,
      bodyDiameter: 40,
      bodyLength: 20,
      // Past the nose and the body, so the cone nobody states is drawn up to it.
      projection: 110,
      flangeDiameter: 46,
    },
  }

  /**
   * **A holder emits two `body` segments** where the flange stands above the
   * body the vendor states: the stated body, and then the last stated diameter
   * carried up to the flange because nothing states what is in between. They
   * are told apart by provenance, not by part — the carried one is `assumed`,
   * and it is the spindle connection rather than the holder body.
   *
   * This is the second place one part emits several segments, and unlike the
   * slot mill it is exercisable from the committed sample, which is the only
   * dataset carrying toolholding.
   */
  it('draws both body segments, and paints the carried one as the connection', () => {
    const { container } = render(<ToolDrawing assembly={carried} />)
    const bodies = [...container.querySelectorAll('[data-part="body"]')]

    expect(bodies).toHaveLength(2)
    expect(bodies.map((each) => each.getAttribute('data-provenance'))).toEqual([
      'vendor-stated',
      'assumed',
    ])
    expect(bodies.map((each) => each.getAttribute('fill'))).toEqual(['#474d57', '#3a4048'])
    // One part, two segments, one name in the note.
    expect(partsDrawn(container).filter((each) => each === 'body')).toHaveLength(1)
    expect(segmentCount(container)).toBeGreaterThan(partsDrawn(container).length)
  })

  it('paints the flutes gold, the body steel and the holder its own grey', () => {
    const { container } = render(<ToolDrawing assembly={connected} />)
    const painted = (selector: string) => container.querySelector(selector)?.getAttribute('fill')

    expect(painted('[data-part="flutes"]')).toBe('#c9a44b')
    expect(painted('[data-part="shank"]')).toBe('#5b626c')
    expect(painted('[data-part="nose"]')).toBe('#474d57')
    expect(painted('[data-part="flange"]')).toBe('#3a4048')
  })

  /**
   * And the sheet is a shade above the card rather than a white rectangle in a
   * dark application — with the ink turned over to match. Dark is the default
   * because the sheet that needed stating was the dark one.
   */
  it('draws on a dark sheet by default', () => {
    const { container } = render(<ToolDrawing assembly={assembly} />)
    const svg = container.querySelector('svg')!

    expect(svg.style.background).toBe('rgb(34, 37, 43)')
    expect(container.querySelector('[data-centreline]')?.getAttribute('stroke')).toBe('#e8ebef')
  })

  it('turns the whole sheet over when the application passes the light theme', () => {
    const { container } = render(<ToolDrawing assembly={connected} theme="light" />)
    const svg = container.querySelector('svg')!

    expect(svg.style.background).toBe('rgb(255, 255, 255)')
    expect(container.querySelector('[data-centreline]')?.getAttribute('stroke')).toBe('#15181c')
    expect(container.querySelector('[data-part="flutes"]')?.getAttribute('fill')).toBe('#e6bf59')
    expect(container.querySelector('[data-silhouette]')?.getAttribute('stroke')).toBe('#3f4650')
  })
})

/**
 * § 8's whole point: a silent plausible picture is the failure mode, so a form
 * this cannot draw is said in words — and the words name the form, because a
 * reader shown nothing is owed the reason.
 */
describe('what it will not draw', () => {
  it('says so rather than drawing a tool with no dimensions', () => {
    const { container } = render(
      <ToolDrawing assembly={{ ...assembly, tool: { ...assembly.tool, geometry: {} } }} />,
    )

    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toMatch(/states no cutting diameter or flute length/)
  })

  it('names the form it has no shape for, rather than drawing a plausible cylinder', () => {
    const { container } = render(
      <ToolDrawing assembly={{ ...assembly, tool: { ...assembly.tool, form: 'dovetail mill' } }} />,
    )

    expect(container.querySelector('svg')).toBeNull()
    expect(container.querySelector('[data-undrawable]')?.getAttribute('data-undrawable')).toBe(
      'dovetail mill',
    )
    expect(container.textContent).toMatch(/is a dovetail mill/)
    expect(container.textContent).toMatch(/not drawn, rather than drawn wrong/)
  })
})

/**
 * The frame is only honest under `xMidYMid meet`: it fits a viewBox by the
 * smaller of its own two ratios, and `frameFor` picks `scale` so that the
 * binding ratio is exactly `scale`. Under `none` the drawing stretches and the
 * reported scale is a lie on one axis.
 */
describe('the contract with the frame', () => {
  it('keeps preserveAspectRatio at xMidYMid meet', () => {
    const { container } = render(<ToolDrawing assembly={assembly} />)

    expect(container.querySelector('svg')?.getAttribute('preserveAspectRatio')).toBe(
      'xMidYMid meet',
    )
  })

  it('draws into a viewBox from the content, not from the panel', () => {
    const { container } = render(<ToolDrawing assembly={assembly} />)
    const [, , width] = container
      .querySelector('svg')!
      .getAttribute('viewBox')!
      .split(' ')
      .map(Number)

    // 75 mm of stack plus its margins — not the hundreds of millimetres the
    // panel's aspect ratio used to buy.
    expect(width).toBeGreaterThan(75)
    expect(width).toBeLessThan(90)
  })
})

/**
 * jsdom has no `ResizeObserver`, so every test above draws at the unmeasured
 * default frame — which is landscape. Without this the vertical half of the
 * package would never run. The observer is stubbed so a panel can be handed a
 * shape and the drawing asked what it did with it.
 */
class StubResizeObserver {
  static latest: StubResizeObserver | null = null
  private readonly callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    StubResizeObserver.latest = this
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  measure(width: number, height: number) {
    act(() => {
      this.callback(
        [{ contentRect: { width, height } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    })
  }
}

const drawnIn = (width: number, height: number) => {
  vi.stubGlobal('ResizeObserver', StubResizeObserver)
  const { container } = render(<ToolDrawing assembly={assembly} />)
  StubResizeObserver.latest!.measure(width, height)
  const centreline = container.querySelector('[data-centreline]')!
  const at = (name: string) => Number(centreline.getAttribute(name))
  const [, , w, h] = container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number)
  return {
    container,
    viewBox: { width: w!, height: h! },
    x1: at('x1'),
    y1: at('y1'),
    x2: at('x2'),
    y2: at('y2'),
  }
}

/**
 * Orientation lives only in the frame's `toX`/`toY`. Nothing in this renderer
 * branches on it, so the proof is that the same assembly, drawn into panels of
 * two shapes, comes out along each panel's long axis without the renderer
 * being told which.
 */
describe('the axis follows the panel, and only through toX and toY', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    StubResizeObserver.latest = null
  })

  it('lays the tool along a wide panel', () => {
    const drawn = drawnIn(1032, 232)

    expect(drawn.viewBox.width).toBeGreaterThan(drawn.viewBox.height)
    // The centreline runs across the sheet: the axis is horizontal.
    expect(drawn.y1).toBe(drawn.y2)
    expect(drawn.x1).not.toBe(drawn.x2)
  })

  it('stands the same tool up in a tall panel', () => {
    const drawn = drawnIn(232, 1032)

    expect(drawn.viewBox.height).toBeGreaterThan(drawn.viewBox.width)
    // And now up it: same renderer, same segments, the other axis.
    expect(drawn.x1).toBe(drawn.x2)
    expect(drawn.y1).not.toBe(drawn.y2)
  })

  it('frames the same content either way, transposed', () => {
    const wide = drawnIn(1032, 232)
    vi.unstubAllGlobals()
    const tall = drawnIn(232, 1032)

    expect(wide.viewBox.width).toBeCloseTo(tall.viewBox.height, 6)
    expect(wide.viewBox.height).toBeCloseTo(tall.viewBox.width, 6)
  })
})

const viewBoxOf = (container: HTMLElement) => {
  const [minX, minY, width, height] = container
    .querySelector('svg')!
    .getAttribute('viewBox')!
    .split(' ')
    .map(Number)
  return { minX: minX!, minY: minY!, width: width!, height: height! }
}

const drawnWith = (props: Record<string, unknown>, width = 900, height = 900) => {
  vi.stubGlobal('ResizeObserver', StubResizeObserver)
  const { container } = render(<ToolDrawing assembly={assembly} {...props} />)
  StubResizeObserver.latest!.measure(width, height)
  return container
}

const codesDrawn = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-dimension]')].map((each) =>
    each.getAttribute('data-dimension'),
  )

describe('the dimensions', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    StubResizeObserver.latest = null
  })

  it('dimensions the tool only when it is asked to', () => {
    const { container: plain } = render(<ToolDrawing assembly={assembly} />)
    expect(plain.querySelector('[data-dimensions]')).toBeNull()

    const container = drawnWith({ dimensions: true })
    const drawn = codesDrawn(container)

    // With a holder: the stickout, and no overall length — most of the shank
    // is inside the holder.
    expect(drawn).toContain('stickout')
    expect(drawn).not.toContain('OAL')
    expect(drawn).toEqual(expect.arrayContaining(['DC', 'SFDM', 'LCF']))
  })

  /** The tool alone states its own overall length, and nothing about a holder. */
  it('dimensions the overall length when the tool is drawn by itself', () => {
    vi.stubGlobal('ResizeObserver', StubResizeObserver)
    const { container } = render(
      <ToolDrawing assembly={{ ...assembly, holder: null, stickout: null }} dimensions />,
    )
    StubResizeObserver.latest!.measure(900, 900)
    const drawn = codesDrawn(container)

    expect(drawn).toContain('OAL')
    expect(drawn).not.toContain('stickout')
  })

  /**
   * **The padding seam.** The bands' room is stated in pixels and settled
   * before the frame exists, so asking for it cannot change the scale that
   * would change it back. What it must do is actually buy room: the drawing
   * with dimensions on is framed wider than the same drawing without.
   */
  it('buys the bands their room out of the frame, not out of the scale', () => {
    const bare = viewBoxOf(drawnWith({}))
    const dimensioned = viewBoxOf(drawnWith({ dimensions: true }))

    // A square panel is drawn along its width, so the bands take their room
    // across it — which is the sheet's height.
    expect(dimensioned.height).toBeGreaterThan(bare.height)
  })

  /**
   * And asymmetrically, which is why the seam had to widen from one number:
   * with figures on both flanks each side takes what its own bands need, and
   * those differ.
   */
  it('gives each flank the room its own bands need', () => {
    const one = viewBoxOf(drawnWith({ dimensions: true, dimensionSides: 'one' }))
    const both = viewBoxOf(drawnWith({ dimensions: true, dimensionSides: 'both' }))

    // Everything on one flank: the tool sits well off centre in its sheet.
    expect(Math.abs(one.minY + one.height / 2)).toBeGreaterThan(1)
    // Split across both: the two margins are nearer each other.
    expect(Math.abs(both.minY + both.height / 2)).toBeLessThan(Math.abs(one.minY + one.height / 2))
  })

  it('writes lengths through the formatter the application passes', () => {
    const container = drawnWith({
      dimensions: true,
      formatLength: (mm: number) => `${String(mm)}!!`,
    })

    expect(container.textContent).toMatch(/13!!/)
  })
})

/**
 * **"They need to be layed out in a way that NEVER OVERLAP THE MODEL, A
 * LEADER, OTHER TEXT, OR ANOTHER DIMENSION"** (Paul, 2026-09-01, with three
 * screenshots of figures written over each other). Three goes at placing
 * figures among the lines each produced a smudge somewhere, so this is a check
 * rather than a rule somebody remembers.
 *
 * Run in **both** orientations, because the rule is about the drawing and not
 * about which way it happens to be laid.
 */
describe('figures that can be read', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    StubResizeObserver.latest = null
  })

  const boxes = (container: HTMLElement) =>
    [...container.querySelectorAll('[data-figure] rect')].map((each) => ({
      x: Number(each.getAttribute('x')),
      y: Number(each.getAttribute('y')),
      width: Number(each.getAttribute('width')),
      height: Number(each.getAttribute('height')),
    }))

  const apart = (
    one: { x: number; y: number; width: number; height: number },
    two: { x: number; y: number; width: number; height: number },
  ) =>
    one.x + one.width <= two.x + 1e-9 ||
    two.x + two.width <= one.x + 1e-9 ||
    one.y + one.height <= two.y + 1e-9 ||
    two.y + two.height <= one.y + 1e-9

  const panels: Array<[string, number, number]> = [
    ['laid along a wide panel', 1200, 400],
    ['stood up in a tall panel', 400, 1200],
  ]

  for (const [what, width, height] of panels) {
    describe(what, () => {
      const drawn = () => drawnWith({ dimensions: true, dimensionSides: 'both' }, width, height)

      it('never lets one figure cover another', () => {
        const found = boxes(drawn())
        expect(found.length).toBeGreaterThan(3)

        for (const [index, one] of found.entries()) {
          for (const two of found.slice(index + 1)) {
            expect(apart(one, two)).toBe(true)
          }
        }
      })

      /** And in the margin: past the tool, never over it. */
      it('keeps every figure outside the tool, and on the sheet', () => {
        const container = drawn()
        const view = viewBoxOf(container)
        const points = [...container.querySelectorAll('[data-part]')].flatMap((each) =>
          each
            .getAttribute('points')!
            .split(' ')
            .map((pair) => pair.split(',').map(Number)),
        )
        const tool = {
          x: Math.min(...points.map((each) => each[0]!)),
          y: Math.min(...points.map((each) => each[1]!)),
          width:
            Math.max(...points.map((each) => each[0]!)) -
            Math.min(...points.map((each) => each[0]!)),
          height:
            Math.max(...points.map((each) => each[1]!)) -
            Math.min(...points.map((each) => each[1]!)),
        }

        for (const box of boxes(container)) {
          expect(apart(box, tool)).toBe(true)
          expect(box.x).toBeGreaterThanOrEqual(view.minX - 1e-6)
          expect(box.x + box.width).toBeLessThanOrEqual(view.minX + view.width + 1e-6)
          expect(box.y).toBeGreaterThanOrEqual(view.minY - 1e-6)
          expect(box.y + box.height).toBeLessThanOrEqual(view.minY + view.height + 1e-6)
        }
      })

      /**
       * **Beside its own line, and off every other one** (Paul, 2026-09-01).
       * Moving the figures in among the lanes is only worth doing if they stay
       * clear of the extension lines that cross those bands.
       */
      it('keeps every figure off the dimension lines', () => {
        const container = drawn()
        const lines = [...container.querySelectorAll('[data-dimension] line')].map((each) => ({
          x1: Number(each.getAttribute('x1')),
          y1: Number(each.getAttribute('y1')),
          x2: Number(each.getAttribute('x2')),
          y2: Number(each.getAttribute('y2')),
        }))
        expect(lines.length).toBeGreaterThan(4)

        for (const box of boxes(container)) {
          for (const line of lines) {
            const across =
              Math.min(line.x1, line.x2) < box.x + box.width && Math.max(line.x1, line.x2) > box.x
            const down =
              Math.min(line.y1, line.y2) < box.y + box.height && Math.max(line.y1, line.y2) > box.y
            expect(across && down).toBe(false)
          }
        }
      })

      /**
       * **"SFDM and shoulder diameter should use outward leaders, not lines
       * over the tool"** (Paul, 2026-09-01): a ⌀6 shank at this scale has no
       * room for a dimension line inside it, so the arrows stand outside and
       * point in.
       */
      it('draws no width dimension across the tool', () => {
        const container = drawn()
        const centre = container.querySelector('[data-centreline]')!
        const vertical =
          Math.abs(Number(centre.getAttribute('x1')) - Number(centre.getAttribute('x2'))) < 1e-9
        // The axis is wherever the centreline runs; a width must stay on one
        // side of it, whichever way that is.
        const off = (element: Element, end: '1' | '2') =>
          vertical
            ? Number(element.getAttribute(`x${end}`)) - Number(centre.getAttribute('x1'))
            : Number(element.getAttribute(`y${end}`)) - Number(centre.getAttribute('y1'))

        for (const code of ['DC', 'SFDM']) {
          const lines = container.querySelectorAll(`[data-dimension="${code}"] line`)
          expect(lines.length).toBeGreaterThan(0)
          for (const line of lines) {
            expect(Math.sign(off(line, '1')) === Math.sign(off(line, '2'))).toBe(true)
            expect(off(line, '1')).not.toBe(0)
          }
        }
      })
    })
  }
})
