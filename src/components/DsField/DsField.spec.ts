import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsField from './DsField.vue'

describe('DsField', () => {
  it('programmatically associates label with control using useId (A11Y-09, A11Y-10)', () => {
    const wrapper = mount(DsField, {
      props: {
        label: 'Username'
      },
      slots: {
        default: '<input class="test-input" />'
      }
    })

    const label = wrapper.find('label')
    expect(label.text()).toBe('Username')
    expect(label.attributes('for')).toBeDefined()
  })

  it('wires aria-describedby for hint and error in order (A11Y-10)', () => {
    let slotProps: Record<string, unknown> | undefined
    const wrapper = mount(DsField, {
      props: {
        label: 'Password',
        hint: 'At least 8 chars',
        error: 'Password too weak'
      },
      slots: {
        default: (props: Record<string, unknown>) => {
          slotProps = props
          return '<input />'
        }
      }
    })

    expect(slotProps?.ariaInvalid).toBe(true)
    expect(slotProps?.ariaDescribedby).toContain('ds-hint-')
    expect(slotProps?.ariaDescribedby).toContain('ds-error-')
    expect(wrapper.find('.ds-field__hint').exists()).toBe(true)
    expect(wrapper.find('.ds-field__hint').text()).toBe('At least 8 chars')
    expect(wrapper.find('.ds-field__error-text').text()).toBe('Password too weak')
    expect(wrapper.find('.ds-field__error').attributes('role')).toBe('alert')
  })

  it('renders required asterisk with aria-hidden="true" (A11Y-10)', () => {
    const wrapper = mount(DsField, {
      props: {
        label: 'Email',
        required: true
      }
    })

    const req = wrapper.find('.ds-field__required')
    expect(req.exists()).toBe(true)
    expect(req.attributes('aria-hidden')).toBe('true')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsField, { label: 'SSR Field', hint: 'SSR Hint' })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-field"')
    expect(html).toContain('SSR Field')
    expect(html).toContain('SSR Hint')
  })
})
