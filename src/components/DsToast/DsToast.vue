<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { useAnnouncer } from '@/composables/a11y/useAnnouncer'

export type DsToastVariant = 'info' | 'success' | 'warning' | 'error'
export type DsToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface DsToastProps {
  /**
   * Title text of the toast notification.
   */
  title?: string
  /**
   * Body / description text.
   */
  description?: string
  /**
   * Semantic visual variant.
   * @default 'info'
   */
  variant?: DsToastVariant
  /**
   * Duration in milliseconds before auto-dismissing.
   * If 0, the toast persists until manually closed.
   * If omitted, errors default to 0 (persistent) and others default to 5000ms.
   */
  duration?: number
  /**
   * Screen position where the toast appears.
   * @default 'bottom-right'
   */
  position?: DsToastPosition
  /**
   * Whether to show the manual close button.
   * @default true
   */
  closable?: boolean
}

const props = withDefaults(defineProps<DsToastProps>(), {
  title: undefined,
  description: undefined,
  variant: 'info',
  duration: undefined,
  position: 'bottom-right',
  closable: true
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'dismiss'): void
}>()

const autoId = useId()
const titleId = computed<string>(() => `ds-toast-title-${autoId}`)
const descId = computed<string>(() => `ds-toast-desc-${autoId}`)

const toastRole = computed<'alert' | 'status'>(() =>
  props.variant === 'error' ? 'alert' : 'status'
)

const toastLive = computed<'assertive' | 'polite'>(() =>
  props.variant === 'error' ? 'assertive' : 'polite'
)

const variantIcon = computed(() => {
  switch (props.variant) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
})

const variantClass = computed<string>(() => `ds-toast--${props.variant}`)
const positionClass = computed<string>(() => `ds-toast--${props.position}`)

const toastRef = ref<HTMLElement | null>(null)
const announcer = useAnnouncer()

let timer: ReturnType<typeof setTimeout> | null = null
let remainingTime = 0
let timerStartTime = 0
let isHovered = false
let isFocused = false

const effectiveDuration = computed<number>(() => {
  if (props.duration !== undefined) {
    return props.duration
  }
  return props.variant === 'error' ? 0 : 5000
})

function dismiss(): void {
  clearTimer()
  open.value = false
  emit('close')
  emit('dismiss')
}

function startTimer(): void {
  clearTimer()
  const dur = effectiveDuration.value
  if (dur <= 0) return

  remainingTime = dur
  timerStartTime = Date.now()
  timer = setTimeout(dismiss, remainingTime)
}

function clearTimer(): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function pauseTimer(): void {
  if (timer && effectiveDuration.value > 0) {
    const elapsed = Date.now() - timerStartTime
    remainingTime = Math.max(0, remainingTime - elapsed)
    clearTimeout(timer)
    timer = null
  }
}

function resumeTimer(): void {
  if (!isHovered && !isFocused && remainingTime > 0 && effectiveDuration.value > 0 && !timer) {
    timerStartTime = Date.now()
    timer = setTimeout(dismiss, remainingTime)
  }
}

function handleMouseEnter(): void {
  isHovered = true
  pauseTimer()
}

function handleMouseLeave(): void {
  isHovered = false
  resumeTimer()
}

function handleFocusIn(): void {
  isFocused = true
  pauseTimer()
}

function handleFocusOut(event: FocusEvent): void {
  const el = toastRef.value
  if (el && event.relatedTarget && el.contains(event.relatedTarget as Node)) {
    return
  }
  isFocused = false
  resumeTimer()
}

function announceToast(): void {
  const text = [props.title, props.description].filter(Boolean).join('. ')
  if (text) {
    announcer.announce(text, props.variant === 'error' ? 'assertive' : 'polite')
  }
}

function syncPopover(): void {
  const el = toastRef.value
  if (!el) return

  if (open.value) {
    if (el.isConnected && typeof el.showPopover === 'function') {
      try {
        if (!el.matches(':popover-open')) {
          el.showPopover()
        }
      } catch {
        // Fallback if already showing or unsupported
      }
    }
    startTimer()
    announceToast()
  } else {
    clearTimer()
    if (el.isConnected && typeof el.hidePopover === 'function') {
      try {
        if (el.matches(':popover-open')) {
          el.hidePopover()
        }
      } catch {
        // Fallback
      }
    }
  }
}

watch(open, () => {
  nextTick(() => {
    syncPopover()
  })
})

onMounted(() => {
  if (open.value) {
    syncPopover()
  }
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template src="./DsToast.html"></template>
<style lang="scss" scoped src="./DsToast.scss"></style>
