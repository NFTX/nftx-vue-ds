<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsBadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'
export type DsBadgeSize = 'sm' | 'md' | 'lg'

export interface DsBadgeProps {
  /**
   * Status color variant.
   * @default 'neutral'
   */
  variant?: DsBadgeVariant
  /**
   * Sizing scale.
   * @default 'md'
   */
  size?: DsBadgeSize
  /**
   * Whether to display a status dot.
   * @default false
   */
  dot?: boolean
  /**
   * Semantic HTML element tag.
   * @default 'span'
   */
  as?: string
  /**
   * Accessible description when badge has only a dot or numeric count.
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DsBadgeProps>(), {
  variant: 'neutral',
  size: 'md',
  dot: false,
  as: 'span',
  ariaLabel: undefined
})

const slots = useSlots()
const isDotOnly = computed<boolean>(() => props.dot && !slots.default)

const variantClass = computed<string>(() => `ds-badge--${props.variant}`)
const sizeClass = computed<string>(() => `ds-badge--${props.size}`)
</script>

<template src="./DsBadge.html"></template>
<style lang="scss" scoped src="./DsBadge.scss"></style>
