<script setup lang="ts">
/**
 * DsVisuallyHidden
 *
 * Hides content visually while keeping it fully accessible to screen readers.
 * Uses the standard visually-hidden CSS clipping pattern.
 */
export interface DsVisuallyHiddenProps {
  /**
   * Semantic HTML element tag to render.
   * @default 'span'
   */
  as?: string
}

withDefaults(defineProps<DsVisuallyHiddenProps>(), {
  as: 'span'
})
</script>

<template src="./DsVisuallyHidden.html"></template>
<style lang="scss" scoped src="./DsVisuallyHidden.scss"></style>
