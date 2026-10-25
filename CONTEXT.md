# CONTEXT — Yuki (App Web)

> Documento para continuidade entre sessões e IAs. **Atualize** ao final de cada iteração significativa.

---

## TL;DR

App web (PWA) de ficha de personagem para o sistema de RPG **Grimório do Coração**. HTML/JS puro, sem frameworks, sem build. Roda abrindo `index.html`. Dados ficam no navegador (`localStorage` para fichas/configurações/perfil/magias-custom, `IndexedDB` para PDFs). Autor é designer, não programador — **prefere find & replace** em vez de receber o arquivo inteiro.

---

## Contexto humano

- **Autor do projeto**: designer, aprendendo a programar com IA. Não é programador.
- **Colaborador ("boss")**: amigo que jogou/criou o sistema e revisa regras. Manda feedback com mudanças pontuais.
- **Idioma do app**: português (Brasil). Manter todos os textos, comentários e strings em PT-BR.
- **Nome do app**: **Yuki** (oficial).
- **Nome do sistema de RPG**: **Grimório do Coração** (não confundir — esse é o sistema, não o app).
- **Versão atual**: `0.4.0-alpha` (constante `APP_VERSION` no topo do JS).
- **Estilo atual**: "web antiga" (fundo cinza `#c0c0c0`, botões bevel, Times New Roman). Tema chamado **Alpha**.
- **Prioridade**: funcionalidade > design. Design será refeito depois com tema próprio.

---

## Stack e arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Shell do app (~20 linhas). `<head>` + `<div id="app">` + links para CSS e JS. |
| `css/app.css` | **Todo o CSS** (tema Alpha + layout + componentes). Fase 1 do split. |
| `js/app.js` | **Todo o JS** (state, models, views, handlers). Fase 1 do split. |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service Worker (cache offline). Cache atual: `yuki-v2`. |
| `favicon/favicon.ico` | Ícone. |
| `spells.csv` | **Opcional**. Presets de magia (CSV). Se não existir, aba "Magias" fica vazia com aviso. |
| `spells/index.json` | **Opcional**. Lista de CSVs (`["a.csv","b.csv"]`) para carregar múltiplos arquivos da pasta `spells/`. |
| `CONTEXT.md` | Este arquivo. |

**CDN externo (única dependência de rede)**:
- PDF.js **3.11.174** em `cdnjs.cloudflare.com` — carregado sob demanda. SW cacheia após primeiro uso.

---

## Plano de splitting (em fases)

> Motivação: `index.html` chegou a ~2500 linhas. Vai crescer com tema próprio e multi-sistema. Separar cedo reduz risco e facilita manutenção. **Sem build step** — apenas arquivos estáticos servidos por HTTP.

### Fase 1 — Split básico (concluído em v0.4.0-alpha)
- `css/app.css` — todo o CSS
- `js/app.js` — todo o JS (ainda monolito, mas fora do HTML)
- `index.html` — shell

### Fase 2 — Split por concern (quando começar o tema Yuki)

Dividir `css/app.css` em:
- `css/base.css` — reset, layout (body, container, h1-h4, .field, .grid)
- `css/components.css` — botões, inputs, modais, cards, tabs, panels, .icon-btn
- `css/alpha.css` — cores, fontes, bordas específicas do tema Alpha
- `css/themes/yuki.css` (a criar) — overrides do tema Yuki

Dividir `js/app.js` em módulos ES (`<script type="module">`):
- `js/constants.js` — CLASSES, THEMES, ARCANA_OPTIONS, PERSONA_TYPES, etc.
- `js/utils.js` — uid, esc, setPath, setText, getCurrent
- `js/state.js` — `state` + save/load (chars, settings, user, custom spells)
- `js/models.js` — factories + normalizeCharacter + defaults + copySpell
- `js/computed.js` — recalc, updateDerivedDisplays
- `js/fields.js` — fieldText, fieldNumber, fieldSelect
- `js/spells.js` — CSV parser + loadSpellPresets
- `js/pdf.js` — runtime do PDF + ensurePdfjs + openBook + renderCurrentPdfPage + readerGoTo/Zoom/Fit + leaveReader
- `js/views.js` — renderWelcome, renderList, renderBooks, renderSheet, renderSplit, renderReader, tabs, cards, modais, `render()` top-level
- `js/handlers.js` — handleClick, handleInput, handleChange, importChar, exportChar, uploadPortrait, uploadUserPfp, crop, rollDice
- `js/main.js` — `init()` + exposição de handlers inline via `window.*`
- `index.html` — `<script type="module" src="js/main.js"></script>`

