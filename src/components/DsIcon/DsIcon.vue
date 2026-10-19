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
  size: 'md',
  ariaLabel: undefined
})

function toPascalCase(str: string): string {
  return str
    .replace(/(^\w|-\w)/g, (clear) => clear.replace('-', '').toUpperCase())
    .trim()
}

const resolvedIcon = computed<Component | string>(() => {
  if (typeof props.icon !== 'string') {
    return props.icon
  }

  const pascalName = toPascalCase(props.icon)
  const iconDict = LucideIcons as unknown as Record<string, Component>
  const match = iconDict[pascalName] || iconDict[`${pascalName}Icon`]
  return match ?? 'span'
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
