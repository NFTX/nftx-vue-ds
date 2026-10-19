import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import DsCard from './DsCard.vue'

const meta = {
  title: 'Molecules/DsCard',
  component: DsCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'glass'],
      description: 'Visual elevation/style variant'
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal content padding'
    },
    href: {
      control: 'text',
      description: 'Destination URL for full-card link'
    }
  }
} satisfies Meta<typeof DsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md'
  },
  render: (args) => ({
    components: { DsCard },
    setup() {
      return { args }
    },
    template: `
      <DsCard v-bind="args">
        <h3>Card Title</h3>
        <p>This is a standard content card with default elevation.</p>
      </DsCard>
    `
  }),
  play: async ({ canvasElement }) => {
    const cardEl = canvasElement.querySelector('.ds-card')
    expect(cardEl).not.toBeNull()
    expect(cardEl?.tagName.toLowerCase()).toBe('article')
  }
}

export const StretchedLink: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    href: 'https://example.com'
  },
  render: (args) => ({
    components: { DsCard },
    setup() {
      return { args }
    },
    template: `
      <DsCard v-bind="args">
        <h3>Clickable Card</h3>
        <p>This whole card is clickable via an accessible pseudo-element stretched link.</p>
      </DsCard>
    `
  }),
  play: async ({ canvasElement }) => {
    const linkEl = canvasElement.querySelector('.ds-card__link')
    expect(linkEl).not.toBeNull()
    expect(linkEl?.getAttribute('href')).toBe('https://example.com')
  }
}

export const Glass: Story = {
  args: {
    variant: 'glass',
    padding: 'lg'
  },
  render: (args) => ({
    components: { DsCard },
    setup() {
      return { args }
    },
    template: `
      <div style="background: linear-gradient(135deg, #be123c, #0284c7); padding: 2rem;">
        <DsCard v-bind="args">
          <h3>Glassmorphic Card</h3>
          <p>Translucent card with backdrop blur and reduced-transparency fallback.</p>
        </DsCard>
      </div>
    `
  })
}
