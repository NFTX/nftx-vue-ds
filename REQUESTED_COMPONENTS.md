# Requested Components Roadmap (`@nftx-dev/vue-ds`)

Este documento registra os componentes e primitivas identificados durante o desenvolvimento e integração do **Portal** (aplicação cliente de referência) que fizeram falta na biblioteca ou que demandaram adaptações manuais.

> **Critério de Inclusão no Design System:**
> Componentes de grande porte ou com regras de negócio específicas da aplicação (ex: lógica de homelab, resolução dinâmica de portas de container, triggers de automação) **não** devem fazer parte do Design System. O DS deve manter apenas **primitivas atômicas e moleculares reutilizáveis**, com forte conformidade WCAG e suporte nativo aos 3 temas.

---

## 🟢 1. Componentes Recomendados para o Design System

### 1.1 `DsThemeToggle` (Botão de Alternância de Tema Atômico)
- **Origem / Necessidade no Portal:**
  O seletor de 3 temas (`light`, `dark`, `colorblind`) atualmente reside de forma acoplada dentro do `DsHeaderBar`. Quando o Portal precisou customizar o header ou posicionar o seletor em outro local, foi necessário reimplementar a lógica de ciclo, ícones e tooltips.
- **Avaliação:** **Alta Prioridade (Atômico).**
  Um design system que oferece "três temas matematicamente verificados" deve fornecer um botão atômico que possa ser usado em qualquer lugar (headers customizados, sidebars, footers, modais de configurações).
- **Especificação Proposta:**
  ```vue
  <DsThemeToggle
    v-model="currentTheme"
    :available-themes="['light', 'dark', 'colorblind']"
    variant="ghost | outline"
    size="sm | md | lg"
  />
  ```
  - Suporte ao modelo *Target Action*: ícone e tooltip indicam a próxima ação (`moon` &rarr; `eye` &rarr; `sun`).
  - Suporte opcional a `useTheme()` composable exportado pelo pacote.

---

### 1.2 `DsTag` / `DsBadge` Variante Sutil (`variant="subtle" | "ghost"`)
- **Origem / Necessidade no Portal:**
  Nos cards de serviço, as tags (`#homelab`, `#vue`, `#docker`) foram inicialmente convertidas para `DsBadge`. O `DsBadge` padrão é uma pílula espessa com borda sólida e background denso, o que sobrecarregou visualmente o card. O Portal precisou de tags leves em formato de texto sutil.
- **Avaliação:** **Alta Prioridade (Atômico).**
  Distinção clara entre:
  1. **Status Badge** (ex: `online`, `erro`, `porta :8080` &mdash; chamativo, com ou sem dot de status).
  2. **Metadata Tag** (ex: tags de categorização, hashtags, chips de filtro leves).
- **Especificação Proposta:**
  ```vue
  <!-- Variante de tag sutil com prefixo opcional -->
  <DsTag prefix="#" size="sm" variant="subtle">homelab</DsTag>
  ```
  - Padding equilibrado: `0.2rem 0.5rem`.
  - Background sutil (`var(--ds-color-bg-muted)`) ou ghost (transparente com cor do texto muted).

---

### 1.3 `DsCode` e `DsKbd` (Monospace & Atalhos de Teclado)
- **Origem / Necessidade no Portal:**
  O Portal exibe URLs, números de porta (`:8080`) e atalhos de teclado (ex: tecla `/` na busca, tecla `Esc` para limpar). Atualmente, é necessário usar tags HTML `<code>` puras e aplicar estilizações manuais em SCSS.
- **Avaliação:** **Média-Alta Prioridade (Atômico).**
  Componentes tipográficos nativos do design system garantem contraste WCAG e fontes mono consistentes em todos os 3 temas.
- **Especificação Proposta:**
  ```vue
  <DsCode size="sm">:8080</DsCode>
  <DsKbd shortcut="/" aria-label="Pressione barra para pesquisar" />
  ```

---

### 1.4 `DsExternalLink` (Link Seguro com Indicador Visual de Nova Aba)
- **Origem / Necessidade no Portal:**
  Todos os cards do dashboard abrem serviços em novas abas (`target="_blank"`), exigindo `rel="noopener noreferrer"`, ícone de seta externa e aviso acessível para leitores de tela (`Aria: opens in new tab`).
- **Avaliação:** **Média Prioridade (Atômico).**
  Encapsula acessibilidade WCAG 2.2 para links que abrem fora da aplicação atual.
- **Especificação Proposta:**
  ```vue
  <DsExternalLink href="http://192.168.1.50:8080">
    Acessar Painel
  </DsExternalLink>
  ```

---

### 1.5 `DsCard` com Suporte a Divisores Opcionais (`divided: false`)
- **Origem / Necessidade no Portal:**
  O componente `DsCard` impõe divisores de linha (`border-block-end` no `#header` e `border-block-start` no `#footer`) com margens fixas de 8px (`var(--ds-space-2)`). Isso conflitou com o design de cards limpos do Portal, que exigiam 20px (`1.25rem`) de margem e um divisor único apenas antes do rodapé.
- **Avaliação:** **Alta Prioridade (Melhoria de Primitiva Existente).**
  O `DsCard` deve permitir desativar divisores internos automáticos via prop:
  ```vue
  <DsCard variant="elevated" padding="lg" :divided="false">
    <!-- Headers e footers sem bordas forçadas -->
  </DsCard>
  ```

---

### 1.6 `DsChipGroup` com Modo Rolável Horizontal (`scrollable`)
- **Origem / Necessidade no Portal:**
  O filtro de categorias usa `DsChipGroup`, mas o componente força quebra de linha (`flex-wrap: wrap`). Em telas mobile ou dashboards com muitas categorias, a quebra de linha ocupa muito espaço vertical antes dos cards.
- **Avaliação:** **Média Prioridade (Melhoria de Primitiva Existente).**
  Adicionar prop `scrollable?: boolean`:
  - `scrollable: true` ativa scroll horizontal sem barra feia (`scrollbar-width: none`), mantendo uma única linha compacta.

---

## 🔴 2. Componentes Avaliados e Mantidos Fora do Design System (App-Specific)

Os seguintes componentes foram avaliados e **NÃO** devem entrar no `@nftx-dev/vue-ds`:

| Componente | Motivo da Exclusão do Design System | Onde Deve Residir |
| :--- | :--- | :--- |
| **`ServiceCard`** | Contém regras de negócio homelab (resolução de portas, substituição de IP do browser, links externos dinâmicos, paleta de cores por serviço). | `portal/src/components/ServiceCard/` |
| **`ScriptsSection`** | Lógica de execução de automações e status de scripts de containers (Phase 2). | `portal/src/components/ScriptsSection/` |
| **`FallbackError`** | Orquestração específica de retry de rede e troubleshooting do gateway. | `portal/src/components/FallbackError/` |
| **Dicionário de Ícones de Homelab** | O DS deve usar Lucide icons neutros; mappings de marcas proprietárias (`docker`, `plex`, `pihole`) devem ficar no app consumidor. | `portal/src/components/ServiceCard/ServiceCard.vue` |
