<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import DsVisuallyHidden from '@/components/DsVisuallyHidden/DsVisuallyHidden.vue'

export type DsCardVariant = 'default' | 'elevated' | 'outlined' | 'glass'
export type DsCardPadding = 'none' | 'sm' | 'md' | 'lg'
export type DsCardAccent = boolean | 'primary' | 'hover'

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
   * Optional primary header title text rendered when `#header` slot is not provided.
   */
  title?: string
  /**
   * Optional primary destination URL. The whole card becomes clickable: the link
   * wraps the `title` when there is one, otherwise it is an overlay named by `linkLabel`.
   * Buttons and links inside the card stay clickable on their own.
   */
  href?: string
  /**
   * Accessible name of the card link when there is no `title` (for example the service name).
   * Without it, the link is named by the card body text.
   */
  linkLabel?: string
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
  /**
   * Screen reader text added to the link when `target` is `_blank`.
   * @default '(opens in a new tab)'
   */
  newTabLabel?: string
}

const props = withDefaults(defineProps<DsCardProps>(), {
  variant: 'default',
  padding: 'md',
  title: undefined,
  href: undefined,
  linkLabel: undefined,
  target: '_self',
  rel: undefined,
  divided: true,
  interactive: false,
  accent: false,
  newTabLabel: '(opens in a new tab)'
})

const variantClass = computed<string>(() => `ds-card--${props.variant}`)
const paddingClass = computed<string>(() => `ds-card--padding-${props.padding}`)
const isClickable = computed<boolean>(() => Boolean(props.href) || Boolean(props.interactive))
const accentClass = computed<string | undefined>(() => {
  if (!props.accent) return undefined
  if (props.accent === 'hover') {
    return 'ds-card--accent-hover'
  }
  return 'ds-card--accent'
})
const slots = useSlots()
const autoId = useId()
const bodyId = `ds-card-body-${autoId}`
const newTabId = `ds-card-new-tab-${autoId}`
// Wrap the title text when the card renders its own title; otherwise use an overlay link
const linksTitle = computed<boolean>(() => Boolean(props.href && props.title && !slots.header))
const overlayLabelledby = computed<string | undefined>(() => {
  if (props.linkLabel) return undefined
  return props.target === '_blank' ? `${bodyId} ${newTabId}` : bodyId
})

const computedRel = computed<string | undefined>(() => {
  if (props.rel) return props.rel
  if (props.target === '_blank') return 'noopener noreferrer'
  return undefined
})
</script>

<template src="./DsCard.html"></template>
<style lang="scss" scoped src="./DsCard.scss"></style>
