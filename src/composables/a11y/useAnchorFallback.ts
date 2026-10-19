// src/composables/a11y/useAnchorFallback.ts
import { ref, onBeforeUnmount, type CSSProperties, type Ref } from 'vue'

export type AnchorPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface UseAnchorFallbackReturn {
  isSupported: boolean
  style: Ref<CSSProperties>
  updatePosition: (
    trigger: HTMLElement | null,
    overlay: HTMLElement | null,
    placement?: AnchorPlacement
  ) => void
  cleanup: () => void
}

export function useAnchorFallback(): UseAnchorFallbackReturn {
  const isSupported = Boolean(CSS.supports?.('anchor-name: --a'))

  const style = ref<CSSProperties>({})
  let activeTrigger: HTMLElement | null = null
  let activeOverlay: HTMLElement | null = null
  let activePlacement: AnchorPlacement = 'bottom-start'
  let isListening = false

  function computePosition(): void {
    const triggerRect = activeTrigger!.getBoundingClientRect()
    const overlayRect = activeOverlay!.getBoundingClientRect()

    let top = 0
    let left = 0

    switch (activePlacement) {
      case 'bottom-start':
        top = triggerRect.bottom + 4
        left = triggerRect.left
        break
      case 'bottom-end':
        top = triggerRect.bottom + 4
        left = triggerRect.right - overlayRect.width
        break
      case 'top-start':
        top = triggerRect.top - overlayRect.height - 4
        left = triggerRect.left
        break
      case 'top-end':
        top = triggerRect.top - overlayRect.height - 4
        left = triggerRect.right - overlayRect.width
        break
    }

    // Viewport collision adjustment
    const padding = 8
    if (left < padding) left = padding
    if (left + overlayRect.width > window.innerWidth - padding) {
      left = window.innerWidth - padding - overlayRect.width
    }
    if (top < padding) top = padding

    style.value = {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      margin: 0
    }
  }

  function handleScrollOrResize(): void {
    computePosition()
  }

  function updatePosition(
    trigger: HTMLElement | null,
    overlay: HTMLElement | null,
    placement: AnchorPlacement = 'bottom-start'
  ): void {
    activeTrigger = trigger
    activeOverlay = overlay
    activePlacement = placement

    if (!trigger || !overlay) {
      cleanup()
      return
    }

    computePosition()

    if (!isListening) {
      window.addEventListener('scroll', handleScrollOrResize, true)
      window.addEventListener('resize', handleScrollOrResize)
      isListening = true
    }
  }

  function cleanup(): void {
    if (isListening) {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      isListening = false
    }
    activeTrigger = null
    activeOverlay = null
    style.value = {}
  }

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    isSupported,
    style,
    updatePosition,
    cleanup
  }
}
