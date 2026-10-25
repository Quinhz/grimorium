/* ============================================================
   SHEET — Ficha: abas, menu lateral, retrato
   Camada 3: usa data.js.
   ============================================================ */
console.log('[Yuki] module: sheet.js loaded');

function sheetMenuHTML() {
  const c = getCurrent();
  if (!c) return '';
  const isMobile = window.innerWidth < 700;
  const tabs = [
    ['identidade', 'Identidade'],
    ['atributos', 'Atributos'],
    ['aspectos', 'Aspectos'],
    ['sociais', 'Sociais'],
    ['personas', 'Personas'],
    ['equipamento', 'Equipamento'],
    ['confidentes', 'Confidentes'],
    ['extras', 'Extras']
  ];

  let html = '<div class="sheet-menu-panel" role="dialog" aria-label="Menu da ficha">';
  html += '<div class="sheet-menu-header">';
  html += '<h3>Menu da Ficha</h3>';
  html += '<button data-action="close-sheet-menu" class="sheet-menu-close" aria-label="Fechar menu">×</button>';
  html += '</div>';

  if (isMobile) {
    html += '<nav class="sheet-menu-tabs">';
    tabs.forEach(([id, label]) => {
      const active = state.tab === id ? ' active' : '';
      html += `<button data-action="set-tab-from-menu" data-tab="${id}" class="sheet-menu-tab${active}">${label}</button>`;
    });
    html += '</nav>';
  }

  html += '<div class="sheet-menu-actions">';
  html += '<h4>Ações</h4>';
  if (c.creationMode) {
    html += `<button data-action="conclude-creation-from-menu" class="sheet-menu-action-btn">Concluir Criação</button>`;
  }
  html += `<button data-action="export-char-from-menu" data-id="${c.id}" class="sheet-menu-action-btn">Exportar JSON</button>`;
  if (canUseSplit() || state.view === 'split') {
    const title = state.view === 'split' ? 'Fechar modo dividido' : 'Abrir modo dividido';
    html += `<button data-action="toggle-split-from-menu" class="sheet-menu-action-btn">${title}</button>`;
  }
  html += '</div>';

  html += '</div>';
  return html;
}

