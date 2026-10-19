import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import DsBadge from './DsBadge.vue'

const meta = {
  title: 'Atoms/DsBadge',
  component: DsBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'error', 'info']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    dot: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof DsBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    variant: 'neutral'
  },
  render: (args) => ({
    components: { DsBadge },
    setup() {
      return { args }
    },
    template: '<DsBadge v-bind="args">Archived</DsBadge>'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText('Archived')
    expect(badge).not.toBeNull()
  }
}

export const BrandWithDot: Story = {
  args: {
    variant: 'brand',
    dot: true
  },
  render: (args) => ({
    components: { DsBadge },
    setup() {
      return { args }
    },
    template: '<DsBadge v-bind="args">Featured</DsBadge>'
  }),
  play: async ({ canvasElement }) => {
    const dotEl = canvasElement.querySelector('.ds-badge__dot')
    expect(dotEl).not.toBeNull()
    expect(dotEl?.getAttribute('aria-hidden')).toBe('true')
  }
}

export const StatusVariants: Story = {
  render: () => ({
    components: { DsBadge },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <DsBadge variant="neutral">Neutral</DsBadge>
        <DsBadge variant="brand" dot>Brand</DsBadge>
        <DsBadge variant="success" dot>Success</DsBadge>
        <DsBadge variant="warning" dot>Warning</DsBadge>
        <DsBadge variant="error" dot>Error</DsBadge>
        <DsBadge variant="info" dot>Information</DsBadge>
      </div>
    `
  })
}

export const DotOnlyAccessible: Story = {
  args: {
    variant: 'success',
    dot: true,
    ariaLabel: 'System online'
  },
  render: (args) => ({
    components: { DsBadge },
    setup() {
      return { args }
    },
    template: '<DsBadge v-bind="args" />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByLabelText('System online')
    expect(badge).not.toBeNull()
    expect(badge.getAttribute('role')).toBe('status')
  }
}
