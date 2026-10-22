import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsDivider from './DsDivider.vue'

const meta: Meta<typeof DsDivider> = {
  title: 'Primitives/DsDivider',
  component: DsDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed']
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl']
    },
    decorative: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsDivider>

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    spacing: 'md'
  }
}

export const DashedWithLabel: Story = {
  args: {
    variant: 'dashed',
    spacing: 'lg',
    label: 'Automation Scripts',
    decorative: false
  }
}

export const Vertical: Story = {
  render: () => ({
    components: { DsDivider },
    template: `
      <div style="display: flex; align-items: center; block-size: 2rem;">
        <span>Services</span>
        <DsDivider orientation="vertical" spacing="sm" />
        <span>Containers</span>
        <DsDivider orientation="vertical" variant="dashed" spacing="sm" />
        <span>Logs</span>
      </div>
    `
  })
}
