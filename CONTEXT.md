# CONTEXT — Yuki (App Web)

> Documento para continuidade entre sessões e IAs. **Atualize** ao final de cada iteração significativa.

---

## TL;DR

App web (PWA) de ficha de personagem para o sistema de RPG **Grimório do Coração**. HTML/JS puro, sem frameworks, sem build. Dados em `localStorage` (fichas/config) e `IndexedDB` (PDFs). Autor é designer, não programador — prefere **find & replace** em vez de receber arquivos inteiros.

---

## Stack e arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Shell do app — 6 CSS + 7 JS em ordem. |
| `css/01-base.css` | Reset, tipografia, `.container`, `.panel`, `.field`, `.tabs`, `.table`, utilitários. |
| `css/02-components.css` | Modais, split view, reader, dice, portrait, crop, print, add-spell, welcome, user-chip. |
| `css/03-theme-yuki.css` | Tema Yuki: variáveis, sidebar, grid, cards, overrides complementares. |
| `css/04-overrides.css` | Responsividade global mobile + ajustes Alpha/Yuki home, sheet menu, reader. |
| `css/05-theme-sibyl.css` | Tema Sibyl: variáveis, fundo parallax, FX burst, layout, cards, overrides mobile. |
| `css/06-consolidation.css` | Consolidações Fases 2a–2d (header-bar, grid, card, main/title, alinhamento desktop). |
| `js/data.js` | Constantes, state, persistência, modelos, cálculos, **CHANGELOG**. |
| `js/theme.js` | `applyTheme`, parallax Sibyl, burst, tile updater. |
| `js/modals.js` | HTML dos modais. |
| `js/reader.js` | Leitor de PDF. |
| `js/sheet.js` | Ficha, abas, menu lateral, retrato. |
| `js/render.js` | Home, lista de fichas, livros, split, welcome. |
| `js/app.js` | Handlers de evento + init. |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service Worker. Cache atual: `yuki-v11`. |
| `ROADMAP.md` | Plano de reestruturação (Fases 0–8). |
| `WORKFLOW.md` | Regras de trabalho. |
| `spells.csv` | Opcional. Presets de magia. |
| `spells/index.json` | Opcional. Lista de múltiplos CSVs. |

**CDNs**: Google Fonts (IBM Plex Mono) e PDF.js (3.11.174).

---

## Convenções Obrigatórias

1. **Sem emoji no código** (use SVGs inline).
2. **Sem frameworks/build step**. HTML/CSS/JS puro.
3. **Sem estilos inline no JS** (exceto casos ultra-específicos). Use classes CSS. Isso quebra a troca de temas.
4. **Usar `overscroll-behavior: contain;`** em modais com scroll interno para não vazar pro fundo.
5. **Ao subir a versão**: Atualizar `APP_VERSION` e adicionar o novo objeto no topo do array `CHANGELOG` em `js/data.js`.
---

## Chaves de Persistência

| Chave | Storage | Conteúdo |
|---|---|---|
| `yuki_v1` | localStorage | Fichas (characters). |
| `grimorio_settings_v1` | localStorage | Configs (template, tema, welcome). |
| `yuki_user_v1` | localStorage | Perfil (pfp, username). |
| `grimorio_custom_spells_v1` | localStorage | Biblioteca "Minhas Magias". |
| `yuki_welcome_seen_v1` | localStorage | Flag se já viu o welcome. |
| `grimorio_books` (DB) | IndexedDB | Livros em PDF (blobs). |

---

## Onde fica o Changelog?

O histórico de versões exibido na tela "Sobre" **não fica neste arquivo**. Ele está implementado como uma constante `CHANGELOG` no topo do `js/data.js` (um array de objetos). A função `aboutModalHTML()` (em `js/modals.js`) lê esse array e renderiza o modal.

---

## Próximos passos / ideias futuras

- Ajustar o design do Tema Yuki.
- Multi-sistema (suporte a outros RPGs no futuro).
- Banco de habilidades pré-carregadas.

## Iteração 24/10/2026 — Home responsiva

- Alinhamento dos botões da home nos temas Alpha e Yuki, com CSS compartilhado e sem cores fixas.
- No Alpha, as quatro ações usam uma grade equilibrada: quatro colunas em telas largas, duas em telas menores e uma em celulares estreitos.
- No Yuki, cabeçalho e botões dos cards têm altura mínima consistente; a navegação vira uma linha de três ícones em celulares estreitos, com rótulos acessíveis.
- Versão atualizada para `v0.8.0-alpha`; cache do Service Worker atualizado para `yuki-v5`.


## Iteração 25/10/2026 — Refinamento do tema Yuki

