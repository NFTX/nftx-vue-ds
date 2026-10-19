import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsModal from './DsModal.vue'
import DsButton from '@/components/DsButton/DsButton.vue'
import { ref } from 'vue'

const meta = {
  title: 'Molecules/DsModal',
  component: DsModal,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen']
    },
    role: {
      control: 'select',
      options: ['dialog', 'alertdialog']
    }
  }
} satisfies Meta<typeof DsModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { DsModal, DsButton },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <DsButton @click="isOpen = true">Open Modal</DsButton>
        <DsModal v-bind="args" v-model:open="isOpen">
          <p>This is the content inside the modal dialog.</p>
          <template #footer>
            <DsButton variant="secondary" @click="isOpen = false">Cancel</DsButton>
            <DsButton variant="primary" @click="isOpen = false">Confirm</DsButton>
          </template>
        </DsModal>
      </div>
    `
  }),
  args: {
    title: 'Confirm Operation',
    description: 'Please review your changes before continuing.',
    size: 'md',
    role: 'dialog'
  },
  play: async ({ canvasElement }) => {
    const openBtn = canvasElement.querySelector('button') as HTMLButtonElement
    expect(openBtn).not.toBeNull()
    await userEvent.click(openBtn)

    const dialog = canvasElement.querySelector('dialog') as HTMLDialogElement
    expect(dialog).not.toBeNull()
    expect(dialog.open).toBe(true)

    const closeBtn = canvasElement.querySelector('.ds-modal__close') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()
    await userEvent.click(closeBtn)
    expect(dialog.open).toBe(false)
  }
}
