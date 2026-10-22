<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useRovingFocus } from '@/composables/a11y/useRovingFocus'

export interface DsChipOption {
  label: string
  value: string
  count?: number
  disabled?: boolean
}

export type DsChip = DsChipOption
export type DsChipGroupVariant = 'surface' | 'elevated'

export interface DsChipGroupProps {
  /**
   * Accessible group label for screen readers.
   * @default 'Filter by'
   */
  label?: string
  /**
   * Available chip options.
   */
  options?: DsChipOption[]
  /**
   * Alias for `options`.
   */
  chips?: DsChipOption[]
  /**
   * Whether multiple chips can be toggled simultaneously.
   * @default false
   */
  multiple?: boolean
  /**
   * When false in single-select mode, clicking the currently active chip is a no-op instead of resetting v-model to ''.
   * @default true
   */
  allowEmpty?: boolean
  /**
   * Surface contrast variant so chips stand out on either base or surface backgrounds.
   * @default 'elevated'
   */
  variant?: DsChipGroupVariant
  /**
   * Enables single-line horizontal scrolling on narrow viewports with hidden scrollbar.
   * @default false
   */
  scrollable?: boolean
}

const props = withDefaults(defineProps<DsChipGroupProps>(), {
  label: 'Filter by',
  options: undefined,
  chips: undefined,
  multiple: false,
  allowEmpty: true,
  variant: 'elevated',
  scrollable: false
})

const model = defineModel<string | string[]>({ default: '' })
const autoId = useId()
const chipRefs = ref<(HTMLButtonElement | null)[]>([])

const resolvedOptions = computed<DsChipOption[]>(() => props.options ?? props.chips ?? [])

const roving = useRovingFocus({
  orientation: 'horizontal',
  loop: true
})

function isSelected(value: string): boolean {
  if (props.multiple && Array.isArray(model.value)) {
    return model.value.includes(value)
  }
  return model.value === value
}

function handleChipClick(option: DsChipOption, index: number): void {
  if (option.disabled) return

  roving.currentIndex.value = index

  if (props.multiple) {
    const current = Array.isArray(model.value) ? [...model.value] : []
    const idx = current.indexOf(option.value)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(option.value)
    }
    model.value = current
  } else {
    if (model.value === option.value) {
      if (props.allowEmpty !== false) {
        model.value = ''
      }
      return
    }
    model.value = option.value
  }
}

function onKeydown(event: KeyboardEvent): void {
  roving.handleKeydown(event, chipRefs.value)
}

const computedId = computed<string>(() => `ds-chip-group-${autoId}`)
</script>

<template src="./DsChipGroup.html"></template>
<style lang="scss" scoped src="./DsChipGroup.scss"></style>
