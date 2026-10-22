import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsAlert from './DsAlert.vue'

const meta: Meta<typeof DsAlert> = {
  title: 'Primitives/DsAlert',
  component: DsAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error']
    },
    dismissible: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsAlert>

export const InfoAlert: Story = {
  args: {
    variant: 'info',
    title: 'Gateway Configuration Notice',
    dismissible: false
  },
  render: (args) => ({
    components: { DsAlert },
    setup() {
      return { args }
    },
    template: `
      <DsAlert v-bind="args">
        All container services are routed via the local reverse proxy on port 8080.
      </DsAlert>
    `
  })
}

export const ErrorWithChecklist: Story = {
  args: {
    variant: 'error',
    title: 'Unable to reach container registry',
    dismissible: true
  },
  render: (args) => ({
    components: { DsAlert },
    setup() {
      return { args }
    },
    template: `
      <DsAlert v-bind="args">
        <p style="margin: 0 0 0.5rem 0;">Verify the following items before retrying:</p>
        <ul style="margin: 0; padding-inline-start: 1.25rem;">
          <li>Docker daemon is running</li>
          <li>Network bridge is active</li>
        </ul>
      </DsAlert>
    `
  })
}

export const AllVariants: Story = {
  render: () => ({
    components: { DsAlert },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <DsAlert variant="info" title="Information">System maintenance scheduled for midnight.</DsAlert>
        <DsAlert variant="success" title="Deployment Complete">All 12 containers started healthy.</DsAlert>
        <DsAlert variant="warning" title="High Memory Usage">Container plex is using 88% of allocated RAM.</DsAlert>
        <DsAlert variant="error" title="Connection Refused" dismissible>Could not connect to 192.168.1.50:9000.</DsAlert>
      </div>
    `
  })
}
