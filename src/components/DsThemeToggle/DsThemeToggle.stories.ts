import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsThemeToggle from './DsThemeToggle.vue'

/**
 * `DsThemeToggle` is an atomic 3-way theme switcher (`light` -> `dark` -> `colorblind`)
 * with live screen-reader announcements and `localStorage` persistence via `useTheme`.
 */
const meta = {
  title: 'Atoms/DsThemeToggle',
  component: DsThemeToggle,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: 'select',
      options: ['ghost', 'secondary', 'outline']
    },
    showLabel: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof DsThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'ghost',
    showLabel: false
  },
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector('button') as HTMLButtonElement
    expect(btn).not.toBeNull()
    await userEvent.click(btn)
    expect(btn).toHaveFocus()
  }
}

export const WithLabel: Story = {
  args: {
    size: 'md',
    variant: 'outline',
    showLabel: true
  }
}
