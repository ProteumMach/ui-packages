import { describe, expect, it } from 'vitest'

import { MILLING_FORMS, TOOL_FORMS, isToolForm, type ToolForm } from '../src/index.js'

describe('the tool form vocabulary', () => {
  it('names each form once', () => {
    // The list is read as a set by everything downstream — icons, a filter
    // panel, a drawing's generator table. A duplicated value would offer a
    // machinist the same form twice and count its tools under one of them.
    const values = TOOL_FORMS.map((form) => form.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('accepts every form it publishes, and `other`', () => {
    for (const form of TOOL_FORMS) {
      expect(isToolForm(form.value), form.value).toBe(true)
    }
    // A real answer, not a fallback: a vendor publishes tools this vocabulary
    // has no word for, and picking the nearest wrong form is worse than saying
    // so.
    expect(isToolForm('other')).toBe(true)
  })

  it('refuses a name it does not know', () => {
    expect(isToolForm('endmill')).toBe(false)
    expect(isToolForm('keyseat cutter')).toBe(false)
    expect(isToolForm('')).toBe(false)
  })

  it('holds the milling forms and nothing from hole making', () => {
    // What a flute-count suggestion makes sense for. A drill in this set is a
    // suggestion offered about a tool that does not take one.
    for (const form of TOOL_FORMS) {
      expect(MILLING_FORMS.has(form.value), form.value).toBe(form.group === 'Milling')
    }
    expect(MILLING_FORMS.has('drill')).toBe(false)
    expect(MILLING_FORMS.has('flat end mill')).toBe(true)
  })

  it('speaks a CAM library’s words rather than a vendor’s', () => {
    // A keyseat or woodruff cutter is a `slot mill` here, which is Fusion's own
    // type for it — the reason the vocabulary is not the scraper's coarse kind.
    const forms: readonly ToolForm[] = TOOL_FORMS.map((form) => form.value)
    expect(forms).toContain('slot mill')
    expect(forms).toContain('bull nose end mill')
    expect(forms).not.toContain('endmill')
  })

  it('groups every form under one a control can offer', () => {
    for (const form of TOOL_FORMS) {
      expect(['Milling', 'Hole making'], form.value).toContain(form.group)
    }
  })
})
