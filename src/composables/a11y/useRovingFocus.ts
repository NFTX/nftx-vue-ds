// src/composables/a11y/useRovingFocus.ts
import { ref, type Ref } from 'vue'

export interface UseRovingFocusOptions {
  /**
   * Orientation for arrow key navigation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical' | 'both'
  /**
   * Whether navigation loops when reaching the start or end.
   * @default true
   */
  loop?: boolean
  /**
   * Initial active index.
   * @default 0
   */
  initialIndex?: number
  /**
   * Callback invoked whenever the focused index changes.
   */
  onFocusChange?: (index: number) => void
}

export interface UseRovingFocusReturn {
  currentIndex: Ref<number>
  focusItem: (index: number, elements?: (HTMLElement | null)[]) => void
  handleKeydown: (event: KeyboardEvent, elements: (HTMLElement | null)[]) => void
  getTabIndex: (index: number) => number
}

export function useRovingFocus(options: UseRovingFocusOptions = {}): UseRovingFocusReturn {
  const {
    orientation = 'horizontal',
    loop = true,
    initialIndex = 0,
    onFocusChange
  } = options

  const currentIndex = ref<number>(initialIndex)

  function isEnabled(el: HTMLElement): boolean {
    return !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true'
  }

  function focusItem(index: number, elements?: (HTMLElement | null)[]): void {
    if (!elements || elements.length === 0) {
      currentIndex.value = index
      if (onFocusChange) {
        onFocusChange(index)
      }
      return
    }

    const target = elements[index]
    if (target && isEnabled(target)) {
      currentIndex.value = index
      target.focus()
      if (onFocusChange) {
        onFocusChange(index)
      }
    }
  }

  function getNextIndex(
    current: number,
    direction: 1 | -1,
    elements: (HTMLElement | null)[]
  ): number {
    const total = elements.length

    let next = current + direction
    for (let count = 0; count < total; count++) {
      if (loop) {
        if (next < 0) next = total - 1
        if (next >= total) next = 0
      } else if (next < 0 || next >= total) {
        break
      }

      const candidate = elements[next]
      if (candidate && isEnabled(candidate)) {
        return next
      }

      next += direction
    }

    return current
  }

  function handleKeydown(event: KeyboardEvent, elements: (HTMLElement | null)[]): void {
    const validElements = elements.filter(Boolean)
    if (validElements.length === 0) return

    const isHorizontal = orientation === 'horizontal' || orientation === 'both'
    const isVertical = orientation === 'vertical' || orientation === 'both'

    let handled = false
    let targetIndex = currentIndex.value

    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          targetIndex = getNextIndex(currentIndex.value, 1, elements)
          handled = true
        }
        break
      case 'ArrowLeft':
        if (isHorizontal) {
          targetIndex = getNextIndex(currentIndex.value, -1, elements)
          handled = true
        }
        break
      case 'ArrowDown':
        if (isVertical) {
          targetIndex = getNextIndex(currentIndex.value, 1, elements)
          handled = true
        }
        break
      case 'ArrowUp':
        if (isVertical) {
          targetIndex = getNextIndex(currentIndex.value, -1, elements)
          handled = true
        }
        break
      case 'Home':
        targetIndex = elements.findIndex((el) => Boolean(el && isEnabled(el)))
        if (targetIndex !== -1) handled = true
        break
      case 'End':
        for (let i = elements.length - 1; i >= 0; i--) {
          const el = elements[i]
          if (el && isEnabled(el)) {
            targetIndex = i
            handled = true
            break
          }
        }
        break
    }

    if (handled) {
      event.preventDefault()
      focusItem(targetIndex, elements)
    }
  }

  function getTabIndex(index: number): number {
    return currentIndex.value === index ? 0 : -1
  }

  return {
    currentIndex,
    focusItem,
    handleKeydown,
    getTabIndex
  }
}
