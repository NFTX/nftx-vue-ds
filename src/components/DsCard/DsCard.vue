<script setup lang="ts">
import { computed } from 'vue'
import DsVisuallyHidden from '@/components/DsVisuallyHidden/DsVisuallyHidden.vue'

export type DsCardVariant = 'default' | 'elevated' | 'outlined' | 'glass'
export type DsCardPadding = 'none' | 'sm' | 'md' | 'lg'
export type DsCardAccent = boolean | 'primary' | 'hover' | 'Hover'

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
  /**
   * Relationship of the linked URL. Defaults to 'noopener noreferrer' when target is '_blank'.
   */
  rel?: string
  /**
   * Whether to render 1px solid borders between header, body, and footer.
   * @default true
   */
  divided?: boolean
  /**
   * Applies hover/focus-within elevation and border transitions even when card is a container with internal links.
   * @default false
   */
  interactive?: boolean
  /**
   * Renders a top accent bar permanently ('primary' / true) or on hover/focus-within ('hover').
   * @default false
   */
  accent?: DsCardAccent
}

const props = withDefaults(defineProps<DsCardProps>(), {
  variant: 'default',
  padding: 'md',
  href: undefined,
  target: '_self',
  rel: undefined,
  divided: true,
  interactive: false,
  accent: false
})

const variantClass = computed<string>(() => `ds-card--${props.variant}`)
const paddingClass = computed<string>(() => `ds-card--padding-${props.padding}`)
const isClickable = computed<boolean>(() => Boolean(props.href) || Boolean(props.interactive))
const accentClass = computed<string | undefined>(() => {
  if (!props.accent) return undefined
  if (props.accent === 'hover' || props.accent === 'Hover') {
    return 'ds-card--accent-hover'
  }
  return 'ds-card--accent'
})
const computedRel = computed<string | undefined>(() => {
  if (props.rel) return props.rel
  if (props.target === '_blank') return 'noopener noreferrer'
  return undefined
})
</script>

<template src="./DsCard.html"></template>
<style lang="scss" scoped src="./DsCard.scss"></style>
