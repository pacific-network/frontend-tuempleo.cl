// candidate-notifications.js
(function () {
  const token = localStorage.getItem('token') || '';
  const AUTH_HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};

  // Contenedores por ID (más robusto que clases)
  const listContainer = document.getElementById('notificationsList');
  const countEl = document.getElementById('notificationsCount');
  if (!listContainer) return;

  function iconByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'far fa-star';
      case 'descartado':     return 'far fa-xmark';
      case 'contratado':     return 'far fa-badge-check';
      default:               return 'far fa-briefcase';
    }
  }

  function humanEstado(estado) {
    if (estado === 'preseleccionado') return 'Fuiste preseleccionado';
    if (estado === 'descartado')     return 'Tu postulación fue descartada';
    if (estado === 'contratado')     return '¡Has sido contratado!';
    return 'Actualización en tu postulación';
  }

  // Pluralización simple en ES
  function pluralize(unit, value) {
    const map = { año: 'años', mes: 'meses', día: 'días', hora: 'horas', minuto: 'minutos', segundo: 'segundos' };
    return value === 1 ? unit : (map[unit] || `${unit}s`);
  }

  function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const diffSec = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diffSec);
    const units = [
      ['año',    365 * 24 * 3600],
      ['mes',     30 * 24 * 3600],
      ['día',     24 * 3600],
      ['hora',     3600],
      ['minuto',     60],
      ['segundo',     1],
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
    // proc: ProcesoSeleccion con relaciones (postulacion, oferta, gestor)
    const estado = proc.estado; // 'preseleccionado' | 'descartado' | 'contratado'
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

  async function loadNotifications() {
    try {
      const res = await fetch(`${BASE_URL_API}/seleccion/mias`, { headers: AUTH_HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const procesos = await res.json(); // array de ProcesoSeleccion

      if (!Array.isArray(procesos) || procesos.length === 0) {
        listContainer.innerHTML = `<div class="text-muted small px-3 py-2">No tienes notificaciones por ahora.</div>`;
        if (countEl) countEl.textContent = '0';
        return;
      }

      listContainer.innerHTML = procesos.map(itemTemplate).join('');
      if (countEl) countEl.textContent = procesos.length > 99 ? '99+' : String(procesos.length);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      listContainer.innerHTML = `<div class="text-danger small px-3 py-2">No se pudieron cargar las notificaciones.</div>`;
      if (countEl) countEl.textContent = '0';
    }
  }

  // Carga inicial
  document.addEventListener('DOMContentLoaded', loadNotifications);

  // ===== Auto-refresh cada 30s (solo si la pestaña está visible) =====
  const REFRESH_MS = 180000;
  let refreshing = false;

  async function safeLoad() {
    if (refreshing) return;
    refreshing = true;
    try { await loadNotifications(); }
    finally { refreshing = false; }
  }

  // Refrescar al volver a la pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') safeLoad();
  });
  window.addEventListener('focus', safeLoad);

  // Intervalo periódico
  const intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') safeLoad();
  }, REFRESH_MS);

  // Limpiar intervalo al salir de la página
  window.addEventListener('beforeunload', () => clearInterval(intervalId));
})();
