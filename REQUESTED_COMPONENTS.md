# Requested Components Roadmap & Architectural Evaluation (`@nftx-dev/vue-ds`)

Este documento registra os componentes e primitivas identificados durante o desenvolvimento e integração do **Portal** (aplicação cliente de referência), bem como a avaliação arquitetural e o status de implementação na versão **v1.1.0** do `@nftx-dev/vue-ds`.

> **Critério de Inclusão no Design System:**
> Componentes de grande porte ou com regras de negócio específicas da aplicação (ex: lógica de homelab, resolução dinâmica de portas de container, triggers de automação) **não** devem fazer parte do Design System. O DS deve manter apenas **primitivas atômicas e moleculares reutilizáveis**, sem dependências externas de UI headless (`ARCH-04`), com forte conformidade WCAG 2.2 AA e suporte nativo aos temas (`light`, `dark`, `colorblind`, `slate-light`, `slate-dark`).

---

## Resumo de Status (v1.1.0)

| Item | Componente / Primitiva | Tipo | Prioridade | Status em v1.1.0 | Referência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | `DsThemeToggle` + `useTheme()` | Novo Componente + Composable | 🔴 Alta (P1) | ✅ Implementado | `ENH-01` |
| **1.2** | `DsTag` & `DsBadge` (`subtle`/`ghost`/`outline`) | Novo Componente + Melhoria | 🔴 Alta (P1) | ✅ Implementado | `ENH-02` |
| **1.3** | `DsCode` & `DsKbd` | Novas Primitivas Tipográficas | 🔴 Média-Alta (P1) | ✅ Implementado | `ENH-03` |
| **1.4** | `DsExternalLink` | Avaliação de Primitiva | 🟡 Média (P2) | ✅ Atendido via `DsLink` & `DsCard` | `DS-04` |
| **1.5** | `DsCard` (`divided`, `interactive`, `accent`) | Melhoria de Primitiva | 🔴 Alta (P1) | ✅ Implementado | `ENH-05`, `DS-04` |
| **1.6** | `DsChipGroup` (`scrollable`, `allowEmpty`, `variant`) | Melhoria de Primitiva | 🔴 Alta (P1) | ✅ Implementado | `ENH-06`, `DS-07` |
| **1.7** | `DsAlert` | Novo Componente | 🔴 Alta (P1) | ✅ Implementado | `ENH-04` |
| **1.8** | `DsCardGrid` (`mode="auto-fill" \| "auto-fit"`) | Melhoria de Layout | 🔴 Alta (P1) | ✅ Implementado | `ENH-07`, `DS-08` |
| **1.9** | `DsDivider` | Novo Componente | 🟡 Média (P2) | ✅ Implementado | `ENH-08` |
| **1.10** | `DsTooltip` | Novo Componente | 🟡 Média (P2) | ✅ Implementado | `ENH-09` |
| **1.11** | `DsFooterBar` | Novo Componente de Layout | 🟢 Normal (P3) | ✅ Implementado | `ENH-10` |

---

## 🟢 1. Componentes Avaliados e Incorporados ao Design System (v1.1.0)

### 1.1 `DsThemeToggle` & `useTheme` (Alternância Atômica de Tema)
- **Origem / Necessidade no Portal:**
  O seletor de 3 temas (`light`, `dark`, `colorblind`) residia de forma acoplada dentro do `DsHeaderBar`. Quando o Portal precisou customizar o header ou posicionar o seletor em outro local, foi necessário reimplementar a lógica de ciclo, persistência em `localStorage`, ícones e anúncios para leitores de tela.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (Atômico + Composable, `ENH-01`).**
  Um design system que oferece temas matematicamente verificados deve exportar tanto o composable reativo `useTheme()` (com guarda SSR, persistência em `localStorage`, fallback para `prefers-color-scheme` e sincronização de `data-theme` em `document.documentElement`) quanto o botão atômico `DsThemeToggle`.
