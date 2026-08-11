import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import * as ui from '../src'

describe('@toolpath/ui', () => {
  it('renders a primary button with its documented Tailwind utilities', () => {
    render(
      <ui.Button variant="primary" type="submit">
        Analyze part
      </ui.Button>,
    )

    const button = screen.getByRole('button', { name: 'Analyze part' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button.firstElementChild).toHaveClass('bg-primary')
  })

  it('renders icon-backed controls without exporting the icon library', () => {
    render(<ui.Checkbox checked={false} name="include-report" onChange={() => undefined} />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect('CheckIcon' in ui).toBe(false)
    expect('icons' in ui).toBe(false)
    expect('ListItem' in ui).toBe(false)
  })

  it('exports the advanced portable primitives', () => {
    expect(ui.Table).toBeDefined()
    expect(ui.Notification.Provider).toBeDefined()
    expect(ui.Dialog.Provider).toBeDefined()
    expect(ui.Panels.Group).toBeDefined()
  })
})
