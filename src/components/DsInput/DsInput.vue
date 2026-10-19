<script setup lang="ts">
import { computed, inject, ref, useId, type ComputedRef } from 'vue'
import { X } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import type { DsFieldContext } from '@/components/DsField/DsField.vue'

defineOptions({
  inheritAttrs: false
})

export type DsInputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
export type DsInputSize = 'sm' | 'md' | 'lg'

export interface DsInputProps {
  /**
   * Input ID. Automatically inherits from parent DsField if present.
   */
  id?: string
  /**
   * HTML input type.
   * @default 'text'
   */
  type?: DsInputType
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
   * Readonly state.
   * @default false
   */
  readonly?: boolean
  /**
   * Whether to display a clear button when text is present.
   * @default false
   */
  clearable?: boolean
  /**
   * Sizing scale.
   * @default 'md'
   */
  size?: DsInputSize
  /**
   * ARIA describedby IDs. Inherited from DsField when used.
   */
  ariaDescribedby?: string
  /**
   * ARIA invalid flag. Inherited from DsField when used.
   */
  ariaInvalid?: boolean
}

export interface DsInputEmits {
  (e: 'clear'): void
}

const props = withDefaults(defineProps<DsInputProps>(), {
  id: undefined,
  type: 'text',
  placeholder: undefined,
  disabled: false,
  required: false,
  readonly: false,
  clearable: false,
  size: 'md',
  ariaDescribedby: undefined,
  ariaInvalid: undefined
})

const emit = defineEmits<DsInputEmits>()
const model = defineModel<string | number>()

const fieldContext = inject<ComputedRef<DsFieldContext> | null>('ds-field-context', null)
const autoId = useId()

const inputRef = ref<HTMLInputElement | null>(null)

const computedId = computed<string>(() => props.id || fieldContext?.value.controlId || `ds-input-${autoId}`)
const computedDisabled = computed<boolean>(() => props.disabled || fieldContext?.value.disabled || false)
const computedRequired = computed<boolean>(() => props.required || fieldContext?.value.required || false)
const computedInvalid = computed<boolean>(() => {
  if (props.ariaInvalid !== undefined) return props.ariaInvalid
  return fieldContext?.value.ariaInvalid || false
})
const computedDescribedby = computed<string | undefined>(() => {
  if (props.ariaDescribedby !== undefined) return props.ariaDescribedby
  return fieldContext?.value.ariaDescribedby
})

const hasValue = computed<boolean>(() => {
  if (model.value === undefined || model.value === null) return false
  return String(model.value).length > 0
})

const showClear = computed<boolean>(() => props.clearable && hasValue.value && !computedDisabled.value && !props.readonly)

function handleClear(): void {
  model.value = ''
  emit('clear')
  inputRef.value?.focus()
}
</script>

<template src="./DsInput.html"></template>
<style lang="scss" scoped src="./DsInput.scss"></style>