### Fase 3 — Multi-sistema (quando começar suporte a outros RPGs)

Refatorar `Character` para `{ systemId, data }` onde `data` segue o schema do sistema. Render e regras viram plugins por sistema. **Requer planejamento prévio** — não começar sem desenhar.

### Regra de ouro
- **Fase 1 é move** — sem refactor. Se quebrar, é trivial debugar.
- **Fase 2 é refactor** — pode quebrar imports/exports. Testar cada módulo.
- **Fase 3 é reescrita** — não começar sem plano.

---

## Convenções obrigatórias

1. **Nunca use emoji no código**. Onde precisar de ícone, use `<svg width="..." height="..." viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>`. Já substituímos 📚/🎲/⚙/✓/⚠/◀/▶ por SVG — não reintroduza.
2. **Sem frameworks**. Nada de React, Vue, jQuery, Alpine, etc. JS puro.
3. **Sem build step**. Editar `index.html`, salvar, recarregar no navegador.
4. **Find & replace para o usuário**. Não mandar arquivo completo a menos que ele peça explicitamente. Fornecer blocos `**Find:**` / `**Replace:**` claros.
5. **Português no código**. Nomes de campos podem ser em inglês (`name`, `level`), mas labels, títulos, comentários e alertas em PT-BR.
6. **Não renomear estruturas existentes** sem pedir. O usuário valoriza consistência.
7. **Ao refatorar assinaturas de função, conferir se o find está no cabeçalho E no corpo**. (Bug do pfp foi causado por replace parcial: o `onConfirm` chegou no handler interno mas não na assinatura → `typeof onConfirm === 'function'` sempre `false`.)

---

## Chaves de persistência (NÃO MUDAR sem migração)

| Chave | Storage | Conteúdo |
|---|---|---|
| `grimoire_v1` | localStorage | `{ characters: [...] }` — todas as fichas |
| `grimoire_settings_v1` | localStorage | `{ template, splitRatio, theme, showWelcome }` |
| `grimoire_user_v1` | localStorage | `{ pfp, username }` — perfil do usuário (app-level) |
| `grimorio_custom_spells_v1` | localStorage | `[]` — biblioteca "Minhas Magias" (custom spells, global) |
| `grimoire_welcome_seen_v1` | localStorage | flag `'1'` — usuário já viu welcome pelo menos 1× |
| `grimorio_books` (DB) | IndexedDB | Object store `books`, keyPath `id`, `{id, name, blob, addedAt}` |

> **Atenção**: `grimoire_*` (com `e`) e `grimorio_*` (com `o`) **coexistem por legado**. Não unificar sem migração explícita (quebra dados salvos).

Se mudar o formato de `characters`, atualizar `normalizeCharacter()` com migração para campos antigos.

---

## Estado global (`state`)

```js
state = {
  characters: [],      // fichas carregadas
  currentId: null,     // id da ficha aberta
  view: 'list',        // 'welcome' | 'list' | 'sheet' | 'books' | 'reader' | 'split'
  tab: 'identidade',   // aba atual da ficha
  currentBookId: null, // id do PDF aberto

  settings: {
    template: 'single',   // 'single' | 'split'
    splitRatio: 0.5,      // 0.2–0.8
    theme: 'alpha',       // 'alpha' (único por enquanto)
    showWelcome: true     // exibir welcome ao abrir
  },

  user: { pfp: '', username: '' },  // perfil do usuário (app-level, NÃO vai no export de ficha)

  showSettings: false,
  showDice: false,
  showPrintPreview: false,
  diceSides: 6,
  diceHistory: [],              // últimas 20 rolagens
  customSpells: [],             // biblioteca "Minhas Magias"
  spellPresets: [],             // carregadas de spells.csv
  spellPresetsLoading: false,
  showAddSpellModal: false,
  addSpellPersonaIdx: null,
  addSpellTab: 'presets',       // 'presets' | 'custom'
  addSpellDraft: null           // rascunho de nova magia
}
```

