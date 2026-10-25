/* ============================================================
   MODAIS — HTML builders para todas as janelas modal
   Camada 1: usa data.js.
   ============================================================ */
console.log('[Yuki] module: modals.js loaded');

function aboutModalHTML() {
  const changelogHtml = CHANGELOG.map(log => `
    <div class="changelog-block">
      <h4>${log.version} <span class="muted">(${log.date})</span></h4>
      <ul>
        ${log.changes.map(c => `<li>${esc(c)}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  return `
    <div class="modal about-modal">
      <div class="about-header">
        <img src="icon.svg" alt="Yuki" class="about-icon">
        <h2>Yuki</h2>
        <p class="about-version">Versão ${APP_VERSION}</p>
      </div>
      <h3 class="about-changelog-title">Changelog</h3>
      <div class="about-changelog">
        ${changelogHtml}
      </div>
      <div class="modal-actions">
        <button data-action="close-about">Fechar</button>
      </div>
    </div>
  `;
}

function settingsModalHTML() {
  const splitDisabled = !canUseSplit();
  const cur = getCurrent();
  let charSection = '';
  if (cur) {
    charSection = `<hr><h3>Personagem atual: ${esc(cur.name) || 'sem nome'}</h3>`;
    if (cur.creationMode) {
      charSection += `<p class="muted">Este personagem está em modo de criação.</p>`;
      charSection += `<button data-action="conclude-creation" class="btn-accent"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><polyline points="20 6 9 17 4 12"/></svg> Concluir Criação</button>`;
    } else {
      charSection += `<p class="muted">Reabrir a criação permite ajustar atributos e habilidades sociais com os limites de criação.</p>`;
      charSection += `<button data-action="reopen-creation">Reabrir Criação</button>`;
    }
  }
  return `
    <div class="modal">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-4px;"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg> Configurações</h2>
      <h3>Perfil do usuário</h3>
      <p class="muted">Identidade de quem usa o app neste dispositivo (não vai no export das fichas).</p>
      <div class="user-edit-row">
        <div class="user-edit-pfp">
          ${state.user.pfp
            ? `<img src="${state.user.pfp}" alt="Perfil">`
            : `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`}
        </div>
        <div class="user-edit-buttons">
          <button data-action="edit-user-pfp">${state.user.pfp ? 'Trocar foto' : 'Adicionar foto'}</button>
          ${state.user.pfp ? `<button class="danger" data-action="remove-user-pfp">Remover foto</button>` : ''}
        </div>
      </div>
      <input type="file" id="user-pfp-file" accept="image/*" style="display:none" onchange="uploadUserPfp(event)">
      <div class="field">
        <label>Nome de usuário</label>
        <input type="text" data-bind="user.username" value="${esc(state.user.username)}" placeholder="Como quer ser chamado?" maxlength="40">
      </div>
      <h3>Template</h3>
      <p class="muted">Escolha o layout da ficha.</p>
      <div class="modal-radio ${state.settings.template === 'single' ? 'selected' : ''}" data-action="set-template" data-template="single">
        <b>Visualização atual</b>
        <div class="muted">Uma coluna. Só a ficha (ou o leitor) na tela.</div>
      </div>
      <div class="modal-radio ${state.settings.template === 'split' ? 'selected' : ''} ${splitDisabled ? 'disabled' : ''}" data-action="set-template" data-template="split">
        <b>Visualização dividida</b>
        <div class="muted">Ficha à esquerda, livro de referência à direita. Arraste a divisória para redimensionar.${splitDisabled ? ' <em>(indisponível nesta tela)</em>' : ''}</div>
      </div>
      <h3>Tema</h3>
      <p class="muted">Aparência visual do app. Mais temas serão adicionados futuramente.</p>
      ${THEMES.map(t => `<div class="modal-radio ${state.settings.theme === t.id ? 'selected' : ''}" data-action="set-theme" data-theme="${t.id}"><b>${esc(t.name)}</b><div class="muted">${esc(t.description)}</div></div>`).join('')}
      <h3>Boas-vindas</h3>
      <p class="muted">Tela exibida ao abrir o app.</p>
      <div class="modal-radio ${state.settings.showWelcome ? 'selected' : ''}" data-action="toggle-welcome-setting">
        <b>${state.settings.showWelcome ? 'Ativada' : 'Desativada'}</b>
        <div class="muted">${state.settings.showWelcome ? 'A tela aparece ao abrir o app.' : 'A tela não aparece.'} Clique para alternar.</div>
      </div>
      <div style="margin-top:8px;"><button data-action="preview-welcome">Ver boas-vindas agora</button></div>
      ${charSection}
      <div class="modal-actions" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border, #ccc); padding-top: 16px; margin-top: 20px;">
        <button data-action="open-about" class="about-open-btn">Sobre o App</button>
        <button data-action="close-settings" class="btn-accent">Fechar</button>
      </div>
    </div>`;
}

function diceModalHTML() {
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];
  let html = '<div class="modal">';
  html += '<h2><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-4px;"><path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm3 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg> Rolar Dados</h2>';
  html += '<h3>Tipo de dado</h3>';
  html += '<div class="dice-row">';
  diceTypes.forEach(d => {
    const sel = state.diceSides === d ? ' selected' : '';
    html += `<button data-action="dice-type" data-sides="${d}" class="dice-type-btn${sel}">d${d}</button>`;
  });
  html += '</div>';
  html += '<div class="field"><label>Quantidade</label><input type="number" id="dice-qty" value="1" min="1" max="100" style="max-width:90px;"></div>';
  html += '<div class="field"><label>Modificador</label><input type="number" id="dice-mod" value="0" style="max-width:90px;"> <span class="muted">(+N ou −N)</span></div>';
  html += '<div style="margin: 12px 0;"><button data-action="roll-dice" style="font-size:16px; padding:8px 24px;">Rolar!</button></div>';
  html += '<div id="dice-result" class="dice-result">Clique em Rolar</div>';
  if (state.diceHistory.length > 0) {
    html += '<div class="dice-history" id="dice-history"><b>Histórico:</b>';
    state.diceHistory.forEach(h => { html += `<div>${esc(h)}</div>`; });
    html += '</div>';
  }
  html += '<div class="modal-actions"><button data-action="close-dice">Fechar</button></div>';
  html += '</div>';
  return html;
}

