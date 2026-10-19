<script setup lang="ts">
import { computed, useId } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

export type DsRadioGroupOrientation = 'vertical' | 'horizontal'

export interface DsRadioOption<T = unknown> {
  label: string
  value: T
  description?: string
  disabled?: boolean
}

export interface DsRadioGroupProps {
  /**
   * Visible legend heading for the radio group (A11Y-14).
   */
  legend: string
  /**
   * Available options list.
   */
  options: DsRadioOption[]
  /**
   * Group input name attribute. Defaults to Vue useId() (VUE-08).
   */
  name?: string
  /**
   * Layout orientation.
   * @default 'vertical'
   */
  orientation?: DsRadioGroupOrientation
  /**
   * Global disabled state.
   * @default false
   */
  disabled?: boolean
  /**
   * Validation error message.
   */
  error?: string
}

const props = withDefaults(defineProps<DsRadioGroupProps>(), {
  name: undefined,
  orientation: 'vertical',
  disabled: false,
  error: undefined
})

const model = defineModel<unknown>()
const autoId = useId()
const computedName = computed<string>(() => props.name || `ds-radio-${autoId}`)
const errorId = computed<string>(() => `${computedName.value}-error`)

function isOptionDisabled(option: DsRadioOption): boolean {
  return props.disabled || Boolean(option.disabled)
}
</script>

<template src="./DsRadioGroup.html"></template>
<style lang="scss" scoped src="./DsRadioGroup.scss"></style>
