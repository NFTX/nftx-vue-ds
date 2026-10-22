<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsDividerOrientation = 'horizontal' | 'vertical'
export type DsDividerVariant = 'solid' | 'dashed'
export type DsDividerSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface DsDividerProps {
  /**
   * Axis of the separator.
   * @default 'horizontal'
   */
  orientation?: DsDividerOrientation
  /**
   * Line style variant.
   * @default 'solid'
   */
  variant?: DsDividerVariant
  /**
   * Margin spacing along the perpendicular axis.
   * @default 'md'
   */
  spacing?: DsDividerSpacing
  /**
   * Optional centered label text.
   */
  label?: string
  /**
   * Whether the divider is purely decorative (`role="none"` / `aria-hidden="true"`).
   * Set to `false` to expose `role="separator"` to assistive technologies.
   * @default true
   */
  decorative?: boolean
}

const props = withDefaults(defineProps<DsDividerProps>(), {
  orientation: 'horizontal',
  variant: 'solid',
  spacing: 'md',
  label: undefined,
  decorative: true
})

const slots = useSlots()

const hasLabel = computed<boolean>(() => Boolean(props.label || slots.default))

const dividerClasses = computed<Record<string, boolean>>(() => ({
  'ds-divider': true,
  [`ds-divider--${props.orientation}`]: true,
  [`ds-divider--${props.variant}`]: true,
  [`ds-divider--spacing-${props.spacing}`]: true,
  'ds-divider--with-label': hasLabel.value
}))
</script>

<template src="./DsDivider.html"></template>
<style lang="scss" scoped src="./DsDivider.scss"></style>
