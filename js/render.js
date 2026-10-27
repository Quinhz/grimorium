/* ============================================================
   RENDER — Views principais: home, list, books, split, welcome
   Camada 4: usa data.js, sheet.js (renderSheet), reader.js (openBook).
   ============================================================ */
console.log('[Yuki] module: render.js loaded');

function render() {
  const app = document.getElementById('app');

  if (state.view === 'split' && !canUseSplit()) {
    state.view = 'sheet';
  }

  if (state.view === 'welcome') {
    renderWelcome(app);
  } else if (state.view === 'split') {
    renderSplit(app);
  } else if (state.view === 'reader') {
    renderReader(app);
  } else if (state.view === 'books') {
    renderBooks(app);
  } else if (state.view === 'sheet' && getCurrent()) {
    renderSheet(app);
  } else {
    renderList(app);
  }

  const oldFab = document.querySelector('.dice-fab');
  if (oldFab) oldFab.remove();
  if (state.view !== 'reader' && state.view !== 'welcome') {
    const isSheetView = state.view === 'sheet' || state.view === 'split';
    const fab = document.createElement('button');
    if (isSheetView) {
      fab.className = 'dice-fab menu-fab';
      fab.setAttribute('data-action', 'toggle-sheet-menu');
      fab.setAttribute('title', 'Menu da ficha');
      fab.setAttribute('aria-label', 'Abrir menu da ficha');
      fab.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>';
    } else {
      fab.className = 'dice-fab';
      fab.setAttribute('data-action', 'open-dice');
      fab.setAttribute('title', 'Rolar dados');
      fab.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm3 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>';
    }
    document.body.appendChild(fab);
  }

  const oldSheetMenu = document.getElementById('sheet-menu-overlay');
  if (oldSheetMenu) oldSheetMenu.remove();
  if (state.sheetMenuOpen && state.view !== 'sheet' && state.view !== 'split') {
    state.sheetMenuOpen = false;
  }
  if (state.sheetMenuOpen) {
    const overlay = document.createElement('div');
    overlay.id = 'sheet-menu-overlay';
    overlay.className = 'sheet-menu-overlay';
    overlay.innerHTML = sheetMenuHTML();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        state.sheetMenuOpen = false;
        overlay.remove();
      }
    });
    document.body.appendChild(overlay);
  }

  const oldModal = document.getElementById('settings-modal');
  if (oldModal) oldModal.remove();
  const oldDice = document.getElementById('dice-modal');
  if (oldDice) oldDice.remove();

  if (state.showSettings) {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = settingsModalHTML();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        state.showSettings = false;
        modal.remove();
      }
    });
    document.body.appendChild(modal);
  }

  const oldAbout = document.getElementById('about-modal');
  if (oldAbout) oldAbout.remove();
  if (state.showAbout) {
    const modal = document.createElement('div');
    modal.id = 'about-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = aboutModalHTML();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        state.showAbout = false;
        modal.remove();
      }
    });
    document.body.appendChild(modal);
  }

  if (state.showDice) {
    const modal = document.createElement('div');
    modal.id = 'dice-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = diceModalHTML();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        state.showDice = false;
        modal.remove();
      }
    });
    document.body.appendChild(modal);
  }

  const oldPrint = document.getElementById('print-preview-modal');
  if (oldPrint) oldPrint.remove();
  if (state.showPrintPreview) {
    const modal = document.createElement('div');
    modal.id = 'print-preview-modal';
    modal.className = 'modal-overlay print-preview-overlay';
    modal.innerHTML = printPreviewModalHTML();
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        state.showPrintPreview = false;
        modal.remove();
      }
    });
    document.body.appendChild(modal);
  }

  const oldAddSpell = document.getElementById('add-spell-modal');
  if (oldAddSpell) oldAddSpell.remove();
  if (state.showAddSpellModal) {
    const cc = getCurrent();
    const pp = cc && cc.personas[state.addSpellPersonaIdx];
    if (pp) {
      const modal = document.createElement('div');
      modal.id = 'add-spell-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = addSpellModalHTML();
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          state.showAddSpellModal = false;
          state.addSpellPersonaIdx = null;
          state.addSpellDraft = null;
          modal.remove();
        }
      });
      document.body.appendChild(modal);
    } else {
      state.showAddSpellModal = false;
      state.addSpellPersonaIdx = null;
      state.addSpellDraft = null;
    }
  }
}

