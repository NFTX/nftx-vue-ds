<script setup lang="ts">
import { formatLabel } from '@/utils/formatLabel'
import { computed, onMounted, ref, useId } from 'vue'
import { DsIcon } from '@/components/DsIcon'
import { useTheme, type DsThemeMode } from '@/composables/useTheme'

export interface DsHeaderBarProps {
  /**
   * Application title displayed in the brand area. No title element is rendered when it is empty.
   */
  title?: string
  /**
   * Secondary description or homelab subtitle.
   */
  subtitle?: string
  /**
   * Whether the header bar is stuck to the top of the viewport.
   * Consumers should ensure `scroll-padding-top: var(--ds-header-height, 4rem)` is active (A11Y-06).
   * @default false
   */
  sticky?: boolean
  /**
   * Current color theme. When set, the header only emits `update:theme` and the parent applies it.
   * When unset, the header applies and persists the theme itself (see `storageKey`).
   */
  theme?: DsThemeMode
  /**
   * Allowed themes to cycle through when clicking the theme toggle.
   * @default ['light', 'dark', 'colorblind']
   */
  availableThemes?: DsThemeMode[]
  /**
   * Whether to display the integrated theme toggle button.
   * @default true
   */
  showThemeToggle?: boolean
  /**
   * LocalStorage key used when the header manages the theme itself (no `theme` prop).
   * @default 'ds-theme'
   */
  storageKey?: string
  /**
   * Whether to display the responsive mobile menu toggle button.
   * @default true
   */
  showMobileToggle?: boolean
  /**
   * Controlled open state for responsive mobile menu.
   * @default false
   */
  mobileMenuOpen?: boolean
  /**
   * Theme names used in the toggle label, merged over the English defaults (`light`, `dark`, `color blind`, `automatic`, `slate light`, `slate dark`).
   * @default () => ({})
   */
  themeLabels?: Partial<Record<DsThemeMode, string>>
  /**
   * Toggle button label; `{theme}` is replaced by the name of the theme a click switches to.
   * @default 'Switch to {theme} theme'
   */
  switchThemeLabel?: string
  /**
   * Accessible name of the desktop navigation landmark.
   * @default 'Primary navigation'
   */
  navLabel?: string
  /**
   * Accessible name of the mobile navigation landmark.
   * @default 'Mobile navigation'
   */
  mobileNavLabel?: string
  /**
   * Mobile menu button label while the menu is closed.
   * @default 'Open navigation menu'
   */
  openMenuLabel?: string
  /**
   * Mobile menu button label while the menu is open.
   * @default 'Close navigation menu'
   */
  closeMenuLabel?: string
  /**
   * Element for the default title. Use a non-heading when the page has its own `<h1>`.
   * @default 'h1'
   */
  titleTag?: 'h1' | 'p' | 'span' | 'div'
}

export interface DsHeaderBarEmits {
  (e: 'update:theme', value: DsThemeMode): void
  (e: 'toggle-theme'): void
  (e: 'update:mobileMenuOpen', value: boolean): void
}

const props = withDefaults(defineProps<DsHeaderBarProps>(), {
  title: undefined,
  subtitle: undefined,
  sticky: false,
  theme: undefined,
  availableThemes: () => ['light', 'dark', 'colorblind'],
  showThemeToggle: true,
  storageKey: 'ds-theme',
  showMobileToggle: true,
  mobileMenuOpen: undefined,
  themeLabels: () => ({}),
  switchThemeLabel: 'Switch to {theme} theme',
  navLabel: 'Primary navigation',
  mobileNavLabel: 'Mobile navigation',
  openMenuLabel: 'Open navigation menu',
  closeMenuLabel: 'Close navigation menu',
  titleTag: 'h1'
})

const emit = defineEmits<DsHeaderBarEmits>()

const DEFAULT_THEMES: DsThemeMode[] = ['light', 'dark', 'colorblind']

const activeThemes = computed<DsThemeMode[]>(() =>
  props.availableThemes && props.availableThemes.length > 0 ? props.availableThemes : DEFAULT_THEMES
)

// Manage the document theme only when the parent does not control it
const themeState =
  props.theme === undefined && props.showThemeToggle
    ? useTheme({ storageKey: props.storageKey, themes: activeThemes.value })
    : null

const effectiveTheme = computed<DsThemeMode>(
  () => props.theme ?? themeState?.theme.value ?? activeThemes.value[0] ?? 'light'
)

const mobileMenuId = useId()
const internalMobileOpen = ref(false)
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const isMobileOpen = computed<boolean>(() => {
  if (props.mobileMenuOpen !== undefined) {
    return props.mobileMenuOpen
  }
  return internalMobileOpen.value
})

const nextTheme = computed<DsThemeMode>(() => {
  const themes = activeThemes.value
  const currentIndex = themes.indexOf(effectiveTheme.value)
  return themes[(currentIndex + 1) % themes.length] ?? 'light'
})

const DEFAULT_THEME_NAMES: Record<DsThemeMode, string> = {
  light: 'light',
  dark: 'dark',
  colorblind: 'color blind',
  auto: 'automatic',
  'slate-light': 'slate light',
  'slate-dark': 'slate dark'
}

const themeToggleLabel = computed<string>(() => {
  const name = props.themeLabels[nextTheme.value] ?? DEFAULT_THEME_NAMES[nextTheme.value]
  return formatLabel(props.switchThemeLabel, { theme: name })
})

const themeToggleIcon = computed<string>(() => {
  switch (effectiveTheme.value) {
    case 'dark':
    case 'slate-dark':
      return 'moon'
    case 'colorblind':
      return 'eye'
    case 'auto':
      return 'sun-moon'
    case 'light':
    default:
      return 'sun'
  }
})

// Backward-compatible alias
const currentThemeIcon = themeToggleIcon

function handleThemeToggle(): void {
  const next = nextTheme.value
  if (props.theme === undefined) {
    themeState?.setTheme(next)
  }
  emit('update:theme', next)
  emit('toggle-theme')
}

function toggleMobileMenu(): void {
  const nextState = !isMobileOpen.value
  internalMobileOpen.value = nextState
  emit('update:mobileMenuOpen', nextState)
}
</script>

<template src="./DsHeaderBar.html"></template>
<style lang="scss" scoped src="./DsHeaderBar.scss"></style>
