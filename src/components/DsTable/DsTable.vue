<script setup lang="ts">
import { computed } from 'vue'

export interface DsTableProps {
  /**
   * Accessible caption for the table.
   */
  caption?: string
  /**
   * Alternating background rows for improved readability.
   * @default false
   */
  striped?: boolean
  /**
   * Highlights rows when hovered.
   * @default true
   */
  hoverable?: boolean
  /**
   * Reduces cell padding for high-density tabular data.
   * @default false
   */
  compact?: boolean
  /**
   * Shows borders around the entire table and cells.
   * @default false
   */
  bordered?: boolean
  /**
   * Wraps the table inside a responsive horizontal scroll region.
   * @default true
   */
  responsive?: boolean
}

const props = withDefaults(defineProps<DsTableProps>(), {
  caption: undefined,
  striped: false,
  hoverable: true,
  compact: false,
  bordered: false,
  responsive: true
})

const tableClasses = computed<Record<string, boolean>>(() => ({
  'ds-table': true,
  'ds-table--striped': props.striped,
  'ds-table--hoverable': props.hoverable,
  'ds-table--compact': props.compact,
  'ds-table--bordered': props.bordered
}))
</script>

<template src="./DsTable.html"></template>
<style lang="scss" scoped src="./DsTable.scss"></style>
