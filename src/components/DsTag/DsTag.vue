<script setup lang="ts">
import { computed, type Component } from 'vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

export type DsTagVariant = 'subtle' | 'surface' | 'outline' | 'ghost'
export type DsTagSize = 'sm' | 'md'
export type DsTagShape = 'rounded' | 'pill'

export interface DsTagProps {
  /**
   * Visual emphasis variant.
   * @default 'subtle'
   */
  variant?: DsTagVariant
  /**
   * Size of the tag.
   * @default 'sm'
   */
  size?: DsTagSize
  /**
   * Border radius shape.
   * @default 'rounded'
   */
  shape?: DsTagShape
  /**
   * Optional leading icon name or component.
   */
  icon?: string | Component
  /**
   * Optional text prefix (e.g. '#').
   */
  prefix?: string
  /**
   * Whether the tag displays a remove button.
   * @default false
   */
  removable?: boolean
  /**
   * Accessible aria-label for the remove button.
   * @default 'Remover'
   */
  removeLabel?: string
}

const props = withDefaults(defineProps<DsTagProps>(), {
  variant: 'subtle',
  size: 'sm',
  shape: 'rounded',
  icon: undefined,
  prefix: undefined,
  removable: false,
  removeLabel: 'Remover'
})

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const tagClasses = computed<Record<string, boolean>>(() => ({
  'ds-tag': true,
  [`ds-tag--${props.variant}`]: true,
  [`ds-tag--${props.size}`]: true,
  [`ds-tag--shape-${props.shape}`]: true
}))
</script>

<template src="./DsTag.html"></template>
<style lang="scss" scoped src="./DsTag.scss"></style>
