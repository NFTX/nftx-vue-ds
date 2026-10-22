import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsTooltip from './DsTooltip.vue'
import DsButton from '@/components/DsButton/DsButton.vue'

const meta: Meta<typeof DsTooltip> = {
  title: 'Primitives/DsTooltip',
  component: DsTooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right']
    },
    openDelay: {
      control: 'number'
    },
    closeDelay: {
      control: 'number'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsTooltip>

export const Default: Story = {
  args: {
    content: 'Restart container service',
    placement: 'top',
    openDelay: 150,
    closeDelay: 150
  },
  render: (args) => ({
    components: { DsTooltip, DsButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 3rem; display: flex; justify-content: center;">
        <DsTooltip v-bind="args">
          <DsButton variant="secondary">Hover or Focus Me</DsButton>
        </DsTooltip>
      </div>
    `
  })
}
