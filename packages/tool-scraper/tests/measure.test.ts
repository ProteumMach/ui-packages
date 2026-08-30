/**
 * The one reader for a machinist's number.
 *
 * Three adapters had their own until 2026-08-29 and they disagreed on real
 * inputs, so what is pinned here is the whole grammar in one place — including
 * the two shapes that must **not** read as numbers, which is where the three
 * readers differed and where a wrong answer is silent.
 */

import { describe, expect, it } from 'vitest'

import { MM_PER_INCH, convertLength, fractionValue } from '../src/measure.js'

describe('the four shapes a vendor publishes', () => {
  it('reads a decimal, with or without a leading zero', () => {
    expect(fractionValue('.250')).toBe(0.25)
    expect(fractionValue('0.250')).toBe(0.25)
    expect(fractionValue('1.550')).toBe(1.55)
  })

  it('reads a whole number', () => {
    expect(fractionValue('6')).toBe(6)
    expect(fractionValue('0')).toBe(0)
  })

  it('reads a simple fraction', () => {
    expect(fractionValue('3/4')).toBe(0.75)
    expect(fractionValue('9/64')).toBe(0.140625)
  })

  it('reads a mixed number', () => {
    // The shape REGO-FIX's own reader could not take: `Number('1-1/2')` is NaN,
    // so a mixed number was refused there and read as 1.5 by Harvey's.
    expect(fractionValue('1-1/2')).toBe(1.5)
    expect(fractionValue('3-7/16')).toBe(3.4375)
  })

  it('ignores surrounding whitespace', () => {
    expect(fractionValue('  1-1/2  ')).toBe(1.5)
  })
})

describe('what is deliberately not a number', () => {
  it('refuses a range, rather than summing it', () => {
    // The reason the whole-number part of a mixed number is `\\d+` and not a
    // decimal. Destiny Tool really publishes `.035-.040` — a corner-radius
    // range — and reading it as `0.035 + 0.040` would ship a wrong radius with
    // nothing failing.
    expect(fractionValue('.035-.040')).toBeNull()
    expect(fractionValue('0.035-0.040')).toBeNull()
  })

  it('refuses a division by zero, which arrives looking finite', () => {
    // `3/` reached one adapter as Infinity and would have travelled into a row
    // as a nominal size.
    expect(fractionValue('3/')).toBeNull()
    expect(fractionValue('3/0')).toBeNull()
  })

  it('refuses text, a unit, and the empty string', () => {
    // A unit is the caller's business: `unit` decides which column is read, and
    // a reader that accepted `3 mm` would be guessing at a system.
    expect(fractionValue('')).toBeNull()
    expect(fractionValue('abc')).toBeNull()
    expect(fractionValue('3 mm')).toBeNull()
    expect(fractionValue('1/4"')).toBeNull()
  })

  it('answers null rather than throwing, whatever the input', () => {
    // The refusal is the caller's: Harvey skips a cell the column does not
    // apply to, REGO-FIX refuses a collet with no size. Pushing that decision
    // in here would take it from the module that knows.
    for (const token of ['', '-', 'N.P.T.', '1/0', '.5-.6']) {
      expect(() => fractionValue(token)).not.toThrow()
    }
  })
})

describe('the constant, and converting with it', () => {
  it('is the 1959 definition', () => {
    expect(MM_PER_INCH).toBe(25.4)
  })

  it('is a no-op between the same system', () => {
    expect(convertLength(3, 'inches', 'inches')).toBe(3)
    expect(convertLength(3, 'millimeters', 'millimeters')).toBe(3)
  })

  it('converts both ways', () => {
    expect(convertLength(1, 'inches', 'millimeters')).toBe(25.4)
    expect(convertLength(25.4, 'millimeters', 'inches')).toBe(1)
  })
})
