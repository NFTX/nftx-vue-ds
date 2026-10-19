import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import DsField from './DsField.vue'

const meta = {
  title: 'Molecules/DsField',
  component: DsField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof DsField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email address',
    hint: 'We will never share your email.'
  },
  render: (args) => ({
    components: { DsField },
    setup() {
      return { args }
    },
    template: `
      <DsField v-bind="args" v-slot="{ id, ariaDescribedby, required, disabled }">
        <input
          :id="id"
          type="email"
          :aria-describedby="ariaDescribedby"
          :required="required"
          :disabled="disabled"
          style="padding: 0.5rem; width: 100%; border: 1px solid #cbd5e1; border-radius: 4px;"
        />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Email address')
    const input = canvas.getByRole('textbox')
    expect(label).not.toBeNull()
    expect(input.getAttribute('id')).toBe(label.getAttribute('for'))
    expect(input.getAttribute('aria-describedby')).not.toBeNull()
  }
}

export const WithError: Story = {
  args: {
    label: 'Username',
    error: 'This username is already taken.',
    required: true
  },
  render: (args) => ({
    components: { DsField },
    setup() {
      return { args }
    },
    template: `
      <DsField v-bind="args" v-slot="{ id, ariaDescribedby, ariaInvalid, required }">
        <input
          :id="id"
          type="text"
          :aria-describedby="ariaDescribedby"
          :aria-invalid="ariaInvalid"
          :required="required"
          style="padding: 0.5rem; width: 100%; border: 1px solid #dc2626; border-radius: 4px;"
        />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const errorEl = canvas.getByText('This username is already taken.')
    expect(errorEl).not.toBeNull()
    const input = canvas.getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  }
}

export const Disabled: Story = {
  args: {
    label: 'Account ID',
    hint: 'Managed by organization',
    disabled: true
  },
  render: (args) => ({
    components: { DsField },
    setup() {
      return { args }
    },
    template: `
      <DsField v-bind="args" v-slot="{ id, ariaDescribedby, disabled }">
        <input
          :id="id"
          type="text"
          :aria-describedby="ariaDescribedby"
          :disabled="disabled"
          value="ORG-94182"
          style="padding: 0.5rem; width: 100%; border: 1px solid #cbd5e1; border-radius: 4px;"
        />
      </DsField>
    `
  })
}
