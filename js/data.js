/* ============================================================
   DATA — Constantes, estado, modelos, persistência, helpers
   Camada 0: sem dependências de outros módulos Yuki.
   ============================================================ */
console.log('[Yuki] module: data.js loaded');

const APP_VERSION = '0.11.2-alpha';

const CHANGELOG = [
  {
    version: 'v0.11.2-alpha',
    date: '25/10/2026',
    changes: [
      'Refactor: app.js dividido em 6 módulos (data, modals, reader, sheet, render, app).',
      'Refactor: nenhuma funcionalidade alterada — apenas reorganização de arquivos.',
      'Nota: cada mudança futura mexe em apenas um arquivo (ver WORKFLOW.md).'
    ]
  },
  {
    version: 'v0.11.1-alpha',
    date: '25/10/2026',
    changes: [
      'Fix: Abrir livro no leitor exigia dois cliques (o primeiro caía de volta pra lista).',
      'Fix: Estado de carregamento agora aparece enquanto o PDF é lido, em vez de voltar à lista.',
      'Fix: "Blink" ao navegar entre páginas — render passou a ser double-buffered (offscreen canvas).',
      'Fix: Resize disparava re-render duplicado no leitor (listeners redundantes unificados).',
      'Fix: Resize agora tem debounce de 150ms para não re-renderizar enquanto a barra de endereço do mobile anima.'
    ]
  },
  {
    version: 'v0.11.0-alpha',
    date: '25/10/2026',
    changes: [
      'Adicionado: Navegação por swipe horizontal no leitor de PDF (mobile).',
      'Adicionado: Navegação por setas do teclado (← / →) no leitor de PDF (desktop).',
      'Adicionado: Botões laterais de navegação (setas) no leitor de PDF em desktop.'
    ]
  },
  {
    version: 'v0.10.0-alpha',
    date: '25/10/2026',
    changes: [
      'Adicionado: Menu lateral (drawer) na ficha em mobile, aberto pelo FAB.',
      'Adicionado: Barra inferior fixa na ficha em mobile (Lista, Dado, Exportar, Excluir).',
      'Adicionado: Rótulo da aba atual no topo da ficha em mobile.',
      'Alterado: No mobile, as abas da ficha migraram do topo para o menu lateral.',
      'Alterado: No mobile, os botões de ação do cabeçalho da ficha foram ocultados.',
      'Alterado: FAB de dados virou FAB de menu dentro da ficha.',
      'Fix: Retrato do personagem no mobile virou quadradinho compacto.',
      'Fix: Retrato só aparece na aba Identidade em mobile.'
    ]
  },
  {
    version: 'v0.8.1-alpha',
    date: '24/10/2026',
    changes: [
      'Fix: Botões da home alinhados em grades responsivas nos temas Alpha e Yuki.',
      'Fix: Navegação da home reorganizada para telas estreitas e celulares.',
      'Fix: Altura, espaçamento e quebra de texto dos botões padronizados.',
      'Fix: Contraste do botão "Sobre o App" no tema Yuki.',
      'Fix: Contraste do botão "Cortar e usar" no modal de recorte.',
      'Fix: Alinhamento do contador e do botão "Novo" no cabeçalho da home.',
      'Adicionado: Sidebar do Yuki reaproveitada na aba Livros.',
      'Fix: Cores do tema Yuki aplicadas à split view.'
    ]
  },
  {
    version: 'v0.8.0-alpha',
    date: '24/10/2026',
    changes: [
      'Adicionado: Home responsiva com botões alinhados em grids.',
      'Adicionado: Navegação da home reorganizada para mobile.',
      'Fix: Altura mínima dos botões padronizada.'
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
const USER_STORAGE_KEY = 'yuki_user_v1';
const CUSTOM_SPELLS_KEY = 'grimorio_custom_spells_v1';

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
];
const THEMES = [
  { id: 'alpha', name: 'Alpha', chroma: 'classic', description: 'Tema clássico — visual de "web antiga", funcional e leve.' },
  { id: 'yuki', name: 'Yuki', chroma: 'chrome', description: 'Tema oficial — não é oficial oficial, a IA meteu o loko, mas relaxa, o designer aqui tá cooking.' },
  { id: 'sibyl', name: 'Sibyl', chroma: 'chrome', description: 'Monitor CRT, glitch sutil, grid infinito de identidades. Inspirado em Serial Experiments Lain e Psycho-Pass.' }
];

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

let state = {
  characters: [],
  currentId: null,
  view: 'list',
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

/* ---------- Utilitários ---------- */
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

/* ---------- Split view / Settings ---------- */
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
  const theme = state.settings.theme || 'alpha';
  document.body.setAttribute('data-theme', theme);
  const bg = document.getElementById('sibyl-bg');
  if (!bg) return;
  if (theme === 'sibyl') {
    bg.hidden = false;
    updateSibylTile();
    startSibylParallax();
  } else {
    bg.hidden = true;
  }
}

const SIBYL_DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100">
     <rect width="100" height="100" fill="#0b1116"/>
     <circle cx="50" cy="37" r="16" fill="#2f7d86"/>
     <path d="M13 100c0-21 17-31 37-31s37 10 37 31z" fill="#2f7d86"/>
   </svg>`);

let _sibylRAF = null;
const _sibylTarget = { x: 0, y: 0 };
const _sibylCurrent = { x: 0, y: 0 };
let _sibylLastMove = -1e9;

function updateSibylTile() {
  const bg = document.getElementById('sibyl-bg');
  if (!bg) return;
  const pfp = (state.user && state.user.pfp) ? state.user.pfp : SIBYL_DEFAULT_AVATAR;
  bg.style.setProperty('--sibyl-tile', `url("${pfp}")`);
}

function startSibylParallax() {
  if (_sibylRAF) return;
  const step = () => {
    const bg = document.getElementById('sibyl-bg');
    if (!bg || bg.hidden) { _sibylRAF = null; return; }
    if (performance.now() - _sibylLastMove > 3000) {
      const t = performance.now() / 1000;
      _sibylTarget.x = Math.sin(t * 0.25) * 0.65;
      _sibylTarget.y = Math.cos(t * 0.19) * 0.65;
    }
    _sibylCurrent.x += (_sibylTarget.x - _sibylCurrent.x) * 0.06;
    _sibylCurrent.y += (_sibylTarget.y - _sibylCurrent.y) * 0.06;
    bg.querySelectorAll('.sibyl-layer').forEach(el => {
      const d = parseFloat(el.dataset.depth) || 20;
      el.style.transform =
        `translate3d(${(-_sibylCurrent.x * d).toFixed(2)}px, ${(-_sibylCurrent.y * d).toFixed(2)}px, 0)`;
    });
    _sibylRAF = requestAnimationFrame(step);
  };
  _sibylRAF = requestAnimationFrame(step);
}

window.addEventListener('pointermove', (e) => {
  _sibylTarget.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  _sibylTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
  _sibylLastMove = performance.now();
}, { passive: true });

function triggerSibylBurst() {
  const fx = document.getElementById('sibyl-fx');
  if (!fx) return;
  fx.classList.remove('sibyl-burst');
  void fx.offsetWidth;
  fx.classList.add('sibyl-burst');
  setTimeout(() => fx.classList.remove('sibyl-burst'), 800);
}

/* ---------- Persistência principal ---------- */
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

/* ---------- Perfil do usuário ---------- */
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
    if (document.body.getAttribute('data-theme') === 'sibyl') updateSibylTile();
  } catch (e) {
    console.error('Erro ao salvar perfil do usuário:', e);
    alert('Não foi possível salvar o perfil. O armazenamento local pode estar cheio.');
  }
}

/* ---------- Minhas Magias ---------- */
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

/* ---------- IndexedDB ---------- */
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

/* ---------- Modelos ---------- */
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

  const socSum = Object.values(c.social).reduce((a, b) => a + Number(b || 0), 0);
  setText('soc-sum', socSum);
  if (c.creationMode) {
    const remSoc = 7 - socSum;
    setText('soc-remaining', remSoc);
    const socRemEl = document.getElementById('soc-remaining');
    if (socRemEl) socRemEl.className = remSoc === 0 ? 'ok' : 'bad';
  }
  SOCIAL_SKILLS.forEach(k => setText('tier-' + k, Math.max(0, Math.floor(Number(c.social[k] || 0) / 5))));

  setText('pv-max-display', c.pv.max);
  setText('energia-max-display', c.energia.max);
  setText('iniciativa-total', Number(c.attributes.AGI || 0) + Number(c.iniciativaBonus || 0));

  const pvCur = document.querySelector('[data-bind="pv.current"]');
  if (pvCur && document.activeElement !== pvCur && Number(pvCur.value) !== c.pv.current) pvCur.value = c.pv.current;
  const enCur = document.querySelector('[data-bind="energia.current"]');
  if (enCur && document.activeElement !== enCur && Number(enCur.value) !== c.energia.current) enCur.value = c.energia.current;

  c.personas.forEach((p, idx) => {
    const spent = p.spells.reduce((a, s) => a + Number(s.tier || 0), 0);
    setText('pm-total-' + idx, p.pm);
    setText('pm-spent-' + idx, spent);
    const rem = Number(p.pm || 0) - spent;
    const el = document.getElementById('pm-remaining-' + idx);
    if (el) { el.textContent = rem; el.className = rem < 0 ? 'bad' : ''; }
  });
}

/* ---------- Helpers de campo ---------- */
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

/* ---------- Carregamento de magias preset ---------- */
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
    } catch (_) {}

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

/* ---------- Utilitários globais ---------- */
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