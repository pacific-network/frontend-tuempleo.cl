// candidate-notifications.js
(function () {
  const token = localStorage.getItem('token') || '';
  const AUTH_HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};

  const listContainer = document.getElementById('notificationsList');
  const countEl = document.getElementById('notificationsCount');
  const dotsContainer = document.getElementById('paginationDots');
  const loadMoreBtn = document.getElementById('loadMoreNotifications');

  // Si no existe el contenedor, no continuamos
  if (!listContainer) return;

  // =========================
  //     PAGINACIÓN
  // =========================
  let procesosCache = [];
  let currentPage = 1;
  const pageSize = 5;

  // =========================
  //    ICONOS Y TEXTOS
  // =========================

  function iconByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'far fa-star';
      case 'descartado': return 'far fa-xmark';
      case 'contratado': return 'far fa-badge-check';
      default: return 'far fa-briefcase';
    }
  }

  function humanEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'Fuiste preseleccionado';
      case 'descartado': return 'Tu postulación fue descartada';
      case 'contratado': return '¡Has sido contratado!';
      default: return 'Actualización en tu postulación';
    }
  }

  function pluralize(unit, value) {
    const map = {
      año: 'años', mes: 'meses', día: 'días',
      hora: 'horas', minuto: 'minutos', segundo: 'segundos'
    };
    return value === 1 ? unit : (map[unit] || `${unit}s`);
  }

  function timeAgo(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const diffSec = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diffSec);

    const units = [
      ['año', 365 * 24 * 3600],
      ['mes', 30 * 24 * 3600],
      ['día', 24 * 3600],
      ['hora', 3600],
      ['minuto', 60],
      ['segundo', 1]
    ];

    for (const [name, secs] of units) {
      const val = Math.floor(abs / secs);
      if (val >= 1) {
        const unit = pluralize(name, val);
        return diffSec >= 0 ? `hace ${val} ${unit}` : `en ${val} ${unit}`;
      }
    }
    return 'justo ahora';
  }

  function itemTemplate(proc) {
    const estado = proc.estado;
    const ofertaTitulo = proc?.postulacion?.oferta?.titulo || 'una oferta';
    const when = timeAgo(proc.fecha);

    return `
      <div class="user-notification-item">
        <a href="candidate-applications.html">
          <div class="user-notification-icon">
            <i class="${iconByEstado(estado)}"></i>
          </div>
          <div class="user-notification-info">
            <p>${humanEstado(estado)} para <b>${ofertaTitulo}</b>.</p>
            <span>${when}</span>
          </div>
        </a>
      </div>
    `;
  }

  // =============================
  //      RENDER PAGINACIÓN
  // =============================

  function renderPage() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const slice = procesosCache.slice(start, end);
    const html = slice.map(itemTemplate).join('');

    if (currentPage === 1) {
      listContainer.innerHTML = html;
    } else {
      listContainer.insertAdjacentHTML('beforeend', html);
    }

    if (end >= procesosCache.length) {
      loadMoreBtn?.classList.add('d-none');
    } else {
      loadMoreBtn?.classList.remove('d-none');
    }
  }

  function renderDots() {
    if (!dotsContainer) return;
    const totalPages = Math.ceil(procesosCache.length / pageSize);

    dotsContainer.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'pagination-dot' + (i === currentPage ? ' active' : '');

      dot.addEventListener('click', () => {
        currentPage = i;
        listContainer.innerHTML = '';
        renderPage();
        renderDots();
      });

      dotsContainer.appendChild(dot);
    }
  }

  // =============================
  //  CARGA DE NOTIFICACIONES
  // =============================

  async function loadNotifications() {
    try {
      const res = await fetch(`${BASE_URL_API}/seleccion/mias`, { headers: AUTH_HEADERS });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const procesos = await res.json();

      if (!Array.isArray(procesos) || procesos.length === 0) {
        listContainer.innerHTML = `
          <div class="text-muted small px-3 py-2">
            No tienes notificaciones por ahora.
          </div>`;
        if (countEl) countEl.textContent = '0';
        return;
      }

      procesosCache = procesos;
      currentPage = 1;

      renderPage();
      renderDots();

      // contador del ícono
      if (countEl)
        countEl.textContent = procesos.length > 99 ? '99+' : String(procesos.length);

    } catch (err) {
      console.error('Error cargando notificaciones:', err);

      listContainer.innerHTML = `
        <div class="text-danger small px-3 py-2">
          No se pudieron cargar las notificaciones.
        </div>`;

      if (countEl) countEl.textContent = '0';
    }
  }

  // =============================
  //     EVENTOS DE PAGINACIÓN
  // =============================

  loadMoreBtn?.addEventListener('click', () => {
    currentPage++;
    renderPage();
    renderDots();
  });

  // =============================
  //        AUTO-REFRESH
  // =============================
  const REFRESH_MS = 180000;
  let refreshing = false;

  async function safeLoad() {
    if (refreshing) return;
    refreshing = true;
    try {
      await loadNotifications();
    } finally {
      refreshing = false;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') safeLoad();
  });

  window.addEventListener('focus', safeLoad);

  const intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') safeLoad();
  }, REFRESH_MS);

  window.addEventListener('beforeunload', () => clearInterval(intervalId));

  // =============================
  //        CARGA INICIAL
  // =============================
  document.addEventListener('DOMContentLoaded', loadNotifications);
})();