function renderSheet(app, target) {
  const targetEl = target || app;
  const c = getCurrent();
  const tabs = [
    ['identidade', 'Identidade'],
    ['atributos', 'Atributos'],
    ['aspectos', 'Aspectos'],
    ['sociais', 'Sociais'],
    ['personas', 'Personas'],
    ['equipamento', 'Equipamento'],
    ['confidentes', 'Confidentes'],
    ['extras', 'Extras']
  ];

  const isMobile = window.innerWidth < 700;
  const showTabsInSheet = !isMobile;
  const showBottomBar = isMobile;

  let html = '';
  if (!c.name) {
    html += `<div class="warn">Preencha as informações de <b>Identidade</b> para começar.</div>`;
  }
  html += `<div class="row-between" style="margin-top:8px;">`;
  html += `<div>`;
  html += `<h1 style="margin:0;">${esc(c.name) || 'Sem nome'}</h1>`;
  if (isMobile) {
    const currentTabLabel = (tabs.find(t => t[0] === state.tab) || [,''])[1];
    html += `<div class="sheet-mobile-tab-label">${currentTabLabel}</div>`;
  }
  html += `</div>`;
  if (!isMobile) {
    html += `<div>`;
    html += `<button data-action="go-list">← Lista</button> `;
    if (c.creationMode) {
      html += `<button data-action="conclude-creation" class="btn-accent"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><polyline points="20 6 9 17 4 12"/></svg> Concluir Criação</button> `;
    }
    html += `<button data-action="open-dice" class="icon-btn" title="Rolar dados"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm3 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg></button> `;
    html += `<button data-action="export-char" data-id="${c.id}">Exportar JSON</button> `;
    html += `<button data-action="open-print-preview">Exportar PDF</button> `;
    html += `<button class="danger" data-action="delete-char" data-id="${c.id}">Excluir</button>`;
    if (canUseSplit() || state.view === 'split') {
      const title = state.view === 'split' ? 'Fechar modo dividido' : 'Abrir modo dividido';
      html += ` <button data-action="toggle-split" class="icon-btn" title="${title}">` +
        `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="6" height="12"/><rect x="9" y="2" width="6" height="12"/></svg>` +
        `</button>`;
    }
    html += `</div>`;
  }
  html += `</div>`;

  if (showTabsInSheet) {
    html += `<div class="tabs">`;
    tabs.forEach(([id, label]) => {
      html += `<div class="tab ${state.tab === id ? 'active' : ''}" data-action="set-tab" data-tab="${id}">${label}</div>`;
    });
    html += `</div>`;
  }

  html += `<div class="sheet-body">`;
  if (!isMobile || state.tab === 'identidade') {
    html += `<div class="portrait-box" data-action="upload-portrait" title="${c.portraitImage ? 'Trocar imagem' : 'Adicionar imagem'}">`;
    if (c.portraitImage) {
      html += `<img src="${c.portraitImage}" alt="Retrato do personagem">`;
      html += `<button class="portrait-remove" data-action="remove-portrait" title="Remover imagem"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg></button>`;
    } else {
      html += `<div class="portrait-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg><span>Adicionar imagem</span></div>`;
    }
    html += `</div>`;
    html += `<input type="file" id="portrait-file" accept="image/*" style="display:none" onchange="uploadPortrait(event)">`;
  }
  html += `<div class="panel">`;
  switch (state.tab) {
    case 'identidade':  html += renderIdentidade(c); break;
    case 'atributos':   html += renderAtributos(c); break;
    case 'aspectos':    html += renderAspectos(c); break;
    case 'sociais':     html += renderSociais(c); break;
    case 'personas':    html += renderPersonas(c); break;
    case 'equipamento': html += renderEquipamento(c); break;
    case 'confidentes': html += renderConfidentes(c); break;
    case 'extras':      html += renderExtras(c); break;
  }
  html += `</div>`;
  html += `</div>`;
  html += `<div class="footer">© ${new Date().getFullYear()} Yuki</div>`;

  if (showBottomBar) {
    html += `<div class="sheet-bottom-spacer"></div>`;
    html += `<div class="sheet-bottom-bar" role="toolbar" aria-label="Ações da ficha">`;
    html += `<button data-action="go-list" class="sheet-bottom-btn" title="Lista" aria-label="Ir para a lista">` +
              `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>` +
              `<span>Lista</span></button>`;
    html += `<button data-action="open-dice" class="sheet-bottom-btn" title="Rolar dados" aria-label="Rolar dados">` +
              `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm3 1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>` +
              `<span>Dado</span></button>`;
    html += `<button data-action="open-print-preview" class="sheet-bottom-btn" title="Exportar PDF" aria-label="Exportar PDF">` +
              `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>` +
              `<span>Exportar</span></button>`;
    html += `<button data-action="delete-char" data-id="${c.id}" class="sheet-bottom-btn danger" title="Excluir personagem" aria-label="Excluir personagem">` +
              `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>` +
              `<span>Excluir</span></button>`;
    html += `</div>`;
  }

  targetEl.innerHTML = html;
  updateDerivedDisplays();
}

function renderIdentidade(c) {
  let html = `<h2>Identidade</h2>`;
  html += `<div class="grid">`;
  html += fieldText('Personagem', 'name', c.name, 'Nome do seu personagem');
  html += fieldSelect('Classe', 'class', c.class, ['', ...CLASSES]);
  html += fieldNumber('Nível (Nv.)', 'level', c.level, 1);
  html += fieldSelect('Arcana', 'arcana', c.arcana, ARCANA_OPTIONS);
  html += fieldText('Jogador', 'player', c.player, 'Seu nome real');
  html += `</div>`;
  html += `<p class="muted">Essas são as primeiras informações a serem preenchidas.</p>`;
  return html;
}

