<script setup lang="ts">
import { computed, provide, useId, useSlots } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

export interface DsFieldContext {
  controlId: string
  ariaDescribedby: string | undefined
  ariaInvalid: boolean
  required: boolean
  disabled: boolean
}

export interface DsFieldProps {
  /**
   * Visible form field label (A11Y-09).
   */
  label: string
  /**
   * Explicit control ID. Defaults to Vue useId() (VUE-08).
   */
  id?: string
  /**
   * Supporting instructional hint text.
   */
  hint?: string
  /**
   * Validation error message. Automatically marks field invalid (A11Y-10).
   */
  error?: string
  /**
   * Whether the field is mandatory.
   * @default false
   */
  required?: boolean
  /**
   * Whether the field is disabled.
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<DsFieldProps>(), {
  id: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  disabled: false
})

const autoId = useId()
const controlId = computed<string>(() => props.id || `ds-control-${autoId}`)
const labelId = computed<string>(() => `ds-label-${controlId.value}`)
const hintId = computed<string>(() => `ds-hint-${controlId.value}`)
const errorId = computed<string>(() => `ds-error-${controlId.value}`)

const slots = useSlots()
const hasHint = computed<boolean>(() => Boolean(props.hint || slots.hint))
const hasError = computed<boolean>(() => Boolean(props.error || slots.error))

const ariaDescribedby = computed<string | undefined>(() => {
  const ids: string[] = []
  if (hasHint.value) {
    ids.push(hintId.value)
  }
  if (hasError.value) {
    ids.push(errorId.value)
  }
  return ids.length > 0 ? ids.join(' ') : undefined
})

const fieldContext = computed<DsFieldContext>(() => ({
  controlId: controlId.value,
  ariaDescribedby: ariaDescribedby.value,
  ariaInvalid: hasError.value,
  required: props.required,
  disabled: props.disabled
}))

provide('ds-field-context', fieldContext)
</script>

<template src="./DsField.html"></template>
<style lang="scss" scoped src="./DsField.scss"></style>
