<script setup lang="ts">
import { computed, useSlots, watchEffect } from 'vue'
import DsSpinner from '@/components/DsSpinner/DsSpinner.vue'

export type DsButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type DsButtonSize = 'sm' | 'md' | 'lg'
export type DsButtonType = 'button' | 'submit' | 'reset'

export interface DsButtonProps {
  /**
   * Visual variant.
   * @default 'primary'
   */
  variant?: DsButtonVariant
  /**
   * Sizing scale.
   * @default 'md'
   */
  size?: DsButtonSize
  /**
   * HTML button type attribute.
   * @default 'button'
   */
  type?: DsButtonType
  /**
   * Disabled state preventing interactions.
   * @default false
   */
  disabled?: boolean
  /**
   * Loading state indicating an asynchronous action.
   * @default false
   */
  loading?: boolean
  /**
   * Accessible name. Required for icon-only buttons (A11Y-11).
   */
  ariaLabel?: string
  /**
   * Explicitly marks button as icon-only (square padding, requires ariaLabel).
   * @default false
   */
  iconOnly?: boolean
  /**
   * Whether button should span 100% of container width.
   * @default false
   */
  fullWidth?: boolean
}

export interface DsButtonEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<DsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  ariaLabel: undefined,
  iconOnly: false,
  fullWidth: false
})

const emit = defineEmits<DsButtonEmits>()
const slots = useSlots()

const isIconOnly = computed<boolean>(() => {
  return Boolean(props.iconOnly) || (!slots.default && (!!slots.prefix || !!slots.suffix))
})

watchEffect(() => {
  if (isIconOnly.value && !props.ariaLabel) {
    console.warn('[DsButton] Icon-only buttons require an `ariaLabel` prop (A11Y-11).')
  }
})

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template src="./DsButton.html"></template>
<style lang="scss" scoped src="./DsButton.scss"></style>
