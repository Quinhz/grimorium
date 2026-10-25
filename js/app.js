/* ============================================================
   GRIMÓRIO DO CORAÇÃO — Ficha de Personagem (PWA)
   Dados salvos em localStorage. Exportação/Importação em JSON.
   ============================================================ */

/* ---------- Constantes ---------- */
const APP_VERSION = '0.9.0-alpha';

const CHANGELOG = [
  { 
    version: 'v0.9.0-alpha', 
    date: '24/10/2026', 
    changes: [
      'Fix: Botões da home alinhados em grades responsivas nos temas Alpha e Yuki.',
      'Fix: Navegação da home reorganizada para telas estreitas e celulares.',
      'Fix: Altura, espaçamento e quebra de texto dos botões padronizados.'
    ]
  },
  { 
    version: 'v0.7.0-alpha', 
    date: 'Anterior', 
    changes: [
      'Adicionado: Tela "Sobre" com Changelog integrado.',
      'Adicionado: Histórico completo de versões no Changelog.',
      'Fix: O scroll do Changelog não vaza mais para o fundo da tela.',
      'Fix: Botão "Concluir Criação" e ícones ajustados nos temas.',
      'Fix: Botão "Sobre" centralizado apenas nas Configurações.'
    ]
  },
  { 
    version: 'v0.6.0-alpha', 
    date: '20/10', 
    changes: [
      'Adicionado: Tema Yuki (Dark Brutalist) com Sidebar e Grid.',
      'Adicionado: Perfil do usuário (foto + nome) no topo da tela.',
      'Adicionado: Tela de boas-vindas com opção de ocultar.'
    ]
  },
  { 
    version: 'v0.5.0-alpha', 
    date: '15/10', 
    changes: [
      'Adicionado: Exportação em PDF com prévia.',
      'Adicionado: Retrato do personagem com ferramenta de recorte (crop).',
      'Adicionado: Presets de magia via arquivo CSV.'
    ]
  },
  { 
    version: 'v0.4.0-alpha', 
    date: '10/10', 
    changes: [
      'Adicionado: Nome provisório "Yuki" e refatoração (HTML/CSS/JS separados).',
      'Adicionado: Biblioteca "Minhas Magias".',
      'Fix: Cálculo de PM das Personas (5 + nível + bônus).'
    ]
  },
  { 
    version: 'v0.3.0-alpha', 
    date: '05/10', 
    changes: [
      'Adicionado: Leitor de PDF.',
      'Adicionado: Modo dividido (Ficha + Leitor).',
      'Adicionado: Rolagem de dados (d4 a d100).'
    ]
  }
];

const STORAGE_KEY = 'yuki_v1';
const CLASSES = ['Emergentes', 'Cartas-Coringa', 'Sombras', 'Supressores', 'Tochas'];
const ARCANA_OPTIONS = ['', 'O Tolo', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Amantes', 'A Carruagem', 'A Justiça', 'O Eremita', 'A Fortuna',
  'A Força', 'O Enforcado', 'A Morte', 'A Temperança', 'O Demônio', 'A Torre',
  'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo', 'Aeon'];
const PERSONA_TYPES = ['Físico', 'Fogo', 'Gelo', 'Vento', 'Raio', 'Nuclear', 'PSY', 'Luz',
  'Trevas', 'Buff', 'Debuff', 'Cura', 'Status', 'Intel', 'Defesa', 'Miscelânea', 'Onipotente'];
const RESISTANCE_TYPES = ['Físico', 'Fogo', 'Gelo', 'Vento', 'Raio', 'Nuclear', 'PSY', 'Luz', 'Trevas', 'Status', 'Intel'];
const SOCIAL_SKILLS = ['Conhecimento', 'Disciplina', 'Empatia', 'Charme', 'Expressão', 'Coragem'];
const ATTR_INFO = [
  ['FOR', 'Força'],
  ['MAG', 'Magia'],
  ['TEC', 'Técnica'],
  ['AGI', 'Agilidade'],
  ['VIT', 'Vitalidade'],
  ['SOR', 'Sorte']
  // TODO: descrições completas de cada atributo quando fornecidas.
];

const THEMES = [
  { id: 'alpha', name: 'Alpha', description: 'Tema clássico — visual de "web antiga", funcional e leve.' },
  { id: 'yuki', name: 'Yuki', description: 'Tema oficial — não é oficial oficial, a IA meteu o loko, mas relaxa, o designer aqui tá cooking.' }
];

const CUSTOM_SPELLS_KEY = 'grimorio_custom_spells_v1';

/* ---------- Carregamento de magias preset (CSV externo) ---------- */
const SPELL_HEADER_MAP = {
  'nome': 'name', 'name': 'name',
  'tipo': 'type', 'type': 'type',
  'categoria': 'category', 'category': 'category',
  'tier': 'tier',
  'alcance': 'range', 'range': 'range',
  'alvo': 'target', 'target': 'target',
  'usos': 'uses', 'uses': 'uses',
  'reprimir': 'repress', 'repress': 'repress',
  'efeito': 'effect', 'effect': 'effect'
};