Runtime do leitor de PDF (fora de `state`, module-scoped):
`currentPdf`, `currentBookName`, `currentPdfPage`, `currentPdfScale`, `currentPdfFit`, `pdfRenderToken`, `openBookToken`, `pdfjsLoading`.

---

## Modelo de dados — Character

```js
{
  id, creationMode: bool,
  name, class, level, arcana, player,
  attributes: { FOR, MAG, TEC, AGI, VIT, SOR },
  pv: { current, max, maxBonus },        // max = 25 + ((5+VIT)×Nível) + maxBonus
  energia: { current, max, maxBonus },   // max = VIT + ⌊Nível/2⌋ + maxBonus
  iniciativaBonus, rd, ptsAspec,
  conviction, aspects: [4 strings],
  social: { Conhecimento, Disciplina, Empatia, Charme, Expressão, Coragem },
  socialTitles: { ...mesmas chaves, strings },
  personas: [...],
  equipment: { weapon, secondaryAttack, armor, accessory, mixedEquip, items: [{name, qty}], feats },
  confidants: [{ arcana, name, rank }],
  extra: { pronouns, age, ... ~50 campos },
  portraitImage,  // data URL JPEG (crop 400×400). Vazio = sem imagem.
  createdAt, updatedAt
}
```

### Persona
```js
{ id, name, level, pm, pmBonus, conviction, naturalAbility,
  types: [],          // até 3 (Emergente: ilimitado)
  resistances: [],    // array; 1 em criação, ilimitado depois
  weaknesses: [],     // idem
  spells: [] }        // até 8
```
`pm = 5 + level + pmBonus` (recalculado em `recalc()`).

### Spell
```js
{ name, type, category, tier, range, target, uses, repress, effect }
```

### Modo de criação (`creationMode`)
- **Só** restringe durante `true`: 18 pts de atributos (mín. 1, máx. 5), 7 pts sociais, 1 resistência + 1 fraqueza por persona, PV/Energia ≤ máx.
- **Depois** (`false`): tudo editável sem limite (exceto: atributos min 1, sociais min −2 e max 25).
- Botão verde "Concluir Criação" no cabeçalho e nas Configurações. Reabrir via ⚙ → Personagem atual → "Reabrir Criação".
- Personagens importados sem o campo → `creationMode = false` (migração em `normalizeCharacter`).

---

## Navegação (views)

| View | Renderiza |
|---|---|
| `welcome` | `renderWelcome` — tela de boas-vindas (só quando `settings.showWelcome`) |
| `list` | `renderList` — lista de fichas + botões + chip do usuário |
| `sheet` | `renderSheet` — ficha em coluna única |
| `books` | `renderBooks` — biblioteca de PDFs |
| `reader` | `renderReader` — PDF fullscreen |
| `split` | `renderSplit` — ficha (esq) + PDF (dir) com divisória arrastável |

`canUseSplit()` exige `window.innerWidth >= 700`. Abaixo disso, `split` cai pra `sheet` automaticamente.

`state.tab`: `identidade`, `atributos`, `aspectos`, `sociais`, `personas`, `equipamento`, `confidentes`, `extras`.

---

## Feature checklist

