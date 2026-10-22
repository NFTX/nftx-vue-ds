import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsCode from './DsCode.vue'

const meta: Meta<typeof DsCode> = {
  title: 'Primitives/DsCode',
  component: DsCode,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md']
    },
    block: {
      control: 'boolean'
    },
    copyable: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsCode>

export const Inline: Story = {
  args: {
    size: 'xs',
    copyable: false
  },
  render: (args) => ({
    components: { DsCode },
    setup() {
      return { args }
    },
    template: '<DsCode v-bind="args">:8080</DsCode>'
  })
}

export const CopyableCommand: Story = {
  args: {
    size: 'sm',
    copyable: true
  },
  render: (args) => ({
    components: { DsCode },
    setup() {
      return { args }
    },
    template: '<DsCode v-bind="args">./setup-docker.sh</DsCode>'
  })
}

export const BlockSnippet: Story = {
  args: {
    block: true,
    copyable: true,
    size: 'sm'
  },
  render: (args) => ({
    components: { DsCode },
    setup() {
      return { args }
    },
    template: '<DsCode v-bind="args">docker compose up -d --build</DsCode>'
  })
}
