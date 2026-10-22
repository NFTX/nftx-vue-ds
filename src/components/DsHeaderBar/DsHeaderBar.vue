<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { DsIcon } from '@/components/DsIcon'

export type DsThemeMode = 'light' | 'dark' | 'colorblind' | 'auto'

export interface DsHeaderBarProps {
  /**
   * Application title displayed in the brand area.
   * @default 'Portal'
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
   * Current color theme.
   * @default 'light'
   */
  theme?: DsThemeMode
  /**
   * Allowed themes to cycle through when clicking the theme toggle.
   * @default ['light', 'dark']
   */
  availableThemes?: DsThemeMode[]
  /**
   * Whether to display the integrated theme toggle button.
   * @default true
   */
  showThemeToggle?: boolean
  /**
   * Controlled open state for responsive mobile menu.
   * @default false
   */
  mobileMenuOpen?: boolean
}

export interface DsHeaderBarEmits {
  (e: 'update:theme', value: DsThemeMode): void
  (e: 'toggle-theme'): void
  (e: 'update:mobileMenuOpen', value: boolean): void
}

const props = withDefaults(defineProps<DsHeaderBarProps>(), {
  title: 'Portal',
  subtitle: undefined,
  sticky: false,
  theme: 'light',
  availableThemes: () => ['light', 'dark'],
  showThemeToggle: true,
  mobileMenuOpen: undefined
})

const emit = defineEmits<DsHeaderBarEmits>()

const mobileMenuId = useId()
const internalMobileOpen = ref(false)

const isMobileOpen = computed<boolean>(() => {
  if (props.mobileMenuOpen !== undefined) {
    return props.mobileMenuOpen
  }
  return internalMobileOpen.value
})

const activeThemes = computed<DsThemeMode[]>(() => {
  return props.availableThemes && props.availableThemes.length > 0
    ? props.availableThemes
    : ['light', 'dark']
})

const nextTheme = computed<DsThemeMode>(() => {
  const current = props.theme
  const themes = activeThemes.value
  const currentIndex = themes.indexOf(current)
  if (currentIndex !== -1) {
    const candidate = themes[(currentIndex + 1) % themes.length]
    if (candidate) return candidate
  }
  if (current === 'colorblind') return 'light'
  return current === 'dark' ? 'light' : 'dark'
})

const themeToggleLabel = computed<string>(() => {
  switch (nextTheme.value) {
    case 'dark':
      return 'Switch to dark theme'
    case 'colorblind':
      return 'Switch to color blind theme'
    case 'light':
    default:
      return 'Switch to light theme'
  }
})

const themeToggleIcon = computed<string>(() => {
  switch (nextTheme.value) {
    case 'dark':
      return 'moon'
    case 'colorblind':
      return 'eye'
    case 'light':
    default:
      return 'sun'
  }
})

// Backward-compatible alias
const currentThemeIcon = themeToggleIcon

function handleThemeToggle(): void {
  emit('update:theme', nextTheme.value)
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
