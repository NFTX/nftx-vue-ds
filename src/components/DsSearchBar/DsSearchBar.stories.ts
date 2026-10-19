import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsSearchBar from './DsSearchBar.vue'

const meta = {
  title: 'Molecules/DsSearchBar',
  component: DsSearchBar,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    hotkey: { control: 'text' },
    shortcutLabel: { control: 'text' },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof DsSearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search documentation...',
    hotkey: '/',
    shortcutLabel: '/'
  },
  play: async ({ canvasElement }) => {
    const searchInput = canvasElement.querySelector('input[type="search"]') as HTMLInputElement
    expect(searchInput).not.toBeNull()

    await userEvent.type(searchInput, 'tokens')
    expect(searchInput.value).toBe('tokens')

    const clearBtn = canvasElement.querySelector('.ds-search-bar__clear') as HTMLButtonElement
    expect(clearBtn).not.toBeNull()
    await userEvent.click(clearBtn)
    expect(searchInput.value).toBe('')
  }
}

export const CmdKShortcut: Story = {
  args: {
    placeholder: 'Search commands, services, and apps...',
    hotkey: 'k',
    shortcutLabel: '⌘K'
  }
}
