// ====== gestion-oferta.js (paginación + cache optimizado + región + sueldo) ======
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
  // Si está en caché, retornarlo
  if (postulantesCache.has(ofertaId)) return postulantesCache.get(ofertaId);

  try {
    const res = await fetch(`${BASE_URL_API}/postulaciones/oferta/${ofertaId}`);

    // 404 → Oferta sin postulantes
    if (res.status === 404) {
      postulantesCache.set(ofertaId, 0);
      return 0;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const count = extractPostulantesCount(json);

    postulantesCache.set(ofertaId, count);
    return count;

  } catch {
    // Error inesperado → retornar 0 igual
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

/* ───── Regiones Chile ───── */
const regionesChile = [
  { numero: 1, nombre: "Región de Arica y Parinacota" },
  { numero: 2, nombre: "Región de Tarapacá" },
  { numero: 3, nombre: "Región de Antofagasta" },
  { numero: 4, nombre: "Región de Atacama" },
  { numero: 5, nombre: "Región de Coquimbo" },
  { numero: 6, nombre: "Región de Valparaíso" },
  { numero: 7, nombre: "Región Metropolitana de Santiago" },
  { numero: 8, nombre: "Región del Libertador General Bernardo O’Higgins" },
  { numero: 9, nombre: "Región del Maule" },
  { numero: 10, nombre: "Región de Ñuble" },
  { numero: 11, nombre: "Región del Biobío" },
  { numero: 12, nombre: "Región de La Araucanía" },
  { numero: 13, nombre: "Región de Los Ríos" },
  { numero: 14, nombre: "Región de Los Lagos" },
  { numero: 15, nombre: "Región de Aysén del General Carlos Ibáñez del Campo" },
  { numero: 16, nombre: "Región de Magallanes y de la Antártica Chilena" }
];

function obtenerNombreRegion(numero) {
  const region = regionesChile.find(r => Number(r.numero) === Number(numero));
  return region ? region.nombre : "Sin región";
}

/* === Render principal === */
async function renderOfertas(page = 1) {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("ofertas-body");
  const container = tbody.closest("table")?.parentElement || tbody;

  // Fade-out
  container.style.transition = "opacity 0.3s ease";
  container.style.opacity = "0.3";

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const json = await res.json();
    let ofertas = json.data || json;

    // Filtrar por tipo
    if (tipoSeleccionado) {
      ofertas = ofertas.filter((o) => o.tipo_aviso === tipoSeleccionado);
    }

    totalItemsGlobal = ofertas.length;
    totalPages = Math.ceil(totalItemsGlobal / itemsPerPage) || 1;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOfertas = ofertas.slice(start, end);

    await new Promise((r) => setTimeout(r, 150));

    if (!pageOfertas.length) {
      tbody.innerHTML = `
        <tr><td colspan="6" class="text-center py-4 text-muted">
        ${tipoSeleccionado ? `No tienes avisos del tipo <strong>${tipoSeleccionado}</strong>.` : "No tienes ofertas publicadas."}
        </td></tr>`;
      document.querySelector(".pagination").innerHTML = "";
      return;
    }

    // === RENDER FINAL: incluye REGIÓN + SUELDO + POSTULANTES + BADGE estado ===
    const filas = await Promise.all(
      pageOfertas.map(async (oferta) => {

        let totalPostulantes = await getPostulantesCount(oferta.id);

        // Parsear data (puede venir string)
        let data = {};
        try {
          data = oferta.data
            ? (typeof oferta.data === "string" ? JSON.parse(oferta.data) : oferta.data)
            : {};
        } catch { data = {}; }

        // Región
        const regionNumero = data.region || oferta.empleador?.data?.region;
        const regionNombre = obtenerNombreRegion(regionNumero);

        // Sueldo
        let sueldoTexto = "De acuerdo al mercado";
        if (data.renta) {
          const d = Number(data.renta.desde || 0);
          const h = Number(data.renta.hasta || 0);
          const f = (n) => n.toLocaleString("es-CL");

          if (d && h && d !== h) sueldoTexto = `$${f(d)} - $${f(h)}`;
          else if (d && !h) sueldoTexto = `$${f(d)}`;
        }

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
                  <li><i class="far fa-location-dot me-1"></i> ${regionNombre}</li>
                </ul>
              </div>
            </div>
          </td>

          <td>${sueldoTexto}</td>

          <td>${fecha}</td>

          <td>
            <a href="employer-candidate.html?id=${oferta.id}"
               class="btn btn-outline-primary btn-sm rounded-pill position-relative px-3 py-1">
              <i class="far fa-users me-1"></i>
              Postulantes
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                    style="font-size: 0.9em;">${totalPostulantes}</span>
            </a>
          </td>

          <td>
            <span class="badge ${oferta.es_activa ? "bg-success" : "bg-secondary"} px-3 py-2">
              ${oferta.es_activa ? "Activo" : "Inactivo"}
            </span>
          </td>

          <td class="text-nowrap">
            <a href="employer-view-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm me-1">
              <i class="far fa-eye"></i></a>
            <a href="employer-edit-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm me-1">
              <i class="far fa-pen"></i></a>
            <a href="#" class="btn btn-outline-danger btn-sm btn-delete" data-id="${oferta.id}">
              <i class="far fa-trash-can"></i></a>
          </td>`;
        return tr;
      })
    );

    tbody.innerHTML = "";
    filas.forEach((tr) => tbody.appendChild(tr));

    renderPagination();
    activarBotonesEliminar(token);

  } catch (err) {
    console.error("❌ Error al cargar ofertas:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar las ofertas.</td></tr>`;
  }

  requestAnimationFrame(() => {
    container.style.opacity = "1";
  });
}

/* === Evento filtro tipo === */
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
      const newPage = Number(e.currentTarget.dataset.page);
      if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
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
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
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
        const errText = await res.text();
        showToast(`Error al eliminar: ${errText}`, "error");
      }
    } catch (err) {
      showToast("Error inesperado al eliminar.", "error");
    } finally {
      idOfertaAEliminar = null;
      filaAEliminar = null;
    }
  };
}