function renderAtributos(c) {
  let html = `<h2>Atributos</h2>`;
  if (c.creationMode) {
    html += `<p>Distribua <b>18 pontos</b> (mín. 1, máx. 5). Níveis superiores: consulte o livro/Mestre.</p>`;
  } else {
    html += `<p class="muted">Valores editáveis livremente após a criação.</p>`;
  }
  html += `<div id="attr-warn" class="warn" style="display:none;"></div>`;
  html += `<div class="grid">`;
  ATTR_INFO.forEach(([key, label]) => {
    const minAttr = c.creationMode ? 'min="1"' : '';
    html += `<div class="field"><label>${key} <span class="muted">(${esc(label)})</span></label>` +
            `<input type="number" data-bind="attributes.${key}" value="${c.attributes[key]}" ${minAttr}></div>`;
  });
  html += `</div>`;
  if (c.creationMode) {
    html += `<p>Total: <b id="attr-sum">0</b> / 18 &nbsp; (restante: <b id="attr-remaining">18</b>)</p>`;
  } else {
    html += `<p>Total: <b id="attr-sum">0</b></p>`;
  }

  html += `<h2>Valores Derivados</h2>`;
  html += `<div class="grid">`;
  html += `<div class="field"><label>PV</label>` +
          `<input type="number" data-bind="pv.current" value="${c.pv.current}" min="0" style="max-width:90px;">` +
          `<span>/ <b id="pv-max-display">${c.pv.max}</b></span></div>`;
  html += `<div class="field"><label>Energia</label>` +
          `<input type="number" data-bind="energia.current" value="${c.energia.current}" min="0" style="max-width:90px;">` +
          `<span>/ <b id="energia-max-display">${c.energia.max}</b></span></div>`;
  if (!c.creationMode) {
    html += `<div class="field"><label>PV Máx. Bônus</label>` +
            `<input type="number" data-bind="pv.maxBonus" value="${c.pv.maxBonus || 0}" style="max-width:90px;">` +
            `<span class="muted">somado ao máx. calculado</span></div>`;
    html += `<div class="field"><label>Energia Máx. Bônus</label>` +
            `<input type="number" data-bind="energia.maxBonus" value="${c.energia.maxBonus || 0}" style="max-width:90px;">` +
            `<span class="muted">somado ao máx. calculado</span></div>`;
  }
  html += `<div class="field"><label>Iniciativa</label>` +
          `<span>AGI (${c.attributes.AGI}) +</span>` +
          `<input type="number" data-bind="iniciativaBonus" value="${c.iniciativaBonus || 0}" style="max-width:70px;">` +
          `<span>= <b id="iniciativa-total">${Number(c.attributes.AGI) + Number(c.iniciativaBonus || 0)}</b></span></div>`;
  html += `<div class="field"><label>RD</label>` +
          `<input type="number" data-bind="rd" value="${c.rd}" min="0" style="max-width:90px;"></div>`;
  html += `<div class="field"><label>Pts. Aspec.</label>` +
          `<input type="number" data-bind="ptsAspec" value="${c.ptsAspec}" min="0" style="max-width:90px;"></div>`;
  html += `</div>`;
  if (c.creationMode) {
    html += `<p class="muted">PV máx = 25 + ((5 + VIT) × Nível) &nbsp;|&nbsp; Energia máx = VIT + ⌊Nível/2⌋ &nbsp;|&nbsp; Iniciativa = AGI + bônus</p>`;
  }
  return html;
}

function renderAspectos(c) {
  let html = `<h2>Aspectos e Convicção</h2>`;
  html += `<p class="muted">Opcionais. Informações sobre motivação e personalidade.</p>`;
  html += `<div class="field vtop"><label>Convicção</label>` +
          `<textarea data-bind="conviction" rows="2" style="flex:1;">${esc(c.conviction)}</textarea></div>`;
  c.aspects.forEach((a, i) => {
    html += `<div class="field"><label>Aspecto Livre ${i + 1}</label>` +
            `<input type="text" data-bind="aspects.${i}" value="${esc(a)}"></div>`;
  });
  return html;
}

