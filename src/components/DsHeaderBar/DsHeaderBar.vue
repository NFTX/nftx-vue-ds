<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { DsIcon } from '@/components/DsIcon'
import { useTheme, type DsTheme } from '@/composables/useTheme'

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
   * Whether to display the responsive mobile menu toggle button.
   * @default true
   */
  showMobileToggle?: boolean
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
  theme: undefined,
  availableThemes: () => ['light', 'dark', 'colorblind'],
  showThemeToggle: true,
  showMobileToggle: true,
  mobileMenuOpen: undefined
})

const emit = defineEmits<DsHeaderBarEmits>()

const themeState = useTheme({
  themes: (props.availableThemes && props.availableThemes.length > 0
    ? props.availableThemes
    : ['light', 'dark', 'colorblind']) as unknown as readonly DsTheme[]
})

const effectiveTheme = computed<DsThemeMode>(() => {
  return props.theme ?? (themeState.theme.value as DsThemeMode)
})

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

const activeThemes = computed<DsThemeMode[]>(() => {
  return props.availableThemes && props.availableThemes.length > 0
    ? props.availableThemes
    : ['light', 'dark', 'colorblind']
})

const nextTheme = computed<DsThemeMode>(() => {
  const current = effectiveTheme.value
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
  switch (effectiveTheme.value) {
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
  const next = nextTheme.value
  if (props.theme === undefined) {
    themeState.setTheme(next as unknown as DsTheme)
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
