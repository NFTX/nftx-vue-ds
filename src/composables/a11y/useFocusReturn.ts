// src/composables/a11y/useFocusReturn.ts
import { ref, onBeforeUnmount, type Ref } from 'vue'

export interface UseFocusReturnReturn {
  triggerElement: Ref<HTMLElement | null>
  saveFocus: (element?: HTMLElement | null) => void
  restoreFocus: () => void
}

export function useFocusReturn(): UseFocusReturnReturn {
  const triggerElement = ref<HTMLElement | null>(null)

  function saveFocus(element?: HTMLElement | null): void {
    if (element) {
      triggerElement.value = element
      return
    }

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      triggerElement.value = document.activeElement
    }
  }

  function restoreFocus(): void {
    if (triggerElement.value && typeof triggerElement.value.focus === 'function') {
      if (typeof document !== 'undefined' && document.contains(triggerElement.value)) {
        triggerElement.value.focus()
      }
    }
    triggerElement.value = null
  }

  onBeforeUnmount(() => {
    triggerElement.value = null
  })

  return {
    triggerElement,
    saveFocus,
    restoreFocus
  }
}