- Yuki é o tema oficial provisório e deve receber prioridade nas próximas iterações visuais.
- Refinar a home: alinhamento do cabeçalho, navegação, cards e botões.
- Melhorar a responsividade em notebook, tablet e mobile, incluindo telas estreitas.
- Padronizar o contraste dos botões de confirmação e salvamento.
- Preferir classes CSS a estilos inline no JavaScript, respeitando a troca de temas.
- Manter HTML, CSS e JavaScript puros, sem frameworks ou etapa de build.
- Ao concluir a alteração, sincronizar APP_VERSION, CHANGELOG e cache do Service Worker.
- Versão planejada: 0.8.0-alpha.
- Cache planejado: yuki-v5.
- Próxima verificação: testar home com zero, um e vários personagens, além dos botões dos modais e da navegação mobile.

## Iteração 25/10/2026 — Correções visuais e navegação Yuki

- Corrigir o contraste do botão "Sobre o App", removendo seu estilo inline e aplicando uma classe específica.
- Alinhar o contador de fichas e o botão "Novo" no cabeçalho da home.
- Reforçar o contraste do botão "Cortar e usar" no modal de recorte.
- Reutilizar a sidebar Yuki na aba Livros, mantendo perfil, navegação e importação acessíveis.
- Aplicar cores do tema Yuki ao fundo e à divisória da split view.
- Atualizar APP_VERSION, CHANGELOG e cache do Service Worker após validação.
- Versão planejada: 0.8.1-alpha.
- Cache planejado: yuki-v6.
- Validar a home, a biblioteca com e sem PDFs, os estados de carregamento/erro, o recorte de fotos e a split view.

## Iteração 25/10/2026 — Menu mobile na ficha + navegação de PDF

- Menu lateral (drawer) na ficha em mobile, aberto pelo FAB (que deixou de ser dado e virou menu dentro da ficha).
- Barra inferior fixa em mobile na ficha com Lista, Dado, Exportar e Excluir.
- Abas da ficha migraram do topo para o menu lateral em mobile.
- Botões de ação do cabeçalho da ficha ocultados em mobile (agora acessíveis via barra/menu).
- Retrato do personagem no mobile virou quadradinho compacto e só aparece na aba Identidade.
- FAB de dados continua sendo dado fora da ficha (home, livros, etc.).
- Changelog do app foi reconstruído com as versões v0.8.0, v0.8.1, v0.10.0 e v0.11.0 completas.
- Leitor de PDF ganhou:
  - Swipe horizontal (mobile): esquerda = próxima, direita = anterior.
  - Setas do teclado ←/→ em desktop (só no leitor em tela cheia).
  - Setas laterais (visuais) no leitor em desktop.
  - Setas aparecem apenas quando há página para navegar (auto-disable).
- Versão: 0.11.0-alpha. Cache: yuki-v7.
- Validar: swipe no mobile, setas + teclado no desktop, setas desabilitadas em primeira/última página, split view sem setas laterais.

## Iteração 25/10/2026 — Refactor: 6 módulos

- `app.js` monolítico dividido em 6 arquivos em `js/`.
- Ordem de carregamento: data → modals → reader → sheet → render → app.
- Nenhuma funcionalidade alterada. Apenas reorganização.
- Cada módulo imprime `[Yuki] module: <nome>.js loaded` no console ao carregar.
  Se faltar algum log, é o arquivo que não carregou.
- `sw.js` cache atualizado para `yuki-v10` com todos os novos arquivos em ASSETS.
- Versão: `0.11.2-alpha`.

### Arquivos novos
- `js/data.js` — constantes, state, persistência, modelos, cálculos.
- `js/modals.js` — HTML dos modais.
- `js/reader.js` — leitor de PDF.
- `js/sheet.js` — ficha, abas, menu lateral, retrato.
- `js/render.js` — home, lista, livros, split, welcome.
- `js/app.js` — handlers de evento + init.

### Regra nova
- Cada bug tem um módulo provável. Ver "Mapa de módulos" em WORKFLOW.md.
- Não é mais preciso enviar `app.js` inteiro quando um bug acontece.


## Iteração 26/10/2026 — Fase 2a do ROADMAP

- Fase 2a: `.yuki-header-bar` consolidado. 4 definições concorrentes → 1 regra única (grid). Mobile alinhado no Yuki.
- Fase 2a-3: alinhamento de header-bar estendido ao Sibyl (min-height compartilhado, justify-self, max-width 900px). Desktop alinhado nos dois temas.
- `.yuki-card.empty` (fillers decorativos) passam a sumir quando há 1+ fichas reais (`:has()`).
- Bug conhecido removido: `.yuki-header-bar` no Sibyl não herdava as regras do Yuki.
- Versão: sem bump (Fase 8 consolida).

## Pendente no ROADMAP
- Fase 2b: `.yuki-grid` (7 → 2 regras).
- Fase 2c: `.yuki-card` + `.yuki-card-img`.
- Fase 2d: `.yuki-main` + `.yuki-title`.
- Fases 3–8.