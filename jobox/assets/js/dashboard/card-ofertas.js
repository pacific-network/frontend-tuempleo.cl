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

    // 🔹 Render dinámico con estructura elegante
    const cardsHTML = ofertas
      .map((o) => {
        const inicio = o.fecha_publicacion ? new Date(o.fecha_publicacion) : new Date();
        let duracionDias = 30;
        if (o.tipo_aviso === "ESTANDAR" || o.tipo_aviso === "PREMIUM") duracionDias = 60;

        const termino = new Date(inicio);
        termino.setDate(inicio.getDate() + duracionDias);
        const diasRestantes = Math.ceil((termino - hoy) / (1000 * 60 * 60 * 24));

        let estadoClass = "badge-active";
        let estadoTexto = "Activo";
        if (diasRestantes < 0) {
          estadoClass = "badge-expired";
          estadoTexto = "Expirado";
        } else if (diasRestantes <= 3) {
          estadoClass = "badge-warning";
          estadoTexto = "Por expirar";
        }

        const inicioFmt = inicio.toLocaleDateString("es-CL", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const terminoFmt = termino.toLocaleDateString("es-CL", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return `
          <div class="job-card ${estadoClass}">
            <div class="job-card-header">
              <h5 class="job-card-title">${o.titulo || "Sin título"}</h5>
              <span class="job-badge ${estadoClass}">
                <i class="fa-solid fa-circle-check"></i> ${estadoTexto}
              </span>
            </div>
            <div class="job-divider"></div>
            <div class="job-info">
              <div class="info-row">
                <i class="far fa-calendar-alt"></i>
                <div class="info-text">
                  <strong>Inicio</strong>
                  <span>${inicioFmt}</span>
                </div>
              </div>
              <div class="info-row">
                <i class="far fa-calendar"></i>
                <div class="info-text">
                  <strong>Término</strong>
                  <span>${terminoFmt}</span>
                </div>
              </div>
              <div class="info-row">
                <i class="far fa-star"></i>
                <div class="info-text">
                  <strong>Tipo</strong>
                  <span>${o.tipo_aviso || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

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
