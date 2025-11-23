// =====================================================
// MÓDULO: Enviadas → Cualificar
// =====================================================

import { 
    getPostulantesOferta, 
    cualificar 
  } from "../api-postulaciones.js";
  
  let OFERTA_ID = null;
  
  // =============================
  // Auto-inicialización
  // =============================
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
  
    if (!id) {
      console.error("❌ Falta ?id= en la URL");
      return;
    }
  
    console.log("📌 ID OFERTA:", id);
    initEnviadas(id);
  });
  
  // =============================
  // Inicializar módulo
  // =============================
  export async function initEnviadas(ofertaId) {
    OFERTA_ID = ofertaId;
    await loadEnviadas();
  }
  
  // =============================
  // Cargar postulaciones ENVIADAS
  // =============================
  async function loadEnviadas() {
    try {
      const data = await getPostulantesOferta(OFERTA_ID);
  
      const enviadas = data.filter(p =>
        (p.estado || "").toLowerCase() === "enviada" ||
        (p.estado || "").toLowerCase() === "enviado"
      );
  
      renderEnviadas(enviadas);
    } catch (error) {
      console.error("❌ Error cargando enviadas:", error);
    }
  }
  
  // =============================
  // Render lista
  // =============================
  function renderEnviadas(lista) {
    const contenedor = document.getElementById("lista-enviadas");
    const empty = document.getElementById("empty-enviadas");
    const count = document.getElementById("count-enviadas");
  
    contenedor.innerHTML = ""; // limpiar
    count.textContent = lista.length;
  
    if (lista.length === 0) {
      empty.style.display = "block";
      return;
    }
  
    empty.style.display = "none";
  
    lista.forEach(item => {
      contenedor.innerHTML += crearCardCandidato(item);
    });
  
    attachCualificarEvents();
  }
  
  // =============================
  // Card HTML
  // =============================
  function crearCardCandidato(item) {
    const usuario = item.postulante.usuario;
    const data = item.postulante.data;
  
    const nombre = `${data.nombre} ${data.apellido}`;
    const perfil = usuario.perfil_foto || "../assets/img/candidate/02.jpg"; // Imagen por defecto
    const estado = item.estado.toLowerCase();
    const fecha = new Date(item.fechaPostulacion).toLocaleDateString();
  
    const region = data.datos_personales?.region || "N/A";
    const comuna = data.datos_personales?.comuna || "N/A";
    const area = data.preferencias?.categoria_empleo || "N/A";
    const renta = data.preferencias?.salario_esperado || 0;
  
    // Formatear salario a miles con puntos
    const rentaFormateada = renta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    // Colores por estado
    const estadoColor = {
      enviada: "text-success",
      rechazada: "text-danger",
      pendiente: "text-warning"
    }[estado] || "text-muted";
  
    return `
      <div class="candidate-card border rounded shadow-sm p-3 mb-3 bg-white" 
           style="transition: transform 0.2s, box-shadow 0.2s;" 
           data-postulacion-id="${item.id}">
  
        <div class="d-flex align-items-center justify-content-between w-100">
  
          <!-- FOTO -->
          <img 
            src="${perfil}" 
            class="rounded-circle me-3 border border-secondary" 
            width="60" 
            height="60"
            style="object-fit: cover;"
          >
  
          <!-- INFORMACIÓN -->
          <div class="flex-grow-1 d-flex align-items-center justify-content-between">
  
            <!-- NOMBRE + ESTADO -->
            <div class="text-center" style="width: 160px;">
              <div class="fw-bold fs-6">${nombre}</div>
              <div class="small ${estadoColor} text-capitalize">${estado}</div>
            </div>
  
            <!-- REGIÓN -->
            <div class="text-center" style="width: 180px;">
              <div class="fw-semibold">${region}</div>
            </div>
  
            <!-- COMUNA -->
            <div class="text-center" style="width: 140px;">
              <div class="fw-semibold">${comuna}</div>
            </div>
  
            <!-- ÁREA -->
            <div class="text-center" style="width: 150px;">
              <div class="fw-semibold">${area}</div>
            </div>
  
            <!-- RENTA -->
            <div class="text-center" style="width: 120px;">
              <div class="fw-semibold text-primary">$${rentaFormateada}</div>
              <div class="small text-muted">CLP</div>
            </div>
  
          </div>
  
          <!-- BOTONES -->
          <div class="d-flex flex-column align-items-end ms-3">
            <button class="btn btn-sm btn-outline-primary mb-1 ver-cv" style="width: 80px; height: 35px; transition: all 0.2s;">Ver CV</button>
            ${
              estado === "enviada"
                ? '<button class="btn btn-sm btn-outline-danger toggle-heart" style="width: 80px; height: 35px; transition: all 0.2s;">❤</button>'
                : ""
            }
          </div>
  
        </div>
      </div>
  
      <style>
        .candidate-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .toggle-heart:hover, .ver-cv:hover {
          transform: scale(1.05);
        }
      </style>
    `;
  }
  
  
  
  // =============================
  // Eventos — Cualificar
  // =============================
  function attachCualificarEvents() {
    document.querySelectorAll(".toggle-heart").forEach(btn => {
      
      btn.addEventListener("click", async e => {
        const card = e.target.closest("[data-postulacion-id]");
        const id = card.getAttribute("data-postulacion-id");
  
        await cualificar(id);
  
        await loadEnviadas();
  
        document.dispatchEvent(
          new CustomEvent("estadoActualizado", {
            detail: { desde: "enviadas", hacia: "calificados", id }
          })
        );
      });
    });
  }
  