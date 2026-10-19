import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsToast from './DsToast.vue'
import DsButton from '@/components/DsButton/DsButton.vue'
import { ref } from 'vue'

const meta = {
  title: 'Molecules/DsToast',
  component: DsToast,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error']
    },
    position: {
      control: 'select',
      options: [
        'top-right',
        'top-left',
        'top-center',
        'bottom-right',
        'bottom-left',
        'bottom-center'
      ]
    },
    duration: { control: 'number' },
    closable: { control: 'boolean' }
  }
} satisfies Meta<typeof DsToast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { DsToast, DsButton },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <DsButton @click="isOpen = true">Trigger Notification</DsButton>
        <DsToast v-bind="args" v-model:open="isOpen" />
      </div>
    `
  }),
  args: {
    title: 'Operation Successful',
    description: 'Your changes have been saved to the server.',
    variant: 'success',
    position: 'bottom-right',
    duration: 5000,
    closable: true
  },
  play: async ({ canvasElement }) => {
    const triggerBtn = canvasElement.querySelector('button') as HTMLButtonElement
    expect(triggerBtn).not.toBeNull()
    await userEvent.click(triggerBtn)

    const toast = canvasElement.querySelector('.ds-toast') as HTMLElement
    expect(toast).not.toBeNull()

    const closeBtn = toast.querySelector('.ds-toast__close') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()
    await userEvent.click(closeBtn)
  }
}
