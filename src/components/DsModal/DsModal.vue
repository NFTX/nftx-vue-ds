<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { X } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { useFocusReturn } from '@/composables/a11y/useFocusReturn'

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
}

const props = withDefaults(defineProps<DsModalProps>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  role: 'dialog',
  headingTag: 'h2',
  dismissible: undefined,
  closeOnBackdropClick: undefined
})

const open = defineModel<boolean>('open', { default: false })
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

function syncModalState(): void {
  const dialog = dialogRef.value
  if (!dialog) return

  if (open.value) {
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

watch(open, () => {
  nextTick(() => {
    syncModalState()
  })
})

onMounted(() => {
  if (open.value) {
    syncModalState()
  }
})

function handleClose(): void {
  open.value = false
  emit('close')
  focusReturn.restoreFocus()
}

function handleCancel(event: Event): void {
  event.preventDefault()
  if (isDismissible.value) {
    handleClose()
  }
}

function handleBackdropClick(event: MouseEvent): void {
  if (!isDismissible.value) return
  // If clicked directly on the dialog backdrop (outside the inner box)
  if (event.target === dialogRef.value) {
    handleClose()
  }
}
</script>

<template src="./DsModal.html"></template>
<style lang="scss" scoped src="./DsModal.scss"></style>
