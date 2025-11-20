// =================== job-list-2 (no logeado) ===================
// Requiere window.BASE_URL_API definido globalmente

(function () {

  // ================== CONFIG GLOBAL ==================
  window.__JOBLIST_ADVANCED__ = true;
  const API = `${window.BASE_URL_API}/ofertas`;

  // ================== ESTADO ==================
  const STATE = {
    page: 1,
    take: 10,
    q: '',
    q_raw: '',
    region: '',
    categoria: '',
    modalidad: [],          // presencial | remoto | hibrido
    tipo_contrato: [],      // plazo_fijo | indefinido | temporal | reemplazo | practica
    salarioMin: undefined,
    salarioMax: undefined,
    posted: 'todos',
    sortBy: 'fecha_publicacion',
    order: 'DESC'
  };

  const MOD_LABEL = {
    hibrido: "Híbrido",
    presencial: "Presencial",
    remoto: "Remoto"
  };

  // ================== POPUP ==================
  const ApplyingUI = (() => {
    let el = null;

    function inject() {
      if (document.getElementById('applying-style')) return;

      const style = document.createElement('style');
      style.id = 'applying-style';
      style.textContent = `
        #applying-popup {
          position: fixed;
          right: 20px;
          top: 20px;
          padding: 10px 14px;
          background: rgba(0,0,0,.85);
          color: white;
          border-radius: 8px;
          display: none;
          z-index: 9999;
          font-size: .9rem;
          gap: .5rem;
          align-items: center;
        }
        #applying-popup .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }

    function ensure() {
      if (el) return el;
      inject();
      el = document.createElement('div');
      el.id = 'applying-popup';
      el.innerHTML = `<span class="spinner"></span> <span class="text"></span>`;
      document.body.appendChild(el);
      return el;
    }

    function show(text = "Aplicando filtros…") {
      const e = ensure();
      e.querySelector('.text').textContent = text;
      e.style.display = 'flex';
    }

    function hide() {
      if (el) el.style.display = 'none';
    }

    return { show, hide };
  })();

  // ================== HELPERS ==================
  const isBlank = v =>
    v == null || v === '' || v === '0' || v === 'Ubicación' || v === 'Categoría';

  const safeParse = str => {
    try { return JSON.parse(str || '{}'); }
    catch { return {}; }
  };

  const formatModalidad = m => MOD_LABEL[m] || 'No especificado';

  const formatRango = r => {
    if (!r?.desde || !r?.hasta) return "No disponible";
    return `$${parseInt(r.desde).toLocaleString('es-CL')} - $${parseInt(r.hasta).toLocaleString('es-CL')}`;
  };

  const diasDesde = fechaStr => {
    if (!fechaStr) return "Sin fecha";
    const hoy = new Date();
    const fecha = new Date(fechaStr);
    const dif = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return dif === 0 ? "Hoy" : dif === 1 ? "Ayer" : `Hace ${dif} días`;
  };

  // Normalizador buscador
  const normalizeEs = s =>
    (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function stemEs(w) {
    w = normalizeEs(w);
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
    const stemmed = tokens.map(stemEs).filter(x => x.length >= 3);
    return stemmed.length ? stemmed.join(' ') : normalizeEs(input);
  }

  // ================== READ FILTERS ==================
  function readFiltersFromUI() {
    const kw = document.getElementById("input-keyword")?.value.trim() || "";
    STATE.q_raw = kw;
    STATE.q = kw ? mixtoQuery(kw) : "";

    STATE.region = document.getElementById("region-select")?.value || "";
    STATE.categoria = document.getElementById("categoria-select")?.value || "";

    STATE.modalidad = [...document.querySelectorAll('input[name="modalidad"]:checked')].map(x => x.value);

    STATE.tipo_contrato = [...document.querySelectorAll('input[name="tipo-contrato"]:checked')]
      .map(x => x.value);

    const posted = document.querySelector('input[name="job-posted"]:checked')?.value;
    const mapPosted = { '1': 'todos', '2': '7d', '3': '24h', '5': '30d' };
    STATE.posted = mapPosted[posted] || "todos";

    // Sueldo (si usas slider)
    try {
      const $slider = window.jQuery && window.jQuery('.price-range');
      if ($slider && $slider.length) {
        STATE.salarioMin = $slider.slider('values', 0);
        STATE.salarioMax = $slider.slider('values', 1);
      }
    } catch (_) {}
  }

  // ================== ARMADOR URL ==================
  function filteredParams(take, page) {
    return {
      page,
      take,
      q: STATE.q || undefined,
      region: isBlank(STATE.region) ? undefined : STATE.region,
      categoria: isBlank(STATE.categoria) ? undefined : STATE.categoria,

      modalidad: STATE.modalidad.length ? STATE.modalidad.join(',') : undefined,
      tipo_contrato: STATE.tipo_contrato.length ? STATE.tipo_contrato.join(',') : undefined,

      salarioMin: STATE.salarioMin,
      salarioMax: STATE.salarioMax,

      posted: STATE.posted !== 'todos' ? STATE.posted : undefined,
      sortBy: STATE.sortBy,
      order: STATE.order,

      _: Date.now()
    };
  }

  function buildUrl(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, v);
    });
    return `${API}?${q.toString()}`;
  }

  async function fetchJson(url, signal) {
    const r = await fetch(url, {
      mode: "cors",
      cache: "no-store",
      signal,
      headers: { "Accept": "application/json" }
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  // ================== RENDER ==================
  function renderOfertas(list) {
    const cont = document.getElementById("ofertas-container");
    cont.innerHTML = "";

    if (!list.length) {
      cont.innerHTML = `<p class="text-center text-muted py-4">Sin resultados.</p>`;
      return;
    }

    list.forEach(o => {
      const d = safeParse(o.data);
      const url = `job-single-2.html?id=${o.id}`;

      cont.insertAdjacentHTML("beforeend", `
        <div class="col-lg-12">
          <div class="job-item" onclick="location.href='${url}'" style="cursor:pointer;">
            <div class="job-img">
              <img src="assets/img/job/01.jpg" alt="">
            </div>

            <div class="job-content">
              <h5>${o.titulo}</h5>
              <span class="job-employer"><i class="far fa-building"></i> ${o.empresa?.nombre_fantasia}</span>

              <ul class="job-info-list">
                <li><i class="fe-briefcase"></i> ${d.area_trabajo || "Sin categoría"}</li>
                <li><i class="fe-check-circle"></i> ${formatModalidad(d.modalidad)}</li>
                <li><i class="fe-clock"></i> ${diasDesde(o.fecha_publicacion)}</li>
                <li><i class="fe-dollar-sign"></i> ${formatRango(d.renta_salarial)}</li>
                <li><i class="fe-map-pin"></i> ${o.empleador?.data?.region || "Región no disponible"}</li>
              </ul>
            </div>
          </div>
        </div>
      `);
    });
  }

  function renderPagination(meta) {
    const pagUl = document.querySelector('.pagination');
    const showing = document.querySelector('.pagination-showing p');
    if (!pagUl) return;

    pagUl.innerHTML = '';

    const total = meta.total || meta.itemCount || 0;
    const page = meta.page || STATE.page;
    const take = meta.take || STATE.take;
    const pages = Math.max(1, Math.ceil(total / take));

    if (showing) {
      const start = total ? ((page - 1) * take + 1) : 0;
      const end = Math.min(page * take, total);
      showing.textContent = total ? `Mostrando ${start} - ${end} de ${total}` : "Sin resultados";
    }

    if (pages <= 1) return;

    // Prev
    const prev = document.createElement('li');
    prev.className = `page-item ${page <= 1 ? "disabled" : ""}`;
    prev.innerHTML = `<a class="page-link" href="#"><i class="far fa-angle-double-left"></i></a>`;
    prev.onclick = e => {
      e.preventDefault();
      if (page > 1) {
        STATE.page--;
        scheduleLoad(300);
      }
    };
    pagUl.appendChild(prev);

    // Pages
    for (let p = 1; p <= pages && p <= 5; p++) {
      const li = document.createElement("li");
      li.className = `page-item ${p === page ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
      li.onclick = e => {
        e.preventDefault();
        STATE.page = p;
        scheduleLoad(300);
      };
      pagUl.appendChild(li);
    }

    // Next
    const next = document.createElement('li');
    next.className = `page-item ${page >= pages ? "disabled" : ""}`;
    next.innerHTML = `<a class="page-link" href="#"><i class="far fa-angle-double-right"></i></a>`;
    next.onclick = e => {
      e.preventDefault();
      if (page < pages) {
        STATE.page++;
        scheduleLoad(300);
      }
    };
    pagUl.appendChild(next);
  }

  // ================== LOAD PRINCIPAL ==================
  async function loadOfertas(signal) {
    const params = filteredParams(STATE.take, STATE.page);
    const url = buildUrl(params);

    console.log("🔍 URL backend:", url);

    let json;
    try {
      json = await fetchJson(url, signal);
    } catch (e) {
      console.error("❌ Error cargando", e);
      document.getElementById('ofertas-container').innerHTML =
        `<p class="text-center text-danger">Error cargando resultados.</p>`;
      return;
    }

    const items = json.data || json.items || [];
    const meta = json.meta || json.pagination || {};

    renderOfertas(items);
    renderPagination(meta);
  }

  // ================== DEBOUNCE ==================
  let APPLY_TIMER = null;
  let INFLIGHT = null;

  function scheduleLoad(delay = 500) {
    ApplyingUI.show();

    if (APPLY_TIMER) clearTimeout(APPLY_TIMER);
    if (INFLIGHT) try { INFLIGHT.abort(); } catch {}

    APPLY_TIMER = setTimeout(async () => {
      APPLY_TIMER = null;

      const ctrl = new AbortController();
      INFLIGHT = ctrl;

      try {
        await loadOfertas(ctrl.signal);
      } finally {
        ApplyingUI.hide();
        INFLIGHT = null;
      }

    }, delay);
  }

  // ================== EVENTOS UI ==================
  document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('input[name="job-posted"]').forEach(ch => {
      ch.addEventListener('change', () => {
        if (ch.checked) {
          document.querySelectorAll('input[name="job-posted"]').forEach(o => {
            if (o !== ch) o.checked = false;
          });
        }
        aplicarFiltro();
      });
    });

    document.getElementById('categoria-select')?.addEventListener('change', aplicarFiltro);
    document.getElementById('region-select')?.addEventListener('change', aplicarFiltro);

    document.querySelectorAll('input[name="modalidad"]').forEach(cb =>
      cb.addEventListener('change', aplicarFiltro)
    );

    document.querySelectorAll('input[name="tipo-contrato"]').forEach(cb =>
      cb.addEventListener('change', aplicarFiltro)
    );

    document.getElementById('input-keyword')?.addEventListener('keydown', e => {
      if (e.key === "Enter") {
        e.preventDefault();
        aplicarFiltro();
      }
    });

    document.getElementById("form-busqueda")?.addEventListener("submit", e => {
      e.preventDefault();
      aplicarFiltro();
    });

    const clearBtn = document.getElementById("clear-keyword");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        document.getElementById("input-keyword").value = "";
        aplicarFiltro();
      });
    }

    readFiltersFromUI();
    ApplyingUI.show("Cargando ofertas…");

    loadOfertas().finally(() => ApplyingUI.hide());
  });

  // ================== EXPOSE ==================
  window.aplicarFiltro = function () {
    readFiltersFromUI();
    STATE.page = 1;
    scheduleLoad(400);
  };

})();
