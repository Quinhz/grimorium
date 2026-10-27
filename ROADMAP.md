# ROADMAP — Yuki (Reestruturação v0.12+)

> Documento vivo. Salve na raiz do projeto como `ROADMAP.md`.
> Atualize ao final de cada fase concluída.

---

## 0. Contexto

- Yuki é um PWA de fichas de RPG (Grimório do Coração).
- HTML/JS puro, sem frameworks, sem build step.
- Dados: localStorage (`yuki_v1`, `grimoire_settings_v1`, `yuki_user_v1`,
  `grimorio_custom_spells_v1`) e IndexedDB (`grimorio_books`).
- Autor é designer, não programador. Prefere **find & replace cirúrgico**
  a receber arquivos inteiros.
- **Mobile é prioridade real** (mestre e vários jogadores só têm celular).

## 1. Situação atual (Out/2026)

- Versão: `0.11.2-alpha`.
- Temas: Alpha (clássico), Yuki (dark brutalist), Sibyl (CRT/glitch).
- Sibyl compartilha markup com Yuki
  (`renderList` unifica via `theme === 'yuki' || theme === 'sibyl'`).
- Fase 2a aplicada: `.yuki-header-bar` consolidado em 1 regra (grid).
  **Mobile alinhado.**
- **Pendente:** alinhamento desktop entre header-bar e grid (§7).

## 2. Problema raiz

### 2.1 CSS monolítico (causa de 90% dos bugs visuais)

`css/app.css` (~3500 linhas) cresceu por acréscimo. Múltiplas
definições do mesmo seletor intercaladas com temas diferentes. Vence
a que está por último. Não é possível saber "quem manda" sem ler tudo.

Auditoria (Fase 1):

| Seletor               | Regras |
|-----------------------|--------|
| `.yuki-nav`           | 6      |
| `.yuki-grid`          | 7      |
| `.yuki-header-bar`    | 4 → 1 (após Fase 2a) |
| `.yuki-main`          | 4      |
| `.yuki-title`         | 4      |
| `.yuki-card`          | 3      |
| `.yuki-card-img`      | 3      |
| `.home-actions`       | 3      |

`!important`: ~30 ocorrências, concentradas em botões de confirmação
(`.btn-accent`, crop confirm, overrides Yuki).

### 2.2 Temas acoplados no JS

