import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsTag from './DsTag.vue'

const meta: Meta<typeof DsTag> = {
  title: 'Primitives/DsTag',
  component: DsTag,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'surface', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md']
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill']
    }
  }
}

export default meta
type Story = StoryObj<typeof DsTag>

export const Default: Story = {
  args: {
    variant: 'subtle',
    size: 'sm',
    shape: 'rounded'
  },
  render: (args) => ({
    components: { DsTag },
    setup() {
      return { args }
    },
    template: '<DsTag v-bind="args">docker</DsTag>'
  })
}

export const WithPrefix: Story = {
  args: {
    prefix: '#',
    variant: 'subtle'
  },
  render: (args) => ({
    components: { DsTag },
    setup() {
      return { args }
    },
    template: '<DsTag v-bind="args">homelab</DsTag>'
  })
}

export const AllVariants: Story = {
  render: () => ({
    components: { DsTag },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <DsTag variant="subtle">Subtle</DsTag>
        <DsTag variant="surface">Surface</DsTag>
        <DsTag variant="outline">Outline</DsTag>
        <DsTag variant="ghost" prefix="#">ghost</DsTag>
        <DsTag variant="subtle" shape="pill" size="md" icon="Tag">Pill Tag</DsTag>
      </div>
    `
  })
}
