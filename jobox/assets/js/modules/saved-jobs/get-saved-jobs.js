    // assets/js/candidate-saved-job.js
(function () {
  // === Utils ===
  const BASE = window.BASE_URL_API
  const tableBody = document.querySelector('.profile-applied-job tbody');
  const paginationContainer = document.querySelector('.pagination-area .pagination');

  // Apuntamos al select del header que mostraste
  const periodSelect = document.querySelector('.user-profile-card-header .select');

  const TOKEN = localStorage.getItem('token') || '';
  const AUTH_HEADERS = TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {};

  // Config paginación (cliente)
  const PAGE_SIZE = 10;
  let allItems = [];
  let filteredItems = [];
  let currentPage = 1;

  // Mapa de regiones de Chile (por código)
  const REGIONES = {
    '1': 'Arica y Parinacota','2': 'Tarapacá','3': 'Antofagasta','4': 'Atacama','5': 'Coquimbo',
    '6': 'Valparaíso','7': 'Maule','8': 'Ñuble','9': 'Biobío','10': 'La Araucanía',
    '11': 'Los Ríos','12': 'Los Lagos','13': 'Metropolitana de Santiago','14': 'Aysén',
    '15': 'Magallanes y Antártica','16': 'O’Higgins'
  };

  // Formateador de fecha en español Chile
  const fmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatFecha = (isoString) => {
    try { const d = new Date(isoString); return isNaN(d) ? '-' : capitalize(fmt.format(d)); }
    catch { return '-'; }
  };
  const capitalize = (s) => s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const isActive = (es_activa, fecha_cierre) => {
    if (!es_activa || !fecha_cierre) return false;
    const hoy = new Date();
    return new Date(fecha_cierre) >= new Date(hoy.toDateString());
  };
  const getBadgeHtml = (es_activa, fecha_cierre) =>
    isActive(es_activa, fecha_cierre)
      ? `<span class="badge badge-success">Activo</span>`
      : `<span class="badge badge-danger">Expirado</span>`;

  const regionFromData = (data) => {
    const code = (data?.region ?? '').toString();
    return REGIONES[code] || (code ? `Región ${code}` : 'Región no especificada');
  };

  // Render de una fila
  const rowHtml = (item) => {
    let data;
    try { data = item.data ? JSON.parse(item.data) : {}; } catch { data = {}; }

    const titulo = item.titulo || data.titulo || 'Oferta';
    const area_trabajo = data.area_trabajo || 'Área no especificada';
    const regionTxt = regionFromData(data);
    const fechaTxt = formatFecha(item.fecha_publicacion);
    const imgSrc = 'assets/img/job/01.jpg';

    return `
      <tr data-oferta-id="${item.id}">
        <td>
          <div class="profile-job-info d-flex">
            <img src="${imgSrc}" alt="" style="width:64px;height:64px;object-fit:cover;">
            <div class="profile-job-content ms-3">
              <h6 class="mb-1"><a href="job-single-2-si.html?id=${item.id}">${escapeHtml(titulo)}</a></h6>
              <ul class="profile-job-list list-unstyled mb-1">
                <li><i class="far fa-briefcase"></i> ${escapeHtml(area_trabajo)}</li>
              </ul>
              <ul class="list-unstyled mb-0">
                <li><i class="far fa-location-dot"></i> ${escapeHtml(regionTxt)}</li>
              </ul>
            </div>
          </div>
        </td>
        <td>${fechaTxt}</td>
        <td>${getBadgeHtml(item.es_activa, item.fecha_cierre)}</td>
        <td class="text-nowrap">
          <a href="job-single-2-si.html?id=${item.id}" class="btn btn-outline-secondary btn-sm" title="Ver">
            <i class="far fa-eye"></i>
          </a>
          <button type="button" class="btn btn-outline-danger btn-sm btn-remove-guardado" data-id="${item.id}" title="Eliminar de guardados">
            <i class="far fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  };

  const escapeHtml = (s) => typeof s === 'string'
    ? s.replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
    : s;

  // Render tabla
  const renderTable = (items) => {
    if (!tableBody) return;

    if (!items || items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">
            No tienes trabajos guardados para el período seleccionado.
          </td>
        </tr>
      `;
      wireRowActions();
      renderPagination(0, 1);
      return;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = items.slice(start, end);

    tableBody.innerHTML = pageItems.map(rowHtml).join('');
    wireRowActions();
    renderPagination(items.length, currentPage);
  };

  // Paginación
  const renderPagination = (total, page) => {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    if (total <= PAGE_SIZE) return;

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const createLi = (labelHtml, targetPage, disabled = false, active = false, ariaLabel = '') => {
      const li = document.createElement('li');
      li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      if (ariaLabel) a.setAttribute('aria-label', ariaLabel);
      a.innerHTML = labelHtml;
      if (!disabled) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          currentPage = targetPage;
          renderTable(filteredItems);
        });
      }
      li.appendChild(a);
      return li;
    };

    // Prev
    paginationContainer.appendChild(
      createLi('<span aria-hidden="true"><i class="far fa-angle-double-left"></i></span>', Math.max(1, page - 1), page === 1, false, 'Previous')
    );

    // Ventana de páginas
    const windowSize = 7;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

    for (let p = start; p <= end; p++) {
      paginationContainer.appendChild(createLi(String(p), p, false, p === page));
    }

    // Next
    paginationContainer.appendChild(
      createLi('<span aria-hidden="true"><i class="far fa-angle-double-right"></i></span>', Math.min(totalPages, page + 1), page === totalPages, false, 'Next')
    );
  };

  // === FILTRO POR RANGO (Semanas / 2 meses) ===
  // 1 -> 7 días, 2 -> 14 días, 3 -> 21 días, 4 -> 28 días, 5 -> 2 meses
  const applyFilter = () => {
    const val = (periodSelect && periodSelect.value) || '5';

    const now = new Date();
    const from = new Date(now);

    switch (val) {
      case '1': from.setDate(from.getDate() - 7); break;   // Última semana
      case '2': from.setDate(from.getDate() - 14); break;  // 2 semanas
      case '3': from.setDate(from.getDate() - 21); break;  // 3 semanas
      case '4': from.setDate(from.getDate() - 28); break;  // 4 semanas
      case '5': default: from.setMonth(from.getMonth() - 2); break; // 2 meses
    }
    from.setHours(0, 0, 0, 0);

    filteredItems = allItems.filter(it => {
      const fp = new Date(it.fecha_publicacion);
      return !isNaN(fp) && fp >= from;
    });

    currentPage = 1;
    renderTable(filteredItems);
  };

  // Acciones de eliminar (con popups)
  const wireRowActions = () => {
    document.querySelectorAll('.btn-remove-guardado').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const ofertaId = e.currentTarget.getAttribute('data-id');
        if (!ofertaId) return;

        if (!TOKEN) {
          await Swal.fire({
            icon: 'info',
            title: 'Sesión requerida',
            text: 'Debes iniciar sesión para eliminar guardados.',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          });
          return;
        }

        const { isConfirmed } = await Swal.fire({
          icon: 'warning',
          title: '¿Eliminar este trabajo?',
          text: 'Se quitará de tu lista de guardados.',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          reverseButtons: true,
          allowOutsideClick: false
        });
        if (!isConfirmed) return;

        try {
          const resp = await fetch(`${BASE}/guardados/${encodeURIComponent(ofertaId)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...AUTH_HEADERS
            }
          });
          if (!resp.ok) {
            const msg = await safeText(resp);
            throw new Error(`Error al eliminar: ${resp.status} ${msg}`);
          }
          // Refrescar lista en memoria y re-render
          allItems = allItems.filter(x => String(x.id) !== String(ofertaId));
          applyFilter();

          await Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El trabajo fue eliminado de tus guardados.',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          });
        } catch (err) {
          console.error(err);
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: 'Intenta nuevamente.',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          });
        }
      });
    });
  };

  const safeText = async (resp) => { try { return await resp.text(); } catch { return ''; } };

  // Estado: sin token
  const renderNoToken = () => {
    if (!tableBody) return;
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">
          Debes iniciar sesión para ver tus trabajos guardados.
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
  };

  // Enganche de eventos del select (nativo + fallback para plugins)
  const hookSelectEvents = () => {
    if (!periodSelect) return;

    // Nativo
    periodSelect.addEventListener('change', applyFilter);

    // Fallback para plugins tipo "nice-select" que renderizan un div .nice-select
    // y no siempre despachan el change del <select>.
    const nice = periodSelect.nextElementSibling;
    if (nice && nice.classList.contains('nice-select')) {
      nice.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('option') || e.target.closest('.option'))) {
          // damos un tick para que el plugin actualice el <select>.value
          setTimeout(applyFilter, 0);
        }
      });
      // También por teclado (Enter/Espacio cambia selección)
      nice.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') setTimeout(applyFilter, 0);
      });
    }
  };

  // Carga inicial
  const init = async () => {
    if (!TOKEN) { renderNoToken(); return; }

    try {
      const resp = await fetch(`${BASE}/guardados/all`, {
        headers: { 'Accept': 'application/json', ...AUTH_HEADERS }
      });
      if (!resp.ok) {
        if ([401, 403].includes(resp.status)) { renderNoToken(); return; }
        const msg = await safeText(resp);
        throw new Error(`Error ${resp.status} al obtener guardados: ${msg}`);
      }

      const data = await resp.json();
      allItems = Array.isArray(data) ? data.filter(Boolean) : [];
      // Orden por fecha de publicación (más recientes primero)
      allItems.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

      // Enganchar select y aplicar filtro inicial (por defecto, value "5" = 2 meses)
      hookSelectEvents();
      if (periodSelect && !['1','2','3','4','5'].includes(periodSelect.value)) {
        periodSelect.value = '5';
      }
      applyFilter();
    } catch (err) {
      console.error(err);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger py-4">
              Ocurrió un problema al cargar tus trabajos guardados.
            </td>
          </tr>
        `;
      }
      if (paginationContainer) paginationContainer.innerHTML = '';
      await Swal.fire({
        icon: 'error',
        title: 'No pudimos cargar los guardados',
        text: 'Por favor intenta nuevamente.',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false
      });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
