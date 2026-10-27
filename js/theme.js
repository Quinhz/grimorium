/* ============================================================
   THEME — Troca de tema, parallax Sibyl, bursts
   Camada 0.5: usa data.js (state, THEMES). Carrega depois de data.js.
   ============================================================ */
console.log('[Yuki] module: theme.js loaded');

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