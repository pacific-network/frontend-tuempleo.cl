// assets/js/job-list/lista-trabajos-lo.js

const ITEMS_POR_PAGINA = 6; // misma UI que logueados
let paginaActual = 1;
let ofertasAll = [];

/* ========== CARGA INICIAL ========== */
document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('ofertas-container');
  const ulPaginacion = document.querySelector('.pagination');
  const showingEl = document.querySelector('.pagination-showing p');

  if (!contenedor) return;

  try {
    ofertasAll = await fetchTodasLasOfertas();               // <<<<<< trae TODAS las páginas
    ofertasAll = (ofertasAll || []).filter(o => o?.es_activa);

    if (ofertasAll.length === 0) {
      contenedor.innerHTML = `<p class="text-center">No hay ofertas disponibles por el momento.</p>`;
      if (showingEl) showingEl.textContent = `Showing 0 - 0 of 0 Jobs`;
      if (ulPaginacion) ulPaginacion.innerHTML = '';
      return;
    }

    // opcional: ordenar por fecha_publicacion desc
    ofertasAll.sort((a, b) => new Date(b.fecha_publicacion || 0) - new Date(a.fecha_publicacion || 0));

    paginaActual = 1;
    renderEmpleosPagina(paginaActual);
  } catch (error) {
    console.error('❌ Error al cargar ofertas:', error);
    contenedor.innerHTML = `<p class="text-danger text-center">No se pudieron cargar las ofertas. Intenta más tarde.</p>`;
    if (ulPaginacion) ulPaginacion.innerHTML = '';
    if (showingEl) showingEl.textContent = `Showing 0 - 0 of 0 Jobs`;
  }
});

/* ========== FETCH TODAS LAS PÁGINAS DEL BACKEND ========== */
async function fetchTodasLasOfertas() {
  let page = 1;
  const take = 50; // ajusta si quieres pedir más por pag
  let todas = [];
  let tieneSiguiente = true;
  let pageCount = null;

  while (tieneSiguiente) {
    const url = `${BASE_URL_API}/ofertas?page=${page}&take=${take}`;
    const resp = await fetch(url);
    const json = await resp.json();

    const lista = Array.isArray(json) ? json : (json?.data || []);
    todas = todas.concat(lista);

    const meta = json?.meta;
    if (meta) {
      // si el backend envía meta
      tieneSiguiente = Boolean(meta.hasNextPage) && page < (meta.pageCount || page + 1);
      pageCount = meta.pageCount || pageCount;
    } else {
      // si NO hay meta asumimos 1 sola página
      tieneSiguiente = false;
    }
    page += 1;
  }

  return todas;
}

/* ========== RENDER DE CARDS ========== */
function renderEmpleosPagina(pagina) {
  const contenedor = document.getElementById('ofertas-container');
  const total = ofertasAll.length;
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fin = Math.min(inicio + ITEMS_POR_PAGINA, total);
  const slice = ofertasAll.slice(inicio, fin);

  contenedor.innerHTML = '';

  slice.forEach(oferta => {
    const data = safeParseData(oferta.data);
    const herramientas = (data.herramientas_basicas || data.herramientas || [])
      .map(h => `<a><span>${h}</span></a>`)
      .join('');

    const empresa = oferta.empresa?.nombre_fantasia || 'Empresa no disponible';

    contenedor.insertAdjacentHTML('beforeend', `
      <div class="col-lg-12">
        <div class="job-item" onclick="window.location.href='job-single-2.html?id=${oferta.id}'" style="cursor:pointer;">
          <div class="job-img">
            <img src="assets/img/job/01.jpg" alt="">
          </div>
          <div class="job-content">
            <div class="job-top">
              <div class="job-title">
                <h5>${oferta.titulo}</h5>
                <span class="job-employer"><i class="far fa-building"></i> ${empresa}</span>
              </div>
            </div>
            <ul class="job-info-list">
              <li><i class="fe-briefcase"></i> ${data.area_trabajo || data.area || 'Área no especificada'}</li>
              <li><i class="fe-check-circle"></i> ${formatModalidad(data.modalidad)}</li>
              <li><i class="fe-clock"></i> ${diasDesde(oferta.fecha_publicacion)}</li>
              <li><i class="fas fa-timer"></i> Exp: ${formatFecha(oferta.fecha_cierre)}</li>
              <li><i class="fe-dollar-sign"></i> Salario: ${formatRango(data.renta_salarial || data.renta)}</li>
              <li><i class="fe-map-pin"></i> ${oferta.empleador?.data?.region || 'Región no disponible'}</li>
            </ul>
            <div class="job-skill">${herramientas}</div>
          </div>
        </div>
      </div>
    `);
  });

  actualizarPaginacion(pagina, total);
}

