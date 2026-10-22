<script setup lang="ts">
import { computed, watch } from 'vue'
import DsButton from '@/components/DsButton/DsButton.vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { useTheme, type DsTheme } from '@/composables/useTheme'
import { useAnnouncer } from '@/composables/a11y/useAnnouncer'

export type DsThemeToggleSize = 'sm' | 'md' | 'lg'
export type DsThemeToggleVariant = 'ghost' | 'secondary' | 'outline'

export interface DsThemeToggleProps {
  /**
   * Button size.
   * @default 'md'
   */
  size?: DsThemeToggleSize
  /**
   * Button visual variant.
   * @default 'ghost'
   */
  variant?: DsThemeToggleVariant
  /**
   * Ordered list of themes to cycle through.
   * @default ['light', 'dark', 'colorblind']
   */
  themes?: readonly DsTheme[]
  /**
   * Alias for `themes` (from REQUESTED_COMPONENTS.md).
   */
  availableThemes?: readonly DsTheme[]
  /**
   * LocalStorage key used when persisting theme.
   * @default 'ds-theme'
   */
  storageKey?: string
  /**
   * Whether to show a visible text label alongside the icon.
   * @default false
   */
  showLabel?: boolean
  /**
   * Custom human-readable labels for each theme.
   */
  labels?: Partial<Record<DsTheme, string>>
}

export interface DsThemeToggleEmits {
  (e: 'change', theme: DsTheme): void
}

const props = withDefaults(defineProps<DsThemeToggleProps>(), {
  size: 'md',
  variant: 'ghost',
  themes: undefined,
  availableThemes: undefined,
  storageKey: 'ds-theme',
  showLabel: false,
  labels: undefined
})

const emit = defineEmits<DsThemeToggleEmits>()
const model = defineModel<DsTheme>()

const resolvedThemes = computed<readonly DsTheme[]>(() => {
  const list = props.themes ?? props.availableThemes
  return list && list.length > 0 ? list : ['light', 'dark', 'colorblind']
})

const themeState = useTheme({
  storageKey: props.storageKey,
  themes: resolvedThemes.value,
  defaultTheme: model.value ?? 'light'
})

const announcer = useAnnouncer()

const currentTheme = computed<DsTheme>(() => model.value ?? themeState.theme.value)

watch(
  () => model.value,
  (val) => {
    if (val && val !== themeState.theme.value) {
      themeState.setTheme(val)
    }
  }
)

const nextTheme = computed<DsTheme>(() => {
  const list = resolvedThemes.value
  const idx = list.indexOf(currentTheme.value)
  const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0
  return list[nextIdx] ?? 'light'
})

const defaultLabels: Record<DsTheme, string> = {
  light: 'Light',
  dark: 'Dark',
  colorblind: 'Colorblind',
  'slate-light': 'Slate Light',
  'slate-dark': 'Slate Dark'
}

function getLabel(t: DsTheme): string {
  return props.labels?.[t] ?? defaultLabels[t] ?? t
}

const currentLabel = computed<string>(() => getLabel(currentTheme.value))
const nextLabel = computed<string>(() => getLabel(nextTheme.value))

const currentIcon = computed<string>(() => {
  switch (currentTheme.value) {
    case 'dark':
    case 'slate-dark':
      return 'moon'
    case 'colorblind':
      return 'eye'
    case 'light':
    case 'slate-light':
    default:
      return 'sun'
  }
})

const ariaLabel = computed<string>(() => {
  return `Current theme: ${currentLabel.value}. Activate to switch to ${nextLabel.value} theme`
})

function handleToggle(): void {
  const next = nextTheme.value
  themeState.setTheme(next)
  model.value = next
  emit('change', next)
  announcer.announce(`Theme changed to ${getLabel(next)}`, 'polite')
}
</script>

<template src="./DsThemeToggle.html"></template>
<style lang="scss" scoped src="./DsThemeToggle.scss"></style>
