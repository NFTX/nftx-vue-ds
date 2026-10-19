import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsLink from './DsLink.vue'

describe('DsLink', () => {
  it('renders an anchor tag with primary variant by default (TEST-06)', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: '/dashboard'
      },
      slots: {
        default: 'Dashboard'
      }
    })

    const a = wrapper.find('a')
    expect(a.attributes('href')).toBe('/dashboard')
    expect(a.classes()).toContain('ds-link--primary')
    expect(a.text()).toBe('Dashboard')
  })

  it('sets rel="noopener noreferrer" and announces new window when target="_blank" (A11Y-08)', () => {
    const wrapper = mount(DsLink, {
      props: {
        href: 'https://example.com',
        target: '_blank'
      },
      slots: {
        default: 'External site'
      }
    })

    const a = wrapper.find('a')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.classes()).toContain('ds-link--external')
    expect(wrapper.text()).toContain('(opens in a new tab)')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsLink, { href: '/profile', variant: 'subtle' }, () => 'Profile Link')
    })

    const html = await renderToString(app)
    expect(html).toContain('href="/profile"')
    expect(html).toContain('ds-link--subtle')
    expect(html).toContain('Profile Link')
  })
})
