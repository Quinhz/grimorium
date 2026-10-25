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
- **Versão atual**: `0.6.0-alpha` (constante `APP_VERSION` no topo do `js/app.js`).
- **Estilo atual**: Tema **Alpha** (clássico, web antiga) e Tema **Yuki** (oficial, Dark Brutalist, monoespaçado IBM Plex Mono).
- **Prioridade**: funcionalidade > design.

---

## Stack e arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Shell do app (~20 linhas). `<head>` + `<div id="app">` + links para CSS e JS. |
| `css/app.css` | **Todo o CSS** (Tema Alpha + Layout + Componentes + Tema Yuki). |
| `js/app.js` | **Todo o JS** (state, models, views, handlers). Ainda monolito. |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service Worker (cache offline). Cache atual: `yuki-v3`. |
| `favicon/favicon.ico` | Ícone. |
| `spells.csv` | **Opcional**. Presets de magia (CSV). |
| `spells/index.json` | **Opcional**. Lista de CSVs (`["a.csv","b.csv"]`) para múltiplos arquivos. |
| `CONTEXT.md` | Este arquivo. |

**CDN externo**: Google Fonts (IBM Plex Mono) e PDF.js **3.11.174** (cdnjs) — carregados sob demanda.

---

## Plano de splitting (em fases)

### Fase 1 — Split básico (CONCLUÍDO)
- `css/app.css` e `js/app.js` separados do HTML.

### Fase 2 — Split por concern (quando começar refactor pesado)
- Dividir CSS em `base`, `components`, `alpha`, `themes/yuki`.
- Dividir JS em módulos ES (`constants`, `utils`, `state`, `models`, `computed`, `fields`, `spells`, `pdf`, `views`, `handlers`, `main`).
- **Regra de ouro**: Move puro na Fase 1 (já feito), refactor com testes na Fase 2.

### Fase 3 — Multi-sistema
- Refatorar `Character` para `{ systemId, data }`. Render e regras como plugins.

---

## Convenções obrigatórias

1. **Nunca use emoji no código**. Use SVGs inline (`<svg ...>`).
2. **Sem frameworks**. JS puro.
3. **Sem build step**. Apenas HTML/CSS/JS estáticos.
4. **Find & replace**. Não mandar arquivo completo a menos que pedido.
5. **Português no código**. Nomes em inglês, strings em PT-BR.
6. **Não renomear estruturas** sem pedir.
7. **Ao refatorar assinaturas de função**, conferir cabeçalho E corpo.
8. **Atualizar CONTEXT.md e Changelog** a cada feature estrutural.
9. **Nunca usar estilos inline no JS** (`style="..."`). Eles quebram a troca de temas. Sempre usar classes CSS.

---

## Chaves de persistência (NÃO MUDAR sem migração)

| Chave | Storage | Conteúdo |
|---|---|---|
| `yuki_v1` | localStorage | `{ characters: [...] }` — todas as fichas |
| `grimorio_settings_v1` | localStorage | `{ template, splitRatio, theme, showWelcome }` |
| `yuki_user_v1` | localStorage | `{ pfp, username }` — perfil do usuário |
| `grimorio_custom_spells_v1` | localStorage | `[]` — biblioteca "Minhas Magias" |
| `yuki_welcome_seen_v1` | localStorage | flag `'1'` — welcome visto pelo menos 1× |
| `grimorio_books` (DB) | IndexedDB | Object store `books`, keyPath `id`. |

---

## Estado global (`state`)

```js
state = {
  characters: [],      // fichas
  currentId: null,     // id aberta
  view: 'list',        // 'welcome' | 'list' | 'sheet' | 'books' | 'reader' | 'split'
  tab: 'identidade',   // aba da ficha
  currentBookId: null, // id do PDF aberto

  settings: {
    template: 'single',   // 'single' | 'split'
    splitRatio: 0.5,      // 0.2–0.8
    theme: 'alpha',       // 'alpha' | 'yuki'
    showWelcome: true     // exibir welcome ao abrir
  },

  user: { pfp: '', username: '' },  // app-level

  showSettings: false,
  showDice: false,
  showPrintPreview: false,
  diceSides: 6,
  diceHistory: [],
  customSpells: [],
  spellPresets: [],
  spellPresetsLoading: false,
  showAddSpellModal: false,
  addSpellPersonaIdx: null,
  addSpellTab: 'presets',
  addSpellDraft: null
}