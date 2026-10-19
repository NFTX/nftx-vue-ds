<script setup lang="ts">
import { computed, useId, type Component } from 'vue'
import { DsIcon } from '@/components/DsIcon'
import { DsButton } from '@/components/DsButton'

export type DsEmptyStateVariant = 'default' | 'card'
export type DsEmptyStateHeadingTag = 'h2' | 'h3' | 'h4' | 'h5'

export interface DsEmptyStateProps {
  /**
   * Primary title or heading.
   */
  title: string
  /**
   * Explanatory description or call-to-action details.
   */
  description?: string
  /**
   * Lucide icon name or component to display above the title.
   */
  icon?: string | Component
  /**
   * Heading tag for title (h2, h3, h4, h5) to maintain semantic outline.
   * @default 'h3'
   */
  headingTag?: DsEmptyStateHeadingTag
  /**
   * Label for primary action button. If provided, renders a default CTA button.
   */
  actionLabel?: string
  /**
   * Visual presentation variant.
   * @default 'default'
   */
  variant?: DsEmptyStateVariant
}

export interface DsEmptyStateEmits {
  (e: 'action'): void
}

const props = withDefaults(defineProps<DsEmptyStateProps>(), {
  description: undefined,
  icon: undefined,
  headingTag: 'h3',
  actionLabel: undefined,
  variant: 'default'
})

const emit = defineEmits<DsEmptyStateEmits>()

const titleId = useId()
const descId = useId()

const variantClass = computed<string>(() => `ds-empty-state--${props.variant}`)

function handleAction(): void {
  emit('action')
}
</script>

<template src="./DsEmptyState.html"></template>
<style lang="scss" scoped src="./DsEmptyState.scss"></style>
