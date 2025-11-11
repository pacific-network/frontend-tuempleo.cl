// import { getUserIdFromToken } from "../modules/utils/decode-jwt.js"; // ✅ ruta corregida

// document.addEventListener("DOMContentLoaded", async () => {
//   const BASE_URL_API = window.BASE_URL_API;
//   const token = localStorage.getItem("token");
//   const container = document.getElementById("candidatos-container");
//   container.innerHTML = `<p class="text-center text-muted">Cargando avisos de tu empresa...</p>`;

//   try {
//     const userId = getUserIdFromToken();
//     if (!userId) {
//       container.innerHTML = `<p class="text-danger text-center">Token inválido o usuario no identificado.</p>`;
//       return;
//     }

//     // 🔹 Obtener datos del empleador
//     const empleadorRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!empleadorRes.ok) {
//       console.error("❌ Error al obtener empleador:", await empleadorRes.text());
//       container.innerHTML = `<p class="text-danger text-center">Error al cargar el empleador.</p>`;
//       return;
//     }

//     const { empleador_id } = await empleadorRes.json();
//     if (!empleador_id) {
//       container.innerHTML = `<p class="text-center text-muted">No se encontró información del empleador.</p>`;
//       return;
//     }

//     // 🔹 Obtener ofertas de trabajo
//     const ofertasRes = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}?page=1&take=10&order=DESC`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!ofertasRes.ok) {
//       console.error("❌ Error al obtener ofertas:", await ofertasRes.text());
//       container.innerHTML = `<p class="text-danger text-center">Error al cargar las ofertas.</p>`;
//       return;
//     }

//     const { data: ofertas } = await ofertasRes.json();
//     if (!ofertas || ofertas.length === 0) {
//       container.innerHTML = `<p class="text-center text-muted">Tu empresa aún no tiene avisos publicados.</p>`;
//       return;
//     }

//     // 🔹 Ordenar del más nuevo al más antiguo
//     ofertas.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

//     const hoy = new Date();

//     const cardsHTML = ofertas.map((o) => {
//       const inicio = o.fecha_publicacion ? new Date(o.fecha_publicacion) : new Date();
//       const cierre = o.fecha_cierre ? new Date(o.fecha_cierre) : null;
    
//       const inicioFmt = inicio.toLocaleDateString("es-CL", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//       const terminoFmt = cierre
//         ? cierre.toLocaleDateString("es-CL", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })
//         : "-";
    
//       let estadoClass = "badge-active";
//       let estadoTexto = "Activo";
//       if (!o.es_activa) {
//         estadoClass = "badge-expired";
//         estadoTexto = "Cerrado";
//       } else if (cierre && cierre < new Date()) {
//         estadoClass = "badge-expired";
//         estadoTexto = "Expirado";
//       }
    
//       const visitas = Number(o.visitsTotal ?? 0);
    
// return `
//   <div class="job-card">
//     <h5 class="job-card-title">${o.titulo || "Sin título"}</h5>
//     <span class="job-badge ${estadoClass}">
//       <i class="fa-solid fa-circle-check"></i> ${estadoTexto}
//     </span>
//     <div class="info-row">
//       <i class="far fa-calendar-alt"></i>
//       <strong>Publicado:</strong> ${inicioFmt}
//     </div>
//     <div class="info-row">
//       <i class="far fa-calendar"></i>
//       <strong>Cierre:</strong> ${terminoFmt}
//     </div>
//     <div class="info-row">
//       <i class="far fa-eye"></i>
//       <strong>Visitas:</strong>
//       <span class="text-primary fw-bold">${visitas}</span>
//     </div>
//     <div class="info-row">
//       <i class="far fa-star"></i>
//       <strong>Tipo:</strong> ${o.tipo_aviso || "-"}
//     </div>
//   </div>
// `;
//     }).join("");
    


//     container.innerHTML = `<div class="user-profile-grid">${cardsHTML}</div>`;

//     // 🔹 Tabs dinámicos
//     document.querySelectorAll("#visitasTabs .nav-link").forEach((tab) => {
//       tab.addEventListener("click", (e) => {
//         e.preventDefault();
//         document.querySelectorAll("#visitasTabs .nav-link").forEach((t) => t.classList.remove("active"));
//         document.querySelectorAll(".tab-pane").forEach((p) => p.classList.add("d-none"));
//         tab.classList.add("active");
//         document.querySelector(`#tab-${tab.dataset.tab}`).classList.remove("d-none");
//       });
//     });
//   } catch (error) {
//     console.error("❌ Error general al cargar avisos:", error);
//     container.innerHTML = `<p class="text-danger text-center">No se pudieron cargar los avisos (${error.message}).</p>`;
//   }
// });
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

        const inicioFmt = inicio.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" });
        const terminoFmt = cierre
          ? cierre.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" })
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
          <div class="job-card">
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

    cardsContainer.innerHTML = `<div class="user-profile-grid">${html}</div>`;
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
  async function loadPage(page = 1) {
    if (!state.empresaId) return;

    loading("Cargando avisos...");
    try {
      const url = new URL(`${BASE_URL_API}/ofertas/empresa/${state.empresaId}`);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("take", state.take.toString());
      url.searchParams.set("order", state.order);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("❌ Error ofertas:", txt);
        errorMsg("Error al cargar las ofertas.");
        return;
      }

      // Esperamos { data: Oferta[], meta: {...} }
      const payload = await res.json();
      const ofertas = payload?.data ?? payload; // fallback por si el endpoint retorna array plano
      const meta = payload?.meta ?? null;

      state.page = meta?.page ?? page;
      state.meta = meta;

      renderCards(ofertas);
      renderPagination(meta);
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