- **Contrato Implementado (`src/components/DsThemeToggle/`, `src/composables/useTheme.ts`):**
  ```vue
  <DsThemeToggle
    v-model="currentTheme"
    :available-themes="['light', 'dark', 'colorblind']"
    variant="ghost"
    size="md"
  />
  ```
  - Exibe o ícone correspondente ao tema ativo (`Sun`, `Moon`, `Eye`) com `aria-label` descritivo anunciando o estado atual e a próxima ação (`"Current theme: Light. Activate to switch to Dark theme"`).
  - Anuncia mudanças via região live singleton (`useAnnouncer().announce(..., 'polite')`).

---

### 1.2 `DsTag` & `DsBadge` Variantes Sutis (`variant="subtle" | "ghost" | "outline"`)
- **Origem / Necessidade no Portal:**
  Nos cards de serviço, as tags (`#homelab`, `#vue`, `#docker`) foram inicialmente convertidas para `DsBadge`. O `DsBadge` padrão utilizava preenchimento saturado e `text-transform: uppercase`, competindo visualmente com indicadores de status e CTAs.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (Atômico, `ENH-02`).**
  Separação semântica clara entre:
  1. **`DsBadge` (Status Indicator):** Indicadores de estado (`online`, `error`, `warning`) com suporte adicional às variantes `subtle`, `ghost`, `outline` e `shape="pill" | "rounded"`.
  2. **`DsTag` (Metadata Tag):** Etiquetas leves de categorização e tópicos sem `uppercase`, com suporte a `prefix` (`#`), `icon`, `variant="subtle" | "surface" | "outline" | "ghost"`, `size="sm" | "md"` e `shape="rounded" | "pill"`.
- **Contrato Implementado (`src/components/DsTag/`):**
  ```vue
  <DsTag prefix="#" size="sm" variant="subtle">homelab</DsTag>
  <DsTag icon="Tag" size="md" variant="surface" shape="pill">docker</DsTag>
  ```

---

### 1.3 `DsCode` e `DsKbd` (Monospace & Atalhos de Teclado)
- **Origem / Necessidade no Portal:**
  O Portal exibe URLs, números de porta (`:8080`), comandos shell (`./setup-docker.sh`) e atalhos de teclado (`/` na busca, `Esc` para limpar), que antes exigiam estilização manual de `<code>` e `<kbd>`.
- **Avaliação Arquitetural:** **Aprovado — Média-Alta Prioridade (Atômico, `ENH-03`).**
  Garante contraste WCAG AA e tipografia monoespaçada (`--ds-font-mono`) consistente em todos os temas.
- **Contrato Implementado (`src/components/DsCode/`, `src/components/DsKbd/`):**
  ```vue
  <DsCode size="xs">:8080</DsCode>
  <DsCode size="sm" copyable>./setup-docker.sh</DsCode>
  <DsKbd shortcut="/" aria-label="Pressione barra para pesquisar" />
  ```
  - `DsCode` suporta modo inline (`<code>`) ou bloco (`<pre><code>` via `block`), tamanhos `xs | sm | md` e cópia para a área de transferência (`copyable`) com feedback visual (`Copy` &rarr; `Check`) e anúncio via `useAnnouncer()`.
  - `DsKbd` renderiza `<kbd>` semântico com borda inferior elevada (`border-block-end-width: 2px`), aceitando conteúdo via slot padrão ou prop `shortcut`.

---

### 1.4 `DsExternalLink` (Avaliação: Consolidado em `DsLink` e `DsCard`)
- **Origem / Necessidade no Portal:**
  Links que abrem serviços em novas abas (`target="_blank"`) exigem `rel="noopener noreferrer"`, indicador visual e aviso acessível para leitores de tela (`(opens in a new tab)`).
