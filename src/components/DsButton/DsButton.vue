<script setup lang="ts">
import { computed, useSlots, watchEffect } from 'vue'
import DsSpinner from '@/components/DsSpinner/DsSpinner.vue'

export type DsButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type DsButtonSize = 'sm' | 'md' | 'lg'
export type DsButtonType = 'button' | 'submit' | 'reset'

export interface DsButtonProps {
  /**
   * Visual variant.
   * @default 'primary'
   */
  variant?: DsButtonVariant
  /**
   * Sizing scale.
   * @default 'md'
   */
  size?: DsButtonSize
  /**
   * HTML button type attribute (ignored when href is provided).
   * @default 'button'
   */
  type?: DsButtonType
  /**
   * Optional URL for link rendering (renders <a> element with role="button").
   */
  href?: string
  /**
   * Target attribute for link rendering (e.g. '_blank').
   */
  target?: string
  /**
   * Rel attribute for link rendering. Defaults to 'noopener noreferrer' when target='_blank'.
   */
  rel?: string
  /**
   * Disabled state preventing interactions.
   * @default false
   */
  disabled?: boolean
  /**
   * Loading state indicating an asynchronous action.
   * @default false
   */
  loading?: boolean
  /**
   * Accessible name. Required for icon-only buttons (A11Y-11).
   */
  ariaLabel?: string
  /**
   * Explicitly marks button as icon-only (square padding, requires ariaLabel).
   * @default false
   */
  iconOnly?: boolean
  /**
   * Whether button should span 100% of container width.
   * @default false
   */
  fullWidth?: boolean
}

export interface DsButtonEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<DsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  href: undefined,
  target: undefined,
  rel: undefined,
  disabled: false,
  loading: false,
  ariaLabel: undefined,
  iconOnly: false,
  fullWidth: false
})

const emit = defineEmits<DsButtonEmits>()
const slots = useSlots()

const isLink = computed<boolean>(() => Boolean(props.href))
const tag = computed<'a' | 'button'>(() => (isLink.value ? 'a' : 'button'))

const effectiveRel = computed<string | undefined>(() => {
  if (props.rel) return props.rel
  if (props.target === '_blank') return 'noopener noreferrer'
  return undefined
})

const isIconOnly = computed<boolean>(() => {
  return Boolean(props.iconOnly) || (!slots.default && (!!slots.prefix || !!slots.suffix))
})

watchEffect(() => {
  if (isIconOnly.value && !props.ariaLabel) {
    console.warn('[DsButton] Icon-only buttons require an `ariaLabel` prop (A11Y-11).')
  }
})

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

function handleSpaceKey(event: KeyboardEvent): void {
  if (isLink.value) {
    event.preventDefault()
    if (!props.disabled && !props.loading) {
      emit('click', event as unknown as MouseEvent)
    }
  }
}
</script>

<template src="./DsButton.html"></template>
<style lang="scss" scoped src="./DsButton.scss"></style>