- [x] Fichas ilimitadas, salvas localmente
- [x] Exportar/importar JSON (individual e lote `{characters:[...]}`)
- [x] Cálculo automático de PV, Energia, Iniciativa
- [x] Múltiplas personas por personagem
- [x] Magias com Tier consumindo PM
- [x] Presets de magia via CSV externo (`spells.csv` ou `spells/index.json`)
- [x] Biblioteca "Minhas Magias" (global, em localStorage)
- [x] PM de persona calculado (5 + nível + bônus)
- [x] Habilidades sociais com Tier automático (5 pts = 1 Tier)
- [x] Modo de criação com limites + reabertura
- [x] Leitor de PDF (IndexedDB + PDF.js)
- [x] Modo dividido com divisor arrastável
- [x] Rolagem de dados (d4–d100, quantidade, modificador, histórico)
- [x] Configurações (template, tema, welcome, perfil)
- [x] Retrato do personagem com crop quadrado 1:1
- [x] Perfil do usuário (pfp + username, app-level)
- [x] Exportação em PDF via preview + `window.print()` (A4)
- [x] Tela de boas-vindas (1× por padrão; reativável nas Configurações)
- [x] PWA (offline após primeiro carregamento)
- [ ] Tema visual próprio (próximo passo)
- [ ] Multi-sistema (planejado, não iniciado)
- [ ] Banco de habilidades pré-carregadas
- [ ] Swipe horizontal no leitor PDF

---

## Padrões de código

- **`render()` re-renderiza tudo**. Não há reconciliação. Qualquer mudança de estado → `render()`.
- **Event delegation em `document.body`**: `click`, `input`, `change` → `handleClick`, `handleInput`, `handleChange`. Botões têm `data-action="..."`; campos têm `data-bind="path.to.field"`.
- **`handleInput` tem 3 prefixos**:
  1. `addSpellDraft.*` → `state.addSpellDraft` (não salva, não recalcula).
  2. `user.*` → `state.user` + `saveUser()` (não salva ficha, não recalcula).
  3. Padrão → `getCurrent()` + `setPath(c, ...)` + `recalc(c)` + `updateDerivedDisplays()` + `save()`.
- **`setPath(obj, 'a.b.c', value)`** navega e seta em objetos aninhados.
- **Helpers**: `fieldText`, `fieldNumber`, `fieldSelect` retornam strings HTML.
- **`esc(s)`** escapa HTML — **sempre** usar ao interpolar dados do usuário.
- **`uid()`, `getCurrent()`, `save()`, `saveUser()`, `saveCustomSpells()`, `saveSettings()`** — chamar após mutação.
- **`recalc(c)`** recalcula PV/Energia/Iniciativa **e PM de todas as personas**.
- **`updateDerivedDisplays()`** atualiza labels sem re-render (chamado após `handleInput`).

---

## Armadilhas e decisões já tomadas

- **SVG inline, não emoji**.
- **`textContent` vs `innerHTML`**: se o conteúdo tem SVG/markup, usar `innerHTML` (ex.: `#attr-warn`).
- **`handleInput` clampa com `min`/`max` do input**. Mas `max` em PV/Energia só existe em `creationMode`.
- **Resistências/Fraquezas são arrays**, não strings.
- **Sociais**: `min="-2"` sempre; `max="25"` só fora de criação. Tier exibido = `max(0, floor(pontos/5))`.
- **`openBook` chamado do `renderBooks`** vai fullscreen. **Do split** → `renderReader(app, rc, true)`.
- **`leaveReader()`** destrói PDF em memória. Chamar ao sair.
- **Token pattern**: `pdfRenderToken` / `openBookToken` previnem race conditions em PDF.js.
- **Crop**: `openCropModal(file, onConfirm)` → `showCropModal(img, onConfirm)`. **Sem `onConfirm`** → grava em `c.portraitImage`. **Com `onConfirm`** → chama callback (usado para `state.user.pfp`). Sem lib externa. Overlay escuro via `box-shadow`.
- **Retrato fica em `.sheet-body`** (flex: retrato à esquerda, `.panel` à direita).
- **Export PDF usa `window.print()`** — sem libs. `@media print` esconde `body > *:not(.print-preview-overlay)`. `-webkit-print-color-adjust: exact` preserva cores.
- **`buildPrintSheetHTML`** pula seções vazias. Cada `.print-section` tem `page-break-inside: avoid`.
- **Welcome**: `settings.showWelcome` (default `true`). Checkbox "Não mostrar novamente" = **primeira visita marcado** (flag `grimoire_welcome_seen_v1`); **visitas seguintes = `!showWelcome`**. Configs → Boas-vindas: toggle + "Ver boas-vindas agora".
- **Presets de magia via CSV externo**. Ordem: `spells.csv` (raiz) e/ou `spells/index.json` (lista de arquivos em `spells/`). SW faz **network-first para `.csv`**. Carregamento assíncrono em `init()`.
- **Schema CSV**: `nome|name`, `tipo|type`, `categoria|category`, `tier`, `alcance|range`, `alvo|target`, `usos|uses`, `reprimir|repress`, `efeito|effect`. Colunas ausentes = vazio; extras = ignoradas; linhas `#` = comentário. BOM removido.
- **"Minhas Magias"**: biblioteca global, `localStorage`. Adicionar a persona faz **cópia** (`copySpell`) — editar cópia não afeta biblioteca.
- **Adicionar magia** abre modal (tabs "Magias" / "Minhas Magias"). Nova magia criada no modal é salva na biblioteca **e** na persona.
- **Formulário de nova magia** usa `data-bind="addSpellDraft.*"`.
- **Perfil do usuário** (`state.user`) é **app-level**: persistido em `grimoire_user_v1`, **não** vai no export JSON de personagem. Não confundir com `character.player`.
- **Chip do usuário** no topo da lista (`.user-chip`, clique → Configurações).
- **Atenção ao refatorar assinatura de função**: conferir **cabeçalho E corpo**. (Bug do pfp foi causado por replace parcial.)

