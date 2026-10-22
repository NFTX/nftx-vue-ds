<script setup lang="ts">
import { computed } from 'vue'

export type DsKbdSize = 'sm' | 'md'

export interface DsKbdProps {
  /**
   * Size of the keyboard key cap.
   * @default 'sm'
   */
  size?: DsKbdSize
  /**
   * Optional shortcut text when not using the default slot.
   */
  shortcut?: string
  /**
   * Optional accessible label for screen readers (e.g. "Press slash to search").
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DsKbdProps>(), {
  size: 'sm',
  shortcut: undefined,
  ariaLabel: undefined
})

const kbdClasses = computed<Record<string, boolean>>(() => ({
  'ds-kbd': true,
  [`ds-kbd--${props.size}`]: true
}))
</script>

<template src="./DsKbd.html"></template>
<style lang="scss" scoped src="./DsKbd.scss"></style>
