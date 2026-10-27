# WORKFLOW — Yuki

## Papéis
- Direção: quem descreve o que quer (não precisa saber técnica)
- Implementação: quem traduz em código e explica

## Ciclo obrigatório
1. Uma coisa por vez.
2. Descrever em estrutura, não adjetivo.
3. Confirmar antes de avançar de fase.
4. Nunca dois módulos ao mesmo tempo.

## Como descrever (direção)
- Ruim: "moderno", "clean", "aquele toque"
- Bom: "três colunas", "texto pequeno em cima do card", "borda fina que aparece no hover"
- Referência vale mais que adjetivo: screenshot, link, "parecido com X"

## Como implementar (IA)
- Ler o arquivo antes de qualquer patch.
- Avisar quando um find é arriscado.
- Se patch quebra, reescrever a função inteira em vez de picotar.
- Nunca responder "pronto" sem dizer o que mudou e por quê.
- Dizer "não sei" sem rodeio.

## Continuidade entre chats
- Sempre enviar: CONTEXT.md + WORKFLOW.md + arquivos relevantes
- Dizer onde paramos: "última coisa feita foi X, próximo é Y"
- Um chat = uma tarefa

## Estrutura do projeto
index.html # shell — 6 CSS + 7 JS em ordem
manifest.json
sw.js # service worker — CACHE atual: yuki-v11
CONTEXT.md
WORKFLOW.md
ROADMAP.md # plano de reestruturação (Fases 0–8)
css/
01-base.css # reset, tipografia, container, panels, fields, tabs, tabelas
02-components.css # modais, split, reader, dice, portrait, crop, print, welcome
03-theme-yuki.css # tema Yuki
04-overrides.css # responsividade global + ajustes Alpha/Yuki
05-theme-sibyl.css # tema Sibyl
06-consolidation.css # consolidações Fases 2a–2d
js/
data.js # camada 0 — constantes, state, persistência, modelos, CHANGELOG
theme.js # camada 0.5 — applyTheme, parallax Sibyl, burst
modals.js # camada 1 — HTML dos modais
reader.js # camada 2 — leitor de PDF
sheet.js # camada 3 — ficha, abas, menu lateral, retrato
render.js # camada 4 — home, list, books, split, welcome
app.js # camada 5 — handlers de evento + init


## Mapa de módulos (qual arquivo editar)

| Se o problema é... | Cola o arquivo... |
|---|---|
| Home, lista de fichas, sidebar, tela de livros, split view, welcome | `js/render.js` |
| Ficha (abas, campos, retrato, menu lateral da ficha) | `js/sheet.js` |
| Modais (configurações, dados, preview PDF, adicionar magia, sobre) | `js/modals.js` |
| Leitor de PDF (abrir, paginar, zoom, swipe) | `js/reader.js` |
| "Cliquei e nada aconteceu" / "não disparou" | `js/app.js` (handlers) |
| "Sumiu tudo", "não carrega", "não calcula" | `js/data.js` |
| Ordem de scripts quebrada / 404 | `index.html` |
| Mudança não aparece (cache velho) | `sw.js` |

## Ordem dos scripts (não muda)

`data → theme → modals → reader → sheet → render → app`

Cada camada usa só as anteriores. Nunca o contrário.

## Versão e cache

- `APP_VERSION` no topo de `js/data.js`
- Entrada nova no topo de `CHANGELOG` (também em `js/data.js`)
- `CACHE` em `sw.js` sobe uma versão (yuki-vN → yuki-vN+1)
- Após subir cache, hard reload (`Ctrl+Shift+R`)