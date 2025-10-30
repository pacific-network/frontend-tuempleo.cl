// employer-payment-notifications.js
(function () {
  // ====== Config ======
  const NOTI_IDS = {
    list: 'notificationsList',      // contenedor de ítems
    count: 'notificationsCount',    // badge con total
  };
  const REFRESH_MS = 120000; // 2 minutos
  const STORAGE_KEY_LAST_SEEN = 'tx_notif_last_seen'; // ISO string del último "visto"

  // ====== Helpers DOM ======
  const $id = (id) => document.getElementById(id);
  const listEl = $id(NOTI_IDS.list);
  const countEl = $id(NOTI_IDS.count);
  if (!listEl) return; // si no existe, salimos silenciosamente

  // ====== Auth y base ======
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const BASE = (typeof BASE_URL_API === 'string' ? BASE_URL_API : '').replace(/\/$/, '');
  const AUTH = token ? { Authorization: `Bearer ${token}` } : {};

  // ====== Utiles: tiempo relativo ======
  function plural(unit, n) {
    const map = { año: 'años', mes: 'meses', día: 'días', hora: 'horas', minuto: 'minutos', segundo: 'segundos' };
    return n === 1 ? unit : (map[unit] || `${unit}s`);
  }
  function timeAgo(iso) {
    const d = new Date(iso);
    const diffSec = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diffSec);
    const units = [
      ['año', 365 * 24 * 3600],
      ['mes', 30 * 24 * 3600],
      ['día', 24 * 3600],
      ['hora', 3600],
      ['minuto', 60],
      ['segundo', 1],
    ];
    for (const [u, s] of units) {
      const v = Math.floor(abs / s);
      if (v >= 1) return diffSec >= 0 ? `hace ${v} ${plural(u, v)}` : `en ${v} ${plural(u, v)}`;
    }
    return 'justo ahora';
  }

  // ====== Mapeos UI ======
  function iconForStatus(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'AUTHORIZED') return 'far fa-badge-check';
    if (s === 'PENDING')    return 'far fa-hourglass';
    return 'far fa-xmark';
  }
  function titleForStatus(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'AUTHORIZED') return 'Pago aprobado';
    if (s === 'PENDING')    return 'Pago pendiente';
    return 'Pago rechazado';
  }
  function lineForStatus(status, amountCLP) {
    const s = String(status || '').toUpperCase();
    const amt = typeof amountCLP === 'number'
      ? amountCLP.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
      : '-';
    if (s === 'AUTHORIZED') return `Tu compra fue aprobada por <b>${amt}</b>.`;
    if (s === 'PENDING')    return `Tu compra por <b>${amt}</b> está pendiente.`;
    return `Tu compra por <b>${amt}</b> fue rechazada.`;
  }

  // ====== Último visto (para "nuevas") ======
  function getLastSeenISO() {
    return localStorage.getItem(STORAGE_KEY_LAST_SEEN) || '';
  }
  function setLastSeenISO(iso) {
    try { localStorage.setItem(STORAGE_KEY_LAST_SEEN, iso); } catch {}
  }

  // ====== Render de un item ======
  function itemTemplate(tx, isNew) {
    const when = timeAgo(tx.createdAt);
    const icon = iconForStatus(tx.status);
    const title = titleForStatus(tx.status);
    const line = lineForStatus(Number(tx.status_total || tx.amount) ? tx.status : tx.status, Number(tx.amount));
    const badgeNew = isNew ? `<span class="badge bg-primary ms-2">nuevo</span>` : '';

    // navega a la vista de transacciones
    const href = 'employer-transaction.html';

    return `
      <div class="user-notification-item">
        <a href="${href}" data-txid="${tx.id}" class="tx-noti-link">
          <div class="user-notification-icon">
            <i class="${icon}"></i>
          </div>
          <div class="user-notification-info">
            <p>${title} ${badgeNew}</p>
            <p class="mb-1">${line}</p>
            <small class="text-muted">OC: <b>${tx.orderId || '-'}</b> · ${when}</small>
          </div>
        </a>
      </div>
    `;
  }

  // ====== Fetch transacciones recientes ======
  async function fetchRecentTransactions() {
    // Tomamos las últimas 10. Si tu API permite ordenar, mejor with ?order=DESC
    const params = new URLSearchParams({ page: 1, take: 10 });
    const url = `${BASE}/transactions?${params.toString()}`;
    const res = await fetch(url, { headers: { ...AUTH, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Asumimos shape { data, meta }
    return Array.isArray(json?.data) ? json.data : [];
  }

  // ====== Pintar notificaciones ======
  async function paintNotifications() {
    try {
      if (!BASE || !token) throw new Error('Sin BASE_URL_API o token');
      const data = await fetchRecentTransactions();

      if (!data.length) {
        listEl.innerHTML = `<div class="text-muted small px-3 py-2">Aún no hay Pagos.</div>`;
        if (countEl) countEl.textContent = '0';
        return;
      }

      // "Nuevas" se decide por createdAt > lastSeenISO
      const lastSeenISO = getLastSeenISO();
      const lastSeen = lastSeenISO ? new Date(lastSeenISO).getTime() : 0;

      // Render
      const html = data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(tx => {
          const isNew = new Date(tx.createdAt).getTime() > lastSeen;
          return itemTemplate(tx, isNew);
        })
        .join('');

      listEl.innerHTML = html;

      // Contador: total o solo nuevos (elige)
      const newCount = data.filter(tx => new Date(tx.createdAt).getTime() > lastSeen).length;
      if (countEl) countEl.textContent = newCount > 0 ? String(newCount) : String(data.length);

      // Marcar como visto al interactuar con el bloque
      listEl.addEventListener('click', (e) => {
        const link = e.target.closest('.tx-noti-link');
        if (!link) return;
        // último tx más reciente
        const newest = data.reduce((acc, cur) => (new Date(cur.createdAt) > new Date(acc.createdAt) ? cur : acc), data[0]);
        setLastSeenISO(new Date(newest.createdAt).toISOString());
      }, { once: true });

    } catch (err) {
      console.error('Pago-notifications error:', err);
      listEl.innerHTML = `<div class="text-danger small px-3 py-2">Aún no se han realizado pagos.</div>`;
      if (countEl) countEl.textContent = '0';
    }
  }

  // ====== Auto-refresh seguro ======
  let busy = false;
  async function safeRefresh() {
    if (busy) return;
    busy = true;
    try { await paintNotifications(); }
    finally { busy = false; }
  }

  document.addEventListener('DOMContentLoaded', safeRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') safeRefresh();
  });
  window.addEventListener('focus', safeRefresh);

  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') safeRefresh();
  }, REFRESH_MS);

  window.addEventListener('beforeunload', () => clearInterval(interval));
})();
