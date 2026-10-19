import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import DsRadioGroup from './DsRadioGroup.vue'

const meta = {
  title: 'Molecules/DsRadioGroup',
  component: DsRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal']
    },
    disabled: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof DsRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    legend: 'Delivery Method',
    options: [
      { label: 'Standard shipping (3-5 days)', value: 'standard' },
      { label: 'Express priority (1-2 days)', value: 'express' },
      { label: 'Same day courier', value: 'same_day' }
    ]
  },
  render: (args) => ({
    components: { DsRadioGroup },
    setup() {
      const selected = ref('standard')
      return { args, selected }
    },
    template: '<DsRadioGroup v-model="selected" v-bind="args" />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const expressRadio = canvas.getByRole('radio', { name: /express priority/i })
    expect(expressRadio).not.toBeChecked()

    await userEvent.click(expressRadio)
    expect(expressRadio).toBeChecked()
  }
}

export const WithDescriptions: Story = {
  args: {
    legend: 'Select account tier',
    options: [
      {
        label: 'Community',
        value: 'community',
        description: 'Free for open source and personal hobby projects.'
      },
      {
        label: 'Pro Developer',
        value: 'pro',
        description: 'Advanced analytics, unlimited tokens, priority compute.'
      },
      {
        label: 'Enterprise',
        value: 'enterprise',
        description: 'Dedicated VPC, SLA guarantees, audit log streaming.',
        disabled: true
      }
    ]
  },
  render: (args) => ({
    components: { DsRadioGroup },
    setup() {
      const tier = ref('pro')
      return { args, tier }
    },
    template: '<DsRadioGroup v-model="tier" v-bind="args" />'
  })
}

export const HorizontalWithError: Story = {
  args: {
    legend: 'Billing Cycle',
    orientation: 'horizontal',
    error: 'Please choose a billing frequency.',
    options: [
      { label: 'Monthly billing', value: 'monthly' },
      { label: 'Annual (save 20%)', value: 'annual' }
    ]
  },
  render: (args) => ({
    components: { DsRadioGroup },
    setup() {
      const cycle = ref()
      return { args, cycle }
    },
    template: '<DsRadioGroup v-model="cycle" v-bind="args" />'
  })
}
