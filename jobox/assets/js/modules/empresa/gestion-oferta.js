// ====== gestion-oferta.js (paginación + cache optimizado) ======
import { getUserIdFromToken } from "../utils/decode-jwt.js";

/* ───── Toast genérico ───── */
function showToast(message, type = "success") {
  const toastEl = document.getElementById("liveToast");
  const toastTitle = document.getElementById("toastTitle");
  const toastBody = document.getElementById("toastBody");

  toastBody.textContent = message;
  toastEl.classList.remove("bg-success", "bg-danger", "bg-warning");
  toastTitle.textContent =
    type === "success" ? "✅ Éxito" :
    type === "error" ? "❌ Error" :
    "⚠️ Aviso";
  toastEl.classList.add(
    type === "success" ? "bg-success" :
    type === "error" ? "bg-danger" :
    "bg-warning"
  );

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/* ───── Helpers ───── */
function extractPostulantesCount(json) {
  try {
    if (Array.isArray(json)) return json.length;
    if (json && typeof json === "object") {
      if (typeof json.total === "number") return json.total;
      if (json.meta && typeof json.meta === "object") {
        return json.meta.totalItems || json.meta.total || 0;
      }
      if (Array.isArray(json.data)) return json.data.length;
    }
  } catch (_) {}
  return 0;
}

/* ───── Cache en memoria ───── */
const postulantesCache = new Map();

async function getPostulantesCount(ofertaId) {
  // 🔹 Si está cacheado, devolver inmediatamente
  if (postulantesCache.has(ofertaId)) {
    return postulantesCache.get(ofertaId);
  }

  try {
    const res = await fetch(`${BASE_URL_API}/postulaciones/oferta/${ofertaId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const count = extractPostulantesCount(json);
    postulantesCache.set(ofertaId, count); // 🔹 Guardar en cache
    return count;
  } catch (err) {
    console.warn(`⚠️ Error obteniendo postulantes para oferta ${ofertaId}:`, err);
    postulantesCache.set(ofertaId, 0);
    return 0;
  }
}

/* ───── Variables globales ───── */
let currentPage = 1;
const itemsPerPage = 7;
let totalPages = 1;
let totalItemsGlobal = 0;
let empleador_id = null;
let tipoSeleccionado = "";

/* === Render principal === */
async function renderOfertas(page = 1) {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("ofertas-body");
  const container = tbody.closest("table")?.parentElement || tbody;

  // 🔹 Fade-out
  container.style.transition = "opacity 0.3s ease";
  container.style.opacity = "0.3";

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const json = await res.json();
    let ofertas = json.data || json;

    // 🔹 Filtrar por tipo (frontend)
    if (tipoSeleccionado) {
      ofertas = ofertas.filter((o) => o.tipo_aviso === tipoSeleccionado);
    }

    totalItemsGlobal = ofertas.length;
    totalPages = Math.ceil(totalItemsGlobal / itemsPerPage) || 1;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOfertas = ofertas.slice(start, end);

    await new Promise((r) => setTimeout(r, 150)); // transición sutil

    if (!pageOfertas.length) {
      const msg = tipoSeleccionado
        ? `No tienes avisos del tipo <strong>${tipoSeleccionado}</strong>.`
        : `No tienes ofertas publicadas.`;
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">${msg}</td></tr>`;
      document.querySelector(".pagination").innerHTML = "";
      return;
    }

    // 🔹 Render de filas con cache de postulantes
    const filas = pageOfertas.map((oferta) => {
      const fecha = oferta.fecha_cierre
        ? new Date(oferta.fecha_cierre).toLocaleDateString("es-CL", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="profile-job-info">
            <div class="profile-job-content">
              <h6 class="mb-1 fw-semibold">${oferta.titulo}</h6>
              <ul class="profile-job-list small text-muted mb-0">
                <li><i class="far fa-location-dot me-1"></i> ${oferta.empleador?.data?.region || "Sin región"}</li>
              </ul>
            </div>
          </div>
        </td>
        <td>
          <a href="employer-candidate.html?id=${oferta.id}"
             class="btn btn-outline-primary btn-sm rounded-pill position-relative px-3 py-1">
            <i class="far fa-users me-1"></i>
            Postulantes
            <span id="post-count-${oferta.id}" 
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                  style="font-size: 0.9em;">...</span>
          </a>
        </td>
        <td>${fecha}</td>
        <td>
          <span class="badge ${oferta.es_activa ? "bg-success" : "bg-secondary"} px-3 py-2">
            ${oferta.es_activa ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td class="text-nowrap">
          <a href="employer-view-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm me-1" title="Ver">
            <i class="far fa-eye"></i></a>
          <a href="employer-edit-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm me-1" title="Editar">
            <i class="far fa-pen"></i></a>
          <a href="#" class="btn btn-outline-danger btn-sm btn-delete" data-id="${oferta.id}" title="Eliminar">
            <i class="far fa-trash-can"></i></a>
        </td>`;
      return tr;
    });

    tbody.innerHTML = "";
    filas.forEach((tr) => tbody.appendChild(tr));

    // 🔹 Cargar los conteos en background usando cache
    pageOfertas.forEach(async (oferta) => {
      const span = document.getElementById(`post-count-${oferta.id}`);
      const count = await getPostulantesCount(oferta.id);
      if (span) span.textContent = count;
    });

    renderPagination();
    activarBotonesEliminar(token);
  } catch (error) {
    console.error("❌ Error al cargar ofertas:", error);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar las ofertas.</td></tr>`;
  }

  // 🔹 Fade-in
  requestAnimationFrame(() => {
    container.style.opacity = "1";
  });
}

/* === Evento del selector de tipo === */
document.getElementById("filterTipoAviso")?.addEventListener("change", (e) => {
  tipoSeleccionado = e.target.value;
  currentPage = 1;
  renderOfertas(currentPage);
});

/* === Inicialización === */
(async () => {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();

  if (!userId) {
    console.error("Token inválido");
    showToast("Token no válido", "error");
    return;
  }

  try {
    const empleadorRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const empleadorData = await empleadorRes.json();
    empleador_id = empleadorData.empleador_id;

    await renderOfertas(currentPage);
  } catch (err) {
    console.error("Error cargando empleador:", err);
    showToast("Error al cargar las ofertas", "error");
  }
})();

/* ───── Paginación ───── */
function renderPagination() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  const prevDisabled = currentPage === 1 ? "disabled" : "";
  const nextDisabled = currentPage === totalPages ? "disabled" : "";

  let html = `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">
        <i class="far fa-angle-double-left"></i>
      </a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  html += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">
        <i class="far fa-angle-double-right"></i>
      </a>
    </li>
  `;

  pagination.innerHTML = html;

  pagination.querySelectorAll("a.page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const newPage = parseInt(e.currentTarget.dataset.page, 10);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
        currentPage = newPage;
        renderOfertas(currentPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  const info = document.getElementById("pagination-info");
  if (info) {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItemsGlobal);
    info.textContent = `Mostrando ${start} – ${end} de ${totalItemsGlobal} ofertas`;
  }
}

/* ───── Eliminar ofertas ───── */
function activarBotonesEliminar(token) {
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  let idOfertaAEliminar = null;
  let filaAEliminar = null;

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      idOfertaAEliminar = btn.dataset.id;
      filaAEliminar = btn.closest("tr");
      deleteModal.show();
    });
  });

  confirmBtn.onclick = async () => {
    if (!idOfertaAEliminar) return;
    try {
      const res = await fetch(`${BASE_URL_API}/ofertas/${idOfertaAEliminar}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        deleteModal.hide();
        filaAEliminar?.remove();
        showToast("Oferta eliminada correctamente", "success");
        renderOfertas(currentPage);
      } else {
        const err = await res.text();
        showToast(`Error al eliminar: ${err}`, "error");
      }
    } catch (err) {
      console.error("❌ Error al eliminar la oferta:", err);
      showToast("Error inesperado al eliminar.", "error");
    } finally {
      idOfertaAEliminar = null;
      filaAEliminar = null;
    }
  };
}
