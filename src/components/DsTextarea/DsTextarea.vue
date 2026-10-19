<script setup lang="ts">
import { computed, inject, useId, type ComputedRef } from 'vue'
import type { DsFieldContext } from '@/components/DsField/DsField.vue'

defineOptions({
  inheritAttrs: false
})

export type DsTextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface DsTextareaProps {
  /**
   * Control ID. Automatically inherited from parent DsField if present.
   */
  id?: string
  /**
   * Visible rows.
   * @default 4
   */
  rows?: number
  /**
   * Placeholder text. Note: forbidden as label substitute (A11Y-09).
   */
  placeholder?: string
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean
  /**
   * Required attribute.
   * @default false
   */
  required?: boolean
  /**
   * Readonly attribute.
   * @default false
   */
  readonly?: boolean
  /**
   * Maximum character length.
   */
  maxlength?: number
  /**
   * Whether to display character counter.
   * @default false
   */
  showCount?: boolean
  /**
   * Resize CSS mode.
   * @default 'vertical'
   */
  resize?: DsTextareaResize
  /**
   * ARIA describedby IDs.
   */
  ariaDescribedby?: string
  /**
   * ARIA invalid flag.
   */
  ariaInvalid?: boolean
}

const props = withDefaults(defineProps<DsTextareaProps>(), {
  id: undefined,
  rows: 4,
  placeholder: undefined,
  disabled: false,
  required: false,
  readonly: false,
  maxlength: undefined,
  showCount: false,
  resize: 'vertical',
  ariaDescribedby: undefined,
  ariaInvalid: undefined
})

const model = defineModel<string>({ default: '' })

const fieldContext = inject<ComputedRef<DsFieldContext> | null>('ds-field-context', null)
const autoId = useId()

const computedId = computed<string>(() => props.id || fieldContext?.value.controlId || `ds-textarea-${autoId}`)
const countId = computed<string>(() => `${computedId.value}-count`)
const computedDisabled = computed<boolean>(() => props.disabled || fieldContext?.value.disabled || false)
const computedRequired = computed<boolean>(() => props.required || fieldContext?.value.required || false)
const computedInvalid = computed<boolean>(() => {
  if (props.ariaInvalid !== undefined) return props.ariaInvalid
  return fieldContext?.value.ariaInvalid || false
})

const charCount = computed<number>(() => (model.value ? model.value.length : 0))

const computedDescribedby = computed<string | undefined>(() => {
  const ids: string[] = []
  const baseDescribedBy = props.ariaDescribedby || fieldContext?.value.ariaDescribedby
  if (baseDescribedBy) {
    ids.push(baseDescribedBy)
  }
  if (props.showCount || props.maxlength) {
    ids.push(countId.value)
  }
  return ids.length > 0 ? ids.join(' ') : undefined
})

const countText = computed<string>(() => {
  if (props.maxlength !== undefined) {
    return `${charCount.value} / ${props.maxlength}`
  }
  return `${charCount.value}`
})
</script>

<template src="./DsTextarea.html"></template>
<style lang="scss" scoped src="./DsTextarea.scss"></style>
