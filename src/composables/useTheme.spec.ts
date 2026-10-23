// src/composables/useTheme.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('initializes with default light theme and cycles through light -> dark -> colorblind (ENH-01)', () => {
    const { theme, themes, cycleTheme, setTheme } = useTheme()

    expect(themes).toEqual(['light', 'dark', 'colorblind'])
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    expect(cycleTheme()).toBe('dark')
    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('ds-theme')).toBe('dark')

    expect(cycleTheme()).toBe('colorblind')
    expect(theme.value).toBe('colorblind')
    expect(document.documentElement.getAttribute('data-theme')).toBe('colorblind')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    expect(cycleTheme()).toBe('light')
    expect(theme.value).toBe('light')

    setTheme('slate-dark')
    expect(theme.value).toBe('slate-dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('slate-dark')

    // Cycling from a theme not in the default array resets to index 0
    expect(cycleTheme()).toBe('light')
  })

  it('restores saved theme from localStorage when valid', () => {
    localStorage.setItem('custom-key', 'colorblind')
    const { theme } = useTheme({ storageKey: 'custom-key' })
    expect(theme.value).toBe('colorblind')
    expect(document.documentElement.getAttribute('data-theme')).toBe('colorblind')
  })

  it('reads existing data-theme attribute from documentElement when localStorage is empty', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
  })

  it('falls back to dark theme when prefers-color-scheme: dark matches', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })

    const { theme } = useTheme({
      themes: ['light', 'dark'],
      defaultTheme: 'light'
    })
    expect(theme.value).toBe('dark')

    matchMediaSpy.mockRestore()
  })

  it('handles empty themes array by falling back to default 3 themes', () => {
    const { themes, theme } = useTheme({ themes: [], defaultTheme: 'colorblind' })
    expect(themes).toEqual(['light', 'dark', 'colorblind'])
    expect(theme.value).toBe('colorblind')
  })
})
