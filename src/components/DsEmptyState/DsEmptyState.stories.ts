import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsEmptyState from './DsEmptyState.vue'
import { DsButton } from '@/components/DsButton'

/**
 * `DsEmptyState` communicates zero-data, empty search queries, network disconnects,
 * or completed tasks with an icon, semantic heading, clear description, and action CTA.
 */
const meta = {
  title: 'Organisms/DsEmptyState',
  component: DsEmptyState,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Primary empty state title'
    },
    description: {
      control: 'text',
      description: 'Contextual description or guidance'
    },
    icon: {
      control: 'text',
      description: 'Lucide icon name'
    },
    headingTag: {
      control: 'select',
      options: ['h2', 'h3', 'h4', 'h5'],
      description: 'Semantic heading element tag'
    },
    actionLabel: {
      control: 'text',
      description: 'Default CTA button label'
    },
    variant: {
      control: 'select',
      options: ['default', 'card'],
      description: 'Visual layout style'
    }
  }
} satisfies Meta<typeof DsEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'No Services Registered',
    description: 'Get started by configuring your first service in services.json.',
    icon: 'server',
    headingTag: 'h3',
    actionLabel: 'Add Service',
    variant: 'default'
  },
  render: (args) => ({
    components: { DsEmptyState },
    setup() {
      return { args }
    },
    template: `
      <DsEmptyState v-bind="args" />
    `
  }),
  play: async ({ canvasElement }) => {
    const emptyState = canvasElement.querySelector<HTMLElement>('.ds-empty-state')
    expect(emptyState).not.toBeNull()
    expect(emptyState?.getAttribute('role')).toBe('region')
  }
}

export const SearchNoResults: Story = {
  args: {
    title: 'No Services Found',
    description: 'No services matched your query "plex-cluster". Check spelling or clear your search.',
    icon: 'search',
    headingTag: 'h3',
    actionLabel: 'Clear Search',
    variant: 'default'
  },
  render: (args) => ({
    components: { DsEmptyState },
    setup() {
      return { args }
    },
    template: `
      <DsEmptyState v-bind="args" />
    `
  })
}

export const CardVariant: Story = {
  args: {
    title: 'No Automation Scripts',
    description: 'All automation tasks and maintenance scripts are currently scheduled or completed.',
    icon: 'terminal',
    headingTag: 'h3',
    actionLabel: 'Create New Script',
    variant: 'card'
  },
  render: (args) => ({
    components: { DsEmptyState },
    setup() {
      return { args }
    },
    template: `
      <div style="max-inline-size: 40rem; margin: auto;">
        <DsEmptyState v-bind="args" />
      </div>
    `
  })
}

export const CustomActions: Story = {
  args: {
    title: 'Database Connection Lost',
    description: 'Unable to reach backend gateway. Check network connection or retry.',
    icon: 'alert-triangle',
    headingTag: 'h2',
    variant: 'card'
  },
  render: (args) => ({
    components: { DsEmptyState, DsButton },
    setup() {
      return { args }
    },
    template: `
      <DsEmptyState v-bind="args">
        <template #actions>
          <DsButton variant="primary">Retry Connection</DsButton>
          <DsButton variant="ghost">View Documentation</DsButton>
        </template>
      </DsEmptyState>
    `
  })
}

export const KeyboardInteraction: Story = {
  args: {
    title: 'Interactive Action',
    actionLabel: 'Perform Action',
    icon: 'check-circle'
  },
  render: (args) => ({
    components: { DsEmptyState },
    setup() {
      return { args }
    },
    template: `
      <DsEmptyState v-bind="args" />
    `
  }),
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>('.ds-empty-state__actions button')
    expect(button).not.toBeNull()
    if (button) {
      await userEvent.click(button)
    }
  }
}
