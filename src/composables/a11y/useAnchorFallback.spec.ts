// src/composables/a11y/useAnchorFallback.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useAnchorFallback } from './useAnchorFallback'

describe('useAnchorFallback', () => {
  it('computes bottom-start position relative to trigger element', () => {
    const fallback = useAnchorFallback()

    // Test scroll before updatePosition
    window.dispatchEvent(new Event('scroll'))
    expect(fallback.style.value).toEqual({})

    const trigger = document.createElement('button')
    const overlay = document.createElement('div')
    document.body.appendChild(trigger)
    document.body.appendChild(overlay)

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 50,
      right: 150,
      width: 100,
      height: 40,
      x: 50,
      y: 100,
      toJSON: () => {}
    })

    vi.spyOn(overlay, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 200,
      left: 0,
      right: 120,
      width: 120,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => {}
    })

    fallback.updatePosition(trigger, overlay, 'bottom-start')

    expect(fallback.style.value).toEqual({
      position: 'fixed',
      top: '144px',
      left: '50px',
      margin: 0
    })

    // Calling again to test branch where isListening is already true
    fallback.updatePosition(trigger, overlay, 'bottom-end')
    expect(fallback.style.value.left).toBe('30px') // 150 - 120

    // Trigger scroll event to test handleScrollOrResize
    window.dispatchEvent(new Event('scroll'))

    fallback.updatePosition(trigger, overlay, 'top-start')
    expect(fallback.style.value.top).toBe('8px') // clamped to min padding 8px

    fallback.updatePosition(trigger, overlay, 'top-end')
    expect(fallback.style.value.top).toBe('8px')

    fallback.cleanup()
    expect(fallback.style.value).toEqual({})
  })

  it('adjusts position when colliding with right viewport edge', () => {
    const fallback = useAnchorFallback()
    const trigger = document.createElement('button')
    const overlay = document.createElement('div')
    document.body.appendChild(trigger)
    document.body.appendChild(overlay)

    const screenWidth = window.innerWidth || 1024
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: screenWidth - 40,
      right: screenWidth + 20,
      width: 60,
      height: 40,
      x: screenWidth - 40,
      y: 100,
      toJSON: () => {}
    })

    vi.spyOn(overlay, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 100,
      left: 0,
      right: 200,
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    })

    fallback.updatePosition(trigger, overlay, 'bottom-start')
    expect(fallback.style.value.left).toBe(`${screenWidth - 8 - 200}px`)
  })

  it('handles null elements safely in updatePosition', () => {
    const fallback = useAnchorFallback()
    fallback.updatePosition(null, null)
    expect(fallback.style.value).toEqual({})
  })

  it('cleans up on component unmount', () => {
    let captured: ReturnType<typeof useAnchorFallback> | null = null
    const TestComp = defineComponent({
      setup() {
        captured = useAnchorFallback()
        return () => null
      }
    })

    const wrapper = mount(TestComp)
    const trigger = document.createElement('button')
    const overlay = document.createElement('div')
    captured!.updatePosition(trigger, overlay)

    wrapper.unmount()
    expect(captured!.style.value).toEqual({})
  })
})