---

## Changelog

> Versões anteriores a `v0.4.0` são reconstruídas do estado documentado (sem tags formais no Git).

### v0.4.0-alpha (atual)
- **Fase 1 do split**: CSS movido para `css/app.css`, JS para `js/app.js`. `index.html` virou shell (~20 linhas).
- Rename oficial: **Yuki** (nome do app). Sistema permanece **Grimório do Coração**.
- **Bug fix**: `showCropModal(img)` → `showCropModal(img, onConfirm)`. Sem isso, pfp do usuário não era salvo (caía no `else`, gravava em `c.portraitImage`).
- Perfil do usuário (pfp + username, app-level, visível no topo da lista, editável nas Configurações)
- Tela de boas-vindas (1× por padrão, reativável, checkbox híbrido)
- Presets de magia via CSV externo
- Biblioteca "Minhas Magias" (custom spells, global)
- PM de persona calculado (5 + nível + bônus)
- Exportação em PDF via preview + `window.print()`
- Retrato do personagem com crop quadrado 1:1

### v0.3.0
- Leitor de PDF (IndexedDB + PDF.js)
- Modo dividido (ficha + PDF)
- Rolagem de dados
- Modal de configurações (template + tema)
- Lista de personagens

### v0.2.0
- Export/import JSON
- Múltiplas personas
- Magias com Tier consumindo PM
- Modo de criação com limites + reabertura

### v0.1.0
- Criação de fichas (localStorage)
- Atributos (FOR/MAG/TEC/AGI/VIT/SOR), sociais, aspectos
- Cálculos: PV, Energia, Iniciativa

---

## Próximos passos / ideias futuras

- **Tema visual próprio** (principal). CSS já tem `[data-theme]` no body preparado.
- **Multi-sistema**: app vai suportar vários sistemas depois. Planejar estrutura de dados para isso antes de codar.
- **Banco de habilidades pré-carregadas** (além de magias).
- **Swipe horizontal** no leitor PDF.
- **Índice/sumário** no leitor PDF.
- **Busca de texto** no PDF (precisa de text layer).
- **Exportação em lote** de todas as fichas.

---

## Workflow para alterações

1. **Ler este CONTEXT.md** antes de mexer.
2. **Pedir o estado atual** de `index.html` se não estiver visível.
3. **Fornecer find & replace** (blocos `**Find:**` / `**Replace:**`) — nunca o arquivo completo sem pedido explícito.
4. **Testar mentalmente**: (a) o replace não colide com outros pontos? (b) o código de `handleClick`/`handleChange` está no lugar certo? (c) precisa de CSS novo? (d) **se for refatorar assinatura de função, o find do cabeçalho também está incluído?**
5. **Atualizar CONTEXT.md** ao final se a mudança for estrutural.