async function loadSpellPresets() {
  state.spellPresetsLoading = true;
  state.spellPresets = [];
  try {
    let all = [];
    const single = await tryFetchSpellCSV('spells.csv');
    if (single) all = all.concat(single);

    try {
      const mRes = await fetch('spells/index.json', { cache: 'no-store' });
      if (mRes.ok) {
        const list = await mRes.json();
        if (Array.isArray(list)) {
          for (const fname of list) {
            if (typeof fname !== 'string') continue;
            const csv = await tryFetchSpellCSV('spells/' + fname);
            if (csv) all = all.concat(csv);
          }
        }
      }
    } catch (_) { /* manifest opcional */ }

    state.spellPresets = all;
  } catch (e) {
    console.error('Erro ao carregar presets:', e);
    state.spellPresets = [];
  } finally {
    state.spellPresetsLoading = false;
    if (state.showAddSpellModal) render();
  }
}

async function tryFetchSpellCSV(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null;
    return parseSpellCSV(text);
  } catch (e) {
    return null;
  }
}

function parseSpellCSV(text) {
  const allRows = parseCSVRows(text).filter(r => r.length > 0 && !String(r[0] || '').trim().startsWith('#'));
  if (allRows.length < 2) return [];
  const headers = allRows[0].map(h => String(h || '').trim().toLowerCase());
  const out = [];
  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    const obj = {};
    headers.forEach((h, j) => {
      const key = SPELL_HEADER_MAP[h] || h;
      obj[key] = row[j] !== undefined ? row[j] : '';
    });
    if (!obj.name && !obj.effect && !obj.type && !obj.category) continue;
    out.push(normalizeSpellRow(obj));
  }
  return out;
}

function parseCSVRows(text) {
  text = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; continue; }
    field += ch; i++;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function normalizeSpellRow(obj) {
  return {
    name: String(obj.name || '').trim(),
    type: String(obj.type || '').trim(),
    category: String(obj.category || '').trim(),
    tier: Number(obj.tier) || 0,
    range: String(obj.range || '').trim(),
    target: String(obj.target || '').trim(),
    uses: String(obj.uses || '').trim(),
    repress: String(obj.repress || '').trim(),
    effect: String(obj.effect || '').trim()
  };
}

/* ---------- Estado ---------- */
let state = {
  characters: [],
  currentId: null,
  view: 'list',      // 'welcome' | 'list' | 'sheet' | 'books' | 'reader' | 'split'
  tab: 'identidade',
  currentBookId: null,
  settings: { template: 'single', splitRatio: 0.5, theme: 'alpha', showWelcome: true },
  user: { pfp: '', username: '' },
  showSettings: false,
  showAbout: false,
  showDice: false,
  showPrintPreview: false,
  sheetMenuOpen: false,
  diceSides: 6,
  diceHistory: [],
  customSpells: [],
  spellPresets: [],
  spellPresetsLoading: false,
  showAddSpellModal: false,
  addSpellPersonaIdx: null,
  addSpellTab: 'presets',
  addSpellDraft: null
};

function canUseSplit() { return window.innerWidth >= 700 && window.innerHeight >= 500; }
function shouldUseSplit() { return state.settings.template === 'split' && canUseSplit(); }
function saveSettings() {
  try { localStorage.setItem('grimorio_settings_v1', JSON.stringify(state.settings)); } catch (e) {}
}
function loadSettings() {
  try {
    const raw = localStorage.getItem('grimorio_settings_v1');
    if (raw) state.settings = Object.assign({ template: 'single', splitRatio: 0.5, theme: 'alpha', showWelcome: true }, JSON.parse(raw));
  } catch (e) {}
}
function applyTheme() {
  document.body.setAttribute('data-theme', state.settings.theme || 'alpha');
}

/* ---------- Estado runtime do leitor de PDF (não persistido) ---------- */
let currentPdf = null;
let currentBookName = '';
let currentPdfPage = 1;
let currentPdfScale = null;
let currentPdfFit = true;
let pdfRenderToken = 0;
let openBookToken = 0;
let pdfjsLoading = null;

/* ---------- Utilidades ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}
function setPath(obj, path, val) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = val;
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function getCurrent() {
  return state.characters.find(c => c.id === state.currentId);
}

/* ---------- Persistência ---------- */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ characters: state.characters }));
  } catch (e) {
    console.error('Erro ao salvar:', e);
    alert('Não foi possível salvar. O armazenamento local pode estar cheio ou bloqueado.');
  }
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      state.characters = (data.characters || []).map(normalizeCharacter);
    }
  } catch (e) {
    console.error('Erro ao carregar:', e);
  }
}

