<script setup lang="ts">
import { computed, type Component } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

export type DsIconSize = 'sm' | 'md' | 'lg' | 'xl' | number

export interface DsIconProps {
  /**
   * Lucide icon component or icon name (PascalCase or kebab-case).
   */
  icon: Component | string
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
   * Accessible label. When omitted, icon is marked aria-hidden="true".
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DsIconProps>(), {
  fallback: undefined,
  size: 'md',
  ariaLabel: undefined
})

function toPascalCase(str: string): string {
  return str
    .replace(/(^\w|[_\s-]\w)/g, (clear) => clear.replace(/[_\s-]/, '').toUpperCase())
    .trim()
}

function resolveSingleIcon(val: Component | string | undefined): Component | string | undefined {
  if (!val) return undefined
  if (typeof val !== 'string') return val

  const trimmed = val.trim()
  if (!trimmed) return undefined

  const pascalName = toPascalCase(trimmed)
  const iconDict = LucideIcons as unknown as Record<string, Component>
  return iconDict[pascalName] || iconDict[`${pascalName}Icon`]
}

const resolvedIcon = computed<Component | string>(() => {
  return resolveSingleIcon(props.icon) || resolveSingleIcon(props.fallback) || 'span'
})

const isAriaHidden = computed<boolean>(() => !props.ariaLabel)

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
</script>

<template src="./DsIcon.html"></template>
<style lang="scss" scoped src="./DsIcon.scss"></style>
