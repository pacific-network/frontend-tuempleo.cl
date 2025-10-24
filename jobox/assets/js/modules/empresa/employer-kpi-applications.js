// employer-kpi-applications.js
(function () {
  const KPI_ID = 'kpi-postulaciones-total';
  const el = document.getElementById(KPI_ID);
  if (!el) return;

  const token = localStorage.getItem('token') || '';
  const BASE = (typeof BASE_URL_API === 'string' ? BASE_URL_API : '').replace(/\/$/, '');
  if (!token || !BASE) {
    console.warn('⚠️ Falta token o BASE_URL_API para KPI postulaciones.');
    return;
  }
  const AUTH = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Utils
  function parseJwt(t) {
    try {
      const p = t.split('.')[1];
      return JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g, '+').replace(/_/g, '/')))));
    } catch { return {}; }
  }
  function getUserId() {
    const p = parseJwt(token);
    return p?.sub || p?.id || p?.userId || null;
  }
  async function j(url) {
    const r = await fetch(url, { headers: AUTH });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    return r.json();
  }
  // Saca un total desde distintas formas comunes
  function extractCount(json) {
    if (!json) return 0;
    if (typeof json.total === 'number') return json.total;
    if (json.meta && typeof json.meta === 'object') {
      if (typeof json.meta.itemCount === 'number') return json.meta.itemCount; // a veces itemCount
      if (typeof json.meta.totalItems === 'number') return json.meta.totalItems;
      if (typeof json.meta.total === 'number') return json.meta.total;
    }
    if (Array.isArray(json.data)) return json.data.length;
    if (Array.isArray(json)) return json.length;
    // otros nombres comunes
    if (Array.isArray(json.rows)) return json.rows.length;
    if (typeof json.count === 'number') return json.count;
    return 0;
  }

  async function run() {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('Token sin userId');

      // 1) empleador
      const basic = await j(`${BASE}/empleador/basic-info/${userId}`);
      const empleadorId = basic?.empleador_id;
      if (!empleadorId) throw new Error('Sin empleador_id');

      // 2) trae TODAS las ofertas (paginando si hace falta)
      // primero lee meta para saber cuántas páginas hay
      const first = await j(`${BASE}/ofertas/empleador/${empleadorId}?page=1&take=50&order=DESC`);
      const totalOfertas = first?.meta?.itemCount ?? (Array.isArray(first?.data) ? first.data.length : 0);
      const pageCount = first?.meta?.pageCount ?? 1;
      let ofertas = Array.isArray(first?.data) ? first.data : [];

      // Si hay más páginas, las traemos
      if (pageCount > 1) {
        const promises = [];
        for (let p = 2; p <= pageCount; p++) {
          promises.push(j(`${BASE}/ofertas/empleador/${empleadorId}?page=${p}&take=50&order=DESC`));
        }
        const pages = await Promise.all(promises);
        pages.forEach(r => { if (Array.isArray(r?.data)) ofertas = ofertas.concat(r.data); });
      }

      if (ofertas.length === 0) {
        el.textContent = '0';
        return;
      }

      // 3) para cada oferta pedimos solo 1 registro y leemos el total real desde meta
      let totalPostulaciones = 0;
      // ejecútalo en grupos para no saturar
      const chunk = 8;
      for (let i = 0; i < ofertas.length; i += chunk) {
        const part = ofertas.slice(i, i + chunk);
        const results = await Promise.all(part.map(async (o) => {
          try {
            const r = await j(`${BASE}/postulaciones/oferta/${o.id}?page=1&take=1`);
            return extractCount(r);
          } catch (err) {
            console.warn(`⚠️ Postulaciones oferta ${o.id}:`, err);
            // Fallback: sin meta, pedimos sin paginar (puede traer pocas por default)
            try {
              const r2 = await j(`${BASE}/postulaciones/oferta/${o.id}`);
              return extractCount(r2);
            } catch {
              return 0;
            }
          }
        }));
        totalPostulaciones += results.reduce((a, b) => a + (Number(b) || 0), 0);
      }

      el.textContent = Number(totalPostulaciones || 0).toString();

      // logs útiles por si no sale:
      console.debug('[KPI] ofertas:', totalOfertas, 'sum postulaciones:', totalPostulaciones);
    } catch (err) {
      console.error('❌ KPI postulaciones:', err);
      el.textContent = '0';
    }
  }

  document.addEventListener('DOMContentLoaded', run);
})();