- **Avaliação Arquitetural:** **Atendido sem duplicação de componente (`DS-04`).**
  - A primitiva existente `DsLink` (`src/components/DsLink/`) já implementa nativamente a detecção automática de links externos (`external` ou `target="_blank"`), aplicando `rel="noopener noreferrer"`, ícone `ExternalLink` e `<DsVisuallyHidden>(opens in a new tab)</DsVisuallyHidden>`.
  - Adicionalmente, o `DsCard` foi corrigido em `DS-04` para injetar automaticamente `rel="noopener noreferrer"` e `<DsVisuallyHidden> (opens in a new tab)</DsVisuallyHidden>` quando renderizado como link (`href` + `target="_blank"`).
  - Manter `DsLink` como única primitiva de link evita fragmentação da API pública.
- **Uso Recomendado:**
  ```vue
  <DsLink href="http://192.168.1.50:8080" target="_blank">
    Acessar Painel
  </DsLink>
  ```

---

### 1.5 `DsCard` com Divisores Opcionais, Modo Interativo e Barra de Acento (`divided`, `interactive`, `accent`)
- **Origem / Necessidade no Portal:**
  O `DsCard` forçava bordas divisórias no `#header` e `#footer`, além de não oferecer elevação de hover/focus-within quando o card era um `<article>` contendo múltiplos elementos interativos internos.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (`ENH-05`, `DS-04`).**
- **Contrato Implementado (`src/components/DsCard/`):**
  ```vue
  <DsCard variant="elevated" padding="lg" :divided="false" interactive accent="hover">
    <!-- Header, body e footer sem bordas divisórias forçadas e com elevação interativa -->
  </DsCard>
  ```
  - `divided?: boolean` (padrão `true`): quando `false`, remove `border-block-end` do cabeçalho e `border-block-start` do rodapé.
  - `interactive?: boolean` (padrão `false`): aplica transição de elevação (`--ds-shadow-lg`) e borda (`--ds-color-border-hover`) em `:hover` e `:focus-within`, respeitando `prefers-reduced-motion: reduce`.
  - `accent?: boolean | 'primary' | 'brand' | 'hover'`: renderiza barra superior de destaque.

---

### 1.6 `DsChipGroup` com Modo Rolável (`scrollable`), Seleção Obrigatória (`allowEmpty`) e Alvo de Toque via Pseudo-Elemento
- **Origem / Necessidade no Portal:**
  Em telas estreitas, a quebra de linha dos filtros ocupava espaço vertical excessivo. Além disso, o modo single-select limpava o filtro ativo ao clicar novamente sobre o chip selecionado (`model.value = ''`), e o mixin `target-size` forçava `44px` de altura visual direta na pílula.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (`ENH-06`, `DS-07`).**
- **Contrato Implementado (`src/components/DsChipGroup/`):**
  ```vue
  <DsChipGroup
    v-model="activeCategory"
    label="Filtrar por categoria"
    :chips="categories"
    :allow-empty="false"
    variant="elevated"
    scrollable
  />
  ```
  - `scrollable?: boolean`: ativa rolagem horizontal em linha única (`flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none`).
  - `allowEmpty?: boolean` (padrão `true`): quando `false` em modo single-select, impede desmarcar o chip atualmente ativo.
  - `variant?: 'surface' | 'elevated'` (padrão `'elevated'`): garante contraste sobre `--ds-color-bg-base`.
  - Usa `@include ts.target-size-pseudo` para manter a pílula visualmente compacta garantindo área de toque de `44×44px` (`RESP-04`).

---

### 1.7 `DsAlert` (Banner / Callout Inline Estático)
- **Origem / Necessidade no Portal:**
  O Portal precisava exibir caixas estáticas de diagnóstico e instruções de remediação (como listas de verificação de erro de rede), mas o DS possuía apenas `DsToast` (notificações flutuantes temporárias) e `DsEmptyState`.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (`ENH-04`).**
- **Contrato Implementado (`src/components/DsAlert/`):**
  ```vue
  <DsAlert variant="error" title="Falha na conexão com o gateway" dismissible @dismiss="onDismiss">
    <p>Verifique os itens abaixo:</p>
    <ul>
      <li>Container do proxy reverso está ativo (<DsCode>docker ps</DsCode>)</li>
    </ul>
    <template #actions>
      <DsButton size="sm" variant="secondary">Tentar novamente</DsButton>
    </template>
  </DsAlert>
  ```
  - Suporta variantes `info | success | warning | error`, aplicando automaticamente `role="alert"` (`warning`/`error`) ou `role="status"` (`info`/`success`).

