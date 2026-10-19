import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsBadge from './DsBadge.vue'

describe('DsBadge', () => {
  it('renders neutral badge with slot text by default (TEST-06)', () => {
    const wrapper = mount(DsBadge, {
      slots: {
        default: 'Active'
      }
    })

    expect(wrapper.classes()).toContain('ds-badge--neutral')
    expect(wrapper.classes()).toContain('ds-badge--md')
    expect(wrapper.text()).toBe('Active')
  })

  it('renders dot indicator with aria-hidden="true" (A11Y-04)', () => {
    const wrapper = mount(DsBadge, {
      props: {
        variant: 'success',
        dot: true
      },
      slots: {
        default: 'Online'
      }
    })

    const dot = wrapper.find('.ds-badge__dot')
    expect(dot.exists()).toBe(true)
    expect(dot.attributes('aria-hidden')).toBe('true')
    expect(wrapper.classes()).toContain('ds-badge--success')
  })

  it('applies role="status" and aria-label for dot-only badge (A11Y-08)', () => {
    const wrapper = mount(DsBadge, {
      props: {
        variant: 'error',
        dot: true,
        ariaLabel: 'Error status'
      }
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-label')).toBe('Error status')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsBadge, { variant: 'brand' }, () => 'SSR Badge')
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-badge ds-badge--brand ds-badge--md"')
    expect(html).toContain('SSR Badge')
  })
})