function renderSociais(c) {
  let html = `<h2>Habilidades Sociais</h2>`;
  if (c.creationMode) {
    html += `<p>Distribua <b>7 pontos</b> (cada <b>5 pontos</b> = 1 Tier). Você pode aceitar até <b>−2</b> em uma habilidade para liberar mais pontos (limite efetivo: até 9).</p>`;
  } else {
    html += `<p class="muted">Cada <b>5 pontos</b> = 1 Tier. Máximo: <b>Tier 5</b> (25 pontos). Valores negativos até −2.</p>`;
  }
  html += `<div class="table-wrap"><table><thead><tr>` +
          `<th>Habilidade</th><th style="width:90px;">Pontos</th><th style="width:70px;">Tier</th><th>Título</th>` +
          `</tr></thead><tbody>`;
  SOCIAL_SKILLS.forEach(k => {
    const maxAttr = c.creationMode ? '' : 'max="25"';
    html += `<tr>`;
    html += `<td data-label="Habilidade"><b>${esc(k)}</b></td>`;
    html += `<td data-label="Pontos"><input type="number" data-bind="social.${k}" value="${c.social[k]}" min="-2" ${maxAttr} style="width:100%;"></td>`;
    html += `<td data-label="Tier"><b id="tier-${k}">${Math.max(0, Math.floor(Number(c.social[k] || 0) / 5))}</b></td>`;
    html += `<td data-label="Título"><input type="text" data-bind="socialTitles.${k}" value="${esc(c.socialTitles[k])}" style="width:100%;"></td>`;
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  if (c.creationMode) {
    html += `<p>Total: <b id="soc-sum">0</b> / 7 &nbsp; (restante: <b id="soc-remaining">7</b>)</p>`;
  } else {
    html += `<p>Total: <b id="soc-sum">0</b></p>`;
  }
  return html;
}

function renderPersonas(c) {
  let html = `<h2>Personas</h2>`;
  html += `<p class="muted">Um personagem pode ter múltiplas personas. PM = 5 + Nível + Bônus (começa em 6 no Nível 1, +1 por nível). Cada magia consome <b>Tier</b> PM.</p>`;
  html += `<button data-action="add-persona">+ Adicionar Persona</button>`;
  if (c.personas.length === 0) {
    html += `<p><em>Nenhuma persona criada ainda.</em></p>`;
  }
  c.personas.forEach((p, idx) => { html += renderPersonaCard(c, p, idx); });
  return html;
}

function renderPersonaCard(c, p, idx) {
  const base = `personas.${idx}`;
  const isEmergente = c.class === 'Emergentes';
  const spent = p.spells.reduce((a, s) => a + Number(s.tier || 0), 0);
  const remaining = Number(p.pm || 0) - spent;

  let html = `<div class="persona-card">`;
  html += `<div class="row-between">`;
  html += `<h3 style="margin:0;">Persona ${idx + 1}: ${esc(p.name) || '<span class="muted">(sem nome)</span>'}</h3>`;
  html += `<button class="danger" data-action="remove-persona" data-idx="${idx}">Remover</button>`;
  html += `</div>`;

  html += `<div class="grid">`;
  html += fieldText('Nome', `${base}.name`, p.name, 'Nome da Persona');
  html += fieldNumber('Nível (Nv.)', `${base}.level`, p.level, 1);
  html += fieldNumber('PM Bônus', `${base}.pmBonus`, p.pmBonus || 0);
  html += `</div>`;
  html += `<div class="field"><label>Convicção</label><input type="text" data-bind="${base}.conviction" value="${esc(p.conviction)}"></div>`;
  html += `<div class="field"><label>Hab. Natural</label><input type="text" data-bind="${base}.naturalAbility" value="${esc(p.naturalAbility)}"></div>`;

  html += `<p>PM: <b id="pm-total-${idx}">${esc(p.pm)}</b> <span class="muted">(5 + Nv. + Bônus)</span> &nbsp;|&nbsp; Gasto: <b id="pm-spent-${idx}">${spent}</b> &nbsp;|&nbsp; ` +
          `Restante: <b id="pm-remaining-${idx}" class="${remaining < 0 ? 'bad' : ''}">${remaining}</b></p>`;

  html += `<h4>Tipos ${isEmergente ? '(Emergente: quantidade variável)' : '(até 3)'}</h4>`;
  html += `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));">`;
  PERSONA_TYPES.forEach(t => {
    const checked = p.types.includes(t) ? 'checked' : '';
    html += `<label style="min-width:0;display:flex;align-items:center;gap:4px;">` +
            `<input type="checkbox" data-action="toggle-type" data-idx="${idx}" data-type="${esc(t)}" ${checked}> ${esc(t)}</label>`;
  });
  html += `</div>`;
  html += `<p class="muted">Selecionados: <b id="type-count-${idx}">${p.types.length}</b>` +
          (isEmergente
            ? ' — Classe Emergente: a quantidade pode variar por nível (consulte o Mestre).'
            : ' — Máximo 3.') + `</p>`;

  html += `<h4>Resistências (${p.resistances.length}${c.creationMode ? ' — máx. 1 em criação' : ''})</h4>`;
  html += `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">`;
  RESISTANCE_TYPES.forEach(t => {
    const checked = p.resistances.includes(t) ? 'checked' : '';
    html += `<label style="min-width:0;display:flex;align-items:center;gap:4px;">` +
            `<input type="checkbox" data-action="toggle-resistance" data-pidx="${idx}" data-type="${esc(t)}" ${checked}> ${esc(t)}</label>`;
  });
  html += `</div>`;
  html += `<h4>Fraquezas (${p.weaknesses.length}${c.creationMode ? ' — máx. 1 em criação' : ''})</h4>`;
  html += `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">`;
  RESISTANCE_TYPES.forEach(t => {
    const checked = p.weaknesses.includes(t) ? 'checked' : '';
    html += `<label style="min-width:0;display:flex;align-items:center;gap:4px;">` +
            `<input type="checkbox" data-action="toggle-weakness" data-pidx="${idx}" data-type="${esc(t)}" ${checked}> ${esc(t)}</label>`;
  });
  html += `</div>`;

  html += `<h4>Magias (${p.spells.length}/8)</h4>`;
  if (p.spells.length === 0) {
    html += `<p class="muted"><em>Nenhuma magia cadastrada.</em></p>`;
  }
  p.spells.forEach((s, si) => { html += renderSpellCard(idx, s, si); });
  if (p.spells.length < 8) {
    html += `<button data-action="add-spell" data-idx="${idx}">+ Adicionar Magia</button>`;
  } else {
    html += `<p class="muted"><em>Máximo de 8 magias atingido.</em></p>`;
  }

  html += `</div>`;
  return html;
}

function renderSpellCard(pIdx, s, sIdx) {
  const base = `personas.${pIdx}.spells.${sIdx}`;
  let html = `<div class="spell-card">`;
  html += `<div class="row-between"><b>Magia ${sIdx + 1}</b>` +
          `<button class="danger" data-action="remove-spell" data-idx="${pIdx}" data-sidx="${sIdx}">Remover</button></div>`;
  html += `<div class="grid">`;
  html += fieldText('Nome', `${base}.name`, s.name);
  html += fieldText('Tipo', `${base}.type`, s.type);
  html += fieldText('Categoria', `${base}.category`, s.category);
  html += fieldNumber('Tier', `${base}.tier`, s.tier, 0);
  html += fieldText('Alcance', `${base}.range`, s.range);
  html += fieldText('Alvo', `${base}.target`, s.target);
  html += fieldText('Usos', `${base}.uses`, s.uses);
  html += fieldText('Reprimir', `${base}.repress`, s.repress);
  html += `</div>`;
  html += `<div class="field vtop"><label>Efeito</label>` +
          `<textarea data-bind="${base}.effect" rows="2" style="flex:1;">${esc(s.effect)}</textarea></div>`;
  html += `</div>`;
  return html;
}

function renderEquipamento(c) {
  const e = c.equipment;
  let html = `<h2>Equipamento e Inventário</h2>`;
  html += `<p class="muted">Opcional. Pode ser preenchido depois. Criação livre, negociada com o Mestre.</p>`;

  html += `<h3>Arma</h3><div class="grid">`;
  html += fieldText('Nome', 'equipment.weapon.name', e.weapon.name);
  html += fieldText('Dano', 'equipment.weapon.damage', e.weapon.damage);
  html += fieldText('Alcance', 'equipment.weapon.range', e.weapon.range);
  html += fieldText('Efeito', 'equipment.weapon.effect', e.weapon.effect);
  html += `</div>`;

  html += `<h3>Ataque Secundário</h3><div class="grid">`;
  html += fieldText('Nome', 'equipment.secondaryAttack.name', e.secondaryAttack.name);
  html += fieldText('Dano', 'equipment.secondaryAttack.damage', e.secondaryAttack.damage);
  html += fieldText('Alcance', 'equipment.secondaryAttack.range', e.secondaryAttack.range);
  html += fieldText('Efeito', 'equipment.secondaryAttack.effect', e.secondaryAttack.effect);
  html += `</div>`;

  html += `<h3>Armadura</h3><div class="grid">`;
  html += fieldText('Nome', 'equipment.armor.name', e.armor.name);
  html += fieldNumber('RD', 'equipment.armor.rd', e.armor.rd, 0);
  html += fieldText('Efeito', 'equipment.armor.effect', e.armor.effect);
  html += `</div>`;

  html += `<h3>Acessório</h3><div class="grid">`;
  html += fieldText('Nome', 'equipment.accessory.name', e.accessory.name);
  html += fieldText('Efeito', 'equipment.accessory.effect', e.accessory.effect);
  html += `</div>`;

  html += `<h3>Equip. Misto</h3>`;
  html += `<div class="field vtop"><label style="min-width:0;">Anotações de itens diversos</label>` +
          `<textarea data-bind="equipment.mixedEquip" rows="2" style="flex:1;">${esc(e.mixedEquip)}</textarea></div>`;

  html += `<h3>Itens</h3>`;
  if (e.items.length === 0) html += `<p class="muted"><em>Nenhum item.</em></p>`;
  e.items.forEach((it, i) => {
    html += `<div class="field">`;
    html += `<input type="text" data-bind="equipment.items.${i}.name" value="${esc(it.name)}" placeholder="Nome/Descrição" style="flex:1;">`;
    html += `<input type="number" data-bind="equipment.items.${i}.qty" value="${it.qty}" min="0" style="max-width:80px;">`;
    html += `<button class="danger" data-action="remove-item" data-idx="${i}">Remover</button>`;
    html += `</div>`;
  });
  html += `<button data-action="add-item">+ Adicionar Item</button>`;

  html += `<h3>Feitos</h3>`;
  html += `<p class="muted">Níveis 2, 4, 6, 8, 10, 12, 14, 16, 18, 20 e extras.</p>`;
  html += `<textarea data-bind="equipment.feats" rows="4" style="width:100%;">${esc(e.feats)}</textarea>`;

  return html;
}

function renderConfidentes(c) {
  let html = `<h2>Confidentes (Links Sociais)</h2>`;
  html += `<p class="muted">Preenchido ao longo da campanha.</p>`;
  if (c.confidants.length === 0) html += `<p><em>Nenhum confidente registrado.</em></p>`;
  c.confidants.forEach((cf, i) => {
    html += `<div class="persona-card">`;
    html += `<div class="row-between"><b>Confidente ${i + 1}</b>` +
            `<button class="danger" data-action="remove-confidant" data-idx="${i}">Remover</button></div>`;
    html += `<div class="grid">`;
    html += fieldSelect('Arcana', `confidants.${i}.arcana`, cf.arcana, ARCANA_OPTIONS);
    html += fieldText('Nome do Confidente', `confidants.${i}.name`, cf.name);
    html += fieldNumber('Rank (1–100)', `confidants.${i}.rank`, cf.rank, 1, 100);
    html += `</div></div>`;
  });
  html += `<button data-action="add-confidant">+ Adicionar Confidente</button>`;
  return html;
}

function renderExtras(c) {
  const x = c.extra;
  let html = `<h2>Informações Extras</h2>`;
  html += `<p class="muted">Opcionais. Sempre editáveis.</p>`;

  const shortFields = [
    ['Pronomes', 'pronouns', 'Ex.: Ele/Dele, Ela/Dela, Elu/Delu'],
    ['Idade', 'age', ''],
    ['Apelido(s)', 'nicknames', ''],
    ['Aniversário', 'birthday', ''],
    ['Signo', 'zodiac', ''],
    ['Cidade Natal', 'hometown', ''],
    ['País/Guardiões', 'country', ''],
    ['Educação Formal', 'education', ''],
    ['Trabalho', 'job', ''],
    ['Experiências Passadas', 'pastExp', ''],
    ['Hobbies', 'hobbies', ''],
    ['Medos', 'fears', ''],
    ['Ambição', 'ambition', ''],
    ['Sonho', 'dream', ''],
    ['Filosofia', 'philosophy', ''],
    ['Idiomas', 'languages', ''],
    ['Aliados', 'allies', ''],
    ['Rivais', 'rivals', ''],
    ['Fama', 'fame', ''],
    ['Altura', 'height', ''],
    ['Peso', 'weight', ''],
    ['Cabelo', 'hair', ''],
    ['Olhos', 'eyes', ''],
    ['Piercing/Tatuagens', 'piercings', ''],
    ['Cicatrizes', 'scars', ''],
    ['Roupas', 'clothes', ''],
    ['Corpo', 'body', ''],
    ['Comida', 'food', ''],
    ['Música', 'music', ''],
    ['Televisão', 'tv', ''],
    ['Literatura', 'literature', ''],
    ['Situação Financeira', 'financial', ''],
    ['Moradia', 'housing', '']
  ];

  html += `<div class="grid">`;
  shortFields.forEach(([label, key, ph]) => {
    html += fieldText(label, `extra.${key}`, x[key], ph);
  });
  html += fieldSelect('Ocupação e Habilidade', 'extra.jobSkill', x.jobSkill, ['', ...SOCIAL_SKILLS]);
  html += `</div>`;

  const longFields = [
    ['Eventos Notáveis', 'events'],
    ['Relacionamentos', 'relationships'],
    ['Retrato e Persona', 'portrait'],
    ['Notas', 'notes']
  ];
  longFields.forEach(([label, key]) => {
    html += `<div class="field vtop"><label>${esc(label)}</label>` +
            `<textarea data-bind="extra.${key}" rows="3" style="flex:1;">${esc(x[key])}</textarea></div>`;
  });

  html += `<h3>Outros</h3><div class="grid">`;
  html += fieldNumber('PR (Pontos de Recurso)', 'extra.pr', x.pr || 0, 0);
  html += fieldText('Blocos Trab.', 'extra.workBlocks', x.workBlocks, 'Ex.: DOM, SEG, TER');
  html += fieldText('Bloqueios/Status', 'extra.statusBlocks', x.statusBlocks, 'Ex.: Atordoado, Envenenado');
  html += `</div>`;

  return html;
}

/* ---------- Retrato e perfil ---------- */
function openCropModal(file, onConfirm) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => showCropModal(img, onConfirm);
    img.onerror = () => alert('Arquivo de imagem inválido.');
    img.src = reader.result;
  };
  reader.onerror = () => alert('Erro ao ler o arquivo.');
  reader.readAsDataURL(file);
}

