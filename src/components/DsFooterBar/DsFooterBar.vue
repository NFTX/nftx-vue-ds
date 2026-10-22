<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsFooterBarVariant = 'surface' | 'base'

export interface DsFooterBarProps {
  /**
   * Whether to display a top border (`border-block-start`).
   * @default true
   */
  bordered?: boolean
  /**
   * Background surface variant.
   * @default 'surface'
   */
  variant?: DsFooterBarVariant
}

const props = withDefaults(defineProps<DsFooterBarProps>(), {
  bordered: true,
  variant: 'surface'
})

const slots = useSlots()

const hasStart = computed<boolean>(() => Boolean(slots.start || slots.default))
const hasCenter = computed<boolean>(() => Boolean(slots.center))
const hasEnd = computed<boolean>(() => Boolean(slots.end))

const footerClasses = computed<Record<string, boolean>>(() => ({
  'ds-footer-bar': true,
  [`ds-footer-bar--${props.variant}`]: true,
  'ds-footer-bar--bordered': props.bordered
}))
</script>

<template src="./DsFooterBar.html"></template>
<style lang="scss" scoped src="./DsFooterBar.scss"></style>
