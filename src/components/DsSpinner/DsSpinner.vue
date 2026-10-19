<script setup lang="ts">
import { computed } from 'vue'

export type DsSpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
export type DsSpinnerVariant = 'current' | 'brand' | 'neutral'

export interface DsSpinnerProps {
  /**
   * Size of the spinner.
   * @default 'md'
   */
  size?: DsSpinnerSize
  /**
   * Color variant of the spinner.
   * @default 'current'
   */
  variant?: DsSpinnerVariant
  /**
   * Accessible text for screen readers.
   * @default 'Loading...'
   */
  label?: string
}

const props = withDefaults(defineProps<DsSpinnerProps>(), {
  size: 'md',
  variant: 'current',
  label: 'Loading...'
})

const sizeClass = computed<string>(() => `ds-spinner--${props.size}`)
const variantClass = computed<string>(() => `ds-spinner--${props.variant}`)
</script>

<template src="./DsSpinner.html"></template>
<style lang="scss" scoped src="./DsSpinner.scss"></style>