function renderWelcome(app) {
  const firstVisit = !localStorage.getItem('yuki_welcome_seen_v1');
  const checkboxChecked = firstVisit ? true : !state.settings.showWelcome;
  let html = `<div class="welcome-screen">`;
  html += `<div class="welcome-card">`;
  html += `<h1 class="welcome-title">Yuki</h1>`;
  html += `<p class="welcome-version">v${APP_VERSION}</p>`;
  html += `<p class="welcome-greeting">Bem vindo(a)! (≧▽≦)</p>`;
  html += `<p class="welcome-desc">Seu grimório digital de fichas de RPG.<br>Crie personagens, gerencie personas, consulte livros de referência e role dados.</p>`;
  html += `<div class="welcome-checkbox">`;
  html += `<label><input type="checkbox" id="welcome-dont-show" ${checkboxChecked ? 'checked' : ''}> Não mostrar esta tela novamente</label>`;
  html += `</div>`;
  html += `<button data-action="welcome-enter" class="welcome-enter">Entrar</button>`;
  html += `<div style="margin-top:16px;font-size:11px;"><button data-action="open-settings" style="background:none;border:none;color:#0000ee;text-decoration:underline;cursor:pointer;padding:0;font-size:11px;">Configurações</button></div>`;
  html += `</div></div>`;
  app.innerHTML = html;
}

function yukiSidebarHTML() {
  const hasPfp = !!state.user.pfp;
  const uname = state.user.username ? esc(state.user.username) : 'Sem nome';

  return `
    <aside class="yuki-sidebar">
      <div class="yuki-profile" data-action="edit-user">
        ${hasPfp
          ? `<img src="${state.user.pfp}" class="yuki-avatar" alt="Perfil">`
          : `<div class="yuki-avatar"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`}
        <div class="yuki-username">${uname}</div>
      </div>

      <nav class="yuki-nav">
        <button data-action="go-books" aria-label="Livros de referência" title="Livros de referência">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 18H7V4h10v16z"/></svg>
          Livros
        </button>
        <button aria-label="Importar ficha" title="Importar ficha" onclick="document.getElementById('import-file').click()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Importar
        </button>
        <button data-action="open-settings" aria-label="Configurações" title="Configurações">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6  -1.62 3.6-3.6 3.6z"/></svg>
          Configs.
        </button>
      </nav>
    </aside>`;
}

