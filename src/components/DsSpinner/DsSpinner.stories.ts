import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import DsSpinner from './DsSpinner.vue'

const meta = {
  title: 'Atoms/DsSpinner',
  component: DsSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },
    variant: {
      control: 'select',
      options: ['current', 'brand', 'neutral']
    },
    label: {
      control: 'text'
    }
  }
} satisfies Meta<typeof DsSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'brand',
    label: 'Processing transaction...'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const spinner = canvasElement.querySelector('.ds-spinner')
    expect(spinner).not.toBeNull()
    expect(spinner?.getAttribute('role')).toBe('status')
    expect(spinner?.getAttribute('aria-live')).toBe('polite')
    const srText = canvas.getByText('Processing transaction...')
    expect(srText).not.toBeNull()
  }
}

export const Sizes: Story = {
  render: () => ({
    components: { DsSpinner },
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: center;">
        <DsSpinner size="sm" variant="brand" />
        <DsSpinner size="md" variant="brand" />
        <DsSpinner size="lg" variant="brand" />
        <DsSpinner size="xl" variant="brand" />
      </div>
    `
  })
}

export const Variants: Story = {
  render: () => ({
    components: { DsSpinner },
    template: `
      <div style="display: flex; gap: 1.5rem; align-items: center; background: #eee; padding: 1rem;">
        <DsSpinner variant="brand" />
        <DsSpinner variant="neutral" />
        <DsSpinner variant="current" style="color: purple;" />
      </div>
    `
  })
}
