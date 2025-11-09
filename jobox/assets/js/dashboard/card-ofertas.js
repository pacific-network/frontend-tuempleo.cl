import { getUserIdFromToken } from "../modules/utils/decode-jwt.js"; // ✅ ruta corregida

document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL_API = window.BASE_URL_API;
  const token = localStorage.getItem("token");
  const container = document.getElementById("candidatos-container");
  container.innerHTML = `<p class="text-center text-muted">Cargando avisos de tu empresa...</p>`;

  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      container.innerHTML = `<p class="text-danger text-center">Token inválido o usuario no identificado.</p>`;
      return;
    }

    // 🔹 Obtener datos del empleador
    const empleadorRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!empleadorRes.ok) {
      console.error("❌ Error al obtener empleador:", await empleadorRes.text());
      container.innerHTML = `<p class="text-danger text-center">Error al cargar el empleador.</p>`;
      return;
    }

    const { empleador_id } = await empleadorRes.json();
    if (!empleador_id) {
      container.innerHTML = `<p class="text-center text-muted">No se encontró información del empleador.</p>`;
      return;
    }

    // 🔹 Obtener ofertas de trabajo
    const ofertasRes = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}?page=1&take=10&order=DESC`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!ofertasRes.ok) {
      console.error("❌ Error al obtener ofertas:", await ofertasRes.text());
      container.innerHTML = `<p class="text-danger text-center">Error al cargar las ofertas.</p>`;
      return;
    }

    const { data: ofertas } = await ofertasRes.json();
    if (!ofertas || ofertas.length === 0) {
      container.innerHTML = `<p class="text-center text-muted">Tu empresa aún no tiene avisos publicados.</p>`;
      return;
    }

    // 🔹 Ordenar del más nuevo al más antiguo
    ofertas.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

    const hoy = new Date();

    const cardsHTML = ofertas.map((o) => {
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
    }).join("");
    


    container.innerHTML = `<div class="user-profile-grid">${cardsHTML}</div>`;

    // 🔹 Tabs dinámicos
    document.querySelectorAll("#visitasTabs .nav-link").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("#visitasTabs .nav-link").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach((p) => p.classList.add("d-none"));
        tab.classList.add("active");
        document.querySelector(`#tab-${tab.dataset.tab}`).classList.remove("d-none");
      });
    });
  } catch (error) {
    console.error("❌ Error general al cargar avisos:", error);
    container.innerHTML = `<p class="text-danger text-center">No se pudieron cargar los avisos (${error.message}).</p>`;
  }
});