/* ---------- Persistência: Perfil do usuário ---------- */
const USER_STORAGE_KEY = 'yuki_user_v1';
function loadUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) state.user = Object.assign({ pfp: '', username: '' }, JSON.parse(raw));
  } catch (e) {
    console.error('Erro ao carregar perfil do usuário:', e);
    state.user = { pfp: '', username: '' };
  }
}
function saveUser() {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user));
  } catch (e) {
    console.error('Erro ao salvar perfil do usuário:', e);
    alert('Não foi possível salvar o perfil. O armazenamento local pode estar cheio.');
  }
}

/* ---------- Persistência: Minhas Magias ---------- */
function loadCustomSpells() {
  try {
    const raw = localStorage.getItem(CUSTOM_SPELLS_KEY);
    if (raw) state.customSpells = JSON.parse(raw) || [];
    if (!Array.isArray(state.customSpells)) state.customSpells = [];
  } catch (e) {
    console.error('Erro ao carregar magias customizadas:', e);
    state.customSpells = [];
  }
}
function saveCustomSpells() {
  try {
    localStorage.setItem(CUSTOM_SPELLS_KEY, JSON.stringify(state.customSpells));
  } catch (e) {
    console.error('Erro ao salvar magias customizadas:', e);
    alert('Não foi possível salvar suas magias. O armazenamento local pode estar cheio.');
  }
}
function copySpell(s) {
  return {
    name: s.name || '',
    type: s.type || '',
    category: s.category || '',
    tier: Number(s.tier) || 0,
    range: s.range || '',
    target: s.target || '',
    uses: s.uses || '',
    repress: s.repress || '',
    effect: s.effect || ''
  };
}

