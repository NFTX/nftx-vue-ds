import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsToast from './DsToast.vue'
import { useAnnouncer } from '@/composables/a11y/useAnnouncer'

describe('DsToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const announcer = useAnnouncer()
    announcer.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders title and description and announces them once through the polite region (TEST-06)', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'File Uploaded',
        description: 'Document ready for review',
        variant: 'info' as const,
        open: true
      }
    })

    const toast = wrapper.find('.ds-toast')
    expect(toast.exists()).toBe(true)
    // Not a live region itself: the announcer reads it, so screen readers hear it once
    expect(toast.attributes('role')).toBe('group')
    expect(toast.attributes('aria-live')).toBeUndefined()
    expect(toast.classes()).toContain('ds-toast--info')
    expect(wrapper.text()).toContain('File Uploaded')
    expect(wrapper.text()).toContain('Document ready for review')

    const announcer = useAnnouncer()
    vi.advanceTimersByTime(100)
    expect(announcer.politeMessage.value).toBe('File Uploaded. Document ready for review')

    wrapper.unmount()
  })

  it('announces error toasts through the assertive region (A11Y-14)', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Connection Lost',
        variant: 'error' as const,
        open: true
      }
    })

    const toast = wrapper.find('.ds-toast')
    expect(toast.attributes('aria-live')).toBeUndefined()
    expect(toast.classes()).toContain('ds-toast--error')

    const announcer = useAnnouncer()
    vi.advanceTimersByTime(100)
    expect(announcer.assertiveMessage.value).toBe('Connection Lost')

    wrapper.unmount()
  })

  it('renders warning and success variants with their respective icons and classes', async () => {
    const wrapperWarn = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Disk Space Low',
        variant: 'warning' as const,
        open: true
      }
    })
    expect(wrapperWarn.find('.ds-toast').classes()).toContain('ds-toast--warning')
    wrapperWarn.unmount()

    const wrapperSuccess = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Saved',
        variant: 'success' as const,
        open: true
      }
    })
    expect(wrapperSuccess.find('.ds-toast').classes()).toContain('ds-toast--success')
    wrapperSuccess.unmount()
  })

  it('closes and emits dismiss when close button is clicked', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Dismissible',
        open: true,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    const closeBtn = wrapper.find('.ds-toast__close')
    expect(closeBtn.exists()).toBe(true)

    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.props('open')).toBe(false)

    wrapper.unmount()
  })

  it('hides close button when closable is false and supports action slot', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Action Toast',
        closable: false,
        open: true
      },
      slots: {
        action: '<button id="undo-btn">Undo</button>'
      }
    })

    expect(wrapper.find('.ds-toast__close').exists()).toBe(false)
    expect(wrapper.find('#undo-btn').exists()).toBe(true)

    wrapper.unmount()
  })

  it('auto-dismisses after duration expires', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Auto close',
        duration: 300,
        open: true
      }
    })

    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    vi.advanceTimersByTime(150)
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])

    wrapper.unmount()
  })

  it('pauses auto-dismiss timer on mouseenter and resumes on mouseleave', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Pause on hover',
        duration: 400,
        open: true
      }
    })

    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    // Hover toast
    await wrapper.trigger('mouseenter')

    // Advance 500ms while hovered (would normally have dismissed)
    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    // Leave toast
    await wrapper.trigger('mouseleave')

    // Advance remaining ~200ms
    vi.advanceTimersByTime(250)
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])

    wrapper.unmount()
  })

  it('pauses auto-dismiss timer on focusin and resumes on focusout', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Pause on focus',
        duration: 400,
        open: true
      }
    })

    vi.advanceTimersByTime(200)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    // Focus toast
    await wrapper.trigger('focusin')

    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    // Focus out
    await wrapper.trigger('focusout', { relatedTarget: document.body })

    vi.advanceTimersByTime(250)
    expect(wrapper.emitted('dismiss')).toBeTruthy()

    wrapper.unmount()
  })

  it('does not resume timer on focusout if focus moved to an element inside toast', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Inside Focus',
        duration: 400,
        open: true,
        closable: true
      }
    })

    await wrapper.trigger('focusin')
    const closeBtn = wrapper.find('.ds-toast__close')
    await wrapper.trigger('focusout', { relatedTarget: closeBtn.element })

    vi.advanceTimersByTime(500)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    wrapper.unmount()
  })

  it('does not auto-dismiss error toasts by default (persistent until closed)', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Critical Server Error',
        variant: 'error' as const,
        open: true,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    vi.advanceTimersByTime(10000)
    expect(wrapper.props('open')).toBe(true)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    wrapper.unmount()
  })

  it('synchronizes when open is set to false programmatically', async () => {
    const wrapper = mount(DsToast, {
      attachTo: document.body,
      props: {
        title: 'Controlled',
        open: true
      }
    })

    await wrapper.setProps({ open: false })
    expect(wrapper.props('open')).toBe(false)

    wrapper.unmount()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsToast, {
          title: 'SSR Toast',
          description: 'Server rendered toast message',
          open: true
        })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-toast')
    expect(html).toContain('SSR Toast')
    expect(html).toContain('Server rendered toast message')
  })

  it('stacks open toasts at the same position instead of overlapping', async () => {
    const first = mount(DsToast, {
      attachTo: document.body,
      props: { title: 'First', open: true, duration: 0, position: 'top-right' }
    })
    const second = mount(DsToast, {
      attachTo: document.body,
      props: { title: 'Second', open: true, duration: 0, position: 'top-right' }
    })
    await second.vm.$nextTick()

    const firstEl = first.find('.ds-toast').element as HTMLElement
    const secondEl = second.find('.ds-toast').element as HTMLElement
    expect(firstEl.style.getPropertyValue('--ds-toast-offset')).toBe('0px')
    expect(secondEl.style.getPropertyValue('--ds-toast-offset')).toBe(`${firstEl.offsetHeight + 8}px`)

    first.unmount()
    await second.vm.$nextTick()
    expect(secondEl.style.getPropertyValue('--ds-toast-offset')).toBe('0px')
    second.unmount()
  })
})
