<script setup lang="ts">
import { computed, useId } from 'vue'

export type DsSwitchSize = 'sm' | 'md' | 'lg'

export interface DsSwitchProps {
  /**
   * Element ID. Defaults to Vue useId() (VUE-08).
   */
  id?: string
  /**
   * Visible label text positioned next to switch.
   */
  label?: string
  /**
   * Accessible label if no visible label is displayed.
   */
  ariaLabel?: string
  /**
   * Sizing scale.
   * @default 'md'
   */
  size?: DsSwitchSize
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean
}

export interface DsSwitchEmits {
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<DsSwitchProps>(), {
  id: undefined,
  label: undefined,
  ariaLabel: undefined,
  size: 'md',
  disabled: false
})

const emit = defineEmits<DsSwitchEmits>()
const model = defineModel<boolean>({ default: false })
const autoId = useId()
const computedId = computed<string>(() => props.id || `ds-switch-${autoId}`)

const isChecked = computed<boolean>(() => Boolean(model.value))
const computedAriaLabel = computed<string | undefined>(() => props.ariaLabel || props.label)

function handleToggle(event: Event): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  model.value = !model.value
  emit('change', model.value)
}
</script>

<template src="./DsSwitch.html"></template>
<style lang="scss" scoped src="./DsSwitch.scss"></style>
