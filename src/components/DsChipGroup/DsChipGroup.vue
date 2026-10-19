<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useRovingFocus } from '@/composables/a11y/useRovingFocus'

export interface DsChipOption {
  label: string
  value: string
  count?: number
  disabled?: boolean
}

export interface DsChipGroupProps {
  /**
   * Accessible group label for screen readers.
   */
  label?: string
  /**
   * Available chip options.
   */
  options: DsChipOption[]
  /**
   * Whether multiple chips can be toggled simultaneously.
   * @default false
   */
  multiple?: boolean
}

const props = withDefaults(defineProps<DsChipGroupProps>(), {
  label: 'Filter by',
  multiple: false
})

const model = defineModel<string | string[]>({ default: '' })
const autoId = useId()
const chipRefs = ref<(HTMLButtonElement | null)[]>([])

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
    model.value = model.value === option.value ? '' : option.value
  }
}

function onKeydown(event: KeyboardEvent): void {
  roving.handleKeydown(event, chipRefs.value)
}

const computedId = computed<string>(() => `ds-chip-group-${autoId}`)
</script>

<template src="./DsChipGroup.html"></template>
<style lang="scss" scoped src="./DsChipGroup.scss"></style>
