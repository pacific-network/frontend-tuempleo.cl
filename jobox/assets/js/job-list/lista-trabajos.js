// =================== job-list (logeados) ===================
// Requiere window.BASE_URL_API definido (assets/js/config/config.js)

(function () {
  const API = `${window.BASE_URL_API}/ofertas`;

  // Umbrales y tamaños "seguros" para la API (evitar 400 por take grande)
  const FILL_THRESHOLD = 10;  // si hay >=10 filtrados, mostramos solo esos
  const FILL_TARGET    = 15;  // si hay <10, completamos hasta 15
  const TAKE_SAFE      = 50;  // tamaño de página seguro para peticiones filtradas

  const STATE = {
    page: 1,
    take: 10,                 // usado para escenario SIN filtros (paginado normal)
    q: '',
    q_raw: '',
    region: '',
    categoria: '',
    modalidad: [],
    salarioMin: undefined,
    salarioMax: undefined,
    posted: 'todos',
    sortBy: 'fecha_publicacion',
    order: 'DESC',
  };

  // UI (checkbox values 3..7) -> códigos API (1..5)
  const UI_TO_API_MODALIDAD = { '3': '5', '4': '2', '5': '1', '6': '4', '7': '3' };
  const MOD_LABEL = { '1': 'Full Time', '2': 'Part Time', '3': 'Remoto', '4': 'Freelance', '5': 'Híbrido' };

  // ---------- Helpers ----------
  const isBlank = (v) =>
    v == null ||
    v === '' ||
    v === '0' ||
    v === 'Ubicación' ||
    v === 'Categoría' ||
    v === 'null' ||
    v === 'undefined';

  const hasAnyFilter = () =>
    !!(STATE.q ||
       (!isBlank(STATE.region) && STATE.region) ||
       (!isBlank(STATE.categoria) && STATE.categoria) ||
       (STATE.modalidad && STATE.modalidad.length) ||
       STATE.salarioMin !== undefined ||
       STATE.salarioMax !== undefined ||
       (STATE.posted && STATE.posted !== 'todos'));

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
      if (Array.isArray(v)) q.append(k, v.join(','));
      else q.append(k, String(v));
    });
    // cache-buster
    q.append('_', Date.now());
    return q.toString();
  }
  function buildUrl(params) {
    const qs = buildQuery(params || {});
    return qs ? `${API}?${qs}` : `${API}?_=${Date.now()}`;
  }
  function safeParse(jsonStr) { try { return JSON.parse(jsonStr || '{}'); } catch { return {}; } }

  // Búsqueda flexible (quitar acentos + stem sencillo)
  function normalizeEs(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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
  function normalizeAndStem(input) {
    const tokens = normalizeEs(input).split(/[\s,;]+/).filter(Boolean);
    const stemmed = tokens.map(stemEs).filter(t => t.length >= 3);
    return stemmed.length ? stemmed.join(' ') : normalizeEs(input);
  }

  // ---------- Reset de filtros UI (para refresh) ----------
  function clearFiltersUI() {
    try {
      const kw = document.getElementById('input-keyword');
      if (kw) kw.value = '';

      const regionSel = document.getElementById('region-select');
      if (regionSel) regionSel.value = ''; // nunca "0"

      const catSel = document.getElementById('categoria-select');
      if (catSel) catSel.value = ''; // nunca "0"

      document.querySelectorAll('input[name="job-type"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('input[name="job-posted"]').forEach(cb => cb.checked = false);

      const $slider = window.jQuery ? window.jQuery('#price-range1') : null; // usa el ID real
      if ($slider && typeof $slider.slider === 'function' && $slider.length) {
        const min = $slider.slider('option', 'min') ?? 0;
        const max = $slider.slider('option', 'max') ?? 3000000;
        try { $slider.slider('values', [min, max]); } catch {}
        const out = document.getElementById('priceRange1');
        if (out) out.value = `${min} - ${max}`;
      }
    } catch (_) {}
  }

  // ---------- Leer filtros UI ----------
  function readFiltersFromUI() {
    const kw = document.getElementById('input-keyword');
    const raw = kw?.value?.trim() || '';
    STATE.q_raw = raw;
    STATE.q = raw ? normalizeAndStem(raw) : '';

    const regionSel = document.getElementById('region-select');
    const regionVal = (regionSel?.value || '').trim();
    STATE.region = isBlank(regionVal) ? '' : regionVal;

    const catSel = document.getElementById('categoria-select');
    const catVal = (catSel?.value || '').trim();
    STATE.categoria = isBlank(catVal) ? '' : catVal;

    const checks = Array.from(document.querySelectorAll('input[name="job-type"]:checked'));
    STATE.modalidad = checks.map(ch => UI_TO_API_MODALIDAD[ch.value]).filter(Boolean);

    const postedCheck = document.querySelector('input[name="job-posted"]:checked');
    if (postedCheck) {
      const mapPosted = { '1': 'todos', '2': '7d', '3': '24h', '4': '7d', '5': '30d', '6': '60d' };
      STATE.posted = mapPosted[postedCheck.value] || 'todos';
    } else {
      STATE.posted = 'todos';
    }

    const $slider = window.jQuery ? window.jQuery('#price-range1') : null;
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

  // ---------- Render ----------
  function renderOfertas(ofertas) {
    const cont = document.getElementById('ofertas-container');
    if (!cont) return;
    cont.innerHTML = '';

    if (!ofertas || ofertas.length === 0) {
      cont.innerHTML = `<p class="text-center">No hay resultados con esos filtros.</p>`;
      return;
    }
    ofertas.forEach(oferta => {
      const data = safeParse(oferta.data);
      const herramientas = (data.herramientas_basicas || []).map(h => `<a><span>${h}</span></a>`).join('');
      const modalidadLegible = formatModalidad(data.modalidad);
      const detailUrl = `job-single-2-si.html?id=${oferta.id}`;

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

  function renderPagination(meta) {
    const pag = document.querySelector('.pagination');
    const showing = document.querySelector('.pagination-showing p');
    if (!pag) return;

    const total = meta?.itemCount ?? meta?.total ?? 0;
    const page = meta?.page ?? STATE.page;
    const take = meta?.take ?? STATE.take;
    const pages = Math.max(1, Math.ceil(total / take));

    pag.innerHTML = '';

    if (pages <= 1) {
      if (showing) {
        const start = total ? 1 : 0;
        const end = total;
        showing.textContent = total ? `Mostrando ${start} - ${end} de ${total} empleos` : 'Sin resultados';
      }
      return;
    }

    const prev = document.createElement('li');
    prev.className = 'page-item' + (page <= 1 ? ' disabled' : '');
    prev.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><i class="far fa-angle-double-left"></i></a>`;
    prev.onclick = (e) => { e.preventDefault(); if (page > 1) { STATE.page = page - 1; loadOfertas(); } };
    pag.appendChild(prev);

    for (let p = 1; p <= pages && p <= 5; p++) {
      const li = document.createElement('li');
      li.className = 'page-item' + (p === page ? ' active' : '');
      li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
      li.onclick = (e) => { e.preventDefault(); STATE.page = p; loadOfertas(); };
      pag.appendChild(li);
    }

    const next = document.createElement('li');
    next.className = 'page-item' + (page >= pages ? ' disabled' : '');
    next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><i class="far fa-angle-double-right"></i></a>`;
    next.onclick = (e) => { e.preventDefault(); if (page < pages) { STATE.page = page + 1; loadOfertas(); } };
    pag.appendChild(next);

    if (showing) {
      const start = total ? (page - 1) * take + 1 : 0;
      const end = Math.min(page * take, total);
      showing.textContent = total ? `Mostrando ${start} - ${end} de ${total} empleos` : 'Sin resultados';
    }
  }

  // ---------- Fetch helpers ----------
  async function fetchJson(url, token) {
    const res = await fetch(url, {
      mode: 'cors',
      cache: 'no-store',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Parámetros filtrados listos para URL
  function filteredParams(take, page) {
    return {
      page,
      take,
      q: STATE.q || undefined,
      region: isBlank(STATE.region) ? undefined : STATE.region,
      categoria: isBlank(STATE.categoria) ? undefined : STATE.categoria,
      area_trabajo: isBlank(STATE.categoria) ? undefined : STATE.categoria, // alias
      modalidad: (STATE.modalidad && STATE.modalidad.length ? STATE.modalidad : undefined),
      salarioMin: STATE.salarioMin,
      salarioMax: STATE.salarioMax,
      sortBy: STATE.sortBy,
      order: STATE.order,
      posted: STATE.posted && STATE.posted !== 'todos' ? STATE.posted : undefined
    };
  }

  async function fetchFilteredPage(take, page, token) {
    const url = buildUrl(filteredParams(take, page));
    const json = await fetchJson(url, token);
    return {
      items: json.data || json.items || [],
      meta: json.meta || json.pagination || {}
    };
  }

  // Trae todos los filtrados paginando en lotes de TAKE_SAFE
  async function fetchAllFilteredPaged(token) {
    // Página 1 con TAKE_SAFE
    const first = await fetchFilteredPage(TAKE_SAFE, 1, token);
    const total = first.meta?.total ?? first.meta?.itemCount ?? first.items.length;

    // Si con la primera página ya tenemos todo, devolvemos
    if (first.items.length >= total) {
      return first.items;
    }

    const pages = Math.ceil(total / TAKE_SAFE);
    const all = [...first.items];

    for (let p = 2; p <= pages; p++) {
      const { items } = await fetchFilteredPage(TAKE_SAFE, p, token);
      all.push(...items);
      if (all.length >= total) break;
    }
    return all.slice(0, total);
  }

  // Trae empleos “cualquiera” (sin filtros) para rellenar
  async function fetchFillers(token, howMany, excludeIds = new Set()) {
    const params = {
      page: 1,
      take: Math.max(howMany * 2, howMany),
      sortBy: STATE.sortBy,
      order: STATE.order
    };
    const url = buildUrl(params);
    const json = await fetchJson(url, token);
    const base = (json.data || json.items || []);
    const filtered = base.filter(j => !excludeIds.has(j.id)).slice(0, howMany);
    return filtered;
  }

  // ---------- Carga principal ----------
  async function loadOfertas(firstLoad = false) {
    const token = localStorage.getItem('token');
    const cont = document.getElementById('ofertas-container');

    try {
      if (hasAnyFilter()) {
        // 1) Hay filtros activos: página 1 con TAKE_SAFE para saber el total
        const first = await fetchFilteredPage(TAKE_SAFE, 1, token);
        const total = first.meta?.total ?? first.meta?.itemCount ?? first.items.length;

        if (total >= FILL_THRESHOLD) {
          // A) >=10 ⇒ traer todos los filtrados y mostrar SOLO esos
          const allFiltered = (first.items.length >= total)
            ? first.items
            : await fetchAllFilteredPaged(token);
          renderOfertas(allFiltered);
          renderPagination({ itemCount: allFiltered.length, page: 1, take: allFiltered.length });
          return;
        } else {
          // B) <10 ⇒ usar los filtrados y rellenar hasta 15
          const filtered = first.items.slice(0, total); // total ya es todo
          const need = Math.max(0, FILL_TARGET - filtered.length);
          const exclude = new Set(filtered.map(o => o.id));
          const fillers = need > 0 ? await fetchFillers(token, need, exclude) : [];
          const combined = [...filtered, ...fillers];
          renderOfertas(combined);
          renderPagination({ itemCount: combined.length, page: 1, take: combined.length });
          return;
        }
      }

      // 2) SIN filtros: comportamiento normal (paginado)
      const baseParams = {
        page: STATE.page,
        take: STATE.take,
        sortBy: STATE.sortBy,
        order: STATE.order,
        posted: 'todos'
      };
      const url = buildUrl(baseParams);
      let json;

      try {
        json = await fetchJson(url, token);
      } catch (e) {
        // Fallback si la API no acepta posted=todos
        const fallbackUrl = buildUrl({
          page: STATE.page,
          take: STATE.take,
          sortBy: STATE.sortBy,
          order: STATE.order
        });
        json = await fetchJson(fallbackUrl, token);
      }

      const ofertas = json.data || json.items || [];
      const meta = json.meta || json.pagination || {};
      renderOfertas(ofertas);
      renderPagination(meta);

    } catch (err) {
      console.error('❌ Error cargando ofertas:', err);
      if (cont) cont.innerHTML = `<p class="text-danger text-center">No se pudieron cargar las ofertas.</p>`;
      renderPagination({ itemCount: 0, page: 1, take: 1 });
    }
  }

  // ---------- Eventos ----------
  function wireUI() {
    // “Job posted” (exclusivo)
    document.querySelectorAll('input[name="job-posted"]').forEach(ch => {
      ch.addEventListener('change', () => {
        if (ch.checked) {
          document.querySelectorAll('input[name="job-posted"]').forEach(o => { if (o !== ch) o.checked = false; });
          readFiltersFromUI();
          STATE.page = 1;
          loadOfertas();
        }
      });
    });

    // Categoría
    const catSel = document.getElementById('categoria-select');
    if (catSel) {
      catSel.addEventListener('change', () => {
        readFiltersFromUI();
        STATE.page = 1;
        loadOfertas();
      });
    }

    // Región
    const regionSel = document.getElementById('region-select');
    if (regionSel) {
      regionSel.addEventListener('change', () => {
        readFiltersFromUI();
        STATE.page = 1;
        loadOfertas();
      });
    }

    // Submit formulario top
    const form = document.getElementById('form-busqueda');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        readFiltersFromUI();
        STATE.page = 1;
        loadOfertas();
      });
    }

    // Enter en keyword
    const kw = document.getElementById('input-keyword');
    if (kw) {
      kw.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          readFiltersFromUI();
          STATE.page = 1;
          loadOfertas();
        }
      });
    }

    // Botón lateral “Aplicar filtro”
    window.aplicarFiltro = function () {
      readFiltersFromUI();
      STATE.page = 1;
      loadOfertas();
    };
  }

  // ---------- Primera carga ----------
  document.addEventListener('DOMContentLoaded', () => {
    clearFiltersUI();     // resetea UI
    wireUI();
    // Primera carga: sin filtros => lista normal
    loadOfertas(true);
  });
})();
