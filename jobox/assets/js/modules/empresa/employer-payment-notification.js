(function () {
  // ====== Configuración General ======
  const CONFIG = {
    listId: "notificationsListPay", // 👈 ID actualizado
    countId: "notificationsCountPay", // 👈 ID actualizado
    refreshMs: 120000,
    pageSize: 5,
    storageKeyLastSeen: "tx_notif_last_seen",
    storageKeyDeleted: "tx_notif_deleted",
  };

  const BASE = (typeof BASE_URL_API === "string" ? BASE_URL_API : "").replace(/\/$/, "");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const AUTH = token ? { Authorization: `Bearer ${token}` } : {};

  const $id = (id) => document.getElementById(id);
  const listEl = $id(CONFIG.listId);
  const countEl = $id(CONFIG.countId);
  if (!listEl) return;

  // ====== Estado ======
  let transactions = [];
  let currentPage = 1;

  // ====== Utilidades ======
  function plural(unit, n) {
    const map = { año: "años", mes: "meses", día: "días", hora: "horas", minuto: "minutos", segundo: "segundos" };
    return n === 1 ? unit : map[unit] || `${unit}s`;
  }

  function timeAgo(iso) {
    const d = new Date(iso);
    const diffSec = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diffSec);
    const units = [
      ["año", 365 * 24 * 3600],
      ["mes", 30 * 24 * 3600],
      ["día", 24 * 3600],
      ["hora", 3600],
      ["minuto", 60],
      ["segundo", 1],
    ];
    for (const [u, s] of units) {
      const v = Math.floor(abs / s);
      if (v >= 1) return diffSec >= 0 ? `hace ${v} ${plural(u, v)}` : `en ${v} ${plural(u, v)}`;
    }
    return "justo ahora";
  }

  // ====== Último visto ======
  const getLastSeen = () => localStorage.getItem(CONFIG.storageKeyLastSeen) || "";
  const setLastSeen = (iso) => localStorage.setItem(CONFIG.storageKeyLastSeen, iso);

  // ====== Eliminaciones virtuales ======
  const getDeletedIds = () => JSON.parse(localStorage.getItem(CONFIG.storageKeyDeleted) || "[]");
  const setDeletedIds = (ids) => localStorage.setItem(CONFIG.storageKeyDeleted, JSON.stringify(ids));
  const isDeleted = (id) => getDeletedIds().includes(id);
  const deleteNotification = (id) => {
    const updated = [...new Set([...getDeletedIds(), id])];
    setDeletedIds(updated);
    renderList(); // re-render virtual
  };

  // ====== Iconos y textos ======
  function iconForStatus(status) {
    const s = String(status || "").toUpperCase();
    if (s === "AUTHORIZED") return "far fa-badge-check text-success";
    if (s === "PENDING") return "far fa-hourglass text-warning";
    return "far fa-xmark text-danger";
  }
  function titleForStatus(status) {
    const s = String(status || "").toUpperCase();
    if (s === "AUTHORIZED") return "Pago aprobado";
    if (s === "PENDING") return "Pago pendiente";
    return "Pago rechazado";
  }
  function lineForStatus(status, amountCLP) {
    const s = String(status || "").toUpperCase();
    const amt =
      typeof amountCLP === "number"
        ? amountCLP.toLocaleString("es-CL", { style: "currency", currency: "CLP" })
        : "-";
    if (s === "AUTHORIZED") return `Tu compra fue aprobada por <b>${amt}</b>.`;
    if (s === "PENDING") return `Tu compra por <b>${amt}</b> está pendiente.`;
    return `Tu compra por <b>${amt}</b> fue rechazada.`;
  }

  // ====== Fetch inicial ======
  async function fetchTransactions() {
    const params = new URLSearchParams({ page: 1, take: 50, order: "DESC" }); // carga todo (hasta 50)
    const url = `${BASE}/transactions?${params.toString()}`;
    const res = await fetch(url, { headers: { ...AUTH, "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  }

  // ====== Render individual ======
function renderItem(tx, isNew) {
  const when = timeAgo(tx.createdAt);
  const icon = iconForStatus(tx.status);
  const title = titleForStatus(tx.status);
  const line = lineForStatus(tx.status, Number(tx.amount));

  return `
    <div class="notification-card fade-in" data-txid="${tx.id}">
      <div class="notification-icon"><i class="${icon}"></i></div>
      <div class="notification-content">
        <p class="notification-title">
          ${title}
          ${isNew ? '<span class="notification-badge">Nuevo</span>' : ''}
        </p>
        <p class="notification-text">${line}</p>
        <p class="notification-meta">OC: <b>${tx.orderId || '-'}</b> · ${when}</p>
      </div>
      <button class="notification-delete" data-id="${tx.id}" title="Eliminar notificación">
        <i class="far fa-trash"></i>
      </button>
    </div>
  `;
}


  // ====== Render total ======
  function renderList() {
    const lastSeen = getLastSeen() ? new Date(getLastSeen()).getTime() : 0;
    const deleted = getDeletedIds();
    const visible = transactions.filter((tx) => !deleted.includes(tx.id));

    const totalPages = Math.ceil(visible.length / CONFIG.pageSize);
    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * CONFIG.pageSize;
    const end = start + CONFIG.pageSize;
    const pageItems = visible.slice(start, end);

    if (!pageItems.length) {
      listEl.innerHTML = `<div class="text-muted small px-3 py-2">No hay notificaciones.</div>`;
      updateCount();
      return;
    }

    const html = pageItems
      .map((tx) => renderItem(tx, new Date(tx.createdAt).getTime() > lastSeen))
      .join("");

    listEl.innerHTML = html + renderPagination(totalPages);
    attachDeleteListeners();
    attachPaginationListeners(totalPages);
    updateCount();
  }

  // ====== Paginación virtual ======
  function renderPagination(totalPages) {
    if (totalPages <= 1) return "";
    return `
      <div class="d-flex justify-content-between align-items-center mt-3">
        <button class="btn btn-sm btn-outline-secondary prev-page" ${currentPage === 1 ? "disabled" : ""}>
          <i class="far fa-angle-left"></i> Anterior
        </button>
        <span class="text-muted small">Página ${currentPage} de ${totalPages}</span>
        <button class="btn btn-sm btn-outline-secondary next-page" ${currentPage >= totalPages ? "disabled" : ""}>
          Siguiente <i class="far fa-angle-right"></i>
        </button>
      </div>
    `;
  }

  function attachPaginationListeners(totalPages) {
    const nextBtn = listEl.querySelector(".next-page");
    const prevBtn = listEl.querySelector(".prev-page");
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderList();
        }
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderList();
        }
      });
  }

  // ====== Eliminar evento ======
  function attachDeleteListeners() {
    listEl.querySelectorAll(".btn-delete-noti").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deleteNotification(id);
      });
    });
  }

  // ====== Contador ======
  function updateCount() {
    if (!countEl) return;
    const count = transactions.filter((tx) => !isDeleted(tx.id)).length;
    countEl.textContent = String(count);
  }

  // ====== Refresh ======
  async function paintNotifications() {
    if (!BASE || !token) throw new Error("Sin BASE_URL_API o token");
    transactions = await fetchTransactions();
    renderList();
  }

  let busy = false;
  async function safeRefresh() {
    if (busy) return;
    busy = true;
    try {
      await paintNotifications();
    } finally {
      busy = false;
    }
  }

  // ====== Ciclo de vida ======
  document.addEventListener("DOMContentLoaded", safeRefresh);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") safeRefresh();
  });
  window.addEventListener("focus", safeRefresh);
  window.addEventListener("beforeunload", () => clearInterval(interval));

  const interval = setInterval(() => {
    if (document.visibilityState === "visible") safeRefresh();
  }, CONFIG.refreshMs);
})();
