/* ============================================================
   READER — Leitor de PDF (runtime state + navegação)
   Camada 2: usa data.js.
   ============================================================ */
console.log('[Yuki] module: reader.js loaded');

let currentPdf = null;
let currentBookName = '';
let currentPdfPage = 1;
let currentPdfScale = null;
let currentPdfFit = true;
let pdfRenderToken = 0;
let openBookToken = 0;
let pdfjsLoading = null;
let _readerResizeTimer = null;

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
      state.currentBookId = null;
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
    state.currentBookId = null;
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
    if (state.currentBookId) {
      targetEl.innerHTML = '<div class="reader-wrap"><div class="reader-loading">Carregando PDF…</div></div>';
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
      <button class="reader-nav-arrow reader-nav-prev" data-action="reader-prev" aria-label="Página anterior" title="Página anterior (←)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <button class="reader-nav-arrow reader-nav-next" data-action="reader-next" aria-label="Próxima página" title="Próxima página (→)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>
    </div>`;
  requestAnimationFrame(() => {
    renderCurrentPdfPage().catch(err => console.error('Erro ao renderizar página:', err));
  });
  setupReaderSwipe();
}

function setupReaderSwipe() {
  const container = document.getElementById('reader-container');
  if (!container) return;

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!currentPdf || !e.changedTouches.length) return;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startTime;

    if (dt > 500) return;
    if (Math.abs(dx) < 60) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (container.scrollWidth > container.clientWidth + 4) return;

    if (dx < 0) {
      readerGoTo(1);
    } else {
      readerGoTo(-1);
    }
  }, { passive: true });
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

  const off = document.createElement('canvas');
  off.width = Math.round(viewport.width * dpr);
  off.height = Math.round(viewport.height * dpr);
  const offCtx = off.getContext('2d');
  offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  try {
    await page.render({ canvasContext: offCtx, viewport }).promise;
  } catch (e) {
    console.error(e);
    return;
  }
  if (myToken !== pdfRenderToken) return;

  canvas.width = off.width;
  canvas.height = off.height;
  canvas.style.width = viewport.width + 'px';
  canvas.style.height = viewport.height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.drawImage(off, 0, 0);

  const info = document.getElementById('reader-page-info');
  if (info) info.textContent = `${currentPdfPage} / ${currentPdf.numPages}`;
  document.querySelectorAll('[data-action="reader-prev"]').forEach(b => {
    b.disabled = currentPdfPage <= 1;
  });
  document.querySelectorAll('[data-action="reader-next"]').forEach(b => {
    b.disabled = currentPdfPage >= currentPdf.numPages;
  });
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
  if (state.view !== 'reader' || !currentPdf || !currentPdfFit) return;
  clearTimeout(_readerResizeTimer);
  _readerResizeTimer = setTimeout(() => {
    if (state.view === 'reader' && currentPdf && currentPdfFit) {
      renderCurrentPdfPage().catch(err => console.error(err));
    }
  }, 150);
});