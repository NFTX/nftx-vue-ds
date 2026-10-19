<script setup lang="ts">
import { computed } from 'vue'

export interface DsSkipLinkProps {
  /**
   * Target element ID to jump to when activated.
   * Takes precedence if `href` is not explicitly provided.
   * @default 'main-content'
   */
  targetId?: string
  /**
   * Destination anchor href.
   * If omitted, falls back to `#${targetId}`.
   */
  href?: string
}

const props = withDefaults(defineProps<DsSkipLinkProps>(), {
  targetId: 'main-content',
  href: undefined
})

const computedHref = computed<string>(() => {
  if (props.href) return props.href
  return `#${props.targetId}`
})

/**
 * Ensures keyboard focus moves cleanly to target landmark,
 * even when target element lacks native tabindex (A11Y-06, A11Y-07).
 */
function handleClick(event: MouseEvent): void {
  event.preventDefault()

  const targetSelector = computedHref.value
  if (!targetSelector.startsWith('#')) return

  const targetEl = document.querySelector<HTMLElement>(targetSelector)
  if (!targetEl) return

  // If target is not naturally focusable, set temporary tabindex for programmatic focus
  if (!targetEl.hasAttribute('tabindex')) {
    targetEl.setAttribute('tabindex', '-1')
    targetEl.addEventListener(
      'blur',
      () => {
        targetEl.removeAttribute('tabindex')
      },
      { once: true }
    )
  }

  targetEl.focus()
  targetEl.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template src="./DsSkipLink.html"></template>
<style lang="scss" scoped src="./DsSkipLink.scss"></style>
