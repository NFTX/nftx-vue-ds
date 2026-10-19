import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import DsLink from './DsLink.vue'

const meta = {
  title: 'Atoms/DsLink',
  component: DsLink,
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text'
    },
    target: {
      control: 'select',
      options: ['_self', '_blank']
    },
    variant: {
      control: 'select',
      options: ['primary', 'subtle']
    }
  }
} satisfies Meta<typeof DsLink>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    href: '/overview',
    variant: 'primary'
  },
  render: (args) => ({
    components: { DsLink },
    setup() {
      return { args }
    },
    template: '<DsLink v-bind="args">Internal Documentation Link</DsLink>'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: /internal documentation link/i })
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).toBe('/overview')
  }
}

export const Subtle: Story = {
  args: {
    href: '/terms',
    variant: 'subtle'
  },
  render: (args) => ({
    components: { DsLink },
    setup() {
      return { args }
    },
    template: '<DsLink v-bind="args">Terms and Conditions</DsLink>'
  })
}

export const ExternalTargetBlank: Story = {
  args: {
    href: 'https://example.com/spec',
    target: '_blank'
  },
  render: (args) => ({
    components: { DsLink },
    setup() {
      return { args }
    },
    template: '<DsLink v-bind="args">External Specification</DsLink>'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    const srNote = canvas.getByText('(opens in a new tab)')
    expect(srNote).not.toBeNull()
  }
}
