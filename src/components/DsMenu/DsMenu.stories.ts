import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsMenu from './DsMenu.vue'

const meta = {
  title: 'Molecules/DsMenu',
  component: DsMenu,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end']
    },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof DsMenu>

export default meta
type Story = StoryObj<typeof meta>

const defaultItems = [
  { id: 'edit', label: 'Edit Service' },
  { id: 'duplicate', label: 'Duplicate Entry' },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete Service', destructive: true }
]

export const Default: Story = {
  args: {
    label: 'Actions',
    items: defaultItems,
    placement: 'bottom-start'
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('.ds-menu-trigger') as HTMLButtonElement
    expect(trigger).not.toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    await userEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    const menu = canvasElement.querySelector('.ds-menu')
    expect(menu).not.toBeNull()
  }
}
