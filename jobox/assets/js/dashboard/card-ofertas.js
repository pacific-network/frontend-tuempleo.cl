import { getUserIdFromToken } from "../modules/utils/decode-jwt.js";

document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL_API = window.BASE_URL_API;
  const token = localStorage.getItem("token");

  const cardsContainer = document.getElementById("candidatos-container");
  if (!cardsContainer) {
    console.error("❌ No existe #candidatos-container en el DOM.");
    return;
  }

  // Crea contenedor de paginación si no existe
  let paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "d-flex justify-content-center mt-3";
    cardsContainer.insertAdjacentElement("afterend", paginationContainer);
  }

  const state = {
    empresaId: null,
    page: 1,
    take: 10,
    order: "DESC",
    meta: null,
  };

  // Helpers UI
  const loading = (msg = "Cargando avisos de tu empresa...") =>
    (cardsContainer.innerHTML = `<p class="text-center text-muted">${msg}</p>`);

  const errorMsg = (msg) =>
    (cardsContainer.innerHTML = `<p class="text-danger text-center">${msg}</p>`);

  // Render de tarjetas
  function renderCards(ofertas = []) {
    if (!ofertas.length) {
      cardsContainer.innerHTML = `<p class="text-center text-muted">No hay avisos para mostrar.</p>`;
      return;
    }
  
    const html = ofertas
      .map((o) => {
        const inicio = o.fecha_publicacion ? new Date(o.fecha_publicacion) : new Date();
        const cierre = o.fecha_cierre ? new Date(o.fecha_cierre) : null;
  
        const inicioFmt = inicio.toLocaleDateString("es-CL", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const terminoFmt = cierre
          ? cierre.toLocaleDateString("es-CL", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
  
        let estadoClass = "badge-active";
        let estadoTexto = "Activo";
        if (!o.es_activa) {
          estadoClass = "badge-expired";
          estadoTexto = "Cerrado";
        } else if (cierre && cierre < new Date()) {
          estadoClass = "badge-expired";
          estadoTexto = "Expirado";
        }
  
        const visitas = Number(o.visitsTotal ?? 0);
  
        return `
          <div class="job-card" data-id="${o.id}" style="cursor:pointer;">
            <h5 class="job-card-title">${o.titulo || "Sin título"}</h5>
            <span class="job-badge ${estadoClass}">
              <i class="fa-solid fa-circle-check"></i> ${estadoTexto}
            </span>
            <div class="info-row">
              <i class="far fa-calendar-alt"></i>
              <strong>Publicado:</strong> ${inicioFmt}
            </div>
            <div class="info-row">
              <i class="far fa-calendar"></i>
              <strong>Cierre:</strong> ${terminoFmt}
            </div>
            <div class="info-row">
              <i class="far fa-eye"></i>
              <strong>Visitas:</strong>
              <span class="text-primary fw-bold">${visitas}</span>
            </div>
            <div class="info-row">
              <i class="far fa-star"></i>
              <strong>Tipo:</strong> ${o.tipo_aviso || "-"}
            </div>
          </div>
        `;
      })
      .join("");
  
    // 🔹 Insertamos las tarjetas
    cardsContainer.innerHTML = `<div class="user-profile-grid">${html}</div>`;
  
    // 🔹 Ahora sí: agregamos el evento click a las tarjetas ya creadas
    cardsContainer.querySelectorAll(".job-card").forEach((card) => {
      card.addEventListener("click", () => {
        const ofertaId = card.getAttribute("data-id");
        if (!ofertaId) return;
    
        // Detecta si estás en local o producción
        const isLocal = window.location.hostname.includes("127.0.0.1") || window.location.hostname.includes("localhost");
    
        const baseUrl = isLocal
          ? "http://127.0.0.1:5501/jobox/empresas" // 🌐 local
          : "https://www.tuempleo.cl/empresas";   // 🌍 producción
    
        // Redirección al detalle de la oferta
        window.location.href = `${baseUrl}/employer-view-job.html?id=${ofertaId}`;
      });
    });
    
  }
  

  // Render de paginación
  function renderPagination(meta) {
    if (!meta) {
      paginationContainer.innerHTML = "";
      return;
    }

    const { page, pageCount, hasPreviousPage, hasNextPage } = meta;

    // Ventana de páginas (máx 7)
    const MAX = 7;
    let start = Math.max(1, page - Math.floor(MAX / 2));
    let end = Math.min(pageCount, start + MAX - 1);
    start = Math.max(1, Math.min(start, end - MAX + 1));

    const btn = (p, active = false, disabled = false, label = null) => {
      const text = label ?? p;
      const cls = [
        "btn",
        "btn-sm",
        active ? "btn-primary" : "btn-outline-primary",
        "mx-1",
      ].join(" ");
      const dis = disabled ? "disabled aria-disabled='true'" : "";
      return `<button class="${cls}" data-page="${p}" ${dis}>${text}</button>`;
    };

    let controls = "";
    controls += btn(page - 1, false, !hasPreviousPage, "&laquo; Anterior");

    for (let i = start; i <= end; i++) {
      controls += btn(i, i === page);
    }

    controls += btn(page + 1, false, !hasNextPage, "Siguiente &raquo;");

    paginationContainer.innerHTML = controls;
  }

  // Cargar página
  // Cargar página
async function loadPage(page = 1) {
  if (!state.empresaId) return;

  loading("Cargando avisos...");
  try {
    const url = new URL(`${BASE_URL_API}/ofertas/empresa/${state.empresaId}`);
    // ⚠️ quitamos los params porque el backend no usa paginación
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ Error ofertas:", txt);
      errorMsg("Error al cargar las ofertas.");
      return;
    }

    const payload = await res.json();
    let ofertas = payload?.data ?? payload;

    // 🔹 Ordenar por fecha de publicación (desc)
    ofertas = ofertas.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

    // Mostrar leyenda
const infoLabelId = "ultimos-avisos-label";
let infoLabel = document.getElementById(infoLabelId);
if (!infoLabel) {
  infoLabel = document.createElement("p");
  infoLabel.id = infoLabelId;
  infoLabel.className = "text-center text-muted small mt-2";
  cardsContainer.insertAdjacentElement("beforebegin", infoLabel);
}
infoLabel.innerHTML = `Mostrando los <strong>últimos 5 avisos publicados</strong>.`;


    // 🔹 Mostrar solo los 5 más recientes
    const ultimas = ofertas.slice(0, 5);

    renderCards(ultimas);

    // 🔹 Quitar paginación
    paginationContainer.innerHTML = "";
  } catch (e) {
    console.error("❌ Error general loadPage:", e);
    errorMsg(`No se pudieron cargar los avisos (${e.message}).`);
  }
}


  // Init
  (async function init() {
    try {
      loading();

      // Validar usuario
      const userId = getUserIdFromToken();
      if (!userId) {
        errorMsg("Token inválido o usuario no identificado.");
        return;
      }

      // Obtener empresa del empleador
      const empRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!empRes.ok) {
        console.error("❌ Error empleador:", await empRes.text());
        errorMsg("Error al cargar el empleador.");
        return;
      }

      const { empresa_id } = await empRes.json();
      if (!empresa_id) {
        cardsContainer.innerHTML = `<p class="text-center text-muted">No se encontró información del empleador.</p>`;
        return;
      }

      state.empresaId = empresa_id;
      await loadPage(1);
    } catch (e) {
      console.error("❌ Error init:", e);
      errorMsg(`No se pudieron cargar los avisos (${e.message}).`);
    }
  })();

  // Delegación de eventos para paginación
  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    const page = parseInt(btn.dataset.page, 10);
    if (Number.isFinite(page) && page > 0 && (!state.meta || page <= state.meta.pageCount)) {
      loadPage(page);
    }
  });
});
