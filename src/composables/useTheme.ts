// src/composables/useTheme.ts
import { ref, type Ref } from 'vue'

export type DsTheme = 'light' | 'dark' | 'colorblind' | 'slate-light' | 'slate-dark'

export interface UseThemeOptions {
  /**
   * LocalStorage key used to persist the selected theme.
   * @default 'ds-theme'
   */
  storageKey?: string
  /**
   * Ordered list of themes to cycle through.
   * @default ['light', 'dark', 'colorblind']
   */
  themes?: readonly DsTheme[]
  /**
   * Fallback theme when no stored or system preference is detected.
   * @default 'light'
   */
  defaultTheme?: DsTheme
}

export interface UseThemeReturn {
  theme: Ref<DsTheme>
  themes: readonly DsTheme[]
  setTheme: (next: DsTheme) => void
  cycleTheme: () => DsTheme
}

const DEFAULT_THEMES: readonly DsTheme[] = ['light', 'dark', 'colorblind']

export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const storageKey = options.storageKey ?? 'ds-theme'
  const themes = options.themes && options.themes.length > 0 ? options.themes : DEFAULT_THEMES
  const defaultTheme: DsTheme = options.defaultTheme ?? 'light'

  function resolveInitialTheme(): DsTheme {
    const stored = globalThis.localStorage?.getItem(storageKey) as DsTheme | null
    if (stored && themes.includes(stored)) {
      return stored
    }

    const domAttr = globalThis.document?.documentElement?.getAttribute('data-theme') as DsTheme | null
    if (domAttr && themes.includes(domAttr)) {
      return domAttr
    }

    const prefersDark = Boolean(globalThis.window?.matchMedia?.('(prefers-color-scheme: dark)').matches)
    if (prefersDark && themes.includes('dark')) {
      return 'dark'
    }

    return defaultTheme
  }

  const theme = ref<DsTheme>(resolveInitialTheme())

  function applyTheme(next: DsTheme): void {
    theme.value = next
    globalThis.document?.documentElement?.setAttribute('data-theme', next)
    globalThis.localStorage?.setItem(storageKey, next)
  }

  // Sync initial attribute
  globalThis.document?.documentElement?.setAttribute('data-theme', theme.value)

  function setTheme(next: DsTheme): void {
    applyTheme(next)
  }

  function cycleTheme(): DsTheme {
    const idx = themes.indexOf(theme.value)
    const nextIndex = idx >= 0 ? (idx + 1) % themes.length : 0
    const next = themes[nextIndex]!
    applyTheme(next)
    return next
  }

  return {
    theme,
    themes,
    setTheme,
    cycleTheme
  }
}
