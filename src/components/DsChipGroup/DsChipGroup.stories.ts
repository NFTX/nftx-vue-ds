import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsChipGroup from './DsChipGroup.vue'

const meta = {
  title: 'Molecules/DsChipGroup',
  component: DsChipGroup,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    multiple: { control: 'boolean' }
  }
} satisfies Meta<typeof DsChipGroup>

export default meta
type Story = StoryObj<typeof meta>

const defaultOptions = [
  { label: 'All Services', value: 'all', count: 42 },
  { label: 'Media', value: 'media', count: 12 },
  { label: 'Monitoring', value: 'monitoring', count: 8 },
  { label: 'Storage', value: 'storage', count: 6 },
  { label: 'Archived', value: 'archived', count: 0, disabled: true }
]

export const SingleSelect: Story = {
  args: {
    label: 'Filter by category',
    options: defaultOptions,
    multiple: false
  },
  play: async ({ canvasElement }) => {
    const chips = canvasElement.querySelectorAll('.ds-chip')
    expect(chips.length).toBe(5)

    const firstChip = chips[0] as HTMLButtonElement
    await userEvent.click(firstChip)
    expect(firstChip.getAttribute('aria-pressed')).toBe('true')
  }
}

export const MultiSelect: Story = {
  args: {
    label: 'Filter multiple categories',
    options: defaultOptions,
    multiple: true
  },
  play: async ({ canvasElement }) => {
    const chips = canvasElement.querySelectorAll('.ds-chip')
    const chip1 = chips[0] as HTMLButtonElement
    const chip2 = chips[1] as HTMLButtonElement

    await userEvent.click(chip1)
    await userEvent.click(chip2)
    expect(chip1.getAttribute('aria-pressed')).toBe('true')
    expect(chip2.getAttribute('aria-pressed')).toBe('true')
  }
}
