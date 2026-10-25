# CONTEXT — Yuki (App Web)

> Documento para continuidade entre sessões e IAs. **Atualize** ao final de cada iteração significativa.

---

## TL;DR

App web (PWA) de ficha de personagem para o sistema de RPG **Grimório do Coração**. HTML/JS puro, sem frameworks, sem build. Dados em `localStorage` (fichas/config) e `IndexedDB` (PDFs). Autor é designer, não programador — prefere **find & replace** em vez de receber arquivos inteiros.

---

## Stack e arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Shell do app (~20 linhas). |
| `css/app.css` | Todo o CSS (Tema Alpha + Componentes + Tema Yuki + Modais). |
| `js/app.js` | Todo o JS (state, views, handlers, **array do Changelog**). |
| `manifest.json` | PWA manifest. |
| `sw.js` | Service Worker. Cache atual: `yuki-v4`. |
| `spells.csv` | Opcional. Presets de magia. |
| `spells/index.json` | Opcional. Lista de múltiplos CSVs. |
| `CONTEXT.md` | Este arquivo. |

**CDNs**: Google Fonts (IBM Plex Mono) e PDF.js (3.11.174).

---

## Convenções Obrigatórias

1. **Sem emoji no código** (use SVGs inline).
2. **Sem frameworks/build step**. HTML/CSS/JS puro.
3. **Sem estilos inline no JS** (exceto casos ultra-específicos). Use classes CSS. Isso quebra a troca de temas.
4. **Usar `overscroll-behavior: contain;`** em modais com scroll interno para não vazar pro fundo.
5. **Ao subir a versão**: Atualizar `APP_VERSION` e adicionar o novo objeto no topo do array `CHANGELOG` no `js/app.js`.

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

O histórico de versões exibido na tela "Sobre" **não fica neste arquivo**. Ele está implementado como uma constante `CHANGELOG` no topo do `js/app.js` (um array de objetos). A função `aboutModalHTML()` lê esse array e renderiza o modal.

---

## Próximos passos / ideias futuras

- Ajustar o design do Tema Yuki.
- Multi-sistema (suporte a outros RPGs no futuro).
- Banco de habilidades pré-carregadas.