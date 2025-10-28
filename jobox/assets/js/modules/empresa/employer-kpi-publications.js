// employer-kpi-publications.js
(function () {
  const KPI_ID = 'kpi-pubs-total';
  const kpiEl = document.getElementById(KPI_ID);
  if (!kpiEl) return;

  const token = localStorage.getItem('token') || '';
  const BASE = (typeof BASE_URL_API === 'string' ? BASE_URL_API : '').replace(/\/$/, '');
  if (!token || !BASE) {
    console.warn('Falta token o BASE_URL_API para cargar KPI de publicaciones.');
    return;
  }

  const AUTH = { Authorization: `Bearer ${token}` };

  // --- util: decodifica JWT de forma segura
  function parseJwt(t) {
    try {
      const payload = t.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (_) {
      return {};
    }
  }

  // --- obtiene userId desde JWT con varias claves posibles
  function getUserId() {
    const p = parseJwt(token);
    return p?.sub || p?.id || p?.userId || null;
  }

  // --- extrae total desde varias formas de respuesta
  function extractTotal(json) {
    try {
      if (!json || typeof json !== 'object') return 0;
      // Prioridades de extracción de totales
      if (typeof json.total === 'number') return json.total;
      if (json.meta && typeof json.meta === 'object') {
        if (typeof json.meta.itemCount === 'number') return json.meta.itemCount;      // 👈 como tu ejemplo
        if (typeof json.meta.totalItems === 'number') return json.meta.totalItems;
        if (typeof json.meta.total === 'number') return json.meta.total;
      }
      if (Array.isArray(json.data)) return json.data.length; // fallback pobre
    } catch (_) {}
    return 0;
  }

  async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, { headers: { ...AUTH, 'Content-Type': 'application/json' }, ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async function loadPublicationsCount() {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('No se pudo resolver userId del token.');

      // 1) Resolver empleador_id
      const basic = await fetchJSON(`${BASE}/empleador/basic-info/${userId}`);
      const empleadorId = basic?.empleador_id;
      if (!empleadorId) throw new Error('No se recibió empleador_id.');

      // 2) Pedir ofertas del empleador con take=1 para solo el meta.total
      //    (page/take/orden son opcionales; usa lo que soporte tu backend)
      const ofertas = await fetchJSON(`${BASE}/ofertas/empleador/${empleadorId}?page=1&take=1&order=DESC`);
      let total = extractTotal(ofertas);

      // 3) Fallback opcional: si tu backend expone /count, úsalo
      if (!total && ofertas?.data && Array.isArray(ofertas.data) && ofertas.data.length >= 0) {
        try {
          const c = await fetchJSON(`${BASE}/ofertas/empleador/${empleadorId}/count`);
          if (typeof c?.count === 'number') total = c.count;
        } catch (_) { /* ignora */ }
      }

      kpiEl.textContent = String(total || 0);
    } catch (err) {
      console.error('Error cargando KPI de publicaciones:', err);
      kpiEl.textContent = '0';
    }
  }

  document.addEventListener('DOMContentLoaded', loadPublicationsCount);
  // refresco opcional al volver al tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadPublicationsCount();
  });
})();
