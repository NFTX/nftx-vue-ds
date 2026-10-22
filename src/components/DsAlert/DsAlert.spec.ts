import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { Terminal } from 'lucide-vue-next'
import DsAlert from './DsAlert.vue'

describe('DsAlert', () => {
  it('renders info alert with role="status" by default', () => {
    const wrapper = mount(DsAlert, {
      props: { title: 'System Info' },
      slots: { default: 'Everything is nominal.' }
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.classes()).toContain('ds-alert')
    expect(wrapper.classes()).toContain('ds-alert--info')
    expect(wrapper.find('.ds-alert__title').text()).toBe('System Info')
    expect(wrapper.find('.ds-alert__description').text()).toBe('Everything is nominal.')
  })

  it('uses role="alert" for warning and error variants and role="status" for success', async () => {
    const wrapper = mount(DsAlert, {
      props: { variant: 'error', title: 'Fatal Error' },
      slots: { default: 'Connection failed.' }
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('ds-alert--error')

    await wrapper.setProps({ variant: 'warning', title: 'Warning' })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('ds-alert--warning')

    await wrapper.setProps({ variant: 'success', title: 'Success' })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.classes()).toContain('ds-alert--success')
  })

  it('supports custom icon prop (string or Component) and actions slot', async () => {
    const wrapper = mount(DsAlert, {
      props: { icon: 'Terminal', title: 'CLI Notice' },
      slots: {
        default: '<ul><li>Step 1</li></ul>',
        actions: '<button type="button">Retry</button>'
      }
    })

    expect(wrapper.find('.ds-alert__icon svg').exists()).toBe(true)
    expect(wrapper.find('.ds-alert__actions button').text()).toBe('Retry')

    await wrapper.setProps({ icon: Terminal, title: 'CLI Notice' })
    expect(wrapper.find('.ds-alert__icon svg').exists()).toBe(true)
  })

  it('renders dismiss button when dismissible is true and emits dismiss', async () => {
    const wrapper = mount(DsAlert, {
      props: {
        variant: 'warning',
        title: 'Dismissible warning',
        dismissible: true
      }
    })

    const closeBtn = wrapper.find('button.ds-alert__close')
    expect(closeBtn.attributes('aria-label')).toBe('Dismiss alert')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsAlert, { variant: 'error', title: 'Troubleshooting Required', dismissible: true }, () =>
          h('p', 'Check gateway status')
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('role="alert"')
    expect(html).toContain('Troubleshooting Required')
  })
})