function rollDice() {
  const qtyEl = document.getElementById('dice-qty');
  const modEl = document.getElementById('dice-mod');
  const qty = Math.max(1, Math.min(100, Number(qtyEl && qtyEl.value) || 1));
  const mod = Number(modEl && modEl.value) || 0;
  const sides = state.diceSides || 6;
  const rolls = [];
  let total = 0;
  for (let i = 0; i < qty; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  const modStr = mod === 0 ? '' : (mod > 0 ? '+' + mod : String(mod));
  const result = total + mod;
  const detail = qty > 1
    ? `${qty}d${sides}${modStr} → [${rolls.join(', ')}]${modStr} = ${result}`
    : `1d${sides}${modStr} = ${result}`;
  state.diceHistory.unshift(detail);
  if (state.diceHistory.length > 20) state.diceHistory.pop();

  const resEl = document.getElementById('dice-result');
  if (resEl) {
    resEl.innerHTML = `<div style="font-size:32px;font-weight:bold;color:#000080;">${result}</div>` +
                      `<div class="muted" style="font-family:Verdana;font-size:12px;">${esc(detail)}</div>`;
  }

  const diceModal = document.getElementById('dice-modal');
  if (diceModal) {
    const oldHist = diceModal.querySelector('.dice-history');
    if (oldHist) oldHist.remove();
    let histHtml = '<div class="dice-history" id="dice-history"><b>Histórico:</b>';
    state.diceHistory.forEach(h => { histHtml += `<div>${esc(h)}</div>`; });
    histHtml += '</div>';
    const actions = diceModal.querySelector('.modal-actions');
    if (actions) actions.insertAdjacentHTML('beforebegin', histHtml);
  }
}

function printPreviewModalHTML() {
  const c = getCurrent();
  if (!c) return '';
  return `
    <div class="modal print-preview-modal">
      <div class="print-preview-header no-print">
        <h2>Exportar como PDF</h2>
        <p class="muted" style="margin:4px 0 0;">Ao clicar em "Salvar PDF", o navegador abrirá a janela de impressão — escolha <b>Salvar como PDF</b> como destino. As cores do tema são preservadas.</p>
      </div>
      <div class="print-sheet" id="print-sheet">${buildPrintSheetHTML(c)}</div>
      <div class="print-preview-actions no-print">
        <button data-action="print-pdf" class="btn-accent">Salvar PDF</button>
        <button data-action="close-print-preview">Cancelar</button>
      </div>
    </div>`;
}

function buildPrintSheetHTML(c) {
  const year = new Date().getFullYear();
  const sectionTitle = (t) => `<h3 style="font-family:'Times New Roman',serif;color:#000080;border-bottom:1px solid #000080;font-size:13px;margin:8px 0 4px;padding-bottom:2px;">${t}</h3>`;
  let h = '';

  h += '<div style="display:flex;gap:14px;align-items:flex-start;border-bottom:3px solid #000080;padding-bottom:10px;margin-bottom:12px;">';
  if (c.portraitImage) {
    h += `<img src="${c.portraitImage}" alt="Retrato" style="width:100px;height:100px;object-fit:cover;border:2px solid #000080;flex-shrink:0;">`;
  } else {
    h += `<div style="width:100px;height:100px;border:2px solid #000080;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px;background:#f8f8f8;">Sem imagem</div>`;
  }
  h += '<div style="flex:1;min-width:0;">';
  h += `<div style="font-family:'Times New Roman',serif;font-size:24px;color:#000080;font-weight:bold;line-height:1.1;">${esc(c.name) || 'Sem nome'}</div>`;
  h += '<div style="margin-top:8px;font-size:12px;">';
  h += `<b>Classe:</b> ${esc(c.class) || '—'} &nbsp; `;
  h += `<b>Nível:</b> ${esc(c.level)} &nbsp; `;
  h += `<b>Arcana:</b> ${esc(c.arcana) || '—'} &nbsp; `;
  h += `<b>Jogador:</b> ${esc(c.player) || '—'}`;
  h += '</div></div></div>';

  h += '<div class="print-section">' + sectionTitle('Atributos');
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
  ATTR_INFO.forEach(([k, label]) => {
    h += `<div style="border:1px solid #808080;padding:4px 10px;min-width:66px;text-align:center;background:#f4f4f4;"><b>${k}</b><br><span style="font-size:16px;color:#000080;font-weight:bold;">${c.attributes[k]}</span><br><span style="font-size:9px;color:#666;">${label}</span></div>`;
  });
  h += '</div></div>';

  h += '<div class="print-section">' + sectionTitle('Valores Derivados');
  h += '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;background:#f8f8f8;padding:6px 10px;border:1px solid #ccc;">';
  h += `<span><b>PV:</b> ${c.pv.current} / ${c.pv.max}</span>`;
  h += `<span><b>Energia:</b> ${c.energia.current} / ${c.energia.max}</span>`;
  h += `<span><b>Iniciativa:</b> ${Number(c.attributes.AGI) + Number(c.iniciativaBonus || 0)}</span>`;
  h += `<span><b>RD:</b> ${c.rd || 0}</span>`;
  h += `<span><b>Pts. Aspec.:</b> ${c.ptsAspec || 0}</span>`;
  h += '</div></div>';

  const hasAspects = c.conviction || c.aspects.some(a => a);
  if (hasAspects) {
    h += '<div class="print-section">' + sectionTitle('Aspectos e Convicção');
    if (c.conviction) h += `<div><b>Convicção:</b> ${esc(c.conviction)}</div>`;
    c.aspects.forEach((a, i) => { if (a) h += `<div><b>Aspecto ${i + 1}:</b> ${esc(a)}</div>`; });
    h += '</div>';
  }

  h += '<div class="print-section">' + sectionTitle('Habilidades Sociais');
  h += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
  SOCIAL_SKILLS.forEach(k => {
    const pts = c.social[k];
    const tier = Math.max(0, Math.floor(Number(pts) / 5));
    const titulo = c.socialTitles[k] || '—';
    h += `<tr><td style="border:1px solid #ccc;padding:2px 6px;width:28%;"><b>${k}</b></td><td style="border:1px solid #ccc;padding:2px 6px;text-align:center;width:12%;">${pts}</td><td style="border:1px solid #ccc;padding:2px 6px;text-align:center;width:14%;">Tier ${tier}</td><td style="border:1px solid #ccc;padding:2px 6px;">${esc(titulo)}</td></tr>`;
  });
  h += '</table></div>';

  if (c.personas.length > 0) {
    h += '<div class="print-section">' + sectionTitle('Personas');
    c.personas.forEach(p => {
      h += '<div style="border:1px solid #808080;padding:8px;margin:6px 0;background:#f8f8f8;page-break-inside:avoid;">';
      h += `<div style="font-weight:bold;color:#000080;font-size:12px;margin-bottom:4px;">${esc(p.name) || '(sem nome)'}</div>`;
      h += '<div style="font-size:11px;margin-bottom:3px;">';
      h += `<b>Nível:</b> ${p.level} &nbsp; <b>PM:</b> ${p.pm}`;
      if (p.conviction) h += ` &nbsp; <b>Convicção:</b> ${esc(p.conviction)}`;
      if (p.naturalAbility) h += ` &nbsp; <b>Hab. Natural:</b> ${esc(p.naturalAbility)}`;
      h += '</div>';
      if (p.types.length) h += `<div style="font-size:11px;"><b>Tipos:</b> ${p.types.map(esc).join(', ')}</div>`;
      if (p.resistances.length) h += `<div style="font-size:11px;"><b>Resistências:</b> ${p.resistances.map(esc).join(', ')}</div>`;
      if (p.weaknesses.length) h += `<div style="font-size:11px;"><b>Fraquezas:</b> ${p.weaknesses.map(esc).join(', ')}</div>`;
      if (p.spells.length > 0) {
        h += '<div style="font-size:11px;margin-top:4px;"><b>Magias:</b></div>';
        h += '<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:2px;table-layout:fixed;">';
        h += '<colgroup><col style="width:18%"><col style="width:10%"><col style="width:9%"><col style="width:6%"><col style="width:10%"><col style="width:10%"><col style="width:8%"><col style="width:29%"></colgroup>';
        h += '<tr style="background:#e8e8e8;"><th style="border:1px solid #ccc;padding:2px;">Nome</th><th style="border:1px solid #ccc;padding:2px;">Tipo</th><th style="border:1px solid #ccc;padding:2px;">Cat.</th><th style="border:1px solid #ccc;padding:2px;">Tier</th><th style="border:1px solid #ccc;padding:2px;">Alc.</th><th style="border:1px solid #ccc;padding:2px;">Alvo</th><th style="border:1px solid #ccc;padding:2px;">Usos</th><th style="border:1px solid #ccc;padding:2px;">Efeito</th></tr>';
        p.spells.forEach(s => {
          const cell = (v) => `<td style="border:1px solid #ccc;padding:2px;word-wrap:break-word;overflow-wrap:break-word;">${esc(v) || '—'}</td>`;
          h += '<tr>';
          h += cell(s.name);
          h += cell(s.type);
          h += cell(s.category);
          h += `<td style="border:1px solid #ccc;padding:2px;text-align:center;">${s.tier || 0}</td>`;
          h += cell(s.range);
          h += cell(s.target);
          h += cell(s.uses);
          h += cell(s.effect);
          h += '</tr>';
        });
        h += '</table>';
      }
      h += '</div>';
    });
    h += '</div>';
  }

  const e = c.equipment;
  const hasEquip = e.weapon.name || e.secondaryAttack.name || e.armor.name || e.accessory.name || e.mixedEquip || e.items.length > 0 || e.feats;
  if (hasEquip) {
    h += '<div class="print-section">' + sectionTitle('Equipamento e Inventário');
    if (e.weapon.name) h += `<div><b>Arma:</b> ${esc(e.weapon.name)} — Dano: ${esc(e.weapon.damage) || '—'}, Alcance: ${esc(e.weapon.range) || '—'}${e.weapon.effect ? ' — ' + esc(e.weapon.effect) : ''}</div>`;
    if (e.secondaryAttack.name) h += `<div><b>Ataque Secundário:</b> ${esc(e.secondaryAttack.name)} — Dano: ${esc(e.secondaryAttack.damage) || '—'}, Alcance: ${esc(e.secondaryAttack.range) || '—'}${e.secondaryAttack.effect ? ' — ' + esc(e.secondaryAttack.effect) : ''}</div>`;
    if (e.armor.name) h += `<div><b>Armadura:</b> ${esc(e.armor.name)} — RD: ${e.armor.rd || 0}${e.armor.effect ? ' — ' + esc(e.armor.effect) : ''}</div>`;
    if (e.accessory.name) h += `<div><b>Acessório:</b> ${esc(e.accessory.name)}${e.accessory.effect ? ' — ' + esc(e.accessory.effect) : ''}</div>`;
    if (e.mixedEquip) h += `<div><b>Equip. Misto:</b> ${esc(e.mixedEquip)}</div>`;
    if (e.items.length > 0) h += `<div style="margin-top:3px;"><b>Itens:</b> ${e.items.map(it => `${esc(it.name) || '?'}${it.qty > 1 ? ' (×' + it.qty + ')' : ''}`).join(', ')}</div>`;
    if (e.feats) h += `<div style="margin-top:3px;"><b>Feitos:</b> ${esc(e.feats)}</div>`;
    h += '</div>';
  }

  if (c.confidants.length > 0) {
    h += '<div class="print-section">' + sectionTitle('Confidentes');
    c.confidants.forEach(cf => {
      h += `<div style="font-size:11px;">• <b>${esc(cf.arcana) || '—'}</b> — ${esc(cf.name) || '—'} (Rank ${cf.rank})</div>`;
    });
    h += '</div>';
  }

  const extraFields = [
    ['Pronomes', 'pronouns'], ['Idade', 'age'], ['Apelido(s)', 'nicknames'],
    ['Aniversário', 'birthday'], ['Signo', 'zodiac'], ['Cidade Natal', 'hometown'],
    ['País/Guardiões', 'country'], ['Eventos Notáveis', 'events'],
    ['Educação Formal', 'education'], ['Trabalho', 'job'],
    ['Experiências Passadas', 'pastExp'], ['Hobbies', 'hobbies'],
    ['Medos', 'fears'], ['Ambição', 'ambition'], ['Sonho', 'dream'],
    ['Filosofia', 'philosophy'], ['Relacionamentos', 'relationships'],
    ['Idiomas', 'languages'], ['Aliados', 'allies'], ['Rivais', 'rivals'],
    ['Fama', 'fame'], ['Altura', 'height'], ['Peso', 'weight'],
    ['Cabelo', 'hair'], ['Olhos', 'eyes'], ['Piercing/Tatuagens', 'piercings'],
    ['Cicatrizes', 'scars'], ['Roupas', 'clothes'], ['Corpo', 'body'],
    ['Comida', 'food'], ['Música', 'music'], ['Televisão', 'tv'],
    ['Literatura', 'literature'], ['Situação Financeira', 'financial'],
    ['Moradia', 'housing'], ['Ocupação e Habilidade', 'jobSkill'],
    ['Notas', 'notes'], ['PR', 'pr'], ['Blocos Trab.', 'workBlocks'],
    ['Bloqueios/Status', 'statusBlocks']
  ];
  const filledExtras = extraFields.filter(([_, k]) => c.extra[k] !== '' && c.extra[k] !== 0 && c.extra[k] != null);
  if (filledExtras.length > 0) {
    h += '<div class="print-section">' + sectionTitle('Informações Extras');
    h += '<div style="column-count:2;column-gap:22px;font-size:11px;">';
    filledExtras.forEach(([label, k]) => {
      h += `<div style="break-inside:avoid;margin-bottom:3px;"><b>${label}:</b> ${esc(c.extra[k])}</div>`;
    });
    h += '</div></div>';
  }

  h += `<div style="margin-top:16px;padding-top:6px;border-top:1px solid #999;font-size:9px;color:#666;text-align:center;">© ${year} Yuki — ${esc(c.name) || 'Sem nome'}</div>`;

  return h;
}

function addSpellModalHTML() {
  const c = getCurrent();
  if (!c) return '';
  const p = c.personas[state.addSpellPersonaIdx];
  if (!p) return '';

  let html = '<div class="modal add-spell-modal">';
  html += '<h2>Adicionar Magia</h2>';
  html += `<p class="muted">Persona: <b>${esc(p.name) || '(sem nome)'}</b> — ${p.spells.length}/8 magias</p>`;
  html += '<div class="add-spell-tabs">';
  html += `<div class="add-spell-tab ${state.addSpellTab === 'presets' ? 'active' : ''}" data-action="add-spell-tab" data-tab="presets">Magias</div>`;
  html += `<div class="add-spell-tab ${state.addSpellTab === 'custom' ? 'active' : ''}" data-action="add-spell-tab" data-tab="custom">Minhas Magias</div>`;
  html += '</div>';
  html += '<div class="add-spell-content">';
  if (state.addSpellTab === 'presets') {
    html += renderPresetsTab(p);
  } else {
    html += renderCustomSpellsTab(p);
  }
  html += '</div>';
  html += '<div class="modal-actions"><button data-action="add-spell-modal-close">Fechar</button></div>';
  html += '</div>';
  return html;
}

function renderPresetsTab(p) {
  if (state.spellPresetsLoading) {
    return '<p class="muted"><em>Carregando magias...</em></p>';
  }
  if (!Array.isArray(state.spellPresets) || state.spellPresets.length === 0) {
    return '<p class="muted"><em>Nenhuma magia carregada. Verifique se o arquivo <b>spells.csv</b> existe na pasta do app (ou a lista <b>spells/index.json</b>).</em></p>';
  }
  let html = '<input type="text" placeholder="Buscar por nome, tipo ou categoria…" style="width:100%;margin-bottom:8px;" oninput="filterPresets(this.value)">';
  html += '<div class="spell-preset-list">';
  state.spellPresets.forEach((s, i) => {
    html += `<div class="spell-preset-item" data-action="add-spell-from-preset" data-preset-idx="${i}">`;
    html += `<div class="spell-preset-title"><b>${esc(s.name)}</b> <span class="muted">Tier ${s.tier} • ${esc(s.type)} • ${esc(s.category)}</span></div>`;
    html += `<div class="spell-preset-desc">${esc(s.effect)}</div>`;
    html += `</div>`;
  });
  html += '</div>';
  return html;
}

function renderCustomSpellsTab(p) {
  if (state.addSpellDraft) {
    return renderSpellDraftForm();
  }
  let html = '<button data-action="add-spell-start-create" style="margin-bottom:8px;">+ Nova Magia</button>';
  if (!Array.isArray(state.customSpells) || state.customSpells.length === 0) {
    html += '<p class="muted"><em>Você ainda não criou nenhuma magia. Use o botão acima para começar.</em></p>';
    return html;
  }
  html += '<div class="spell-preset-list">';
  state.customSpells.forEach((s, i) => {
    html += `<div class="spell-preset-item" style="cursor:default;">`;
    html += `<div class="spell-preset-title"><b>${esc(s.name) || '(sem nome)'}</b> <span class="muted">Tier ${s.tier || 0} • ${esc(s.type) || '—'}${s.category ? ' • ' + esc(s.category) : ''}</span></div>`;
    html += `<div class="spell-preset-desc">${esc(s.effect) || '<em>sem efeito</em>'}</div>`;
    html += `<div style="display:flex;gap:4px;margin-top:6px;">`;
    html += `<button data-action="add-spell-from-custom" data-custom-idx="${i}">Adicionar à Persona</button>`;
    html += `<button class="danger" data-action="add-spell-delete-custom" data-custom-idx="${i}">Excluir</button>`;
    html += `</div></div>`;
  });
  html += '</div>';
  return html;
}

function renderSpellDraftForm() {
  const d = state.addSpellDraft;
  let html = '<div class="spell-draft-form">';
  html += '<h3 style="margin-top:0;">Nova Magia</h3>';
  html += '<div class="grid">';
  html += fieldText('Nome', 'addSpellDraft.name', d.name);
  html += fieldText('Tipo', 'addSpellDraft.type', d.type);
  html += fieldText('Categoria', 'addSpellDraft.category', d.category);
  html += fieldNumber('Tier', 'addSpellDraft.tier', d.tier, 0);
  html += fieldText('Alcance', 'addSpellDraft.range', d.range);
  html += fieldText('Alvo', 'addSpellDraft.target', d.target);
  html += fieldText('Usos', 'addSpellDraft.uses', d.uses);
  html += fieldText('Reprimir', 'addSpellDraft.repress', d.repress);
  html += '</div>';
  html += '<div class="field vtop"><label>Efeito</label>' +
          `<textarea data-bind="addSpellDraft.effect" rows="3" style="flex:1;">${esc(d.effect)}</textarea></div>`;
  html += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px;">';
  html += '<button data-action="add-spell-cancel-create">Cancelar</button>';
  html += '<button data-action="add-spell-save-create" class="btn-accent">Salvar e Adicionar</button>';
  html += '</div>';
  html += '</div>';
  return html;
}