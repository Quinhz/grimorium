# CONTEXT — Grimório do Coração (App Web)

> Documento para continuidade entre sessões e IAs. **Atualize** ao final de cada iteração significativa.

---

## TL;DR

App web (PWA) de ficha de personagem para o sistema de RPG **Grimório do Coração**. HTML/JS puro, sem frameworks, sem build. Roda abrindo `index.html`. Dados ficam no navegador (`localStorage` para fichas/configurações, `IndexedDB` para PDFs). Autor é designer, não programador — **prefere find & replace** em vez de receber o arquivo inteiro.

---

## Contexto humano

- **Autor do projeto**: designer, aprendendo a programar com IA. Não é programador.
- **Colaborador ("boss")**: amigo que jogou/criou o sistema e revisa regras. Manda feedback com mudanças pontuais.
- **Idioma do app**: português (Brasil). Manter todos os textos, comentários e strings em PT-BR.
- **Estilo atual**: "web antiga" (fundo cinza `#c0c0c0`, botões bevel, Times New Roman nos títulos). Tema chamado **Alpha**.
- **Prioridade**: funcionalidade > design. Design será refeito depois (tema Alpha é provisório).
- **Nome do app**: **Grimorium** (não definitivo — escolher antes do lançamento público para evitar conflito de marca).
- **Versão atual**: `0.4.0-valpha` (constante `APP_VERSION` no topo do JS).

---

## Stack e arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | App inteiro (CSS + JS inline). Fonte única de verdade. |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service Worker (cache offline). Versão atual do cache: `grimorium-v5`. |
| `favicon/favicon.ico` | Ícone (referenciado no `<head>`). |
| `CONTEXT.md` | Este arquivo. |

**CDN externo (única dependência de rede)**:
- PDF.js **3.11.174** em `cdnjs.cloudflare.com` — carregado sob demanda. SW cacheia após primeiro uso.

---

## Convenções obrigatórias

1. **Nunca use emoji no código**. Onde precisar de ícone, use `<svg width="..." height="..." viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>`. Já substituímos 📚/🎲/⚙/✓/⚠/◀/▶ por SVG — não reintroduza.
2. **Sem frameworks**. Nada de React, Vue, jQuery, Alpine, etc. JS puro.
3. **Sem build step**. Editar `index.html`, salvar, recarregar no navegador.
4. **Find & replace para o usuário**. Não mandar arquivo completo a menos que ele peça explicitamente. Fornecer blocos `**Find:**` / `**Replace:**` claros.
5. **Português no código**. Nomes de campos podem ser em inglês (`name`, `level`), mas labels, títulos, comentários e alertas em PT-BR.
6. **Não renomear estruturas existentes** sem pedir. O usuário valoriza consistência.

---

## Chaves de persistência (NÃO MUDAR sem migração)

| Chave | Storage | Conteúdo |
|---|---|---|
| `grimorio_do_coracao_v1` | localStorage | `{ characters: [...] }` — todas as fichas |
| `grimorio_settings_v1` | localStorage | `{ template, splitRatio, theme }` |
| `grimorio_books` (DB) | IndexedDB | Object store `books`, keyPath `id`, contém `{id, name, blob, addedAt}` |

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
    showWelcome: true     // exibir tela de boas-vindas ao abrir
  },
  showSettings: false, // modal de config aberto
  showDice: false,     // modal de dados aberto
  diceSides: 6,        // tipo do dado selecionado
  diceHistory: []      // últimas 20 rolagens
}
```

Runtime do leitor de PDF (fora de `state`, module-scoped):
`currentPdf`, `currentBookName`, `currentPdfPage`, `currentPdfScale`, `currentPdfFit`, `pdfRenderToken`, `openBookToken`, `pdfjsLoading`.

---

## Modelo de dados — Character

```js
{
  id, creationMode: bool,           // true = em criação (limites ativos)
  name, class, level, arcana, player,
  attributes: { FOR, MAG, TEC, AGI, VIT, SOR },  // min 1 em criação
  pv: { current, max, maxBonus },   // max = 25 + ((5+VIT)×Nível) + maxBonus
  energia: { current, max, maxBonus }, // max = VIT + ⌊Nível/2⌋ + maxBonus
  iniciativaBonus, rd, ptsAspec,
  conviction, aspects: [4 strings],
  social: { Conhecimento, Disciplina, Empatia, Charme, Expressão, Coragem },
  socialTitles: { ...mesmas chaves, strings },
  personas: [...],
  equipment: { weapon, secondaryAttack, armor, accessory, mixedEquip, items: [{name, qty}], feats },
  confidants: [{ arcana, name, rank }],
  extra: { pronouns, age, ... ~50 campos },
  portraitImage,  // data URL (base64 JPEG), redimensionado para max 400x400, vazio = sem imagem
  createdAt, updatedAt
}
```

### Persona
```js
{ id, name, level, pm, pmBonus, conviction, naturalAbility,
  // pm = 5 + level + pmBonus (recalculado em recalc()); pmBonus começa em 0
  types: [],               // até 3 (Emergente: ilimitado)
  resistances: [],         // array; 1 em criação, ilimitado depois
  weaknesses: [],          // idem
  spells: [até 8] }
