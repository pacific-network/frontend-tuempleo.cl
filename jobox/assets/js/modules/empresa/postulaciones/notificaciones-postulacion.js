// // ===============================================================
// 📦 Integración: Notificaciones de nuevas postulaciones (Persistentes)
// 📁 src/assets/js/modules/empresa/postulaciones/notificaciones-postulacion.js
// ===============================================================

import { getUserIdFromToken } from "../../utils/decode-jwt.js";

(function () {
  const CONFIG = {
    refreshMs: 60000, // cada 60 segundos
    storageKeyLastSeen: "postulaciones_last_seen",
    storageKeyNotificaciones: "postulaciones_guardadas",
  };

  const BASE_URL_API = window.BASE_URL_API || "http://localhost:3000/v1";
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const AUTH = token ? { Authorization: `Bearer ${token}` } : {};
  const listEl = document.getElementById("notificationsList");
  if (!listEl) return;

  // ===== Helpers =====
  const getLastSeen = () => localStorage.getItem(CONFIG.storageKeyLastSeen) || "";
  const setLastSeen = (iso) => localStorage.setItem(CONFIG.storageKeyLastSeen, iso);

  const getGuardadas = () => {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.storageKeyNotificaciones)) || [];
    } catch {
      return [];
    }
  };

  const setGuardadas = (arr) =>
    localStorage.setItem(CONFIG.storageKeyNotificaciones, JSON.stringify(arr));

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
      if (v >= 1) {
        return diffSec >= 0
          ? `hace ${v} ${u}${v > 1 ? "s" : ""}`
          : `en ${v} ${u}${v > 1 ? "s" : ""}`;
      }
    }
    return "justo ahora";
  }

  // ===============================================================
  // 🧩 Obtener empresa_id usando el ID de usuario (token)
  // ===============================================================
  async function fetchEmpresaId() {
    const userId = getUserIdFromToken();
    if (!userId) return null;

    const url = `${BASE_URL_API}/empleador/basic-info/${userId}`;
    try {
      const res = await fetch(url, { headers: { ...AUTH, "Content-Type": "application/json" } });
      if (!res.ok) return null;
      const data = await res.json();
      return data.empresa_id || null;
    } catch {
      return null;
    }
  }

  // ===============================================================
  // 📬 Obtener todas las postulaciones de la empresa
  // ===============================================================
  async function fetchPostulacionesEmpresa(empresaId) {
    const url = `${BASE_URL_API}/seleccion/empresa/${empresaId}`;
    try {
      const res = await fetch(url, { headers: { ...AUTH, "Content-Type": "application/json" } });
      if (!res.ok) return [];
      const data = await res.json();
      console.log(`📬 Postulaciones encontradas para empresa ${empresaId}: ${data.length}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error en fetchPostulacionesEmpresa:", error);
      return [];
    }
  }

  // ===============================================================
  // 🔔 Renderizar notificación
  // ===============================================================
  function renderPostulacion(p, ofertaTitulo, isNew) {
    const nombre = `${p.postulante?.usuario?.nombres || ""} ${p.postulante?.usuario?.apellidos || ""}`.trim();
    const fecha = timeAgo(p.fechaPostulacion || p.fecha_postulacion);

    const card = document.createElement("div");
    card.className = "notification-card fade-in";
    card.dataset.type = "postulacion";
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="notification-icon"><i class="far fa-user text-info"></i></div>
      <div class="notification-content">
        <p class="notification-title">
          <b>${nombre || "Un postulante"}</b> postuló a <b>${ofertaTitulo || "una oferta"}</b>
          ${isNew ? '<span class="notification-badge">Nuevo</span>' : ""}
        </p>
        <p class="notification-text">Revisa su perfil desde el panel de candidatos.</p>
        <p class="notification-meta">Fecha: ${fecha}</p>
      </div>
      <button class="notification-delete" data-id="${p.id}" title="Eliminar notificación">
        <i class="far fa-trash"></i>
      </button>
    `;

    card.querySelector(".notification-delete").addEventListener("click", () => {
      card.remove();
      const restantes = getGuardadas().filter((n) => n.id !== p.id);
      setGuardadas(restantes);
    });

    listEl.prepend(card);
  }

  // ===============================================================
  // 🧠 Verificar nuevas postulaciones (comparando con guardadas)
  // ===============================================================
  async function checkNewPostulaciones() {
    try {
      const empresaId = await fetchEmpresaId();
      if (!empresaId) return;

      const postulaciones = await fetchPostulacionesEmpresa(empresaId);
      if (!postulaciones.length) return;

      const guardadas = getGuardadas();
      const nuevas = postulaciones.filter(
        (p) => !guardadas.some((g) => g.id === p.id)
      );

      if (nuevas.length > 0) {
        const actualizadas = [...guardadas, ...nuevas];
        setGuardadas(actualizadas);
        nuevas.forEach((p) => renderPostulacion(p, p.oferta?.titulo, true));
      } else {
        console.log("✅ No hay nuevas postulaciones.");
      }
    } catch (err) {
      console.error("❌ Error general en checkNewPostulaciones:", err);
    }
  }

  // ===============================================================
  // 🚀 Render inicial (desde localStorage)
  // ===============================================================
  function renderGuardadas() {
    const guardadas = getGuardadas();
    if (guardadas.length) {
      console.log(`♻️ Renderizando ${guardadas.length} notificaciones persistentes`);
      guardadas.forEach((p) => renderPostulacion(p, p.oferta?.titulo, false));
    }
  }

  // ===============================================================
  // 🚀 Ciclo de vida
  // ===============================================================
  document.addEventListener("DOMContentLoaded", () => {
    renderGuardadas(); // pintar persistentes primero
    checkNewPostulaciones(); // buscar nuevas
    setInterval(checkNewPostulaciones, CONFIG.refreshMs);
  });
})();
