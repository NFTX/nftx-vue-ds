import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import DsIcon from './DsIcon.vue'
import { Check, AlertCircle, Info } from 'lucide-vue-next'

const meta = {
  title: 'Atoms/DsIcon',
  component: DsIcon,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 28],
      description: 'Size token or numeric size in pixels'
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label when icon conveys standalone meaning'
    }
  }
} satisfies Meta<typeof DsIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: Check,
    size: 'md'
  },
  play: async ({ canvasElement }) => {
    const iconEl = canvasElement.querySelector('.ds-icon')
    expect(iconEl).not.toBeNull()
    expect(iconEl?.getAttribute('aria-hidden')).toBe('true')
  }
}

export const StringName: Story = {
  args: {
    icon: 'heart',
    size: 'lg'
  },
  play: async ({ canvasElement }) => {
    const iconEl = canvasElement.querySelector('.ds-icon')
    expect(iconEl).not.toBeNull()
  }
}

export const AccessibleStandalone: Story = {
  args: {
    icon: AlertCircle,
    size: 'md',
    ariaLabel: 'Error: invalid input'
  },
  play: async ({ canvasElement }) => {
    const iconEl = canvasElement.querySelector('.ds-icon')
    expect(iconEl?.getAttribute('role')).toBe('img')
    expect(iconEl?.getAttribute('aria-label')).toBe('Error: invalid input')
    expect(iconEl?.getAttribute('aria-hidden')).toBeNull()
  }
}

export const Sizes: Story = {
  args: {
    icon: Info
  },
  render: () => ({
    components: { DsIcon },
    setup() {
      return { Info }
    },
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <DsIcon :icon="Info" size="sm" />
        <DsIcon :icon="Info" size="md" />
        <DsIcon :icon="Info" size="lg" />
        <DsIcon :icon="Info" size="xl" />
        <DsIcon :icon="Info" :size="40" />
      </div>
    `
  })
}
