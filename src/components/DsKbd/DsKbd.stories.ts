import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsKbd from './DsKbd.vue'

const meta: Meta<typeof DsKbd> = {
  title: 'Primitives/DsKbd',
  component: DsKbd,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md']
    }
  }
}

export default meta
type Story = StoryObj<typeof DsKbd>

export const Default: Story = {
  args: {
    size: 'sm'
  },
  render: (args) => ({
    components: { DsKbd },
    setup() {
      return { args }
    },
    template: '<DsKbd v-bind="args">⌘K</DsKbd>'
  })
}

export const ShortcutProp: Story = {
  args: {
    shortcut: '/',
    ariaLabel: 'Press slash to search',
    size: 'sm'
  }
}