```

### Spell
```js
{ name, type, category, tier, range, target, uses, repress, effect }
```

### Modo de criação (`creationMode`)
- **Só** restringe durante `true`: 18 pts de atributos, 7 pts sociais, 1 resistência + 1 fraqueza por persona, PV/Energia ≤ máx.
- **Depois** (`false`): tudo editável sem limite (exceto: atributos min 1, sociais min −2 e max 25 = Tier 5).
- Botão verde "Concluir Criação" no cabeçalho e nas Configurações. Reabrir via ⚙ → Personagem atual → "Reabrir Criação".
- Personagens importados sem o campo → `creationMode = false` (migração em `normalizeCharacter`).

---

## Navegação (views)

`state.view` controla o que `render()` monta em `#app`:

| View | Renderiza |
|---|---|
| `list` | `renderList` — lista de fichas + botões (novo, importar, livros, config) |
| `sheet` | `renderSheet` — ficha em coluna única |
| `books` | `renderBooks` — biblioteca de PDFs |
| `reader` | `renderReader` — PDF fullscreen |
| `split` | `renderSplit` — ficha (esq) + PDF (dir) com divisória arrastável |

**Só existe split se `window.innerWidth >= 700`** (`canUseSplit()`). Abaixo disso, cai pra `sheet` automaticamente.

`state.tab` (só em `sheet`/`split`): `identidade`, `atributos`, `aspectos`, `sociais`, `personas`, `equipamento`, `confidentes`, `extras`.

---

## Feature checklist

- [x] Fichas ilimitadas, salvas localmente
- [x] Exportar/importar JSON (individual ou lote `{characters:[...]}`)
- [x] Cálculo automático de PV, Energia, Iniciativa
- [x] Múltiplas personas por personagem
- [x] Magias com Tier consumindo PM
- [x] Presets de magia carregados de CSV externo (spells.csv ou spells/index.json) + biblioteca "Minhas Magias" (custom, global, em localStorage)
- [x] PM de persona calculado automaticamente (5 + nível + bônus)
- [x] Habilidades sociais com Tier automático (5 pts = 1 Tier)
- [x] Modo de criação com limites + reabertura
- [x] Leitor de PDF (IndexedDB + PDF.js)
- [x] Modo dividido (ficha + PDF) com divisor arrastável
- [x] Rolagem de dados (d4–d100, quantidade, modificador)
- [x] Configurações (template, tema)
- [x] Retrato do personagem com crop quadrado 1:1 (drag + slider)
- [x] Exportação em PDF via preview modal + `window.print()` (todas as abas numa folha A4)
- [x] Tela de boas-vindas (aparece 1× por padrão; reativável nas Configurações)
- [x] PWA (offline após primeiro carregamento)
- [ ] Banco de habilidades pré-carregadas
- [ ] Swipe horizontal no leitor PDF
- [ ] Mais temas (visual — refazer do zero, tema Alpha é provisório)

---

## Padrões de código

