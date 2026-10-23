<script setup lang="ts">
import { computed, type Component } from 'vue'
import { resolveIconByName } from './iconRegistry'

export type DsIconSize = 'sm' | 'md' | 'lg' | 'xl' | number

export interface DsIconProps {
  /**
   * Lucide icon component or icon name (PascalCase or kebab-case).
   */
  icon?: Component | string
  /**
   * Alias for `icon` (Lucide icon component or icon name).
   */
  name?: Component | string
  /**
   * Fallback icon component or icon name when the requested icon cannot be resolved.
   */
  fallback?: Component | string
  /**
   * Size token or custom number in pixels.
   * @default 'md'
   */
  size?: DsIconSize
  /**
   * Explicitly marks icon as decorative (`aria-hidden="true"`).
   */
  decorative?: boolean
  /**
   * Accessible label. When omitted, icon is marked aria-hidden="true".
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DsIconProps>(), {
  icon: undefined,
  name: undefined,
  fallback: undefined,
  size: 'md',
  decorative: undefined,
  ariaLabel: undefined
})

function resolveSingleIcon(val: Component | string | undefined): Component | string | undefined {
  if (!val) return undefined
  if (typeof val !== 'string') return val
  return resolveIconByName(val)
}

const resolvedIcon = computed<Component | string>(() => {
  const primary = props.icon ?? props.name
  return resolveSingleIcon(primary) || resolveSingleIcon(props.fallback) || 'span'
})

const isAriaHidden = computed<boolean>(() => {
  if (props.decorative === true) return true
  return !props.ariaLabel
})

const sizeClass = computed<string | undefined>(() => {
  if (typeof props.size === 'string') {
    return `ds-icon--${props.size}`
  }
  return undefined
})

const customStyle = computed<Record<string, string> | undefined>(() => {
  if (typeof props.size === 'number') {
    const sizeRem = `${props.size / 16}rem`
    return {
      inlineSize: sizeRem,
      blockSize: sizeRem
    }
  }
  return undefined
})
const iconKey = computed<string>(() => {
  const primary = props.icon ?? props.name
  if (typeof primary === 'string') return primary
  return props.ariaLabel ?? 'ds-icon'
})
</script>

<template src="./DsIcon.html"></template>
<style lang="scss" scoped src="./DsIcon.scss"></style>