function renderList(app) {
  const hasPfp = !!state.user.pfp;
  const uname = state.user.username ? esc(state.user.username) : 'Sem nome';

  const currentTheme = THEMES.find(t => t.id === state.settings.theme) || THEMES[0];
  if (currentTheme.chroma === 'chrome') {
    let html = `<div class="yuki-layout">`;
    html += yukiSidebarHTML();
    html += `<input type="file" id="import-file" accept=".json,application/json" style="display:none" onchange="importChar(event)">`;

    html += `<main class="yuki-main">`;
    html += `<header class="yuki-header">`;
    html += `<h2 class="yuki-title">Fichas</h2>`;
    html += `<div class="yuki-header-bar">`;
    html += `<span>Fichas: ${state.characters.length}</span>`;
    html += `<button class="btn-accent" data-action="new-char">Novo</button>`;
    html += `</div></header>`;

    html += `<div class="yuki-grid">`;
    state.characters.forEach(c => {
      html += `<div class="yuki-card">`;
      if (c.portraitImage) {
        html += `<img src="${c.portraitImage}" class="yuki-card-img" alt="Retrato">`;
      } else {
        html += `<div class="yuki-card-img">Sem imagem</div>`;
      }
      html += `<div class="yuki-card-title">${esc(c.name) || 'Sem nome'}</div>`;
      html += `<div class="yuki-card-class">${esc(c.class) || 'Classe'}</div>`;
      html += `<button class="btn-accent" data-action="open-char" data-id="${c.id}">Abrir</button>`;
      html += `</div>`;
    });

    for (let i = 0; i < 3; i++) {
      html += `<div class="yuki-card empty"></div>`;
    }
    html += `</div>`;
    html += `<div class="footer">© ${new Date().getFullYear()} Yuki</div>`;
    html += `</main></div>`;
    app.innerHTML = html;
    return;
  }

  let html = `<div class="row-between" style="align-items:flex-start;">`;
  html += `<div>`;
  html += `<h1 style="margin-top:0;">Yuki</h1>`;
  html += `<div class="muted">Ficha de personagem — dados salvos localmente no seu navegador.</div>`;
  html += `</div>`;
  html += `<div class="user-chip ${hasPfp || state.user.username ? '' : 'user-chip-empty'}" data-action="edit-user" title="Editar perfil">`;
  if (hasPfp) {
    html += `<div class="user-chip-pfp"><img src="${state.user.pfp}" alt="Perfil"></div>`;
  } else {
    html += `<div class="user-chip-pfp"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
  }
  html += `<div class="user-chip-name">${uname}</div>`;
  html += `</div>`;
  html += `</div>`;
  html += `<hr>`;
  html += `<div class="panel row-between home-actions-panel">`;
  html += `<div class="home-actions">`;
  html += `<button data-action="new-char">+ Novo Personagem</button> `;
  html += `<button onclick="document.getElementById('import-file').click()">Importar Ficha (.json)</button>`;
  html += `<button data-action="go-books"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 18H7V4h10v16z"/></svg> Livros de Referência</button>`;
  html += `<button data-action="open-settings" class="icon-btn" title="Configurações"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg></button>`;
  html += `<input type="file" id="import-file" accept=".json,application/json" style="display:none" onchange="importChar(event)">`;
  html += `</div>`;
  html += `<div class="muted">${state.characters.length} personagem(ns) salvo(s)</div>`;
  html += `</div>`;

  if (state.characters.length === 0) {
    html += `<div class="panel-inset"><p><em>Nenhum personagem criado ainda.</em></p>` +
            `<p class="muted">Clique em <b>+ Novo Personagem</b> para começar. Você poderá preencher os campos na ficha.</p></div>`;
  } else {
    html += `<div class="table-wrap"><table>`;
    html += `<thead><tr><th>Personagem</th><th>Classe</th><th>Nv.</th><th>Arcana</th><th>Jogador</th><th>Ações</th></tr></thead><tbody>`;
    state.characters.forEach(c => {
      html += `<tr>`;
      html += `<td data-label="Personagem">${esc(c.name) || '<em>sem nome</em>'}</td>`;
      html += `<td data-label="Classe">${esc(c.class) || '—'}</td>`;
      html += `<td data-label="Nível">${esc(c.level)}</td>`;
      html += `<td data-label="Arcana">${esc(c.arcana) || '—'}</td>`;
      html += `<td data-label="Jogador">${esc(c.player) || '—'}</td>`;
      html += `<td data-label="Ações">`;
      html += `<button data-action="open-char" data-id="${c.id}">Abrir</button> `;
      html += `<button data-action="export-char" data-id="${c.id}">Exportar JSON</button> `;
      html += `<button class="danger" data-action="delete-char" data-id="${c.id}">Excluir</button>`;
      html += `</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `<div class="footer">© ${new Date().getFullYear()} Yuki</div>`;
  app.innerHTML = html;
}

async function renderBooks(app) {
  const currentTheme = THEMES.find(t => t.id === state.settings.theme) || THEMES[0];
  const isChrome = currentTheme.chroma === 'chrome';

  if (isChrome) {
    app.innerHTML = `
      <div class="yuki-layout">
        ${yukiSidebarHTML()}
        <input type="file" id="import-file" accept=".json,application/json" style="display:none" onchange="importChar(event)">
        <main class="yuki-main yuki-books-main" id="yuki-books-content">
          <h2 class="yuki-title">Livros de Referência</h2>
          <p class="muted">Carregando…</p>
        </main>
      </div>`;
  } else {
    app.innerHTML = `<h1>Livros de Referência</h1><div class="muted">Carregando…</div>`;
  }
  let books = [];
  try {
    books = await booksDBList();
  } catch (e) {
    console.error(e);
    if (isChrome) {
      const target = document.getElementById('yuki-books-content');
      if (target) {
        target.innerHTML = `<h2 class="yuki-title">Livros de Referência</h2>
          <div class="warn">Erro ao acessar o armazenamento de livros. Seu navegador pode ter bloqueado IndexedDB.</div>`;
      }
    } else {
      app.innerHTML = `<h1>Livros de Referência</h1>
        <div class="warn">Erro ao acessar o armazenamento de livros. Seu navegador pode ter bloqueado IndexedDB.</div>`;
    }
    return;
  }

  let html = isChrome
    ? `<h2 class="yuki-title">Livros de Referência</h2>`
    : `<h1>Livros de Referência</h1>`;
  html += `<div class="muted">PDFs salvos localmente (IndexedDB). Depois de carregar uma vez, funciona offline.</div>`;
  html += `<hr>`;
  html += `<div class="panel row-between">`;
  html += `<div>`;
  html += `<button data-action="go-list">← Lista</button> `;
  html += `<button data-action="add-book">+ Adicionar PDF</button>`;
  html += `<input type="file" id="book-file" accept="application/pdf,.pdf" style="display:none" onchange="addBook(event)">`;
  html += `</div>`;
  html += `<div class="muted">${books.length} livro(s)</div>`;
  html += `</div>`;

  if (books.length === 0) {
    html += `<div class="panel-inset"><p><em>Nenhum livro adicionado ainda.</em></p>` +
            `<p class="muted">Clique em <b>+ Adicionar PDF</b> para enviar um livro de referência.</p></div>`;
  } else {
    books.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    html += `<div class="table-wrap"><table>`;
    html += `<thead><tr><th>Nome</th><th>Tamanho</th><th>Adicionado</th><th>Ações</th></tr></thead><tbody>`;
    books.forEach(b => {
      const sizeMB = b.blob && b.blob.size ? (b.blob.size / (1024 * 1024)).toFixed(1) + ' MB' : '—';
      const dt = b.addedAt ? new Date(b.addedAt).toLocaleDateString('pt-BR') : '—';
      html += `<tr>`;
      html += `<td data-label="Nome">${esc(b.name) || '<em>sem nome</em>'}</td>`;
      html += `<td data-label="Tamanho">${sizeMB}</td>`;
      html += `<td data-label="Adicionado">${dt}</td>`;
      html += `<td data-label="Ações"><button data-action="open-book" data-id="${b.id}">Abrir</button> ` +
              `<button class="danger" data-action="delete-book" data-id="${b.id}">Excluir</button></td>`;
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `<div class="footer">© ${new Date().getFullYear()} Yuki</div>`;

  if (isChrome) {
    const target = document.getElementById('yuki-books-content');
    if (target) target.innerHTML = html;
  } else {
    app.innerHTML = html;
  }
}

async function addBook(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    alert('Selecione um arquivo PDF.');
    return;
  }
  try {
    await booksDBAdd(file.name, file);
    render();
  } catch (err) {
    alert('Erro ao salvar PDF: ' + err.message);
  }
}

function renderSplit(app) {
  const c = getCurrent();
  if (!c) { state.view = 'list'; render(); return; }
  if (!canUseSplit()) { state.view = 'sheet'; render(); return; }

  const ratio = state.settings.splitRatio || 0.5;
  const leftPct = (ratio * 100).toFixed(2);
  const rightPct = ((1 - ratio) * 100).toFixed(2);

  app.innerHTML = `
    <div class="split-wrap" id="split-wrap">
      <div class="split-pane split-pane-left" id="split-left" style="width:${leftPct}%">
        <div id="split-left-content" style="padding:8px 12px;"></div>
      </div>
      <div class="split-divider" id="split-divider" title="Arraste para redimensionar"></div>
      <div class="split-pane split-pane-right" id="split-right" style="width:${rightPct}%">
        <div id="split-right-content" style="height:100%;display:flex;flex-direction:column;overflow:hidden;"></div>
      </div>
    </div>`;

  const leftContent = document.getElementById('split-left-content');
  renderSheet(app, leftContent);

  const rightContent = document.getElementById('split-right-content');
  if (currentPdf) {
    renderReader(app, rightContent, true);
  } else {
    renderBookPickerInto(rightContent);
  }

  setupSplitDivider();
}

async function renderBookPickerInto(target) {
  target.innerHTML = '<div class="split-empty"><p>Carregando livros…</p></div>';
  let books = [];
  try { books = await booksDBList(); } catch (e) {}

  let html = '<div style="padding:8px 12px;">';
  html += '<h3 style="margin-top:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-3px;"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 18H7V4h10v16z"/></svg> Livros</h3>';
  if (books.length === 0) {
    html += '<p class="muted"><em>Nenhum livro adicionado ainda.</em></p>';
    html += '<button data-action="add-book">+ Adicionar PDF</button>';
    html += '<input type="file" id="book-file" accept="application/pdf,.pdf" style="display:none" onchange="addBook(event)">';
  } else {
    books.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    books.forEach(b => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #999;">`;
      html += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(b.name)}">${esc(b.name)}</span>`;
      html += `<button data-action="open-book" data-id="${b.id}">Abrir</button>`;
      html += `</div>`;
    });
    html += '<div style="margin-top:8px;"><button data-action="add-book">+ Adicionar PDF</button></div>';
    html += '<input type="file" id="book-file" accept="application/pdf,.pdf" style="display:none" onchange="addBook(event)">';
  }
  html += '</div>';
  target.innerHTML = html;
}

function setupSplitDivider() {
  const wrap = document.getElementById('split-wrap');
  const divider = document.getElementById('split-divider');
  const left = document.getElementById('split-left');
  const right = document.getElementById('split-right');
  if (!wrap || !divider || !left || !right) return;

  let dragging = false;

  const updateRatio = (clientX) => {
    const rect = wrap.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0.2, Math.min(0.8, ratio));
    state.settings.splitRatio = ratio;
    left.style.width = (ratio * 100) + '%';
    right.style.width = ((1 - ratio) * 100) + '%';
  };

  const scheduleRefit = () => {
    clearTimeout(window._splitRefitTimer);
    window._splitRefitTimer = setTimeout(() => {
      if (currentPdf && currentPdfFit) {
        renderCurrentPdfPage().catch(err => console.error(err));
      }
    }, 120);
  };

  divider.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    try { divider.setPointerCapture(e.pointerId); } catch (err) {}
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  divider.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    updateRatio(e.clientX);
    scheduleRefit();
  });

  const stopDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    try { divider.releasePointerCapture(e.pointerId); } catch (err) {}
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    saveSettings();
  };
  divider.addEventListener('pointerup', stopDrag);
  divider.addEventListener('pointercancel', stopDrag);
}