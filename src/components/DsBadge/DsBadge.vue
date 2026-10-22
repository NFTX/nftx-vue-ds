<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsBadgeVariant =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'subtle'
  | 'ghost'
  | 'outline'
export type DsBadgeSize = 'sm' | 'md' | 'lg'
export type DsBadgeShape = 'pill' | 'rounded'

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
   * Corner radius shape.
   * @default 'pill'
   */
  shape?: DsBadgeShape
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
  shape: 'pill',
  dot: false,
  as: 'span',
  ariaLabel: undefined
})

const slots = useSlots()
const isDotOnly = computed<boolean>(() => props.dot && !slots.default)

const variantClass = computed<string>(() => `ds-badge--${props.variant}`)
const sizeClass = computed<string>(() => `ds-badge--${props.size}`)
const shapeClass = computed<string | undefined>(() =>
  props.shape === 'rounded' ? 'ds-badge--rounded' : undefined
)
</script>

<template src="./DsBadge.html"></template>
<style lang="scss" scoped src="./DsBadge.scss"></style>