`renderList()` em `render.js`:
```js
if (state.settings.theme === 'yuki' || state.settings.theme === 'sibyl') { ... }

Cada tema novo = editar essa linha.
2.3 Performance

    render() recria todos os modais a cada chamada (5 modais do zero).

    Parallax Sibyl usa 4 camadas com filter: blur() → caro em GPU móvel.

    background-position animado = não composto → repaint contínuo.

2.4 Personalização

state.settings só tem 4 flags. Cores, tamanho de fonte e intensidade
de animação são fixos por tema.
3. Prioridades (ordem)

    Alinhamento — visual saltado aos olhos.

    Mobile — validação obrigatória em toda fase.

    Performance — 60fps em Android médio.

    Personalização de movimento (não de cor) — toggles por tema.

4. Arquitetura alvo
4.1 Dois "chromas"

Todo tema usa um de dois esqueletos:
Chroma	Temas	Markup
classic	Alpha	.container + painéis/tabelas
chrome	Yuki, Sibyl, futuros	.yuki-layout (sidebar + main + grid)

Cada tema em THEMES declara chroma: 'classic' | 'chrome'.
renderList() consulta theme.chroma, nunca o ID.

Adicionar tema futuro:

    THEMES.push({ id:'novo', chroma:'chrome', ... })

    Criar css/themes/novo.css (~15 variáveis)

    Pronto. Zero mudança em JS.

4.2 CSS em camadas
text

css/
  base.css         reset, tipografia, utilitários
  layout.css       .container, .panel, .grid, .split, .modal (estrutura)
  components.css   botões, inputs, tabs, cards, sheet menu, reader
  themes/
    alpha.css
    yuki.css
    sibyl.css
  print.css        @media print

index.html carrega todos. Cada tema escopado por body[data-theme="X"].
Sem flicker, sem fetch dinâmico.
4.3 Tokens (variáveis CSS)

Cada tema define só valores; componentes definem estrutura:
css

body[data-theme="X"] {
  --bg-main, --bg-card, --bg-input,
  --text-main, --text-muted, --text-accent,
  --border, --accent, --accent-contrast,
  --radius-card, --radius-input,
  --shadow-card, --shadow-modal,
  --font-ui, --font-heading,
  --space-1..4,
  --motion-scale,              /* 0=off, 0.5=reduced, 1=full */
  --motion-transition-duration
}

4.4 Render dividido
js

render() {
  renderApp();     // home/sheet/books/split/welcome
  renderModals();  // apenas modais cujo estado mudou
}

Modais viram singletons (montados uma vez, toggle hidden).
Re-renderiza só quando conteúdo interno muda.
4.5 Preferências do usuário
js

state.settings.prefs = {
  motion: 'full',              // 'full' | 'reduced' | 'off'
  themeFx: {                   // overrides por tema
    sibyl: { parallax: true, glitch: true },
    yuki:  { hoverFx: true }
  }
}

Aplicado como CSS vars no <html>. Cada tema lê var(--motion-scale).
Não é color picker — é intensidade de movimento.
5. Fases

    1 fase = 1 sessão. Não avançar sem validar em mobile + desktop.

Fase 0 — Este documento ✅

Salvar como ROADMAP.md.
Fase 1 — Auditoria CSS ✅

Feita em 26/10/2026. Ver §2.1.
Fase 2a — .yuki-header-bar consolidado ✅

Aplicado: 4 regras → 1. Mobile alinhado.
Fase 2a-2 — Alinhamento desktop ⏳

Aplicado o fix de 3 regras (ver §7). Validar.
Se não resolver, próxima sessão começa com screenshot.
Fase 2b — .yuki-grid consolidado

Arquivo: css/app.css.
Meta: 7 regras → 1 por breakpoint (desktop / mobile).
Validar: cards com mesmo tamanho em 1, 3, 5, 8 personagens.
Fase 2c — .yuki-card + .yuki-card-img

Arquivo: css/app.css.
Meta: 3+3 → 1+1 por breakpoint.
Validar: card inteiro consistente em todos os temas.
Fase 2d — .yuki-main + .yuki-title

Arquivo: css/app.css.
Meta: 4+4 → 1+1 por breakpoint.
Validar: espaçamento uniforme entre home, livros, ficha.
Fase 3 — Desacoplar temas do JS

Arquivos: js/data.js, js/render.js, index.html.

    THEMES ganha chroma.

    renderList() consulta chroma.

    index.html carrega CSS em camadas.

    Zero mudança de comportamento visível.

Fase 4 — Componentes limpos

Arquivos: css/components.css (novo), js/modals.js, js/sheet.js.
Sub-dividir:

    4a: cards + tabs + inputs

    4b: modais (settings/about/dice/print/add-spell)

    4c: reader + crop + sheet menu + bottom bar
    Validar: 1 screenshot por tema por sub-fase.

Fase 5 — Render dividido

Arquivos: js/render.js, js/modals.js, js/app.js.

    render() → renderApp() + renderModals().

    Modais singletons.

    Ganho principal de performance.

Fase 6 — Preferências de movimento

Arquivos: js/data.js, js/modals.js, js/app.js, css/components.css.

    prefs.motion (full/reduced/off).

    prefs.themeFx.<tema>.parallax, .glitch, .hoverFx.

    UI em Configurações > Aparência.

    Aplicado como CSS vars.

Fase 7 — Parallax mobile-first

Arquivos: js/data.js, css/themes/sibyl.css.

    Detectar touch + largura < 900px → 2 camadas em vez de 4, sem blur.

    Pausar requestAnimationFrame em document.hidden.

    transform em pseudo-elemento (composited), não background-position.

    Meta: 60fps Android médio, sem drain perceptível de bateria.

Fase 8 — Bump + changelog + cache

    APP_VERSION = 0.12.0-alpha.

    CHANGELOG entrada nova.

    sw.js CACHE = yuki-v11 + revisar ASSETS.

    Hard reload (Ctrl+Shift+R).

6. Checklist por fase (obrigatório)

    □

    Home: 0 fichas, 1 ficha, 5 fichas
    □

    Home: alinhamento header ↔ cards em 360 / 390 / 768 / 1024 / 1440px
    □

    Ficha: as 7 abas abrem e preenchem
    □

    Ficha: mobile (FAB, bottom bar)
    □

    Livros: vazio e com 1 PDF
    □

    Split: divisória arrasta, PDF repagina
    □

    Modais: settings, about, dice, print preview
    □

    Trocar tema: Alpha → Yuki → Sibyl → Alpha, sem reload
    □

    Hard reload: estado persiste
    □

    Mobile real (não só DevTools) em pelo menos 1 teste por fase

7. Known issue — alinhamento desktop (Fase 2a-2)

Sintoma: no desktop, botão "Novo" / contagem "Fichas: N" não
alinhados com os cards abaixo.

Hipóteses:

    .yuki-card.empty (3 fillers) visíveis em desktop distorcem o grid
    quando há 1+ personagens reais.

    .yuki-header e .yuki-grid com max-width: 900px mas centros
    diferentes por align-items: center do .yuki-main.

Fix aplicado (26/10/2026):
css

body[data-theme="yuki"] .yuki-header,
body[data-theme="yuki"] .yuki-grid {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  min-width: 0;
}
body[data-theme="yuki"] .yuki-header-bar > button {
  justify-self: end;
  margin-right: 0;
}
body[data-theme="yuki"] .yuki-grid:has(.yuki-card:not(.empty)) .yuki-card.empty,
body[data-theme="sibyl"] .yuki-grid:has(.yuki-card:not(.empty)) .yuki-card.empty {
  display: none;
}

Se persistir: screenshot obrigatório. Sem ele não dá pra medir
o delta em px nem inferir a fonte.
8. Métricas de sucesso
Métrica	Antes	Meta
Linhas em css/app.css	~3500	0 (dividido em 6)
!important no CSS	~30	< 5
Tempo de render() ao abrir modal	~30–60ms	< 5ms
Definições de .yuki-header-bar	4	1 ✅
Definições de .yuki-grid	7	2 (desktop/mobile)
Adicionar tema novo	3 arquivos	1 arquivo
9. Não-fazer

    Não reescrever render.js inteiro. Incremental (Fase 5).

    Não trocar de framework. "Sem build step" é escolha válida.

    Não adicionar tema novo durante reestruturação. Terminar primeiro.

    Não bump de versão em fase intermediária. Só na Fase 8.

    Não usar scripts no Console com o usuário — ele reportou
    dificuldade (copyAudit() falhou). Validar visualmente +
    descrição em texto ou screenshot.

10. Changelog deste documento

    26/10/2026 — Criação inicial.
    Fase 1 (auditoria) e 2a (header-bar) marcadas concluídas.
    Fix de alinhamento desktop aplicado (§7).
    Mobile promovido a prioridade máxima.
    Personalização redefinida como movimento, não cor.
    Proibição de scripts Console adicionada (§9).