/* ============================================================
   APP — Event handlers + inicialização
   Camada 5: usa todos os módulos. Deve ser o ÚLTIMO a carregar.
   ============================================================ */
console.log('[Yuki] module: app.js loaded');

function importChar(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const list = Array.isArray(parsed) ? parsed :
                   (parsed.characters && Array.isArray(parsed.characters)) ? parsed.characters :
                   [parsed];
      let added = 0;
      list.forEach(raw => {
        const c = normalizeCharacter(raw);
        c.id = uid();
        state.characters.push(c);
        added++;
      });
      save();
      render();
      alert(added + ' ficha(s) importada(s).');
    } catch (err) {
      alert('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function handleInput(e) {
  const el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  const bind = el.dataset.bind;

  if (bind.startsWith('addSpellDraft.')) {
    if (!state.addSpellDraft) return;
    let dval = el.value;
    if (el.type === 'number') {
      if (el.value === '') dval = 0;
      else {
        dval = Number(el.value);
        if (isNaN(dval)) dval = 0;
        if (el.min !== '' && dval < Number(el.min)) { dval = Number(el.min); el.value = dval; }
        if (el.max !== '' && dval > Number(el.max)) { dval = Number(el.max); el.value = dval; }
      }
    }
    setPath(state.addSpellDraft, bind.replace('addSpellDraft.', ''), dval);
    return;
  }

  if (bind.startsWith('user.')) {
    let uval = el.value;
    if (el.type === 'number') {
      if (el.value === '') uval = 0;
      else {
        uval = Number(el.value);
        if (isNaN(uval)) uval = 0;
      }
    }
    setPath(state.user, bind.replace('user.', ''), uval);
    saveUser();
    return;
  }

  const c = getCurrent();
  if (!c) return;

  let val = el.value;
  if (el.type === 'number') {
    if (el.value === '') {
      val = 0;
    } else {
      val = Number(el.value);
      if (isNaN(val)) val = 0;
      if (el.min !== '' && val < Number(el.min)) { val = Number(el.min); el.value = val; }
      if (el.max !== '' && val > Number(el.max)) { val = Number(el.max); el.value = val; }
    }
  }
  setPath(c, bind, val);
  recalc(c);
  updateDerivedDisplays();
  save();
}

function handleChange(e) {
  const el = e.target;

  if (el.dataset && el.dataset.action === 'toggle-type') {
    const c = getCurrent();
    if (!c) return;
    const idx = Number(el.dataset.idx);
    const p = c.personas[idx];
    if (!p) return;
    const type = el.dataset.type;
    const isEmergente = c.class === 'Emergentes';

    if (el.checked) {
      if (!isEmergente && p.types.length >= 3) {
        el.checked = false;
        alert('Personas de classes não-Emergentes podem ter no máximo 3 tipos.');
        return;
      }
      if (!p.types.includes(type)) p.types.push(type);
    } else {
      p.types = p.types.filter(t => t !== type);
    }
    save();
    const countEl = document.getElementById('type-count-' + idx);
    if (countEl) countEl.textContent = p.types.length;
    return;
  }

  if (el.dataset && el.dataset.action === 'toggle-resistance') {
    const c = getCurrent();
    if (!c) return;
    const p = c.personas[Number(el.dataset.pidx)];
    if (!p) return;
    const type = el.dataset.type;
    if (el.checked) {
      if (c.creationMode && p.resistances.length >= 1) {
        el.checked = false;
        alert('Durante a criação, cada persona pode ter no máximo 1 resistência.');
        return;
      }
      if (!p.resistances.includes(type)) p.resistances.push(type);
    } else {
      p.resistances = p.resistances.filter(t => t !== type);
    }
    save();
    return;
  }

  if (el.dataset && el.dataset.action === 'toggle-weakness') {
    const c = getCurrent();
    if (!c) return;
    const p = c.personas[Number(el.dataset.pidx)];
    if (!p) return;
    const type = el.dataset.type;
    if (el.checked) {
      if (c.creationMode && p.weaknesses.length >= 1) {
        el.checked = false;
        alert('Durante a criação, cada persona pode ter no máximo 1 fraqueza.');
        return;
      }
      if (!p.weaknesses.includes(type)) p.weaknesses.push(type);
    } else {
      p.weaknesses = p.weaknesses.filter(t => t !== type);
    }
    save();
    return;
  }

  if (el.type === 'number' && el.dataset && el.dataset.bind && el.value === '' && el.min !== '') {
    el.value = el.min;
  }

  if (el.dataset && el.dataset.bind) handleInput(e);
}

function handleClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  const action = el.dataset.action;
  const c = getCurrent();

  switch (action) {
  case 'welcome-enter': {
    const cb = document.getElementById('welcome-dont-show');
    state.settings.showWelcome = cb ? !cb.checked : false;
    try { localStorage.setItem('yuki_welcome_seen_v1', '1'); } catch (e) {}
    saveSettings();
    state.view = 'list';
    render();
    break;
  }
  case 'new-char': {
    const nc = newCharacter();
    state.characters.push(nc);
    state.currentId = nc.id;
    state.view = shouldUseSplit() ? 'split' : 'sheet';
    state.tab = 'identidade';
    save();
    render();
    break;
  }
  case 'open-char':
    state.currentId = el.dataset.id;
    state.view = shouldUseSplit() ? 'split' : 'sheet';
    state.tab = 'identidade';
    render();
    break;
  case 'go-list':
    goList();
    break;
  case 'upload-portrait': {
    const pf = document.getElementById('portrait-file');
    if (pf) pf.click();
    break;
  }
  case 'remove-portrait':
    if (!c) return;
    if (confirm('Remover a imagem do personagem?')) {
      c.portraitImage = '';
      save();
      render();
    }
    break;
  case 'open-settings':
    state.showSettings = true;
    render();
    break;
  case 'edit-user':
    state.showSettings = true;
    render();
    break;
  case 'open-about':
    state.showSettings = false;
    state.showAbout = true;
    render();
    break;
  case 'close-about':
    state.showAbout = false;
    render();
    break;
  case 'edit-user-pfp': {
    const uf = document.getElementById('user-pfp-file');
    if (uf) uf.click();
    break;
  }
  case 'remove-user-pfp':
    if (confirm('Remover a foto de perfil?')) {
      state.user.pfp = '';
      saveUser();
      render();
    }
    break;
  case 'close-settings':
    state.showSettings = false;
    render();
    break;
  case 'set-template': {
    const t = el.dataset.template;
    if (t === 'split' && !canUseSplit()) {
      alert('A visualização dividida não está disponível nesta tela (muito estreita).');
      return;
    }
    state.settings.template = t;
    saveSettings();
    render();
    break;
  }
  case 'set-theme':
    state.settings.theme = el.dataset.theme;
    saveSettings();
    applyTheme();
    if (state.settings.theme === 'sibyl') triggerSibylBurst();
    render();
    break;
  case 'toggle-welcome-setting':
    state.settings.showWelcome = !state.settings.showWelcome;
    saveSettings();
    render();
    break;
  case 'preview-welcome':
    state.showSettings = false;
    state.view = 'welcome';
    render();
    break;
  case 'toggle-split': {
    if (state.view === 'split') {
      state.view = 'sheet';
      render();
      break;
    }
    if (!getCurrent()) {
      alert('Selecione um personagem primeiro para usar o modo dividido.');
      return;
    }
    if (!canUseSplit()) {
      alert('Modo dividido não disponível nesta tela.');
      return;
    }
    state.view = 'split';
    render();
    break;
  }
  case 'close-book': {
    if (currentPdf) { try { currentPdf.destroy(); } catch (e) {} currentPdf = null; }
    currentBookName = '';
    currentPdfPage = 1;
    state.currentBookId = null;
    const rc = document.getElementById('split-right-content');
    if (rc) renderBookPickerInto(rc);
    break;
  }
  case 'go-books':
    leaveReader();
    state.view = 'books';
    state.currentBookId = null;
    render();
    break;
  case 'add-book':
    document.getElementById('book-file').click();
    break;
  case 'open-book':
    openBook(el.dataset.id);
    break;
  case 'delete-book':
    if (confirm('Excluir este livro? Essa ação não pode ser desfeita.')) {
      booksDBDelete(el.dataset.id).then(() => render()).catch(err => alert('Erro: ' + err.message));
    }
    break;
  case 'reader-prev':
    readerGoTo(-1);
    break;
  case 'reader-next':
    readerGoTo(1);
    break;
  case 'reader-zoom-in':
    readerZoom(1.25);
    break;
  case 'reader-zoom-out':
    readerZoom(0.8);
    break;
  case 'reader-fit':
    readerFit();
    break;
  case 'open-dice':
    state.showDice = true;
    render();
    break;
  case 'close-dice':
    state.showDice = false;
    render();
    break;
  case 'open-print-preview':
    if (!c) return;
    state.showPrintPreview = true;
    render();
    break;
  case 'close-print-preview':
    state.showPrintPreview = false;
    render();
    break;
  case 'print-pdf':
    window.print();
    break;
  case 'dice-type':
    state.diceSides = Number(el.dataset.sides);
    document.querySelectorAll('.dice-type-btn').forEach(b => {
      b.classList.toggle('selected', Number(b.dataset.sides) === state.diceSides);
    });
    break;
  case 'roll-dice':
    rollDice();
    break;
  case 'conclude-creation':
    if (!c) return;
    c.creationMode = false;
    save();
    render();
    break;
  case 'reopen-creation':
    if (!c) return;
    c.creationMode = true;
    state.showSettings = false;
    save();
    render();
    break;
  case 'delete-char': {
    const id = el.dataset.id;
    const target = state.characters.find(x => x.id === id);
    const nm = target && target.name ? `"${target.name}"` : 'este personagem';
    if (confirm('Excluir ' + nm + '? Essa ação não pode ser desfeita.')) {
      state.characters = state.characters.filter(x => x.id !== id);
      if (state.currentId === id) state.currentId = null;
      save();
      if (!state.currentId) state.view = 'list';
      render();
    }
    break;
  }
  case 'export-char':
    exportChar(el.dataset.id);
    break;
  case 'set-tab':
    state.tab = el.dataset.tab;
    render();
    break;
  case 'toggle-sheet-menu':
    state.sheetMenuOpen = !state.sheetMenuOpen;
    render();
    break;
  case 'close-sheet-menu':
    state.sheetMenuOpen = false;
    render();
    break;
  case 'set-tab-from-menu':
    state.tab = el.dataset.tab;
    state.sheetMenuOpen = false;
    render();
    break;
  case 'conclude-creation-from-menu':
    if (!c) return;
    c.creationMode = false;
    state.sheetMenuOpen = false;
    save();
    render();
    break;
  case 'export-char-from-menu':
    exportChar(el.dataset.id);
    break;
  case 'toggle-split-from-menu':
    state.sheetMenuOpen = false;
    if (state.view === 'split') {
      state.view = 'sheet';
    } else {
      if (!getCurrent() || !canUseSplit()) {
        alert('Modo dividido não disponível nesta tela.');
        render();
        return;
      }
      state.view = 'split';
    }
    render();
    break;
  case 'add-persona':
    if (!c) return;
    c.personas.push(newPersona(c.level));
    save();
    render();
    break;
  case 'remove-persona':
    if (!c) return;
    if (confirm('Remover esta persona?')) {
      c.personas.splice(Number(el.dataset.idx), 1);
      save();
      render();
    }
    break;
  case 'add-spell': {
    if (!c) return;
    const p = c.personas[Number(el.dataset.idx)];
    if (!p) return;
    if (p.spells.length >= 8) {
      alert('Máximo de 8 magias por persona.');
      return;
    }
    state.addSpellPersonaIdx = Number(el.dataset.idx);
    state.addSpellTab = 'presets';
    state.addSpellDraft = null;
    state.showAddSpellModal = true;
    render();
    break;
  }
  case 'add-spell-modal-close':
    state.showAddSpellModal = false;
    state.addSpellPersonaIdx = null;
    state.addSpellDraft = null;
    render();
    break;
  case 'add-spell-tab':
    state.addSpellTab = el.dataset.tab;
    state.addSpellDraft = null;
    render();
    break;
  case 'add-spell-from-preset': {
    if (!c) return;
    const pp = c.personas[state.addSpellPersonaIdx];
    if (!pp) return;
    if (pp.spells.length >= 8) return;
    const preset = state.spellPresets[Number(el.dataset.presetIdx)];
    if (!preset) return;
    pp.spells.push(copySpell(preset));
    save();
    if (pp.spells.length >= 8) {
      state.showAddSpellModal = false;
      state.addSpellPersonaIdx = null;
      state.addSpellDraft = null;
    }
    render();
    break;
  }
  case 'add-spell-from-custom': {
    if (!c) return;
    const pp = c.personas[state.addSpellPersonaIdx];
    if (!pp) return;
    if (pp.spells.length >= 8) return;
    const cs = state.customSpells[Number(el.dataset.customIdx)];
    if (!cs) return;
    pp.spells.push(copySpell(cs));
    save();
    if (pp.spells.length >= 8) {
      state.showAddSpellModal = false;
      state.addSpellPersonaIdx = null;
      state.addSpellDraft = null;
    }
    render();
    break;
  }
  case 'add-spell-delete-custom': {
    const ci = Number(el.dataset.customIdx);
    if (!state.customSpells[ci]) return;
    if (!confirm('Excluir esta magia de "Minhas Magias"? Personagens que já a adicionaram não serão afetados.')) return;
    state.customSpells.splice(ci, 1);
    saveCustomSpells();
    render();
    break;
  }
  case 'add-spell-start-create':
    state.addSpellDraft = newSpell();
    render();
    break;
  case 'add-spell-cancel-create':
    state.addSpellDraft = null;
    render();
    break;
  case 'add-spell-save-create': {
    if (!c) return;
    const pp = c.personas[state.addSpellPersonaIdx];
    if (!pp) return;
    if (pp.spells.length >= 8) { alert('Máximo atingido.'); return; }
    if (!state.addSpellDraft) return;
    const draft = copySpell(state.addSpellDraft);
    state.customSpells.push(copySpell(draft));
    saveCustomSpells();
    pp.spells.push(copySpell(draft));
    save();
    state.addSpellDraft = null;
    if (pp.spells.length >= 8) {
      state.showAddSpellModal = false;
      state.addSpellPersonaIdx = null;
    }
    render();
    break;
  }
  case 'remove-spell':
    if (!c) return;
    c.personas[Number(el.dataset.idx)].spells.splice(Number(el.dataset.sidx), 1);
    save();
    render();
    break;
  case 'add-item':
    if (!c) return;
    c.equipment.items.push({ name: '', qty: 1 });
    save();
    render();
    break;
  case 'remove-item':
    if (!c) return;
    c.equipment.items.splice(Number(el.dataset.idx), 1);
    save();
    render();
    break;
  case 'add-confidant':
    if (!c) return;
    c.confidants.push({ arcana: '', name: '', rank: 1 });
    save();
    render();
    break;
  case 'remove-confidant':
    if (!c) return;
    c.confidants.splice(Number(el.dataset.idx), 1);
    save();
    render();
    break;
  }
}

