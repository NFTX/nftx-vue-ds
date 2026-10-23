/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useScrollLock } from './useScrollLock'

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  it('locks and restores document body overflow when used by a single instance', () => {
    const TestComp = defineComponent({
      setup() {
        const { lock, unlock } = useScrollLock()
        return { lock, unlock }
      },
      render: () => h('div')
    })

    const wrapper = mount(TestComp)
    expect(document.body.style.overflow).toBe('')

    wrapper.vm.lock()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.vm.unlock()
    expect(document.body.style.overflow).toBe('')
  })

  it('manages multiple concurrent locks with reference counting', () => {
    const CompA = defineComponent({
      setup() {
        return useScrollLock()
      },
      render: () => h('div')
    })
    const CompB = defineComponent({
      setup() {
        return useScrollLock()
      },
      render: () => h('div')
    })

    const wrapperA = mount(CompA)
    const wrapperB = mount(CompB)

    wrapperA.vm.lock()
    expect(document.body.style.overflow).toBe('hidden')

    wrapperB.vm.lock()
    expect(document.body.style.overflow).toBe('hidden')

    // Unlock A: B is still active, so overflow remains hidden
    wrapperA.vm.unlock()
    expect(document.body.style.overflow).toBe('hidden')

    // Unlock B: All locks released, restored
    wrapperB.vm.unlock()
    expect(document.body.style.overflow).toBe('')
  })

  it('automatically unlocks when component unmounts while locked', () => {
    const TestComp = defineComponent({
      setup() {
        const { lock, unlock } = useScrollLock()
        return { lock, unlock }
      },
      render: () => h('div')
    })

    const wrapper = mount(TestComp)
    wrapper.vm.lock()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('handles redundant lock/unlock calls safely without over-incrementing or negative count', () => {
    const TestComp = defineComponent({
      setup() {
        return useScrollLock()
      },
      render: () => h('div')
    })

    const wrapper = mount(TestComp)
    // Redundant unlock when not locked
    wrapper.vm.unlock()
    expect(document.body.style.overflow).toBe('')

    // Lock twice on same instance
    wrapper.vm.lock()
    wrapper.vm.lock()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.vm.unlock()
    expect(document.body.style.overflow).toBe('')
  })
})
