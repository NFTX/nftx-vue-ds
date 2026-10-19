<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { DsIcon } from '@/components/DsIcon'

export type DsThemeMode = 'light' | 'dark' | 'auto'

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

const isDarkTheme = computed<boolean>(() => props.theme === 'dark')

const themeToggleLabel = computed<string>(() => {
  return isDarkTheme.value ? 'Switch to light theme' : 'Switch to dark theme'
})

function handleThemeToggle(): void {
  const nextTheme: DsThemeMode = isDarkTheme.value ? 'light' : 'dark'
  emit('update:theme', nextTheme)
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