function showCropModal(img, onConfirm) {
  const old = document.getElementById('crop-modal');
  if (old) old.remove();

  const maxW = Math.min(520, window.innerWidth - 80);
  const maxH = Math.min(380, window.innerHeight - 220);
  let dispW = img.width, dispH = img.height;
  if (dispW > maxW || dispH > maxH) {
    const r = Math.min(maxW / dispW, maxH / dispH);
    dispW = Math.round(dispW * r);
    dispH = Math.round(dispH * r);
  }
  const minDisp = Math.min(dispW, dispH);
  const sliderMin = Math.max(20, Math.round(minDisp * 0.3));
  const sliderMax = Math.round(minDisp);

  let cropSize = Math.round(minDisp * 0.7);
  let cropX = Math.round((dispW - cropSize) / 2);
  let cropY = Math.round((dispH - cropSize) / 2);

  const modal = document.createElement('div');
  modal.id = 'crop-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal crop-modal">
      <h2>Cortar imagem</h2>
      <p class="muted">Arraste o quadrado para mover. Use o controle abaixo para ajustar o tamanho.</p>
      <div class="crop-stage" style="width:${dispW}px; height:${dispH}px;">
        <canvas id="crop-canvas" width="${dispW}" height="${dispH}"></canvas>
        <div class="crop-selection" id="crop-selection" style="left:${cropX}px; top:${cropY}px; width:${cropSize}px; height:${cropSize}px;"></div>
      </div>
      <div class="field" style="margin-top:12px;">
        <label>Tamanho</label>
        <input type="range" id="crop-size" min="${sliderMin}" max="${sliderMax}" value="${cropSize}" style="flex:1;">
      </div>
      <div class="modal-actions">
        <button id="crop-cancel">Cancelar</button>
        <button id="crop-confirm" class="btn-accent">Cortar e usar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, dispW, dispH);

  const selection = document.getElementById('crop-selection');
  const slider = document.getElementById('crop-size');

  let dragging = false;
  let dragStartX = 0, dragStartY = 0, startLeft = 0, startTop = 0;

  const clampPos = () => {
    if (cropX < 0) cropX = 0;
    if (cropY < 0) cropY = 0;
    if (cropX + cropSize > dispW) cropX = dispW - cropSize;
    if (cropY + cropSize > dispH) cropY = dispH - cropSize;
    selection.style.left = cropX + 'px';
    selection.style.top = cropY + 'px';
  };

  selection.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startLeft = cropX;
    startTop = cropY;
    try { selection.setPointerCapture(e.pointerId); } catch (er) {}
  });
  selection.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    cropX = startLeft + (e.clientX - dragStartX);
    cropY = startTop + (e.clientY - dragStartY);
    clampPos();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    try { selection.releasePointerCapture(e.pointerId); } catch (er) {}
  };
  selection.addEventListener('pointerup', endDrag);
  selection.addEventListener('pointercancel', endDrag);

  slider.addEventListener('input', () => {
    cropSize = Number(slider.value);
    selection.style.width = cropSize + 'px';
    selection.style.height = cropSize + 'px';
    clampPos();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('crop-cancel').addEventListener('click', () => modal.remove());

  document.getElementById('crop-confirm').addEventListener('click', () => {
    const scale = img.width / dispW;
    const sx = Math.round(cropX * scale);
    const sy = Math.round(cropY * scale);
    const sSize = Math.round(cropSize * scale);
    const outSize = Math.min(400, sSize);
    const out = document.createElement('canvas');
    out.width = outSize;
    out.height = outSize;
    out.getContext('2d').drawImage(img, sx, sy, sSize, sSize, 0, 0, outSize, outSize);
    let dataUrl;
    try {
      dataUrl = out.toDataURL('image/jpeg', 0.85);
    } catch (err) {
      alert('Erro ao gerar a imagem.');
      modal.remove();
      return;
    }
    if (typeof onConfirm === 'function') {
      onConfirm(dataUrl);
    } else {
      const c = getCurrent();
      if (c) {
        c.portraitImage = dataUrl;
        save();
        render();
      }
    }
    modal.remove();
  });
}

function uploadPortrait(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Selecione um arquivo de imagem.');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    alert('Imagem muito grande (máx. 20 MB).');
    return;
  }
  openCropModal(file);
}

function uploadUserPfp(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Selecione um arquivo de imagem.');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    alert('Imagem muito grande (máx. 20 MB).');
    return;
  }
  openCropModal(file, (dataUrl) => {
    state.user.pfp = dataUrl;
    saveUser();
    render();
  });
}