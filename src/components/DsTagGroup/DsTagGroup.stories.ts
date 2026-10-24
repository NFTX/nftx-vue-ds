import type { Meta, StoryObj } from '@storybook/vue3'
import DsTagGroup from './DsTagGroup.vue'

const meta: Meta<typeof DsTagGroup> = {
  title: 'Components/DsTagGroup',
  component: DsTagGroup,
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
    },
    editable: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsTagGroup>

export const Default: Story = {
  args: {
    tags: ['São Paulo', 'Educação', 'Mobilidade'],
    editable: false
  }
}

export const Editable: Story = {
  args: {
    tags: ['Nacional', 'Região Sul', 'Agronegócio'],
    editable: true,
    placeholder: '+ Nova subseção'
  }
}
