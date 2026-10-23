import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsHeaderBar from './DsHeaderBar.vue'

describe('DsHeaderBar', () => {
  it('renders semantic <header> landmark with title and role="banner" (TEST-06)', () => {
    const wrapper = mount(DsHeaderBar, {
      props: {
        title: 'Homelab Portal',
        subtitle: 'Local Services'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('header')
    expect(wrapper.attributes('role')).toBe('banner')
    expect(wrapper.find('.ds-header-bar__title').text()).toBe('Homelab Portal')
    expect(wrapper.find('.ds-header-bar__subtitle').text()).toBe('Local Services')
  })

  it('renders brand, search, and navigation slots', () => {
    const wrapper = mount(DsHeaderBar, {
      slots: {
        brand: () => h('span', { class: 'custom-logo' }, 'Custom Brand'),
        search: () => h('input', { placeholder: 'Search...' }),
        navigation: () => h('a', { href: '/dashboard' }, 'Dashboard'),
        actions: () => h('button', 'User Profile')
      }
    })

    expect(wrapper.find('.custom-logo').text()).toBe('Custom Brand')
    expect(wrapper.find('.ds-header-bar__center input').attributes('placeholder')).toBe('Search...')
    expect(wrapper.find('.ds-header-bar__nav a').text()).toBe('Dashboard')
    expect(wrapper.find('.ds-header-bar__actions').text()).toContain('User Profile')
  })

  it('applies sticky class when sticky prop is true (A11Y-06)', () => {
    const wrapper = mount(DsHeaderBar, {
      props: { sticky: true }
    })

    expect(wrapper.classes()).toContain('ds-header-bar--sticky')
  })

  it('handles theme toggle clicks and emits update:theme and toggle-theme', async () => {
    const wrapper = mount(DsHeaderBar, {
      props: {
        theme: 'light',
        availableThemes: ['light', 'dark']
      }
    })

    const themeBtn = wrapper.find('.ds-header-bar__theme-toggle')
    expect(themeBtn.exists()).toBe(true)
    expect(themeBtn.attributes('aria-label')).toBe('Switch to dark theme')

    await themeBtn.trigger('click')

    expect(wrapper.emitted('toggle-theme')).toHaveLength(1)
    expect(wrapper.emitted('update:theme')).toEqual([['dark']])

    await wrapper.setProps({ theme: 'dark' })
    expect(themeBtn.attributes('aria-label')).toBe('Switch to light theme')

    await themeBtn.trigger('click')
    expect(wrapper.emitted('update:theme')?.[1]).toEqual(['light'])
  })

  it('supports 3-way theme cycling across light, dark, and colorblind modes', async () => {
    const wrapper = mount(DsHeaderBar, {
      props: {
        theme: 'light',
        availableThemes: ['light', 'dark', 'colorblind']
      }
    })

    const themeBtn = wrapper.find('.ds-header-bar__theme-toggle')
    expect(themeBtn.attributes('aria-label')).toBe('Switch to dark theme')

    // Click from light -> dark
    await themeBtn.trigger('click')
    expect(wrapper.emitted('update:theme')?.[0]).toEqual(['dark'])

    // Update to dark -> next is colorblind
    await wrapper.setProps({ theme: 'dark' })
    expect(themeBtn.attributes('aria-label')).toBe('Switch to color blind theme')
    await themeBtn.trigger('click')
    expect(wrapper.emitted('update:theme')?.[1]).toEqual(['colorblind'])

    // Update to colorblind -> next is light
    await wrapper.setProps({ theme: 'colorblind' })
    expect(themeBtn.attributes('aria-label')).toBe('Switch to light theme')
    await themeBtn.trigger('click')
    expect(wrapper.emitted('update:theme')?.[2]).toEqual(['light'])
  })

  it('hides theme toggle when showThemeToggle is false', () => {
    const wrapper = mount(DsHeaderBar, {
      props: { showThemeToggle: false }
    })

    expect(wrapper.find('.ds-header-bar__theme-toggle').exists()).toBe(false)
  })

  it('handles mobile menu toggle and controls aria-expanded state', async () => {
    const wrapper = mount(DsHeaderBar, {
      slots: {
        navigation: () => h('a', { href: '/services' }, 'Services')
      }
    })

    const mobileBtn = wrapper.find('.ds-header-bar__mobile-toggle')
    expect(mobileBtn.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ds-header-bar__mobile-menu').exists()).toBe(false)

    // Open mobile menu
    await mobileBtn.trigger('click')
    expect(mobileBtn.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:mobileMenuOpen')).toEqual([[true]])
    expect(wrapper.find('.ds-header-bar__mobile-menu').exists()).toBe(true)
    expect(wrapper.find('.ds-header-bar__mobile-nav a').text()).toBe('Services')

    // Close mobile menu
    await mobileBtn.trigger('click')
    expect(mobileBtn.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:mobileMenuOpen')?.[1]).toEqual([false])
  })

  it('supports controlled mobileMenuOpen prop', async () => {
    const wrapper = mount(DsHeaderBar, {
      props: {
        mobileMenuOpen: true
      }
    })

    const mobileBtn = wrapper.find('.ds-header-bar__mobile-toggle')
    expect(mobileBtn.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ds-header-bar__mobile-menu').exists()).toBe(true)

    await wrapper.setProps({ mobileMenuOpen: false })
    expect(mobileBtn.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ds-header-bar__mobile-menu').exists()).toBe(false)
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsHeaderBar, {
          title: 'SSR Portal',
          subtitle: 'Gateway Dashboard',
          sticky: true
        })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-header-bar ds-header-bar--sticky"')
    expect(html).toContain('SSR Portal')
    expect(html).toContain('Gateway Dashboard')
  })
})
