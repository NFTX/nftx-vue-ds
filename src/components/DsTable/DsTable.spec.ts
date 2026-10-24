import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DsTable from './DsTable.vue'

describe('DsTable', () => {
  it('renders a table with caption and rows', () => {
    const wrapper = mount(DsTable, {
      props: {
        caption: 'Lista de Pautas'
      },
      slots: {
        header: '<tr><th>#</th><th>Título</th></tr>',
        default: '<tr><td>1</td><td>Editorial</td></tr>'
      }
    })

    expect(wrapper.find('table.ds-table').exists()).toBe(true)
    expect(wrapper.find('.ds-table__caption').text()).toBe('Lista de Pautas')
    expect(wrapper.find('thead.ds-table__head').text()).toContain('#')
    expect(wrapper.find('tbody.ds-table__body').text()).toContain('Editorial')
  })

  it('applies variant classes correctly', () => {
    const wrapper = mount(DsTable, {
      props: {
        striped: true,
        compact: true,
        bordered: true
      }
    })

    const table = wrapper.find('table.ds-table')
    expect(table.classes()).toContain('ds-table--striped')
    expect(table.classes()).toContain('ds-table--compact')
    expect(table.classes()).toContain('ds-table--bordered')
  })

  it('wraps in a responsive container with accessible region label by default', () => {
    const wrapper = mount(DsTable, {
      props: {
        caption: 'Pautas da Edição'
      }
    })

    const container = wrapper.find('.ds-table-container')
    expect(container.exists()).toBe(true)
    expect(container.attributes('role')).toBe('region')
    expect(container.attributes('aria-label')).toBe('Pautas da Edição')
  })
})
