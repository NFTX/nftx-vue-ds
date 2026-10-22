<script setup lang="ts">
import { computed, useSlots, type Component } from 'vue'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

export type DsAlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface DsAlertProps {
  /**
   * Semantic alert variant.
   * @default 'info'
   */
  variant?: DsAlertVariant
  /**
   * Optional alert title text.
   */
  title?: string
  /**
   * Optional custom icon name or component. Defaults to the semantic variant icon.
   */
  icon?: string | Component
  /**
   * Whether the alert displays a close button that emits `dismiss`.
   * @default false
   */
  dismissible?: boolean
}

const props = withDefaults(defineProps<DsAlertProps>(), {
  variant: 'info',
  title: undefined,
  icon: undefined,
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const slots = useSlots()

const alertRole = computed<'alert' | 'status'>(() =>
  props.variant === 'error' || props.variant === 'warning' ? 'alert' : 'status'
)

const defaultIconComponent = computed<Component>(() => {
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

const resolvedIconName = computed<string | undefined>(() =>
  typeof props.icon === 'string' ? props.icon : undefined
)

const resolvedIconComponent = computed<Component | undefined>(() => {
  if (typeof props.icon === 'object' || typeof props.icon === 'function') {
    return props.icon
  }
  if (!props.icon) {
    return defaultIconComponent.value
  }
  return undefined
})

const hasTitle = computed<boolean>(() => Boolean(props.title || slots.title))
const hasBody = computed<boolean>(() => Boolean(slots.default))
const hasActions = computed<boolean>(() => Boolean(slots.actions))

const alertClasses = computed<Record<string, boolean>>(() => ({
  'ds-alert': true,
  [`ds-alert--${props.variant}`]: true
}))

function handleDismiss(): void {
  emit('dismiss')
}
</script>

<template src="./DsAlert.html"></template>
<style lang="scss" scoped src="./DsAlert.scss"></style>
