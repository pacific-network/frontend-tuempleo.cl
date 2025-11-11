// ===============================================================
// 👤 Notificaciones de nuevas Postulaciones — notificaciones-postulacion.js
// ===============================================================

import { getUserIdFromToken } from "../../utils/decode-jwt.js";

(function () {
  const CONFIG = {
    listId: "notificationsListPost", // 👈 ID actualizado
    countId: "notificationsCountPost", // 👈 ID actualizado
    refreshMs: 120000,
    pageSize: 5,
    storageKeyLastSeen: "postulaciones_last_seen",
    storageKeyDeleted: "postulaciones_deleted",
  };

  const BASE_URL_API = window.BASE_URL_API || "http://localhost:3000/v1";
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const AUTH = token ? { Authorization: `Bearer ${token}` } : {};

  const listEl = document.getElementById(CONFIG.listId);
  const countEl = document.getElementById(CONFIG.countId);
  if (!listEl) return;
  // ===== Estado =====
  let postulaciones = [];
  let currentPage = 1;

  // ===== Helpers LocalStorage =====
  const getDeletedIds = () => JSON.parse(localStorage.getItem(CONFIG.storageKeyDeleted) || "[]");
  const setDeletedIds = (ids) => localStorage.setItem(CONFIG.storageKeyDeleted, JSON.stringify(ids));
  const isDeleted = (id) => getDeletedIds().includes(id);
  const markDeleted = (id) => {
    const updated = [...new Set([...getDeletedIds(), id])];
    setDeletedIds(updated);
    renderList();
  };

  const getLastSeen = () => localStorage.getItem(CONFIG.storageKeyLastSeen) || "";
  const setLastSeen = (iso) => localStorage.setItem(CONFIG.storageKeyLastSeen, iso);

  // ===== Utilidades =====
  function timeAgo(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return "-";
    const diffSec = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diffSec);
    const units = [
      ["día", 86400],
      ["hora", 3600],
      ["minuto", 60],
      ["segundo", 1],
    ];
    for (const [u, s] of units) {
      const v = Math.floor(abs / s);
      if (v >= 1)
        return diffSec >= 0
          ? `hace ${v} ${u}${v > 1 ? "s" : ""}`
          : `en ${v} ${u}${v > 1 ? "s" : ""}`;
    }
    return "justo ahora";
  }

  // ===== Fetch Empresa =====
  async function fetchEmpresaId() {
    const userId = getUserIdFromToken();
    if (!userId) return null;
    try {
      const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
        headers: { ...AUTH, "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.empresa_id || null;
    } catch {
      return null;
    }
  }

  // ===== Fetch Postulaciones =====
  async function fetchPostulacionesEmpresa(empresaId) {
    const res = await fetch(`${BASE_URL_API}/seleccion/empresa/${empresaId}`, {
      headers: { ...AUTH, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // ===== Render individual =====
  function renderItem(p, isNew) {
    const nombre = `${p.postulante?.usuario?.nombres || ""} ${
      p.postulante?.usuario?.apellidos || ""
    }`.trim();
    const fecha = timeAgo(p.fecha_postulacion || p.fechaPostulacion);
    const titulo = p.oferta?.titulo || "una oferta";

    return `
      <div class="notification-card fade-in" data-postid="${p.id}">
        <div class="notification-icon"><i class="far fa-user text-info"></i></div>
        <div class="notification-content">
          <p class="notification-title">
            <b>${nombre || "Un postulante"}</b> postuló a <b>${titulo}</b>
            ${isNew ? '<span class="notification-badge">Nuevo</span>' : ""}
          </p>
          <p class="notification-text">Revisa su perfil desde el panel de candidatos.</p>
          <p class="notification-meta">Fecha: ${fecha}</p>
        </div>
        <button class="notification-delete" data-id="${p.id}" title="Eliminar notificación">
          <i class="far fa-trash"></i>
        </button>
      </div>
    `;
  }

  // ===== Render lista =====
  function renderList() {
    const lastSeen = getLastSeen() ? new Date(getLastSeen()).getTime() : 0;
    const deleted = getDeletedIds();
    const visible = postulaciones.filter((p) => !deleted.includes(p.id));

    const totalPages = Math.ceil(visible.length / CONFIG.pageSize);
    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * CONFIG.pageSize;
    const end = start + CONFIG.pageSize;
    const pageItems = visible.slice(start, end);

    if (!pageItems.length) {
      listEl.innerHTML = `<div class="text-muted small px-3 py-2">No hay nuevas postulaciones.</div>`;
      updateCount();
      return;
    }

    const html = pageItems
      .map((p) => renderItem(p, new Date(p.fecha_postulacion).getTime() > lastSeen))
      .join("");

    listEl.innerHTML = html + renderPagination(totalPages);
    attachDeleteListeners();
    attachPaginationListeners(totalPages);
    updateCount();
  }

  // ===== Paginación =====
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

  // ===== Eliminar =====
  function attachDeleteListeners() {
    listEl.querySelectorAll(".notification-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        markDeleted(id);
      });
    });
  }

  // ===== Contador =====
  function updateCount() {
    if (!countEl) return;
    const count = postulaciones.filter((p) => !isDeleted(p.id)).length;
    countEl.textContent = String(count);
  }

  // ===== Refresh =====
  async function paintNotifications() {
    const empresaId = await fetchEmpresaId();
    if (!empresaId) return;
    postulaciones = await fetchPostulacionesEmpresa(empresaId);
    if (postulaciones.length) {
      setLastSeen(new Date().toISOString());
      renderList();
    }
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

  // ===== Ciclo de vida =====
  document.addEventListener("DOMContentLoaded", safeRefresh);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") safeRefresh();
  });
  window.addEventListener("focus", safeRefresh);

  const interval = setInterval(() => {
    if (document.visibilityState === "visible") safeRefresh();
  }, CONFIG.refreshMs);

  window.addEventListener("beforeunload", () => clearInterval(interval));
})();
