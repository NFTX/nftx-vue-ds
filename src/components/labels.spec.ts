// Built-in labels default to English and can be overridden per component (one place for all label props)
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DsAlert from './DsAlert/DsAlert.vue'
import DsCard from './DsCard/DsCard.vue'
import DsCode from './DsCode/DsCode.vue'
import DsHeaderBar from './DsHeaderBar/DsHeaderBar.vue'
import DsInput from './DsInput/DsInput.vue'
import DsLink from './DsLink/DsLink.vue'
import DsModal from './DsModal/DsModal.vue'
import DsSearchBar from './DsSearchBar/DsSearchBar.vue'
import DsTable from './DsTable/DsTable.vue'
import DsTag from './DsTag/DsTag.vue'
import DsTagGroup from './DsTagGroup/DsTagGroup.vue'
import DsThemeToggle from './DsThemeToggle/DsThemeToggle.vue'
import DsToast from './DsToast/DsToast.vue'

describe('label props', () => {
  it('use English defaults', () => {
    expect(mount(DsAlert, { props: { dismissible: true } }).find('button').attributes('aria-label')).toBe('Dismiss alert')
    expect(mount(DsInput, { props: { clearable: true, modelValue: 'x' } }).find('button').attributes('aria-label')).toBe('Clear input')
    expect(mount(DsTable).attributes('aria-label')).toBe('Data table')
    expect(mount(DsTag, { props: { removable: true } }).find('button').attributes('aria-label')).toBe('Remove')
    expect(mount(DsToast, { props: { closable: true } }).attributes('aria-label')).toBe('Notification')

    const group = mount(DsTagGroup, { props: { editable: true, modelValue: ['vue'] } })
    expect(group.find('.ds-tag__remove').attributes('aria-label')).toBe('Remove tag vue')
    expect(group.find('.ds-tag-group__add-btn').text()).toBe('+ Add tag')
  })

  it('accept overrides, including {placeholder} templates', async () => {
    expect(
      mount(DsAlert, { props: { dismissible: true, dismissLabel: 'Fechar alerta' } }).find('button').attributes('aria-label')
    ).toBe('Fechar alerta')
    expect(
      mount(DsInput, { props: { clearable: true, modelValue: 'x', clearLabel: 'Limpar' } }).find('button').attributes('aria-label')
    ).toBe('Limpar')
    expect(mount(DsTable, { props: { regionLabel: 'Tabela' } }).attributes('aria-label')).toBe('Tabela')

    const toast = mount(DsToast, { props: { closeLabel: 'Fechar', ariaLabel: 'Aviso' } })
    expect(toast.attributes('aria-label')).toBe('Aviso')
    expect(toast.find('.ds-toast__close').attributes('aria-label')).toBe('Fechar')

    const modal = mount(DsModal, { props: { title: 'T', closeLabel: 'Fechar diálogo' } })
    expect(modal.find('.ds-modal__close').attributes('aria-label')).toBe('Fechar diálogo')

    const search = mount(DsSearchBar, {
      props: { modelValue: 'q', shortcutLabel: '/', clearLabel: 'Limpar busca', shortcutHint: 'Tecle {key} para buscar' }
    })
    expect(search.find('.ds-search-bar__clear').attributes('aria-label')).toBe('Limpar busca')
    expect(search.text()).toContain('Tecle / para buscar')

    const group = mount(DsTagGroup, {
      props: { editable: true, modelValue: ['vue'], removeLabel: 'Remover {tag}', inputLabel: 'Nova tag' }
    })
    expect(group.find('.ds-tag__remove').attributes('aria-label')).toBe('Remover vue')
    await group.find('.ds-tag-group__add-btn').trigger('click')
    expect(group.find('input').attributes('aria-label')).toBe('Nova tag')

    expect(
      mount(DsLink, { props: { href: '/x', target: '_blank', newTabLabel: '(nova aba)' } }).text()
    ).toContain('(nova aba)')
    expect(
      mount(DsCard, { props: { href: '/x', target: '_blank', newTabLabel: '(nova aba)' } }).text()
    ).toContain('(nova aba)')

    const code = mount(DsCode, { props: { copyable: true, copyLabel: 'Copiar' } })
    expect(code.find('button').attributes('aria-label')).toBe('Copiar')
  })

  it('format theme and navigation labels', async () => {
    const header = mount(DsHeaderBar, {
      props: {
        theme: 'light',
        themeLabels: { dark: 'escuro' },
        switchThemeLabel: 'Mudar para tema {theme}',
        navLabel: 'Navegação',
        openMenuLabel: 'Abrir menu',
        closeMenuLabel: 'Fechar menu',
        mobileNavLabel: 'Navegação móvel'
      },
      slots: { default: '<a href="/">Início</a>' }
    })
    expect(header.find('.ds-header-bar__theme-toggle').attributes('aria-label')).toBe('Mudar para tema escuro')
    expect(header.find('.ds-header-bar__nav').attributes('aria-label')).toBe('Navegação')
    const menuBtn = header.find('.ds-header-bar__mobile-toggle')
    expect(menuBtn.attributes('aria-label')).toBe('Abrir menu')
    await menuBtn.trigger('click')
    expect(menuBtn.attributes('aria-label')).toBe('Fechar menu')
    expect(header.find('.ds-header-bar__mobile-nav').attributes('aria-label')).toBe('Navegação móvel')

    const toggle = mount(DsThemeToggle, {
      props: {
        modelValue: 'light',
        labels: { light: 'Claro', dark: 'Escuro' },
        toggleLabel: 'Tema {current}; ativar para {next}',
        announceLabel: 'Tema: {theme}'
      }
    })
    expect(toggle.attributes('aria-label')).toBe('Tema Claro; ativar para Escuro')
    await toggle.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(document.getElementById('ds-announcer-polite')?.textContent).toBe('Tema: Escuro')
  })
})
