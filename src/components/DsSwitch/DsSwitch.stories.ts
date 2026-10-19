import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import DsSwitch from './DsSwitch.vue'

const meta = {
  title: 'Atoms/DsSwitch',
  component: DsSwitch,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: 'boolean'
    },
    label: {
      control: 'text'
    }
  }
} satisfies Meta<typeof DsSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Enable desktop notifications'
  },
  render: (args) => ({
    components: { DsSwitch },
    setup() {
      const enabled = ref(false)
      return { args, enabled }
    },
    template: '<DsSwitch v-model="enabled" v-bind="args" />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch', { name: /enable desktop notifications/i })
    expect(switchEl).not.toBeNull()
    expect(switchEl.getAttribute('aria-checked')).toBe('false')

    await userEvent.click(switchEl)
    expect(switchEl.getAttribute('aria-checked')).toBe('true')
  }
}

export const Sizes: Story = {
  render: () => ({
    components: { DsSwitch },
    setup() {
      const s1 = ref(true)
      const s2 = ref(true)
      const s3 = ref(true)
      return { s1, s2, s3 }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <DsSwitch v-model="s1" size="sm" label="Small compact switch" />
        <DsSwitch v-model="s2" size="md" label="Medium standard switch" />
        <DsSwitch v-model="s3" size="lg" label="Large prominent switch" />
      </div>
    `
  })
}

export const Disabled: Story = {
  args: {
    label: 'Enforced security policy (disabled)',
    disabled: true
  },
  render: (args) => ({
    components: { DsSwitch },
    setup() {
      const val = ref(true)
      return { args, val }
    },
    template: '<DsSwitch v-model="val" v-bind="args" />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')
    expect(switchEl).toBeDisabled()
  }
}
