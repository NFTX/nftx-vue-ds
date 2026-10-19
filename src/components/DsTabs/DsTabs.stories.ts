import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsTabs from './DsTabs.vue'

const meta = {
  title: 'Molecules/DsTabs',
  component: DsTabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    manual: { control: 'boolean' }
  }
} satisfies Meta<typeof DsTabs>

export default meta
type Story = StoryObj<typeof meta>

const defaultTabs = [
  { id: 'overview', label: 'Overview', badge: 'New' },
  { id: 'settings', label: 'Settings' },
  { id: 'billing', label: 'Billing & Plans', badge: 3 },
  { id: 'logs', label: 'Audit Logs', disabled: true }
]

export const Default: Story = {
  args: {
    tabs: defaultTabs,
    orientation: 'horizontal',
    manual: false
  },
  render: (args) => ({
    components: { DsTabs },
    setup() {
      return { args }
    },
    template: `
      <DsTabs v-bind="args">
        <template #overview>
          <p>Overview tab content: system health is optimal.</p>
        </template>
        <template #settings>
          <p>Settings tab content: configure security preferences.</p>
        </template>
        <template #billing>
          <p>Billing tab content: enterprise subscription tier.</p>
        </template>
      </DsTabs>
    `
  }),
  play: async ({ canvasElement }) => {
    const tabs = canvasElement.querySelectorAll('button[role="tab"]')
    expect(tabs.length).toBe(4)

    const secondTab = tabs[1] as HTMLButtonElement
    await userEvent.click(secondTab)
    expect(secondTab.getAttribute('aria-selected')).toBe('true')

    const panels = canvasElement.querySelectorAll('div[role="tabpanel"]')
    const activePanel = Array.from(panels).find((p) => !p.hasAttribute('hidden'))
    expect(activePanel?.textContent).toContain('Settings tab content')
  }
}

export const Vertical: Story = {
  args: {
    tabs: defaultTabs,
    orientation: 'vertical'
  },
  render: (args) => ({
    components: { DsTabs },
    setup() {
      return { args }
    },
    template: `
      <DsTabs v-bind="args">
        <template #overview>
          <h3>Vertical Overview</h3>
          <p>System metrics are updated live.</p>
        </template>
        <template #settings>
          <h3>Vertical Settings</h3>
          <p>Configure dashboard preferences.</p>
        </template>
      </DsTabs>
    `
  })
}
