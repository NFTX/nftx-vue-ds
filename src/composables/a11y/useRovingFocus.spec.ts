// src/composables/a11y/useRovingFocus.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { useRovingFocus } from './useRovingFocus'

describe('useRovingFocus', () => {
  function createElements(count: number, disabledIndices: number[] = []): HTMLElement[] {
    const list: HTMLElement[] = []
    for (let i = 0; i < count; i++) {
      const el = document.createElement('button')
      el.id = `item-${i}`
      if (disabledIndices.includes(i)) {
        el.setAttribute('disabled', 'true')
      }
      document.body.appendChild(el)
      list.push(el)
    }
    return list
  }

  it('manages active index and tab index', () => {
    const onFocusChange = vi.fn()
    const roving = useRovingFocus({ initialIndex: 0, onFocusChange })
    const elements = createElements(3, [1])

    expect(roving.currentIndex.value).toBe(0)
    expect(roving.getTabIndex(0)).toBe(0)
    expect(roving.getTabIndex(1)).toBe(-1)

    // Focus disabled item (should be rejected)
    roving.focusItem(1, elements)
    expect(roving.currentIndex.value).toBe(0)

    // Focus enabled item
    roving.focusItem(2, elements)
    expect(roving.currentIndex.value).toBe(2)
    expect(roving.getTabIndex(2)).toBe(0)
    expect(onFocusChange).toHaveBeenCalledWith(2)

    roving.focusItem(-1, elements) // negative out of bounds
    expect(roving.currentIndex.value).toBe(2)

    roving.focusItem(5, elements) // positive out of bounds
    expect(roving.currentIndex.value).toBe(2)

    roving.focusItem(0, [null]) // element is null
    expect(roving.currentIndex.value).toBe(2)

    const elAriaDisabled = document.createElement('button')
    elAriaDisabled.setAttribute('aria-disabled', 'true')
    roving.focusItem(0, [elAriaDisabled]) // element has aria-disabled
    expect(roving.currentIndex.value).toBe(2)

    roving.focusItem(0, []) // elements array is empty
    expect(roving.currentIndex.value).toBe(0)

    const withoutCallback = useRovingFocus()
    withoutCallback.focusItem(1, []) // without elements and without callback
    expect(withoutCallback.currentIndex.value).toBe(1)

    roving.focusItem(1) // without elements array
    expect(roving.currentIndex.value).toBe(1)
  })

  it('navigates with horizontal arrow keys and skips disabled elements with loop', () => {
    const roving = useRovingFocus({ orientation: 'horizontal', loop: true })
    const elements = createElements(4, [1]) // element 1 is disabled

    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    roving.handleKeydown(eventRight, elements)
    expect(roving.currentIndex.value).toBe(2) // skipped disabled index 1

    roving.handleKeydown(eventRight, elements)
    expect(roving.currentIndex.value).toBe(3)

    roving.handleKeydown(eventRight, elements)
    expect(roving.currentIndex.value).toBe(0) // looped back to 0

    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    roving.handleKeydown(eventLeft, elements)
    expect(roving.currentIndex.value).toBe(3) // looped back to 3
  })

  it('returns current index when all other elements are disabled during navigation', () => {
    const roving = useRovingFocus({ orientation: 'horizontal', loop: true })
    const elements = createElements(3, [1, 2]) // only index 0 is enabled

    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), elements)
    expect(roving.currentIndex.value).toBe(0)

    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), elements)
    expect(roving.currentIndex.value).toBe(0)
  })

  it('navigates with vertical arrow keys when orientation is vertical or both', () => {
    const roving = useRovingFocus({ orientation: 'vertical', loop: false })
    const elements = createElements(3)

    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    roving.handleKeydown(eventDown, elements)
    expect(roving.currentIndex.value).toBe(1)

    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    roving.handleKeydown(eventUp, elements)
    expect(roving.currentIndex.value).toBe(0)

    // loop is false; up from 0 stays at 0
    roving.handleKeydown(eventUp, elements)
    expect(roving.currentIndex.value).toBe(0)

    // loop is false; down from 2 stays at 2
    roving.focusItem(2, elements)
    roving.handleKeydown(eventDown, elements)
    expect(roving.currentIndex.value).toBe(2)

    // ArrowLeft/ArrowRight should be ignored in vertical mode
    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), elements)
    expect(roving.currentIndex.value).toBe(2)
    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), elements)
    expect(roving.currentIndex.value).toBe(2)
  })

  it('navigates with both orientations in both mode', () => {
    const roving = useRovingFocus({ orientation: 'both', loop: true })
    const elements = createElements(3)

    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), elements)
    expect(roving.currentIndex.value).toBe(1)
    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }), elements)
    expect(roving.currentIndex.value).toBe(2)
    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }), elements)
    expect(roving.currentIndex.value).toBe(1)
    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), elements)
    expect(roving.currentIndex.value).toBe(0)
  })

  it('handles Home and End keys', () => {
    const roving = useRovingFocus({ orientation: 'both' })
    const elements = createElements(5, [0, 4]) // first and last disabled

    const eventHome = new KeyboardEvent('keydown', { key: 'Home' })
    roving.handleKeydown(eventHome, elements)
    expect(roving.currentIndex.value).toBe(1) // first enabled item

    const eventEnd = new KeyboardEvent('keydown', { key: 'End' })
    roving.handleKeydown(eventEnd, elements)
    expect(roving.currentIndex.value).toBe(3) // last enabled item
  })

  it('handles Home and End when all items are disabled', () => {
    const roving = useRovingFocus()
    const allDisabled = createElements(2, [0, 1])

    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'Home' }), allDisabled)
    expect(roving.currentIndex.value).toBe(0)

    roving.handleKeydown(new KeyboardEvent('keydown', { key: 'End' }), allDisabled)
    expect(roving.currentIndex.value).toBe(0)
  })

  it('ignores unhandled keys and handles empty or null elements gracefully', () => {
    const roving = useRovingFocus({ orientation: 'horizontal' })
    const elements = createElements(3)

    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' }) // vertical key in horizontal mode
    roving.handleKeydown(eventDown, elements)
    expect(roving.currentIndex.value).toBe(0)

    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' }) // vertical key in horizontal mode
    roving.handleKeydown(eventUp, elements)
    expect(roving.currentIndex.value).toBe(0)

    const eventOther = new KeyboardEvent('keydown', { key: 'Tab' })
    roving.handleKeydown(eventOther, elements)
    expect(roving.currentIndex.value).toBe(0)

    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    roving.handleKeydown(eventRight, [])
    expect(roving.currentIndex.value).toBe(0)

    // array with null entries
    const withNulls = [null, elements[0] ?? null, null]
    roving.handleKeydown(eventRight, withNulls)
  })
})
