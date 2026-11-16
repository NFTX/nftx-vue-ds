// src/composables/useTheme.ts
import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

export type DsTheme = 'light' | 'dark' | 'colorblind' | 'slate-light' | 'slate-dark'
/** A concrete theme, or `auto` to follow the system color scheme. */
export type DsThemeMode = DsTheme | 'auto'

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
  themes?: readonly DsThemeMode[]
  /**
   * Fallback theme when no stored, document or system preference is detected.
   * @default 'light'
   */
  defaultTheme?: DsThemeMode
}

export interface UseThemeReturn {
  theme: Ref<DsThemeMode>
  themes: readonly DsThemeMode[]
  setTheme: (next: DsThemeMode) => void
  cycleTheme: () => DsThemeMode
}

const DEFAULT_THEMES: readonly DsThemeMode[] = ['light', 'dark', 'colorblind']
const THEME_CHANGE_EVENT = 'ds-theme-change'

interface ThemeChangeDetail {
  storageKey: string
  theme: DsThemeMode
}

// Storage access throws when site data is blocked; the theme then lasts for the page only
function readStorage(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value)
  } catch {
    // Storage blocked: keep the in-page theme
  }
}

// `auto` removes data-theme so the prefers-color-scheme token fallback applies
function applyToDocument(mode: DsThemeMode): void {
  const root = globalThis.document?.documentElement
  if (mode === 'auto') {
    root?.removeAttribute('data-theme')
  } else {
    root?.setAttribute('data-theme', mode)
  }
  root?.classList.toggle('dark', mode === 'dark')
}

/**
 * Reads, applies and persists the theme on `<html data-theme>`.
 * Every instance with the same `storageKey` stays in sync on the page.
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const storageKey = options.storageKey ?? 'ds-theme'
  const themes = options.themes && options.themes.length > 0 ? options.themes : DEFAULT_THEMES
  const defaultTheme: DsThemeMode = options.defaultTheme ?? 'light'

  function isKnown(value: string | null | undefined): value is DsThemeMode {
    return Boolean(value) && themes.includes(value as DsThemeMode)
  }

  function resolveInitialTheme(): DsThemeMode {
    const stored = readStorage(storageKey)
    if (isKnown(stored)) return stored

    const domAttr = globalThis.document?.documentElement?.getAttribute('data-theme')
    if (isKnown(domAttr)) return domAttr

    if (themes.includes('auto')) return 'auto'

    const prefersDark = Boolean(globalThis.window?.matchMedia?.('(prefers-color-scheme: dark)').matches)
    if (prefersDark && themes.includes('dark')) return 'dark'

    return defaultTheme
  }

  const theme = ref<DsThemeMode>(resolveInitialTheme())
  applyToDocument(theme.value)

  function setTheme(next: DsThemeMode): void {
    theme.value = next
    applyToDocument(next)
    writeStorage(storageKey, next)
    const detail: ThemeChangeDetail = { storageKey, theme: next }
    globalThis.window?.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail }))
  }

  function cycleTheme(): DsThemeMode {
    const idx = themes.indexOf(theme.value)
    const next = themes[idx >= 0 ? (idx + 1) % themes.length : 0]!
    setTheme(next)
    return next
  }

  function handleThemeChange(event: Event): void {
    const detail = (event as CustomEvent<ThemeChangeDetail>).detail
    if (detail.storageKey === storageKey) {
      theme.value = detail.theme
    }
  }

  // Only listen inside a component or effect scope, where the listener can be removed
  if (globalThis.window && getCurrentScope()) {
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)
    onScopeDispose(() => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange))
  }

  return {
    theme,
    themes,
    setTheme,
    cycleTheme
  }
}
