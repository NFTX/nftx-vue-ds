<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useId,
  type CSSProperties
} from 'vue'
import { useAnchorFallback, type AnchorPlacement } from '@/composables/a11y/useAnchorFallback'

export type DsTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface DsTooltipProps {
  /**
   * Text content displayed inside the tooltip.
   */
  content: string
  /**
   * Preferred placement relative to the trigger.
   * @default 'top'
   */
  placement?: DsTooltipPlacement
  /**
   * Delay in ms before opening on pointer hover.
   * @default 200
   */
  openDelay?: number
  /**
   * Delay in ms before closing on pointer leave (WCAG 2.2 SC 1.4.13 Hoverable).
   * @default 150
   */
  closeDelay?: number
}

const props = withDefaults(defineProps<DsTooltipProps>(), {
  placement: 'top',
  openDelay: 200,
  closeDelay: 150
})

const rawId = useId()
const sanitizedId = rawId.replace(/[^a-zA-Z0-9_-]/g, '')
const tooltipId = `ds-tooltip-${sanitizedId}`
const anchorVarName = `--ds-tooltip-anchor-${sanitizedId}`

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const { isSupported: isAnchorSupported, style: fallbackStyle, updatePosition, cleanup } =
  useAnchorFallback()

const anchorStyle = computed<CSSProperties>(() => ({
  '--ds-tooltip-anchor-name': anchorVarName
}))

const popoverStyle = computed<CSSProperties>(() => ({
  '--ds-tooltip-anchor-name': anchorVarName,
  ...(isAnchorSupported ? {} : fallbackStyle.value)
}))

const mappedAnchorPlacement = computed<AnchorPlacement>(() => {
  switch (props.placement) {
    case 'bottom':
    case 'right':
      return 'bottom-start'
    case 'top':
    case 'left':
    default:
      return 'top-start'
  }
})

function clearTimers(): void {
  if (openTimer !== null) {
    clearTimeout(openTimer)
    openTimer = null
  }
  if (closeTimer !== null) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function syncTriggerAriaDescribedby(): void {
  const wrapper = triggerRef.value
  if (!wrapper) return
  const child = wrapper.firstElementChild as HTMLElement | null
  if (child) {
    child.setAttribute('aria-describedby', tooltipId)
  }
}

async function openNow(): Promise<void> {
  clearTimers()
  if (isOpen.value) return
  isOpen.value = true
  await nextTick()
  const el = tooltipRef.value
  if (el && typeof el.showPopover === 'function') {
    try {
      el.showPopover()
    } catch {
      // Fallback when popover API throws in headless or detached DOM
    }
  }
  if (!isAnchorSupported) {
    updatePosition(triggerRef.value, tooltipRef.value, mappedAnchorPlacement.value)
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalKeydown)
  }
}

function closeNow(): void {
  clearTimers()
  if (!isOpen.value) return
  isOpen.value = false
  const el = tooltipRef.value
  if (el && typeof el.hidePopover === 'function') {
    try {
      el.hidePopover()
    } catch {
      // Fallback
    }
  }
  cleanup()
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
}

function scheduleOpen(): void {
  clearTimers()
  if (props.openDelay <= 0) {
    void openNow()
    return
  }
  openTimer = setTimeout(() => {
    openTimer = null
    void openNow()
  }, props.openDelay)
}

function scheduleClose(): void {
  clearTimers()
  if (props.closeDelay <= 0) {
    closeNow()
    return
  }
  closeTimer = setTimeout(() => {
    closeTimer = null
    closeNow()
  }, props.closeDelay)
}

function handleTriggerMouseEnter(): void {
  scheduleOpen()
}

function handleTriggerMouseLeave(): void {
  scheduleClose()
}

function handleTooltipMouseEnter(): void {
  clearTimers()
}

function handleTooltipMouseLeave(): void {
  scheduleClose()
}

function handleFocusIn(): void {
  void openNow()
}

function handleFocusOut(): void {
  closeNow()
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isOpen.value) {
    closeNow()
  }
}

onMounted(() => {
  syncTriggerAriaDescribedby()
})

onUpdated(() => {
  syncTriggerAriaDescribedby()
})

onBeforeUnmount(() => {
  clearTimers()
  cleanup()
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
})
</script>

<template src="./DsTooltip.html"></template>
<style lang="scss" scoped src="./DsTooltip.scss"></style>
