// src/composables/a11y/useFocusReturn.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useFocusReturn } from './useFocusReturn'

describe('useFocusReturn', () => {
  it('saves active element and restores focus', () => {
    const focusReturn = useFocusReturn()

    const button = document.createElement('button')
    button.id = 'trigger-btn'
    document.body.appendChild(button)
    button.focus()

    focusReturn.saveFocus()
    expect(focusReturn.triggerElement.value).toBe(button)

    const otherInput = document.createElement('input')
    document.body.appendChild(otherInput)
    otherInput.focus()
    expect(document.activeElement).toBe(otherInput)

    focusReturn.restoreFocus()
    expect(document.activeElement).toBe(button)
    expect(focusReturn.triggerElement.value).toBeNull()
  })

  it('saves explicit element passed as parameter', () => {
    const focusReturn = useFocusReturn()
    const div = document.createElement('div')
    div.tabIndex = 0
    document.body.appendChild(div)

    focusReturn.saveFocus(div)
    expect(focusReturn.triggerElement.value).toBe(div)

    focusReturn.restoreFocus()
    expect(document.activeElement).toBe(div)
  })

  it('does nothing when element is disconnected from DOM or when null', () => {
    const focusReturn = useFocusReturn()

    // Restore when triggerElement is null
    expect(() => focusReturn.restoreFocus()).not.toThrow()

    const btn = document.createElement('button')
    document.body.appendChild(btn)
    btn.focus()

    focusReturn.saveFocus()
    btn.remove()

    expect(() => focusReturn.restoreFocus()).not.toThrow()
    expect(focusReturn.triggerElement.value).toBeNull()
  })

  it('handles activeElement not being HTMLElement', () => {
    const focusReturn = useFocusReturn()
    const originalActive = document.activeElement
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null)

    focusReturn.saveFocus()
    expect(focusReturn.triggerElement.value).toBeNull()

    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(originalActive)
  })

  it('cleans up triggerElement on unmount', () => {
    let captured: ReturnType<typeof useFocusReturn> | null = null
    const TestComp = defineComponent({
      setup() {
        captured = useFocusReturn()
        return () => null
      }
    })

    const wrapper = mount(TestComp)
    const btn = document.createElement('button')
    captured!.saveFocus(btn)
    expect(captured!.triggerElement.value).toBe(btn)

    wrapper.unmount()
    expect(captured!.triggerElement.value).toBeNull()
  })
})
