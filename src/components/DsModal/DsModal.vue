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
   * Whether clicking the backdrop closes the modal.
   * @default true
   */
  closeOnBackdropClick?: boolean
}

const props = withDefaults(defineProps<DsModalProps>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  role: 'dialog',
  headingTag: 'h2',
  closeOnBackdropClick: true
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'close'): void
}>()

const autoId = useId()
const titleId = computed<string>(() => `ds-modal-title-${autoId}`)
const descriptionId = computed<string>(() => `ds-modal-desc-${autoId}`)
const sizeClass = computed<string>(() => `ds-modal--${props.size}`)

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
  handleClose()
}

function handleBackdropClick(event: MouseEvent): void {
  if (!props.closeOnBackdropClick) return
  // If clicked directly on the dialog backdrop (outside the inner box)
  if (event.target === dialogRef.value) {
    handleClose()
  }
}
</script>

<template src="./DsModal.html"></template>
<style lang="scss" scoped src="./DsModal.scss"></style>