---

### 1.8 `DsCardGrid` com Modo `auto-fill` vs `auto-fit` (`ENH-07`, `DS-08`)
- **Origem / Necessidade no Portal:**
  Quando uma busca ou filtro retornava apenas 1 ou 2 cards, `repeat(auto-fit, ...)` expandia um único card por toda a largura de `1280px`.
- **Avaliação Arquitetural:** **Aprovado — Alta Prioridade (`ENH-07`).**
- **Contrato Implementado (`src/components/DsCardGrid/`):**
  ```vue
  <DsCardGrid min-card-width="18rem" gap="md" mode="auto-fill">
    <!-- Preserva trilhas vazias para não esticar 1-2 cards em telas largas -->
  </DsCardGrid>
  ```

---

### 1.9 `DsDivider` (`ENH-08`), `DsTooltip` (`ENH-09`) e `DsFooterBar` (`ENH-10`)
- **`DsDivider` (`src/components/DsDivider/`):** Separador horizontal ou vertical (`solid | dashed`) com espaçamento configurável (`none | sm | md | lg | xl`), rótulo centralizado opcional (`label` ou slot) e suporte a `decorative` (`role="none"` por padrão ou `role="separator"` quando `decorative: false`).
- **`DsTooltip` (`src/components/DsTooltip/`):** Tooltip acessível em conformidade com **WCAG 2.2 SC 1.4.13 (Content on Hover or Focus)**:
  - *Dismissible*: tecla `Escape` fecha o tooltip sem mover o foco.
  - *Hoverable*: `closeDelay` permite mover o cursor do gatilho para o conteúdo do tooltip sem fechá-lo.
  - *Persistent*: permanece aberto enquanto o foco ou cursor estiver ativo, usando Popover API + CSS Anchor Positioning (`useAnchorFallback`).
- **`DsFooterBar` (`src/components/DsFooterBar/`):** Landmark semântico `<footer>` com slots `start`, `center` e `end` alinhado ao container de `80rem` do `DsHeaderBar`.

---

## 🔴 2. Componentes Avaliados e Mantidos Fora do Design System (App-Specific)

Os seguintes componentes foram avaliados e **NÃO** pertencem ao `@nftx-dev/vue-ds`, devendo residir na aplicação consumidora compondo as novas primitivas da v1.1.0:

| Componente | Motivo da Exclusão do Design System | Como Compor com `@nftx-dev/vue-ds` v1.1.0 | Onde Deve Residir |
| :--- | :--- | :--- | :--- |
| **`ServiceCard`** | Contém regras de negócio homelab (resolução de portas, substituição de IP do browser, links externos dinâmicos, paleta de cores por serviço). | Compor usando `<DsCard :divided="false" interactive accent="hover">`, `<DsTag prefix="#">`, `<DsCode>` e `<DsBadge variant="subtle">`. | `portal/src/components/ServiceCard/` |
| **`ScriptsSection`** | Lógica de execução de automações e status de scripts de containers (Phase 2). | Compor usando `<DsDivider variant="dashed" label="Scripts">`, `<DsCard>` e `<DsCode copyable>`. | `portal/src/components/ScriptsSection/` |
| **`FallbackError`** | Orquestração específica de retry de rede e troubleshooting do gateway. | Compor usando `<DsAlert variant="error">` com checklist no slot padrão e `<DsButton>` no slot `#actions`. | `portal/src/components/FallbackError/` |
| **Dicionário de Ícones de Homelab** | O DS não deve embutir todos os ~1.500 ícones do Lucide (`DS-12`) nem marcas proprietárias (`docker`, `plex`, `pihole`). | Usar `registerDsIcons({ ... })` exportado pelo `@nftx-dev/vue-ds` para registrar ícones customizados na inicialização do app consumidor. | `portal/src/components/ServiceCard/ServiceCard.vue` |
