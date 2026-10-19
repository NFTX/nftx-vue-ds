<script setup lang="ts">
import { computed } from 'vue'

export type DsCardGridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DsCardGridProps {
  /**
   * Root HTML container tag.
   * Defaults to 'ul' to enforce semantic list structure for assistive technologies.
   * @default 'ul'
   */
  tag?: string
  /**
   * Minimum column width before wrapping.
   * Uses CSS `min(100%, minColWidth)` to guarantee zero overflow at 320px (RESP-02, RESP-06).
   * @default '18rem'
   */
  minColWidth?: string
  /**
   * Spacing gap between grid items.
   * @default 'md'
   */
  gap?: DsCardGridGap
  /**
   * Whether grid items should pack compactly to fill holes.
   * @default false
   */
  dense?: boolean
  /**
   * Optional array of data items to render via scoped `#item` slot.
   */
  items?: unknown[]
}

const props = withDefaults(defineProps<DsCardGridProps>(), {
  tag: 'ul',
  minColWidth: '18rem',
  gap: 'md',
  dense: false,
  items: undefined
})

const gapClass = computed<string>(() => `ds-card-grid--gap-${props.gap}`)

const gridStyle = computed<Record<string, string>>(() => ({
  '--ds-card-grid-min-col': props.minColWidth
}))
</script>

<template src="./DsCardGrid.html"></template>
<style lang="scss" scoped src="./DsCardGrid.scss"></style>