/* ========== PAGINACIÓN (MISMA ESTRUCTURA UI) ========== */
function actualizarPaginacion(pagina, total) {
  const ul = document.querySelector('.pagination');
  const p = document.querySelector('.pagination-showing p');
  if (!ul) return;

  const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);
  ul.innerHTML = '';

  // Prev
  ul.insertAdjacentHTML('beforeend', `
    <li class="page-item ${pagina === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" aria-label="Previous" onclick="return cambiarPagina(${pagina - 1});">
        <span aria-hidden="true"><i class="far fa-angle-double-left"></i></span>
      </a>
    </li>
  `);

  // ventana de 5
  const ventana = 5;
  let start = Math.max(1, pagina - Math.floor(ventana / 2));
  let end = Math.min(totalPaginas, start + ventana - 1);
  if (end - start + 1 < ventana) start = Math.max(1, end - ventana + 1);

  for (let i = start; i <= end; i++) {
    ul.insertAdjacentHTML('beforeend', `
      <li class="page-item ${i === pagina ? 'active' : ''}">
        <a class="page-link" href="#" onclick="return cambiarPagina(${i});">${i}</a>
      </li>
    `);
  }

  // Next
  ul.insertAdjacentHTML('beforeend', `
    <li class="page-item ${pagina === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" aria-label="Next" onclick="return cambiarPagina(${pagina + 1});">
        <span aria-hidden="true"><i class="far fa-angle-double-right"></i></span>
      </a>
    </li>
  `);

  // "Showing x - y of z Jobs"
  const desde = total === 0 ? 0 : (pagina - 1) * ITEMS_POR_PAGINA + 1;
  const hasta = Math.min(pagina * ITEMS_POR_PAGINA, total);
  if (p) p.textContent = `Showing ${desde} - ${hasta} of ${total} Jobs`;
}

function cambiarPagina(nueva) {
  const totalPaginas = Math.ceil(ofertasAll.length / ITEMS_POR_PAGINA);
  if (nueva < 1 || nueva > totalPaginas) return false;
  paginaActual = nueva;
  renderEmpleosPagina(paginaActual);
  return false; // evita salto por href="#"
}

/* ========== HELPERS ========== */
function safeParseData(data) {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return {}; }
}

function formatModalidad(val) {
  // acepta números, strings o textos ya normalizados
  const mapa = {
    '1': 'Full Time',
    '2': 'Part Time',
    '3': 'Remoto',
    '4': 'Freelance',
    '5': 'Híbrido',
    'Full Time': 'Full Time',
    'Part Time': 'Part Time',
    'Remoto': 'Remoto',
    'Freelancer': 'Freelance',
    'Freelance': 'Freelance',
    'Híbrido': 'Híbrido',
    'Hibrido': 'Híbrido'
  };
  const k = String(val ?? '').trim();
  return mapa[k] || 'No especificado';
}

function formatFecha(fechaStr) {
  if (!fechaStr) return 'Sin fecha';
  const d = new Date(fechaStr);
  return isNaN(d) ? 'Sin fecha' : d.toLocaleDateString('es-CL');
}

function formatRango(r) {
  if (!r) return 'No disponible';
  const d = r.desde != null ? parseInt(r.desde, 10) : null;
  const h = r.hasta != null ? parseInt(r.hasta, 10) : null;
  const sd = Number.isFinite(d) ? `$${d.toLocaleString('es-CL')}` : '';
  const sh = Number.isFinite(h) ? `$${h.toLocaleString('es-CL')}` : '';
  if (sd && sh) return `${sd} - ${sh}`;
  return sd || sh || 'No disponible';
}

function diasDesde(fechaStr) {
  if (!fechaStr) return 'Fecha desconocida';
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return 'Fecha desconocida';
  const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
  return dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`;
}
