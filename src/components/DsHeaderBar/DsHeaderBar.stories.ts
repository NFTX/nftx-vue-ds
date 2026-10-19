import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsHeaderBar from './DsHeaderBar.vue'
import { DsButton } from '@/components/DsButton'
import { DsInput } from '@/components/DsInput'

/**
 * `DsHeaderBar` serves as the primary top-level `<header>` landmark (`role="banner"`).
 * It features responsive navigation, mobile drawer collapse, search integration,
 * and built-in theme switching conforming to WCAG 2.2 AA.
 *
 * ### Keyboard Contract
 * | Key | Target | Result |
 * | :--- | :--- | :--- |
 * | `Tab` / `Shift+Tab` | Header elements | Sequentially navigates brand, search, nav links, and action buttons |
 * | `Enter` / `Space` | Theme toggle | Switches between light and dark themes |
 * | `Enter` / `Space` | Mobile toggle | Toggles the responsive mobile navigation drawer (`aria-expanded`) |
 */
const meta = {
  title: 'Organisms/DsHeaderBar',
  component: DsHeaderBar,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Primary portal or application name'
    },
    subtitle: {
      control: 'text',
      description: 'Contextual homelab or environment subtitle'
    },
    sticky: {
      control: 'boolean',
      description: 'Sticks header to top of viewport with backdrop blur'
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'auto'],
      description: 'Current color theme'
    },
    showThemeToggle: {
      control: 'boolean',
      description: 'Display integrated theme switcher'
    }
  }
} satisfies Meta<typeof DsHeaderBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Portal',
    subtitle: 'Homelab Access Hub',
    sticky: false,
    theme: 'light',
    showThemeToggle: true
  },
  render: (args) => ({
    components: { DsHeaderBar },
    setup() {
      return { args }
    },
    template: `
      <DsHeaderBar v-bind="args" />
    `
  }),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector<HTMLElement>('.ds-header-bar')
    expect(header).not.toBeNull()
    expect(header?.getAttribute('role')).toBe('banner')
  }
}

export const WithSearchAndNav: Story = {
  args: {
    title: 'Portal',
    subtitle: 'Gateway Dashboard',
    sticky: false,
    theme: 'light',
    showThemeToggle: true
  },
  render: (args) => ({
    components: { DsHeaderBar, DsInput, DsButton },
    setup() {
      return { args }
    },
    template: `
      <DsHeaderBar v-bind="args">
        <template #search>
          <DsInput placeholder="Search services..." size="sm" style="inline-size: 24rem;" />
        </template>
        <template #navigation>
          <a href="#" style="color: inherit; text-decoration: none; font-weight: 500;">Services</a>
          <a href="#" style="color: inherit; text-decoration: none; font-weight: 500;">Scripts</a>
          <a href="#" style="color: inherit; text-decoration: none; font-weight: 500;">Logs</a>
        </template>
        <template #actions>
          <DsButton variant="ghost" size="sm">Admin</DsButton>
        </template>
      </DsHeaderBar>
    `
  })
}

export const Sticky: Story = {
  args: {
    title: 'Portal (Sticky)',
    subtitle: 'Stuck to viewport top',
    sticky: true,
    theme: 'light'
  },
  render: (args) => ({
    components: { DsHeaderBar },
    setup() {
      return { args }
    },
    template: `
      <div style="min-height: 120vh; background: var(--ds-color-bg-base);">
        <DsHeaderBar v-bind="args" />
        <div style="padding: 2rem;">
          <p>Scroll down to verify sticky header bar with backdrop blur.</p>
        </div>
      </div>
    `
  })
}

export const LongContentEdgeCase: Story = {
  args: {
    title: 'Homelab Infrastructure Production Monitoring & Ingress Gateway Portal',
    subtitle: 'Cluster Node 01 - Primary Air-Gapped Network Segment with Redundant Tunnel Routing',
    sticky: false
  },
  render: (args) => ({
    components: { DsHeaderBar },
    setup() {
      return { args }
    },
    template: `
      <div style="max-inline-size: 320px; border: 1px solid var(--ds-color-border-default);">
        <DsHeaderBar v-bind="args" />
      </div>
    `
  })
}

export const KeyboardInteraction: Story = {
  args: {
    title: 'Interactive Header',
    subtitle: 'Focus flow testing'
  },
  render: (args) => ({
    components: { DsHeaderBar, DsButton },
    setup() {
      return { args }
    },
    template: `
      <DsHeaderBar v-bind="args">
        <template #actions>
          <DsButton size="sm" variant="secondary">Settings</DsButton>
        </template>
      </DsHeaderBar>
    `
  }),
  play: async ({ canvasElement }) => {
    const themeBtn = canvasElement.querySelector<HTMLButtonElement>('.ds-header-bar__theme-toggle')
    expect(themeBtn).not.toBeNull()
    if (themeBtn) {
      await userEvent.click(themeBtn)
    }
  }
}
