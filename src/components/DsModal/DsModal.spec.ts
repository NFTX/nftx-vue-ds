import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, nextTick } from 'vue'
import DsModal from './DsModal.vue'

describe('DsModal', () => {
  it('renders modal dialog correctly with title, description and size (TEST-06)', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Delete Resource',
        description: 'This action cannot be undone.',
        size: 'lg',
        role: 'alertdialog',
        open: true
      },
      slots: {
        default: '<p>Are you sure?</p>',
        footer: '<button id="btn-cancel">Cancel</button>'
      }
    })

    const dialog = wrapper.find('dialog')
    expect(dialog.exists()).toBe(true)
    expect(dialog.classes()).toContain('ds-modal--lg')
    expect(dialog.attributes('role')).toBe('alertdialog')

    const titleEl = wrapper.find('.ds-modal__title')
    expect(titleEl.exists()).toBe(true)
    expect(titleEl.text()).toBe('Delete Resource')

    const descEl = wrapper.find('.ds-modal__desc')
    expect(descEl.exists()).toBe(true)
    expect(descEl.text()).toBe('This action cannot be undone.')

    expect(dialog.attributes('aria-labelledby')).toBe(titleEl.attributes('id'))
    expect(dialog.attributes('aria-describedby')).toBe(descEl.attributes('id'))
    expect(wrapper.text()).toContain('Are you sure?')
    expect(wrapper.text()).toContain('Cancel')

    wrapper.unmount()
  })

  it('handles close button click and emits close event', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Edit Details',
        open: true,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    const closeBtn = wrapper.find('.ds-modal__close')
    expect(closeBtn.exists()).toBe(true)

    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.props('open')).toBe(false)

    wrapper.unmount()
  })

  it('handles cancel event (Escape key) on dialog', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Preferences',
        open: true,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    const dialog = wrapper.find('dialog')
    await dialog.trigger('cancel')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.props('open')).toBe(false)

    wrapper.unmount()
  })

  it('handles backdrop click when closeOnBackdropClick is true', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Settings',
        open: true,
        closeOnBackdropClick: true,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    const dialog = wrapper.find('dialog')
    // Clicking the dialog itself simulates clicking on the backdrop
    await dialog.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.props('open')).toBe(false)

    wrapper.unmount()
  })

  it('does not close on inside box click or when closeOnBackdropClick is false', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Locked Dialog',
        open: true,
        closeOnBackdropClick: false,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      }
    })

    const dialog = wrapper.find('dialog')
    await dialog.trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.props('open')).toBe(true)

    wrapper.unmount()
  })

  it('prevents Escape dismissal by default when role="alertdialog" or dismissible=false (A11Y-18, TEST-10)', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Critical Confirmation',
        role: 'alertdialog',
        open: true
      }
    })

    expect(wrapper.find('.ds-modal__close').exists()).toBe(false)
    const dialog = wrapper.find('dialog')
    await dialog.trigger('cancel')
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.setProps({ role: 'dialog', dismissible: false })
    await dialog.trigger('cancel')
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('updates dialog state when open prop changes programmatically', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Dynamic Open',
        open: false
      }
    })

    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('open')).toBeUndefined()

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(dialog.attributes('open')).toBeDefined()

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(dialog.attributes('open')).toBeUndefined()

    wrapper.unmount()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          DsModal,
          { title: 'SSR Dialog', open: false },
          { default: () => 'SSR Content' }
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-modal')
    expect(html).toContain('SSR Dialog')
    expect(html).toContain('SSR Content')
  })

  it('locks body scroll when open and restores it when closed', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Scroll Lock Test',
        open: true
      }
    })

    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('dismisses modal on backdrop click', async () => {
    const wrapper = mount(DsModal, {
      attachTo: document.body,
      props: {
        title: 'Backdrop Test',
        open: true,
        dismissible: true
      }
    })

    const dialog = wrapper.find('dialog')
    // Trigger click directly on dialog backdrop
    await dialog.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()

    wrapper.unmount()
  })
})
