<script setup lang="ts">
import { computed } from 'vue'

export type DsCardVariant = 'default' | 'elevated' | 'outlined' | 'glass'
export type DsCardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface DsCardProps {
  /**
   * Card visual style variant.
   * @default 'default'
   */
  variant?: DsCardVariant
  /**
   * Card internal padding.
   * @default 'md'
   */
  padding?: DsCardPadding
  /**
   * Optional primary destination URL.
   * When provided, renders a stretched link across the entire card.
   */
  href?: string
  /**
   * Target for the primary link.
   * @default '_self'
   */
  target?: string
}

const props = withDefaults(defineProps<DsCardProps>(), {
  variant: 'default',
  padding: 'md',
  href: undefined,
  target: '_self'
})

const variantClass = computed<string>(() => `ds-card--${props.variant}`)
const paddingClass = computed<string>(() => `ds-card--padding-${props.padding}`)
const isClickable = computed<boolean>(() => Boolean(props.href))
</script>

<template src="./DsCard.html"></template>
<style lang="scss" scoped src="./DsCard.scss"></style>
