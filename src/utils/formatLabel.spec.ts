import { describe, it, expect } from 'vitest'
import { formatLabel } from './formatLabel'

describe('formatLabel', () => {
  it('fills known placeholders and keeps unknown ones', () => {
    expect(formatLabel('Switch to {theme} theme', { theme: 'dark' })).toBe('Switch to dark theme')
    expect(formatLabel('{a} and {b}', { a: 'x' })).toBe('x and {b}')
    expect(formatLabel('No placeholders', {})).toBe('No placeholders')
  })
})
