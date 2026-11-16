<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { X } from '@lucide/vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { useFocusReturn } from '@/composables/a11y/useFocusReturn'
import { useScrollLock } from '@/composables/useScrollLock'

export type DsModalSize = 'sm' | 'md' | 'lg' | 'fullscreen'
export type DsModalRole = 'dialog' | 'alertdialog'

export interface DsModalProps {
  /**
   * Dialog title text.
   */
  title?: string
  /**
   * Dialog description / subtitle text.
   */
  description?: string
  /**
   * Modal container size.
   * @default 'md'
   */
  size?: DsModalSize
  /**
   * ARIA role. Use 'alertdialog' for confirmations that require user action.
   * @default 'dialog'
   */
  role?: DsModalRole
  /**
   * Heading element tag for title.
   * @default 'h2'
   */
  headingTag?: 'h1' | 'h2' | 'h3' | 'h4'
  /**
   * Whether the modal can be dismissed via Escape key, backdrop click, or header close button.
   * Defaults to true for role="dialog" and false for role="alertdialog" (A11Y-18).
   */
  dismissible?: boolean
  /**
   * Deprecated alias for dismissible. Whether clicking the backdrop closes the modal.
   */
  closeOnBackdropClick?: boolean
  /**
   * Accessible label for the header close button.
   * @default 'Close dialog'
   */
  closeLabel?: string
}

const props = withDefaults(defineProps<DsModalProps>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  role: 'dialog',
  headingTag: 'h2',
  dismissible: undefined,
  closeOnBackdropClick: undefined,
  closeLabel: 'Close dialog'
})

const openProp = defineModel<boolean>('open', { default: false })
const defaultModel = defineModel<boolean>({ default: false })

const open = computed<boolean>({
  get: () => Boolean(openProp.value || defaultModel.value),
  set: (val: boolean) => {
    openProp.value = val
    defaultModel.value = val
  }
})
const emit = defineEmits<{
  (e: 'close'): void
}>()

const autoId = useId()
const titleId = computed<string>(() => `ds-modal-title-${autoId}`)
const descriptionId = computed<string>(() => `ds-modal-desc-${autoId}`)
const sizeClass = computed<string>(() => `ds-modal--${props.size}`)

const isDismissible = computed<boolean>(() => {
  if (props.dismissible !== undefined) return props.dismissible
  if (props.closeOnBackdropClick !== undefined) return props.closeOnBackdropClick
  return props.role !== 'alertdialog'
})

const dialogRef = ref<HTMLDialogElement | null>(null)
const focusReturn = useFocusReturn()
const scrollLock = useScrollLock()

function syncModalState(): void {
  const dialog = dialogRef.value
  if (!dialog) return

  if (open.value) {
    scrollLock.lock()
    if (!dialog.open) {
      focusReturn.saveFocus()
      if (dialog.isConnected && typeof dialog.showModal === 'function') {
        try {
          dialog.showModal()
        } catch {
          dialog.setAttribute('open', 'true')
        }
      }
    }
  } else {
    scrollLock.unlock()
    if (dialog.open) {
      if (typeof dialog.close === 'function') {
        try {
          dialog.close()
        } catch {
          dialog.removeAttribute('open')
        }
      }
      focusReturn.restoreFocus()
    }
  }
}

watch(
  () => open.value,
  () => {
    nextTick(() => {
      syncModalState()
    })
  }
)

onMounted(() => {
  if (open.value) {
    syncModalState()
  }
})

onBeforeUnmount(() => {
  scrollLock.unlock()
})

function handleClose(): void {
  open.value = false
  scrollLock.unlock()
  emit('close')
  focusReturn.restoreFocus()
}

// The dialog can also close natively, for example through a <form method="dialog"> in the slot
function handleNativeClose(): void {
  if (open.value) {
    handleClose()
  }
}

function handleCancel(event: Event): void {
  event.preventDefault()
  if (isDismissible.value) {
    handleClose()
  }
}

function handleBackdropClick(event: MouseEvent): void {
  if (!isDismissible.value) return
  const dialog = dialogRef.value
  if (!dialog) return

  const target = event.target as HTMLElement | null
  if (target?.classList.contains('ds-modal__backdrop') || event.target === dialog) {
    handleClose()
  }
}
</script>

<template src="./DsModal.html"></template>
<style lang="scss" scoped src="./DsModal.scss"></style>
