<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { Check, Minus } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

defineOptions({
  inheritAttrs: false
})

export interface DsCheckboxProps {
  /**
   * Element ID. Defaults to Vue useId() (VUE-08).
   */
  id?: string
  /**
   * Visible checkbox label text.
   */
  label?: string
  /**
   * Indeterminate partially checked state (A11Y-14).
   * @default false
   */
  indeterminate?: boolean
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
   * Input value when modelValue is an array of selected items.
   */
  value?: unknown
}

const props = withDefaults(defineProps<DsCheckboxProps>(), {
  id: undefined,
  label: undefined,
  indeterminate: false,
  disabled: false,
  required: false,
  value: undefined
})

const model = defineModel<boolean | unknown[]>({ default: false })
const autoId = useId()
const computedId = computed<string>(() => props.id || `ds-checkbox-${autoId}`)

const inputRef = ref<HTMLInputElement | null>(null)

const isChecked = computed<boolean>(() => {
  if (Array.isArray(model.value)) {
    return model.value.includes(props.value)
  }
  return Boolean(model.value)
})

function syncIndeterminate(): void {
  if (inputRef.value) {
    inputRef.value.indeterminate = Boolean(props.indeterminate)
  }
}

onMounted(() => {
  syncIndeterminate()
})

watch(() => props.indeterminate, () => {
  syncIndeterminate()
})
</script>

<template src="./DsCheckbox.html"></template>
<style lang="scss" scoped src="./DsCheckbox.scss"></style>
