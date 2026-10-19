<script setup lang="ts">
import { computed, inject, useId, type ComputedRef } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import type { DsFieldContext } from '@/components/DsField/DsField.vue'

export type DsSelectSize = 'sm' | 'md' | 'lg'

export interface DsSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface DsSelectProps {
  /**
   * Element ID. Inherited from DsField when present.
   */
  id?: string
  /**
   * Select options list.
   */
  options?: DsSelectOption[]
  /**
   * Select component size.
   * @default 'md'
   */
  size?: DsSelectSize
  /**
   * Optional placeholder option shown when no value is selected.
   */
  placeholder?: string
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean
  /**
   * Required field attribute.
   * @default false
   */
  required?: boolean
  /**
   * Explicit aria-describedby attribute.
   */
  ariaDescribedby?: string
  /**
   * Explicit aria-invalid attribute.
   */
  ariaInvalid?: boolean | 'true' | 'false'
}

const props = withDefaults(defineProps<DsSelectProps>(), {
  id: undefined,
  options: () => [],
  size: 'md',
  placeholder: undefined,
  disabled: false,
  required: false,
  ariaDescribedby: undefined,
  ariaInvalid: undefined
})

const model = defineModel<string | number>({ default: '' })
const fieldContext = inject<ComputedRef<DsFieldContext> | null>('ds-field-context', null)
const autoId = useId()

const computedId = computed<string>(() => {
  return props.id || fieldContext?.value.controlId || `ds-select-${autoId}`
})

const computedDisabled = computed<boolean>(() => {
  return props.disabled || fieldContext?.value.disabled || false
})

const computedRequired = computed<boolean>(() => {
  return props.required || fieldContext?.value.required || false
})

const computedAriaDescribedby = computed<string | undefined>(() => {
  return props.ariaDescribedby || fieldContext?.value.ariaDescribedby || undefined
})

const computedAriaInvalid = computed<'true' | 'false' | undefined>(() => {
  if (props.ariaInvalid !== undefined) {
    return props.ariaInvalid === true || props.ariaInvalid === 'true' ? 'true' : 'false'
  }
  if (fieldContext?.value.ariaInvalid) {
    return 'true'
  }
  return undefined
})

const sizeClass = computed<string>(() => `ds-select-wrapper--${props.size}`)

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  model.value = target.value
}
</script>

<template src="./DsSelect.html"></template>
<style lang="scss" scoped src="./DsSelect.scss"></style>