function init() {
  load();
  loadSettings();
  loadUser();
  loadCustomSpells();
  loadSpellPresets();
  applyTheme();
  if (state.settings.showWelcome) state.view = 'welcome';
  document.body.addEventListener('input', handleInput);
  document.body.addEventListener('change', handleChange);
  document.body.addEventListener('click', handleClick);

  document.addEventListener('keydown', (e) => {
    if (state.view === 'reader' && currentPdf && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target;
      const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (!isTyping) {
        if (e.key === 'ArrowRight') { e.preventDefault(); readerGoTo(1); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); readerGoTo(-1); return; }
      }
    }

    if (e.key !== 'Escape') return;
    if (state.sheetMenuOpen) {
      state.sheetMenuOpen = false;
      render();
      return;
    }
    if (state.showSettings) {
      state.showSettings = false;
      render();
      return;
    }
    if (state.showAddSpellModal) {
      if (state.addSpellDraft) {
        state.addSpellDraft = null;
        render();
        return;
      }
      state.showAddSpellModal = false;
      state.addSpellPersonaIdx = null;
      render();
    }
  });

  window.addEventListener('resize', () => {
    if (state.view === 'split' && !canUseSplit()) {
      state.view = 'sheet';
      render();
      return;
    }
  });

  window.addEventListener('orientationchange', () => {
    if (state.view === 'sheet' || state.view === 'split') {
      setTimeout(() => render(), 300);
    }
  });

  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service Worker não registrado:', err);
      });
    });
  }
}
init();