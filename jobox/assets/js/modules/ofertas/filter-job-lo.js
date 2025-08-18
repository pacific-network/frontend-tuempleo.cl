// =================== job-list-2 (no logeado) ===================
// Requiere BASE_URL_API definido globalmente (p. ej. window.BASE_URL_API)

(function () {
  // Señalamos que el script avanzado está activo (para evitar doble carga con lista-trabajos-lo.js)
  window.__JOBLIST_ADVANCED__ = true;

  const API = `${BASE_URL_API}/ofertas`;

  const STATE = {
    page: 1,
    take: 10,
    q: '',
    q_raw: '',            // guardamos lo que escribió el usuario
    region: '',
    categoria: '',
    modalidad: [],
    salarioMin: undefined,
    salarioMax: undefined,
    posted: 'todos',
    sortBy: 'fecha_publicacion',
    order: 'DESC'
  };

  // Mapeo de UI (checkbox values 3..7) -> códigos API (1..5)
  const UI_TO_API_MODALIDAD = { '3': '5', '4': '2', '5': '1', '6': '4', '7': '3' };
  const MOD_LABEL = { '1': 'Full Time', '2': 'Part Time', '3': 'Remoto', '4': 'Freelance', '5': 'Híbrido' };

  // ---------------- Popup "Aplicando filtros..." ----------------
  const ApplyingUI = (() => {
    let el = null;
    let styleInjected = false;

    function injectStyle() {
      if (styleInjected) return;
      const css = `
#applying-popup{
  position:fixed; right:20px; top:20px; z-index:9999;
  display:none; align-items:center; gap:.6rem;
  background:rgba(0,0,0,.85); color:#fff; padding:.6rem .9rem;
  border-radius:.6rem; box-shadow:0 6px 20px rgba(0,0,0,.25); font-size:.95rem
}
#applying-popup .spinner{
  width:16px; height:16px; border:2px solid #fff; border-top-color:transparent;
  border-radius:50%; animation:spin .8s linear infinite
}
@keyframes spin { to { transform: rotate(360deg); } }
`;
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
      styleInjected = true;
    }

    function ensureEl() {
      if (el) return el;
      injectStyle();
      el = document.createElement('div');
      el.id = 'applying-popup';
      el.innerHTML = `<span class="spinner"></span><span class="text"></span>`;
      document.body.appendChild(el);
      return el;
    }

    function show(text = 'Aplicando filtros…') {
      const node = ensureEl();
      node.querySelector('.text').textContent = text;
      node.style.display = 'flex';
    }

    function hide() {
      if (!el) return;
      el.style.display = 'none';
    }

    return { show, hide };
  })();

  // ---------------- Helpers ----------------
  function formatModalidad(code) { return MOD_LABEL[String(code)] || 'No especificado'; }
  function formatFecha(fechaStr) {
    if (!fechaStr) return 'Sin fecha';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-CL');
  }
  function formatRango(renta) {
    if (!renta?.desde || !renta?.hasta) return 'No disponible';
    return `$${parseInt(renta.desde).toLocaleString('es-CL')} - $${parseInt(renta.hasta).toLocaleString('es-CL')}`;
  }
  function diasDesde(fechaStr) {
    if (!fechaStr) return 'Fecha desconocida';
    const hoy = new Date();
    const fecha = new Date(fechaStr);
    const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`;
  }
  function buildQuery(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return;
      // No enviar "posted=todos" para evitar ruido en la API
      if (k === 'posted' && v === 'todos') return;
      if (Array.isArray(v)) q.append(k, v.join(','));
      else q.append(k, String(v));
    });
    return q.toString();
  }
  function safeParse(jsonStr) { try { return JSON.parse(jsonStr || '{}'); } catch { return {}; } }

  // --- Normalización y “stemming” suave en español para la keyword ---
  function normalizeEs(s) {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
      .toLowerCase();
  }
  function stemEs(word) {
    const w = normalizeEs(word);
    return w
      .replace(/(iciones|aciones|uciones)$/i, '')
      .replace(/(icion|acion|ucion|sion|cion)$/i, '')
      .replace(/(istas|icos|icas|mente|idades)$/i, '')
      .replace(/(ista|ico|ica|idad)$/i, '')
      .replace(/(os|as|es)$/i, '')
      .replace(/(o|a)$/i, '');
  }
  function mixtoQuery(input) {
    const tokens = normalizeEs(input).split(/[\s,;]+/).filter(Boolean);
    const stemmed = tokens.map(stemEs).filter(t => t.length >= 3);
    return stemmed.length ? stemmed.join(' ') : normalizeEs(input);
  }

  // ---------------- Reset de filtros UI en refresh ----------------
  function clearFiltersUI() {
    try {
      const kw = document.getElementById('input-keyword');
      if (kw) kw.value = '';

      const regionSel = document.getElementById('region-select');
      if (regionSel) regionSel.value = '';

      const catSel = document.getElementById('categoria-select');
      if (catSel) catSel.value = '';

      document.querySelectorAll('input[name="job-type"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="job-posted"]').forEach(cb => cb.checked = false);

      // Slider jQuery UI (si existe)
      const $slider = window.jQuery ? window.jQuery('.price-range') : null;
      if ($slider && typeof $slider.slider === 'function' && $slider.length) {
        const min = $slider.slider('option', 'min') ?? 0;
        const max = $slider.slider('option', 'max') ?? 3000000;
        try { $slider.slider('values', [min, max]); } catch {}
        const out = document.getElementById('priceRange1');
        if (out) out.value = `${min} - ${max}`;
      }
    } catch (_) {}
  }

  // ---------------- Últimas búsquedas ----------------
  const BUSQ_KEY = 'ultimasBusquedas';
  function pushBusqueda(term) {
    if (!term) return;
    const raw = localStorage.getItem(BUSQ_KEY);
    let arr = [];
    try { arr = raw ? JSON.parse(raw) : []; } catch {}
    arr = [term, ...arr.filter(x => x !== term)].slice(0, 5);
    localStorage.setItem(BUSQ_KEY, JSON.stringify(arr));
    renderUltimasBusquedas(arr);
  }
  function renderUltimasBusquedas(arr) {
    const ul = document.getElementById('lista-busquedas');
    if (!ul) return;
    ul.innerHTML = '';
    (arr || []).forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" class="text-decoration-none">${t}</a>`;
      li.querySelector('a').onclick = (e) => {
        e.preventDefault();
        const input = document.getElementById('input-keyword');
        if (input) input.value = t;
        STATE.q_raw = t;
        STATE.q = mixtoQuery(t);
        STATE.page = 1;
        scheduleLoad(400);
      };
      ul.appendChild(li);
    });
  }

  // ---------------- Leer filtros desde UI ----------------
  function readFiltersFromUI() {
    const kw = document.getElementById('input-keyword');
    const raw = kw?.value?.trim() || '';
    STATE.q_raw = raw;
    STATE.q = raw ? mixtoQuery(raw) : '';

    const regionSel = document.getElementById('region-select');
    STATE.region = (regionSel?.value || '').trim();

    const catSel = document.getElementById('categoria-select');
    STATE.categoria = (catSel?.value || '').trim();

    // Modalidad: checkboxes -> códigos API
    const checks = Array.from(document.querySelectorAll('input[name="job-type"]:checked'));
    STATE.modalidad = checks.map(ch => UI_TO_API_MODALIDAD[ch.value]).filter(Boolean);

    // Publicados: selección única
    const postedCheck = document.querySelector('input[name="job-posted"]:checked');
    if (postedCheck) {
      const mapPosted = { '1': 'todos', '2': '7d', '3': '24h', '4': '7d', '5': '30d', '6': '60d' };
      STATE.posted = mapPosted[postedCheck.value] || 'todos';
    } else {
      STATE.posted = 'todos';
    }

    // Salario: jQuery UI slider
    const $slider = window.jQuery ? window.jQuery('.price-range') : null;
    if ($slider && typeof $slider.slider === 'function' && $slider.length) {
      const maxVal = $slider.slider('option', 'max') ?? 3000000;
      let min = $slider.slider('values', 0);
      let max = $slider.slider('values', 1);
      min = Number.isFinite(min) ? Math.round(min) : undefined;
      max = Number.isFinite(max) ? Math.round(max) : undefined;
      STATE.salarioMin = min;
      STATE.salarioMax = (max !== undefined && max < maxVal) ? max : undefined;
    } else {
      STATE.salarioMin = undefined;
      STATE.salarioMax = undefined;
    }
  }

  // ---------------- Render de tarjetas ----------------
  function renderOfertas(ofertas) {
    const cont = document.getElementById('ofertas-container');
    cont.innerHTML = '';

    if (!ofertas || ofertas.length === 0) {
      cont.innerHTML = `<p class="text-center">No hay resultados con esos filtros.</p>`;
      return;
    }

    ofertas.forEach(oferta => {
      const data = safeParse(oferta.data);
      const herramientas = (data.herramientas_basicas || []).map(h => `<a><span>${h}</span></a>`).join('');
      const modalidadLegible = formatModalidad(data.modalidad);
      const detailUrl = `job-single-2.html?id=${oferta.id}`;

      cont.insertAdjacentHTML('beforeend', `
        <div class="col-lg-12" id="oferta-${oferta.id}">
          <div class="job-item" data-id="${oferta.id}" onclick="window.location.href='${detailUrl}'" style="cursor: pointer;">
            <div class="job-img"><img src="assets/img/job/01.jpg" alt=""></div>
            <div class="job-content">
              <div class="job-top">
                <div class="job-title">
                  <h5>${oferta.titulo}</h5>
                  <span class="job-employer"><i class="far fa-building"></i> ${oferta.empresa?.nombre_fantasia || 'Empresa'}</span>
                </div>
              </div>
              <ul class="job-info-list">
                <li><i class="fe-briefcase"></i> ${data.area_trabajo || 'Área no especificada'}</li>
                <li><i class="fe-check-circle"></i> ${modalidadLegible}</li>
                <li><i class="fe-clock"></i> ${diasDesde(oferta.fecha_publicacion)}</li>
                <li><i class="fas fa-timer"></i> Exp: ${formatFecha(oferta.fecha_cierre)}</li>
                <li><i class="fe-dollar-sign"></i> Salario: ${formatRango(data.renta_salarial)}</li>
                <li><i class="fe-map-pin"></i> ${oferta.empleador?.data?.region || 'Región no disponible'}</li>
              </ul>
              <div class="job-skill">${herramientas}</div>
            </div>
          </div>
        </div>
      `);
    });
  }

  // ---------------- Paginación ----------------
  function renderPagination(meta) {
    const pag = document.querySelector('.pagination');
    const showing = document.querySelector('.pagination-showing p');
    if (!pag) return;

    const total = meta?.itemCount ?? meta?.total ?? 0;
    const page = meta?.page ?? STATE.page;
    const take = meta?.take ?? STATE.take;
    const pages = Math.max(1, Math.ceil(total / take));

    pag.innerHTML = '';

    const prev = document.createElement('li');
    prev.className = 'page-item' + (page <= 1 ? ' disabled' : '');
    prev.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><i class="far fa-angle-double-left"></i></a>`;
    prev.onclick = (e) => { e.preventDefault(); if (page > 1) { STATE.page = page - 1; scheduleLoad(300); } };
    pag.appendChild(prev);

    for (let p = 1; p <= pages && p <= 5; p++) {
      const li = document.createElement('li');
      li.className = 'page-item' + (p === page ? ' active' : '');
      li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
      li.onclick = (e) => { e.preventDefault(); STATE.page = p; scheduleLoad(300); };
      pag.appendChild(li);
    }

    const next = document.createElement('li');
    next.className = 'page-item' + (page >= pages ? ' disabled' : '');
    next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><i class="far fa-angle-double-right"></i></a>`;
    next.onclick = (e) => { e.preventDefault(); if (page < pages) { STATE.page = page + 1; scheduleLoad(300); } };
    pag.appendChild(next);

    if (showing) {
      const start = total ? (page - 1) * take + 1 : 0;
      const end = Math.min(page * take, total);
      showing.textContent = total ? `Showing ${start} - ${end} of ${total} Jobs` : 'Sin resultados';
    }
  }

  // ---------------- Carga principal + debounce ----------------
  let APPLY_TIMER = null;
  let INFLIGHT_CTRL = null;

  function scheduleLoad(delay = 600) {
    ApplyingUI.show('Aplicando filtros…');
    if (APPLY_TIMER) clearTimeout(APPLY_TIMER);
    if (INFLIGHT_CTRL) { try { INFLIGHT_CTRL.abort(); } catch {} INFLIGHT_CTRL = null; }

    APPLY_TIMER = setTimeout(async () => {
      APPLY_TIMER = null;
      const ctrl = new AbortController();
      INFLIGHT_CTRL = ctrl;
      try {
        await loadOfertas(ctrl.signal);
      } finally {
        INFLIGHT_CTRL = null;
        ApplyingUI.hide();
      }
    }, delay);
  }

  async function loadOfertas(signal) {
    const qs = buildQuery({
      page: STATE.page,
      take: STATE.take,
      q: STATE.q,
      region: STATE.region,
      categoria: STATE.categoria,
      area_trabajo: STATE.categoria, // alias por compat
      modalidad: STATE.modalidad,
      salarioMin: STATE.salarioMin,
      salarioMax: STATE.salarioMax,
      posted: STATE.posted,
      sortBy: STATE.sortBy,
      order: STATE.order
    });

    // Si no hay filtros (qs vacío), pega al endpoint base para "todas"
    const url = qs ? `${API}?${qs}` : API;
    const cont = document.getElementById('ofertas-container');

    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const ofertas = json.data || json.items || [];
      const meta = json.meta || json.pagination || {};

      renderOfertas(ofertas);
      renderPagination(meta);

      if (STATE.q_raw) pushBusqueda(STATE.q_raw);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('❌ Error cargando ofertas:', err);
      if (cont) cont.innerHTML = `<p class="text-danger text-center">No se pudieron cargar las ofertas.</p>`;
    }
  }

  // ---------------- Eventos UI ----------------
  window.aplicarFiltro = function () {
    readFiltersFromUI();
    STATE.page = 1;
    scheduleLoad(600);
  };

  document.addEventListener('DOMContentLoaded', () => {
    // “Job posted” selección única (tipo checkbox exclusivo)
    document.querySelectorAll('input[name="job-posted"]').forEach(ch => {
      ch.addEventListener('change', () => {
        if (ch.checked) {
          document.querySelectorAll('input[name="job-posted"]').forEach(o => { if (o !== ch) o.checked = false; });
          readFiltersFromUI();
          STATE.page = 1;
          scheduleLoad(600);
        }
      });
    });

    // Cambio de categoría ⇒ NO limpiamos la keyword
    const catSel = document.getElementById('categoria-select');
    if (catSel) {
      catSel.addEventListener('change', () => {
        readFiltersFromUI();
        STATE.page = 1;
        scheduleLoad(400);
      });
    }

    // Cambio de región
    const regionSel = document.getElementById('region-select');
    if (regionSel) {
      regionSel.addEventListener('change', () => {
        readFiltersFromUI();
        STATE.page = 1;
        scheduleLoad(600);
      });
    }

    // Últimas búsquedas (solo mostrar, sin auto-aplicar)
    try { renderUltimasBusquedas(JSON.parse(localStorage.getItem(BUSQ_KEY) || '[]')); } catch {}

    // Submit del formulario superior
    const form = document.getElementById('form-busqueda');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        readFiltersFromUI();
        STATE.page = 1;
        scheduleLoad(600);
      });
    }

    // Enter en el input de keyword
    const kw = document.getElementById('input-keyword');
    if (kw) {
      kw.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          readFiltersFromUI();
          STATE.page = 1;
          scheduleLoad(600);
        }
      });
    }

    // Botón limpiar (si existe en tu HTML)
    const clearBtn = document.getElementById('clear-keyword');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const kw = document.getElementById('input-keyword');
        if (kw) kw.value = '';
        STATE.q_raw = '';
        STATE.q = '';
        STATE.page = 1;
        scheduleLoad(300);
      });
    }

    // Primera carga: reset filtros + traer TODO
    clearFiltersUI();      // ← reset UI al refrescar
    readFiltersFromUI();   // ← leer (vacío)
    ApplyingUI.show('Cargando ofertas…');
    loadOfertas().finally(() => ApplyingUI.hide());
  });
})();