- **`render()` re-renderiza tudo**. Não há reconciliação. Qualquer mudança de estado → chamar `render()`.
- **Event delegation em `document.body`**: `click`, `input`, `change` → handlers `handleClick`, `handleInput`, `handleChange`. Botões têm `data-action="..."`; campos têm `data-bind="path.to.field"`.
- **`setPath(obj, 'a.b.c', value)`** navega e seta em objetos aninhados.
- **Helpers de UI**: `fieldText(label, bind, value, placeholder)`, `fieldNumber(...)`, `fieldSelect(...)` retornam strings HTML.
- **`esc(s)`** escapa HTML — **sempre** usar ao interpolar dados do usuário em templates.
- **`uid()`** gera IDs únicos.
- **`getCurrent()`** retorna a ficha aberta.
- **`save()`** persiste após qualquer mutação.
- **`recalc(c)`** recalcula PV/Energia/Iniciativa — chamar após qualquer input numérico relevante.
- **`updateDerivedDisplays()`** atualiza labels/aviso sem re-renderizar (chamado após `handleInput`).

---

## Armadilhas e decisões já tomadas

- **SVG inline, não emoji**. Reforçando: qualquer UI nova, zero emoji.
- **`textContent` vs `innerHTML`**: se o conteúdo tem SVG/markup, usar `innerHTML`. Ex.: o aviso `#attr-warn` usa `innerHTML` porque inclui SVG de aviso.
- **`handleInput` clampa com `min`/`max` do input**. Mas `max` em PV/Energia só existe em modo criação — fora de criação o usuário pode digitar acima do máximo.
- **Resistências/Fraquezas são arrays** (`resistances`, `weaknesses`), não strings. Import antigo com `resistance: 'Fogo'` migra pra `['Fogo']`.
- **PM de persona = `5 + nível + pmBonus`**. Antes era fixo em 6. `pmBonus` substitui o campo editável antigo; o total é recalculado em `recalc()` (que percorre `c.personas`) e atualizado no DOM via `updateDerivedDisplays` (id `pm-total-${idx}`). Migração em `normalizeCharacter` infere `pmBonus = max(0, pmAntigo − 5 − nível)` para preservar overrides existentes.
- **Presets de magia são carregados de CSV externo** (não há mais `SPELL_PRESETS` hardcoded). Ordem: (a) `spells.csv` na raiz, (b) se existir `spells/index.json` (`["a.csv","b.csv"]`), cada CSV em `spells/` é carregado e concatenado. Nenhum dos dois → aba "Magias" mostra aviso e fica vazia. Carregamento é assíncrono em `init()` (`loadSpellPresets()` não é awaited); se o modal abrir antes de terminar, mostra "Carregando...". SW faz **network-first para `.csv`** — atualizações do arquivo aparecem sem bump de cache.
- **Schema CSV** (header lowercase, trimado; aceita PT e EN): `nome|name`, `tipo|type`, `categoria|category`, `tier`, `alcance|range`, `alvo|target`, `usos|uses`, `reprimir|repress`, `efeito|effect`. Colunas ausentes = vazio; extras = ignoradas; linhas começando com `#` = comentário. BOM UTF-8 é removido. `spells.csv.example` é o template (renomear para `spells.csv` para ativar).
- **"Minhas Magias"** é uma biblioteca **global** (compartilhada entre personagens), persistida em `localStorage` sob `grimorio_custom_spells_v1`. Adicionar preset/custom a uma persona faz uma **cópia** (`copySpell`) — editar a cópia na persona não altera a biblioteca.
- **Adicionar magia agora abre um modal** (não cria um card em branco direto). Fluxo: botão + → modal → tab "Magias" (presets) ou "Minhas Magias" (custom com criar/excluir). Nova magia criada no modal é salva na biblioteca **e** na persona. Fecha sozinho quando a persona chega em 8 magias.
- **Formulário de nova magia usa `data-bind="addSpellDraft.*"`** — `handleInput` detecta esse prefixo e atualiza `state.addSpellDraft` (não o personagem).
- **Sociais**: `min="-2"` sempre. `max="25"` só fora de criação. Tier exibido é `max(0, floor(pontos/5))` — negativos viram 0.
- **`openBook` chamado do `renderBooks`** vai para `reader` fullscreen. **`openBook` chamado do split** → `renderReader(app, rc, true)` (embedded, sem botões de split).
- **`leaveReader()`** destrói PDF em memória. Chamar ao sair do leitor para liberar RAM.
- **Token pattern**: `pdfRenderToken` e `openBookToken` previnem race conditions em operações assíncronas (PDF.js carrega devagar).
- **`window.addEventListener('resize')`** tem dois listeners: um redefine split→sheet se < 700px, outro refaz fit do PDF.
- **Crop do retrato**: implementação própria (sem lib externa). Modal aberto via `openCropModal(file)` → `showCropModal(img)` (DOM criado direto no `document.body`, fora do `render()`, para não ser limpo por re-render). Seleção quadrada 1:1 arrastável com `pointer events` + slider de tamanho; overlay escuro via `box-shadow: 0 0 0 9999px rgba(0,0,0,0.55)` no `.crop-selection`. Resultado: canvas 400×400 → data URL JPEG (0.85) salvo em `portraitImage`. `resizeImageFile` foi removido junto.
- **Retrato fica em `.sheet-body`** (flex: retrato à esquerda, `.panel` à direita com `flex:1; min-width:0`). Não está mais no cabeçalho — o cabeçalho voltou a ser só `.row-between` com h1 + botões.
- **Export PDF usa `window.print()`** — sem libs. O preview é um modal que monta `buildPrintSheetHTML(c)` (todas as abas numa folha A4 com cores do tema). `@media print` esconde `body > *:not(.print-preview-overlay)` e mantém só o `#print-sheet`. `-webkit-print-color-adjust: exact` preserva os fundos coloridos. **Não adicionamos** html2pdf/jsPDF: sairia imagem (sem `Ctrl+F`, 5–10× maior). Se algum dia o usuário pedir download direto sem o diálogo do sistema, aí sim adicionar html2pdf.js.
- **`buildPrintSheetHTML`** monta seções que pulam conteúdo vazio (Aspectos/Equipamento/Confidentes/Extras só aparecem se preenchidos). Cada `.print-section` tem `page-break-inside: avoid` para não quebrar no meio. Cada persona-card também.
- **Tela de boas-vindas (`view === 'welcome'`)** é controlada por `settings.showWelcome` (default `true`). Aparece na primeira abertura. Checkbox "Não mostrar novamente" tem comportamento híbrido: **primeira visita = marcado por padrão** (flag `grimorium_welcome_seen_v1` no `localStorage`); **visitas seguintes = `!showWelcome`**. Ao entrar: `showWelcome = !checkbox.checked` + flag é gravada. Configurações → Boas-vindas: toggle direto + botão "Ver boas-vindas agora" (só navega, não altera). FAB de dados é omitido em `welcome`. CSS `.welcome-screen/.welcome-card/.welcome-title/...` no final do `<style>`.

---

## Próximos passos / ideias futuras

- **Design/visual completo**: refazer tema Alpha ou criar Beta/Gamma. CSS já tem `[data-theme]` no body preparado.
- **Banco de habilidades pré-carregadas**: JSON embutido + botão "importar habilidade" na ficha.
- **Swipe horizontal** no leitor PDF para virar página.
- **Índice/sumário** no leitor PDF.
- **Busca de texto** no PDF (precisa de text layer).
- **Exportação em lote** de todas as fichas.

---

## Workflow para alterações

1. **Ler este CONTEXT.md** antes de mexer.
2. **Pedir o estado atual** de `index.html` se não estiver visível.
3. **Fornecer find & replace** (blocos `**Find:**` / `**Replace:**`) — nunca o arquivo completo sem pedido explícito.
4. **Testar mentalmente**: (a) o replace não vai colidir com outros pontos do arquivo? (b) o código de `handleClick`/`handleChange` está no lugar certo? (c) precisa de CSS novo?
5. **Atualizar CONTEXT.md** ao final se a mudança for estrutural (novo campo de estado, nova feature, nova convenção).