/* ---------- IndexedDB (livros de referência) ---------- */
function openBooksDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('grimorio_books', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('books')) {
        req.result.createObjectStore('books', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function booksDBList() {
  const db = await openBooksDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readonly');
    const req = tx.objectStore('books').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function booksDBGet(id) {
  const db = await openBooksDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readonly');
    const req = tx.objectStore('books').get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function booksDBAdd(name, blob) {
  const db = await openBooksDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const id = uid();
    tx.objectStore('books').put({ id, name, blob, addedAt: Date.now() });
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}
async function booksDBDelete(id) {
  const db = await openBooksDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    tx.objectStore('books').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------- Fábricas e normalização ---------- */
function defaultExtra() {
  return {
    pronouns: '', age: '', nicknames: '', birthday: '', zodiac: '',
    hometown: '', country: '', events: '', education: '', job: '',
    pastExp: '', hobbies: '', fears: '', ambition: '', dream: '',
    philosophy: '', relationships: '', languages: '', allies: '',
    rivals: '', fame: '', height: '', weight: '', hair: '', eyes: '',
    piercings: '', scars: '', clothes: '', body: '', food: '', music: '',
    tv: '', literature: '', financial: '', housing: '', jobSkill: '',
    portrait: '', notes: '', pr: 0, workBlocks: '', statusBlocks: ''
  };
}
function defaultEquipment() {
  return {
    weapon: { name: '', damage: '', range: '', effect: '' },
    secondaryAttack: { name: '', damage: '', range: '', effect: '' },
    armor: { name: '', rd: 0, effect: '' },
    accessory: { name: '', effect: '' },
    mixedEquip: '',
    items: [],
    feats: ''
  };
}
function newCharacter() {
  return {
    id: uid(),
    creationMode: true,
    name: '', class: '', level: 1, arcana: '', player: '',
    attributes: { FOR: 1, MAG: 1, TEC: 1, AGI: 1, VIT: 1, SOR: 1 },
    pv: { current: 30, max: 30, maxBonus: 0 },
    energia: { current: 6, max: 6, maxBonus: 0 },
    iniciativaBonus: 0,
    rd: 0,
    ptsAspec: 4,
    conviction: '',
    aspects: ['', '', '', ''],
    social: { Conhecimento: 0, Disciplina: 0, Empatia: 0, Charme: 0, 'Expressão': 0, Coragem: 0 },
    socialTitles: { Conhecimento: '', Disciplina: '', Empatia: '', Charme: '', 'Expressão': '', Coragem: '' },
    personas: [],
    equipment: defaultEquipment(),
    confidants: [],
    extra: defaultExtra(),
    portraitImage: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
function newPersona(charLevel) {
  const lvl = charLevel || 1;
  return {
    id: uid(),
    name: '', level: lvl, pm: 5 + lvl, pmBonus: 0,
    conviction: '', naturalAbility: '',
    types: [], resistances: [], weaknesses: [],
    spells: []
  };
}
function newSpell() {
  return { name: '', type: '', category: '', tier: 0, range: '', target: '', uses: '', repress: '', effect: '' };
}
function normalizeCharacter(raw) {
  const def = newCharacter();
  const c = Object.assign({}, def, raw || {});
  if (raw.creationMode === undefined) c.creationMode = false;
  c.attributes = Object.assign({ FOR:1, MAG:1, TEC:1, AGI:1, VIT:1, SOR:1 }, raw.attributes || {});
  c.pv = Object.assign({ current: 30, max: 30, maxBonus: 0 }, raw.pv || {});
  c.energia = Object.assign({ current: 6, max: 6, maxBonus: 0 }, raw.energia || {});
  c.social = Object.assign({ Conhecimento:0, Disciplina:0, Empatia:0, Charme:0, 'Expressão':0, Coragem:0 }, raw.social || {});
  c.socialTitles = Object.assign({ Conhecimento:'', Disciplina:'', Empatia:'', Charme:'', 'Expressão':'', Coragem:'' }, raw.socialTitles || {});
  c.extra = Object.assign(defaultExtra(), raw.extra || {});
  c.equipment = Object.assign(defaultEquipment(), raw.equipment || {});
  c.equipment.weapon = Object.assign(defaultEquipment().weapon, (raw.equipment || {}).weapon || {});
  c.equipment.secondaryAttack = Object.assign(defaultEquipment().secondaryAttack, (raw.equipment || {}).secondaryAttack || {});
  c.equipment.armor = Object.assign(defaultEquipment().armor, (raw.equipment || {}).armor || {});
  c.equipment.accessory = Object.assign(defaultEquipment().accessory, (raw.equipment || {}).accessory || {});
  c.equipment.items = (raw.equipment || {}).items || [];
  c.aspects = (raw.aspects && raw.aspects.length === 4) ? raw.aspects : ['','','',''];
  c.personas = (raw.personas || []).map(p => ({
    id: p.id || uid(),
    name: p.name || '',
    level: p.level || 1,
    pm: p.pm ?? 6,
    pmBonus: p.pmBonus ?? Math.max(0, (p.pm ?? 6) - 5 - (p.level || 1)),
    conviction: p.conviction || '',
    naturalAbility: p.naturalAbility || '',
    types: p.types || [],
    resistances: Array.isArray(p.resistances) ? p.resistances : (p.resistance ? [p.resistance] : []),
    weaknesses: Array.isArray(p.weaknesses) ? p.weaknesses : (p.weakness ? [p.weakness] : []),
    spells: (p.spells || []).map(s => ({
      name: s.name || '', type: s.type || '', category: s.category || '',
      tier: s.tier || 0, range: s.range || '', target: s.target || '',
      uses: s.uses || '', repress: s.repress || '', effect: s.effect || ''
    }))
  }));
  c.confidants = (raw.confidants || []).map(cf => ({
    arcana: cf.arcana || '', name: cf.name || '', rank: cf.rank || 1
  }));
  c.ptsAspec = raw.ptsAspec ?? 4;
  c.iniciativaBonus = raw.iniciativaBonus ?? 0;
  c.rd = raw.rd ?? 0;
  c.id = raw.id || uid();
  return c;
}

/* ---------- Cálculos ---------- */
function recalc(c) {
  if (!c) return;
  c.pv.max = 25 + ((5 + Number(c.attributes.VIT || 0)) * Number(c.level || 1)) + Number(c.pv.maxBonus || 0);
  if (c.creationMode && c.pv.current > c.pv.max) c.pv.current = c.pv.max;
  if (c.pv.current < 0) c.pv.current = 0;
  c.energia.max = Number(c.attributes.VIT || 0) + Math.floor(Number(c.level || 1) / 2) + Number(c.energia.maxBonus || 0);
  if (c.creationMode && c.energia.current > c.energia.max) c.energia.current = c.energia.max;
  if (c.energia.current < 0) c.energia.current = 0;
  c.personas.forEach(p => {
    p.pm = Math.max(0, 5 + Number(p.level || 1) + Number(p.pmBonus || 0));
  });
  c.updatedAt = Date.now();
}

function updateDerivedDisplays() {
  const c = getCurrent();
  if (!c) return;

  // Atributos
  const attrSum = Object.values(c.attributes).reduce((a, b) => a + Number(b || 0), 0);
  setText('attr-sum', attrSum);
  if (c.creationMode) {
    const remAttr = 18 - attrSum;
    setText('attr-remaining', remAttr);
    const attrRemEl = document.getElementById('attr-remaining');
    if (attrRemEl) attrRemEl.className = remAttr === 0 ? 'ok' : 'bad';
  }
  const attrWarn = document.getElementById('attr-warn');
  if (attrWarn) {
    const over = Object.entries(c.attributes).filter(([k, v]) => Number(v) > 5).map(([k]) => k);
    if (c.creationMode && (over.length > 0 || attrSum !== 18)) {
      attrWarn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;"><path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg> Criação: distribua exatamente 18 pontos (mín. 1, máx. 5).' +
        (over.length ? ' Valores acima de 5: ' + over.join(', ') + '.' : '');
      attrWarn.style.display = '';
    } else {
      attrWarn.style.display = 'none';
    }
  }

  // Sociais
  const socSum = Object.values(c.social).reduce((a, b) => a + Number(b || 0), 0);
  setText('soc-sum', socSum);
  if (c.creationMode) {
    const remSoc = 7 - socSum;
    setText('soc-remaining', remSoc);
    const socRemEl = document.getElementById('soc-remaining');
    if (socRemEl) socRemEl.className = remSoc === 0 ? 'ok' : 'bad';
  }
  SOCIAL_SKILLS.forEach(k => setText('tier-' + k, Math.max(0, Math.floor(Number(c.social[k] || 0) / 5))));

  // PV / Energia / Iniciativa
  setText('pv-max-display', c.pv.max);
  setText('energia-max-display', c.energia.max);
  setText('iniciativa-total', Number(c.attributes.AGI || 0) + Number(c.iniciativaBonus || 0));

  // Inputs de PV/Energia (clamp)
  const pvCur = document.querySelector('[data-bind="pv.current"]');
  if (pvCur && document.activeElement !== pvCur && Number(pvCur.value) !== c.pv.current) pvCur.value = c.pv.current;
  const enCur = document.querySelector('[data-bind="energia.current"]');
  if (enCur && document.activeElement !== enCur && Number(enCur.value) !== c.energia.current) enCur.value = c.energia.current;

  // Persona PM restante
  c.personas.forEach((p, idx) => {
    const spent = p.spells.reduce((a, s) => a + Number(s.tier || 0), 0);
    setText('pm-total-' + idx, p.pm);
    setText('pm-spent-' + idx, spent);
    const rem = Number(p.pm || 0) - spent;
    const el = document.getElementById('pm-remaining-' + idx);
    if (el) { el.textContent = rem; el.className = rem < 0 ? 'bad' : ''; }
  });
}

/* ---------- Helpers de campos ---------- */
function fieldText(label, bind, value, placeholder) {
  return `<div class="field"><label>${esc(label)}</label>` +
    `<input type="text" data-bind="${bind}" value="${esc(value)}" placeholder="${esc(placeholder || '')}"></div>`;
}
function fieldNumber(label, bind, value, min, max) {
  return `<div class="field"><label>${esc(label)}</label>` +
    `<input type="number" data-bind="${bind}" value="${value}" ` +
    `${min !== undefined && min !== '' ? `min="${min}"` : ''} ` +
    `${max !== undefined && max !== '' ? `max="${max}"` : ''}></div>`;
}
function fieldSelect(label, bind, value, options) {
  const opts = options.map(o => {
    const disp = o === '' ? '—' : o;
    return `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(disp)}</option>`;
  }).join('');
  return `<div class="field"><label>${esc(label)}</label><select data-bind="${bind}">${opts}</select></div>`;
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */
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
     
       // FAB de dados (fora da ficha) ou menu da ficha (dentro dela)
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
  
       // Drawer do menu da ficha (abas + ações extras)
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

   /* ---------- Tela de boas-vindas ---------- */
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
   
   /* ---------- Lista de personagens ---------- */
   function renderList(app) {
     const hasPfp = !!state.user.pfp;
     const uname = state.user.username ? esc(state.user.username) : 'Sem nome';
     
     // LAYOUT EXCLUSIVO DO TEMA YUKI
     if (state.settings.theme === 'yuki') {
       let html = `<div class="yuki-layout">`;
       
       // Sidebar
       html += yukiSidebarHTML();
       html += `<input type="file" id="import-file" accept=".json,application/json" style="display:none" onchange="importChar(event)">`;

       // Main Content

       // Main Content
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
       
       // Espaços vazios (estética da grid)
       for (let i = 0; i < 3; i++) {
         html += `<div class="yuki-card empty"></div>`;
       }
       html += `</div>`;
       html += `<div class="footer">© ${new Date().getFullYear()} Yuki</div>`;
       html += `</main></div>`;
       app.innerHTML = html;
       return; // Encerra a função aqui pro Yuki não renderizar o layout antigo
     }

     // LAYOUT ANTIGO (TEMA ALPHA)
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

/* ---------- Livros de Referência ---------- */
async function renderBooks(app) {
  const isYuki = state.settings.theme === 'yuki';
  
  if (isYuki) {
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
    if (isYuki) {
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

  let html = isYuki
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
  
  if (isYuki) {
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

function ensurePdfjs() {
  if (window.pdfjsLib) {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return Promise.resolve();
  }
  if (pdfjsLoading) return pdfjsLoading;
  pdfjsLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      } else {
        reject(new Error('PDF.js carregou, mas pdfjsLib não está disponível.'));
      }
    };
    s.onerror = () => reject(new Error('Falha ao carregar PDF.js. Verifique sua conexão.'));
    document.head.appendChild(s);
  });
  return pdfjsLoading;
}

function leaveReader() {
  openBookToken++;
  if (currentPdf) { try { currentPdf.destroy(); } catch (e) {} currentPdf = null; }
  currentPdfPage = 1;
  currentPdfFit = true;
  currentPdfScale = null;
  currentBookName = '';
}

async function openBook(id) {
  const myToken = ++openBookToken;
  state.currentBookId = id;
  const inSplit = state.view === 'split';

  if (inSplit) {
    const rc = document.getElementById('split-right-content');
    if (rc) rc.innerHTML = '<div class="split-empty"><p>Carregando PDF…</p></div>';
  } else {
    state.view = 'reader';
    render();
  }

  try {
    await ensurePdfjs();
    if (myToken !== openBookToken) return;

    const book = await booksDBGet(id);
    if (myToken !== openBookToken) return;
    if (!book) {
      alert('Livro não encontrado.');
      if (!inSplit) { state.view = 'books'; render(); }
      else { const rc = document.getElementById('split-right-content'); if (rc) renderBookPickerInto(rc); }
      return;
    }

    const buf = await book.blob.arrayBuffer();
    if (myToken !== openBookToken) return;

    if (currentPdf) { try { currentPdf.destroy(); } catch (e) {} currentPdf = null; }
    currentPdf = await pdfjsLib.getDocument({ data: buf }).promise;
    if (myToken !== openBookToken) {
      try { currentPdf.destroy(); } catch (e) {}
      currentPdf = null;
      return;
    }
    currentBookName = book.name || 'Livro';
    currentPdfPage = 1;
    currentPdfFit = true;
    currentPdfScale = null;

    if (inSplit) {
      const app = document.getElementById('app');
      const rc = document.getElementById('split-right-content');
      if (rc) renderReader(app, rc, true);
    } else {
      render();
    }
  } catch (e) {
    if (myToken !== openBookToken) return;
    console.error(e);
    alert('Erro ao abrir PDF: ' + e.message);
    if (!inSplit) { state.view = 'books'; render(); }
    else { const rc = document.getElementById('split-right-content'); if (rc) renderBookPickerInto(rc); }
  }
}

function renderReader(app, target, embedded) {
  const targetEl = target || app;
  if (!currentPdf) {
    if (embedded) {
      targetEl.innerHTML = '<div class="split-empty"><p><em>Nenhum livro aberto.</em></p></div>';
      return;
    }
    state.view = 'books';
    renderBooks(app);
    return;
  }
  const backAction = embedded ? 'close-book' : 'go-books';
  const backLabel = embedded ? '← Fechar' : '← Livros';
  const showSplitToggle = !embedded && getCurrent() && canUseSplit();
  targetEl.innerHTML = `
    <div class="reader-wrap">
      <div class="reader-toolbar">
        <button data-action="${backAction}">${backLabel}</button>
        <button data-action="reader-prev" title="Página anterior"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
        <span class="reader-page-info" id="reader-page-info">— / —</span>
        <button data-action="reader-next" title="Próxima página"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
        <span class="reader-title" title="${esc(currentBookName)}">${esc(currentBookName)}</span>
        <button data-action="reader-zoom-out" title="Diminuir zoom">−</button>
        <button data-action="reader-fit" title="Ajustar à tela">Ajustar</button>
        <button data-action="reader-zoom-in" title="Aumentar zoom">+</button>
        ${showSplitToggle ? `<button data-action="toggle-split" class="icon-btn" title="Abrir em modo dividido"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="6" height="12"/><rect x="9" y="2" width="6" height="12"/></svg></button>` : ''}
      </div>
      <div class="reader-container" id="reader-container">
        <div class="reader-inner"><canvas id="reader-canvas"></canvas></div>
      </div>
    </div>`;
  requestAnimationFrame(() => {
    renderCurrentPdfPage().catch(err => console.error('Erro ao renderizar página:', err));
  });
}

function getFitScale(page, container) {
  const base = page.getViewport({ scale: 1 });
  const cw = container.clientWidth - 8;
  const ch = container.clientHeight - 8;
  return Math.min(cw / base.width, ch / base.height);
}

async function renderCurrentPdfPage() {
  if (!currentPdf) return;
  const myToken = ++pdfRenderToken;
  const container = document.getElementById('reader-container');
  const canvas = document.getElementById('reader-canvas');
  if (!container || !canvas) return;

  const page = await currentPdf.getPage(currentPdfPage);
  if (myToken !== pdfRenderToken) return;

  let scale;
  if (currentPdfFit) {
    scale = getFitScale(page, container);
    currentPdfScale = scale;
  } else {
    scale = currentPdfScale || 1;
  }

  const dpr = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale });
  canvas.width = Math.round(viewport.width * dpr);
  canvas.height = Math.round(viewport.height * dpr);
  canvas.style.width = viewport.width + 'px';
  canvas.style.height = viewport.height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, viewport.width, viewport.height);

  try {
    await page.render({ canvasContext: ctx, viewport }).promise;
  } catch (e) {
    console.error(e);
  }
  if (myToken !== pdfRenderToken) return;

  const info = document.getElementById('reader-page-info');
  if (info) info.textContent = `${currentPdfPage} / ${currentPdf.numPages}`;
  const prevBtn = document.querySelector('[data-action="reader-prev"]');
  const nextBtn = document.querySelector('[data-action="reader-next"]');
  if (prevBtn) prevBtn.disabled = currentPdfPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPdfPage >= currentPdf.numPages;
}

function readerGoTo(delta) {
  if (!currentPdf) return;
  const next = currentPdfPage + delta;
  if (next < 1 || next > currentPdf.numPages) return;
  currentPdfPage = next;
  const container = document.getElementById('reader-container');
  if (container) { container.scrollTop = 0; container.scrollLeft = 0; }
  renderCurrentPdfPage().catch(err => console.error(err));
}

function readerZoom(factor) {
  if (!currentPdf) return;
  currentPdfFit = false;
  currentPdfScale = Math.max(0.1, Math.min(6, (currentPdfScale || 1) * factor));
  renderCurrentPdfPage().catch(err => console.error(err));
}

function readerFit() {
  if (!currentPdf) return;
  currentPdfFit = true;
  currentPdfScale = null;
  renderCurrentPdfPage().catch(err => console.error(err));
}

window.addEventListener('resize', () => {
  if (state.view === 'reader' && currentPdf && currentPdfFit) {
    renderCurrentPdfPage().catch(err => console.error(err));
  }
});

/* ---------- Modo dividido ---------- */
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

/* ---------- Sobre (About) ---------- */
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

/* ---------- Configurações ---------- */
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

/* ---------- Rolagem de dados ---------- */
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

/* ---------- Exportação em PDF (preview + window.print) ---------- */
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

  // Cabeçalho
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

  // Atributos
  h += '<div class="print-section">' + sectionTitle('Atributos');
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
  ATTR_INFO.forEach(([k, label]) => {
    h += `<div style="border:1px solid #808080;padding:4px 10px;min-width:66px;text-align:center;background:#f4f4f4;"><b>${k}</b><br><span style="font-size:16px;color:#000080;font-weight:bold;">${c.attributes[k]}</span><br><span style="font-size:9px;color:#666;">${label}</span></div>`;
  });
  h += '</div></div>';

  // Derivados
  h += '<div class="print-section">' + sectionTitle('Valores Derivados');
  h += '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;background:#f8f8f8;padding:6px 10px;border:1px solid #ccc;">';
  h += `<span><b>PV:</b> ${c.pv.current} / ${c.pv.max}</span>`;
  h += `<span><b>Energia:</b> ${c.energia.current} / ${c.energia.max}</span>`;
  h += `<span><b>Iniciativa:</b> ${Number(c.attributes.AGI) + Number(c.iniciativaBonus || 0)}</span>`;
  h += `<span><b>RD:</b> ${c.rd || 0}</span>`;
  h += `<span><b>Pts. Aspec.:</b> ${c.ptsAspec || 0}</span>`;
  h += '</div></div>';

  // Aspectos (só se tiver algum)
  const hasAspects = c.conviction || c.aspects.some(a => a);
  if (hasAspects) {
    h += '<div class="print-section">' + sectionTitle('Aspectos e Convicção');
    if (c.conviction) h += `<div><b>Convicção:</b> ${esc(c.conviction)}</div>`;
    c.aspects.forEach((a, i) => { if (a) h += `<div><b>Aspecto ${i + 1}:</b> ${esc(a)}</div>`; });
    h += '</div>';
  }

  // Sociais
  h += '<div class="print-section">' + sectionTitle('Habilidades Sociais');
  h += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
  SOCIAL_SKILLS.forEach(k => {
    const pts = c.social[k];
    const tier = Math.max(0, Math.floor(Number(pts) / 5));
    const titulo = c.socialTitles[k] || '—';
    h += `<tr><td style="border:1px solid #ccc;padding:2px 6px;width:28%;"><b>${k}</b></td><td style="border:1px solid #ccc;padding:2px 6px;text-align:center;width:12%;">${pts}</td><td style="border:1px solid #ccc;padding:2px 6px;text-align:center;width:14%;">Tier ${tier}</td><td style="border:1px solid #ccc;padding:2px 6px;">${esc(titulo)}</td></tr>`;
  });
  h += '</table></div>';

  // Personas
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

  // Equipamento (só se tiver algo)
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

  // Confidentes
  if (c.confidants.length > 0) {
    h += '<div class="print-section">' + sectionTitle('Confidentes');
    c.confidants.forEach(cf => {
      h += `<div style="font-size:11px;">• <b>${esc(cf.arcana) || '—'}</b> — ${esc(cf.name) || '—'} (Rank ${cf.rank})</div>`;
    });
    h += '</div>';
  }

  // Extras (só campos preenchidos, em duas colunas)
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

  // Rodapé
  h += `<div style="margin-top:16px;padding-top:6px;border-top:1px solid #999;font-size:9px;color:#666;text-align:center;">© ${year} Yuki — ${esc(c.name) || 'Sem nome'}</div>`;

  return h;
}

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

  // No mobile as abas ficam aqui (não ficam acima da ficha)
  if (isMobile) {
    html += '<nav class="sheet-menu-tabs">';
    tabs.forEach(([id, label]) => {
      const active = state.tab === id ? ' active' : '';
      html += `<button data-action="set-tab-from-menu" data-tab="${id}" class="sheet-menu-tab${active}">${label}</button>`;
    });
    html += '</nav>';
  }

  // Ações extras (as mesmas que saíram do topo)
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

/* ---------- Ficha (com abas) ---------- */
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
  html += `<h1 style="margin:0;">${esc(c.name) || 'Sem nome'}</h1>`;
  if (isMobile) {
    const currentTabLabel = (tabs.find(t => t[0] === state.tab) || [,''])[1];
    html += `<div class="sheet-mobile-tab-label">${currentTabLabel}</div>`;
  }
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
  html += `</div></div>`;

  if (showTabsInSheet) {
    html += `<div class="tabs">`;
    tabs.forEach(([id, label]) => {
      html += `<div class="tab ${state.tab === id ? 'active' : ''}" data-action="set-tab" data-tab="${id}">${label}</div>`;
    });
    html += `</div>`;
  }

  html += `<div class="sheet-body">`;
  html += `<div class="portrait-box" data-action="upload-portrait" title="${c.portraitImage ? 'Trocar imagem' : 'Adicionar imagem'}">`;
  if (c.portraitImage) {
    html += `<img src="${c.portraitImage}" alt="Retrato do personagem">`;
    html += `<button class="portrait-remove" data-action="remove-portrait" title="Remover imagem"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg></button>`;
  } else {
    html += `<div class="portrait-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg><span>Adicionar imagem</span></div>`;
  }
  html += `</div>`;
  html += `<input type="file" id="portrait-file" accept="image/*" style="display:none" onchange="uploadPortrait(event)">`;
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

/* ---------- Aba: Identidade ---------- */
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

/* ---------- Aba: Atributos ---------- */
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

/* ---------- Aba: Aspectos ---------- */
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

/* ---------- Aba: Sociais ---------- */
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

/* ---------- Aba: Personas ---------- */
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

/* ---------- Modal: Adicionar Magia ---------- */
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

function filterPresets(query) {
  const q = String(query || '').toLowerCase().trim();
  document.querySelectorAll('.spell-preset-item[data-preset-idx]').forEach(node => {
    const idx = Number(node.dataset.presetIdx);
    const s = state.spellPresets[idx];
    if (!s) return;
    const hay = ((s.name || '') + ' ' + (s.type || '') + ' ' + (s.category || '')).toLowerCase();
    node.style.display = (!q || hay.includes(q)) ? '' : 'none';
  });
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

/* ---------- Aba: Equipamento ---------- */
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

/* ---------- Aba: Confidentes ---------- */
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

/* ---------- Aba: Extras ---------- */
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
  // Ocupação e Habilidade (select de Habilidades Sociais)
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

/* ============================================================
   AÇÕES E EVENTOS
   ============================================================ */
function goList() {
  state.view = 'list';
  state.currentId = null;
  render();
}

function exportChar(id) {
  const c = state.characters.find(x => x.id === id);
  if (!c) return;
  const data = JSON.stringify(c, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safe = (c.name || 'sem-nome').replace(/[^\w\-À-ÿ]+/g, '-').slice(0, 40);
  a.download = `personagem-${safe}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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

function importChar(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      // Aceita ficha individual OU exportação em lote ({characters: [...]})
      const list = Array.isArray(parsed) ? parsed :
                   (parsed.characters && Array.isArray(parsed.characters)) ? parsed.characters :
                   [parsed];
      let added = 0;
      list.forEach(raw => {
        const c = normalizeCharacter(raw);
        c.id = uid(); // garante unicidade
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

/* ---------- Delegação de eventos ---------- */
function handleInput(e) {
  const el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  const bind = el.dataset.bind;

  // Rascunho de nova magia (dentro do modal "Adicionar Magia")
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

  // Perfil do usuário (app-level)
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

  // Toggle de tipo de persona
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

  // Toggle de resistência
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

  // Toggle de fraqueza
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

  // Se campo numérico vazio e tem min, aplica min
  if (el.type === 'number' && el.dataset && el.dataset.bind && el.value === '' && el.min !== '') {
    el.value = el.min;
  }

  // Qualquer campo com data-bind
  if (el.dataset && el.dataset.bind) handleInput(e);
}

function handleClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  // Inputs/selects/textarea são tratados em input/change
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

/* ---------- Inicialização ---------- */
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
    if (state.view === 'reader' && currentPdf && currentPdfFit) {
      renderCurrentPdfPage().catch(err => console.error(err));
    }
  });

  window.addEventListener('orientationchange', () => {
    if (state.view === 'sheet' || state.view === 'split') {
      setTimeout(() => render(), 300);
    }
  });

  render();

  // Registro do Service Worker (PWA) — só funciona em http/https
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service Worker não registrado:', err);
      });
    });
  }
}
init();
