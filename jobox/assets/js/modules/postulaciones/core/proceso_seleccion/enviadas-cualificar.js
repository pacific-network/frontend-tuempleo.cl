// =====================================================
// MÓDULO: Enviadas → Cualificar
// =====================================================

import { 
  getPostulantesOferta, 
  cualificar 
} from "../api-postulaciones.js";

let OFERTA_ID = null;

// =============================
// AUTO-INICIALIZACIÓN
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
// INICIALIZAR MÓDULO
// =============================
export async function initEnviadas(ofertaId) {
  OFERTA_ID = ofertaId;
  await loadEnviadas();
}

// =============================
// CARGAR POSTULACIONES ENVIADAS
// =============================
async function loadEnviadas() {
  try {
    const data = await getPostulantesOferta(OFERTA_ID);

    const enviadas = data.filter(p =>
      (p.estado || "").toLowerCase() === "enviada" ||
      (p.estado || "").toLowerCase() === "enviado"
    );

    renderEnviadas(enviadas);
    bindViewCVEvents();
    attachCualificarEvents();

  } catch (error) {
    console.error("❌ Error cargando enviadas:", error);
  }
}

// =============================
// RENDER LISTA
// =============================
function renderEnviadas(lista) {
  const contenedor = document.getElementById("lista-enviadas");
  const empty = document.getElementById("empty-enviadas");
  const count = document.getElementById("count-enviadas");

  contenedor.innerHTML = "";
  count.textContent = lista.length;

  if (lista.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  lista.forEach(item => {
    const div = document.createElement("div");
    div.className = "col-12 mb-3";
    div.innerHTML = crearCardContratados(item);
    contenedor.appendChild(div);
  });
}

// =============================
// EVENTOS — VER CV
// =============================
function bindViewCVEvents() {
  document.querySelectorAll(".ver-cv").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const userId = e.target.getAttribute("data-user-id");
      const postulacionId = btn.getAttribute("data-postulacion-id");
      const estado = btn.getAttribute("data-estado");
      const OFERTA_ID = btn.getAttribute("data-oferta-id");

      if (!userId) {
        console.error("❌ No se encontró el user ID");
        return;
      }

      console.log("👤 Redirigiendo a candidato usuario ID:", userId);

      // 🔥 RESPETA EXACTAMENTE TU RUTA
      window.location.href = `/empresas/employer-view-candidate.html?id=${userId}`;
    });
  });
}

// =============================
// CREAR CARD CANDIDATO
// =============================
function crearCardCandidato(item) {
  const usuario = item.postulante.usuario;
  const data = item.postulante.data;

  const nombre = `${data.nombre} ${data.apellido}`;
  const perfil = usuario.perfil_foto || "../assets/img/candidate/02.jpg";
  const estado = item.estado.toLowerCase();
  const region = data.datos_personales?.region || "N/A";
  const comuna = data.datos_personales?.comuna || "N/A";
  const area = data.preferencias?.categoria_empleo || "N/A";
  const renta = data.preferencias?.salario_esperado || 0;
  const rentaFormateada = renta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `
    <div class="candidate-card border rounded shadow-sm p-3 mb-3 bg-white"
         data-postulacion-id="${item.id}">

      <div class="d-flex align-items-center justify-content-between w-100">

        <img src="${perfil}" class="rounded-circle me-3 border border-secondary"
             width="60" height="60" style="object-fit: cover;">

        <div class="flex-grow-1 d-flex align-items-center justify-content-between">

          <div class="text-center" style="width: 160px;">
            <div class="fw-bold fs-6">${nombre}</div>
            <div class="small text-success text-capitalize">${estado}</div>
          </div>

          <div class="text-center" style="width: 180px;">
            <div class="fw-semibold">${region}</div>
          </div>

          <div class="text-center" style="width: 140px;">
            <div class="fw-semibold">${comuna}</div>
          </div>

          <div class="text-center" style="width: 150px;">
            <div class="fw-semibold">${area}</div>
          </div>

          <div class="text-center" style="width: 120px;">
            <div class="fw-semibold text-primary">$${rentaFormateada}</div>
            <div class="small text-muted">CLP</div>
          </div>

        </div>

        <!-- BOTONES -->
        <div class="d-flex flex-column align-items-end ms-3">

          <button class="btn btn-sm btn-outline-primary ver-cv" data-postulacion-id="${postulacionId}" data-user-id="${usuarioId}" data-estado="${estado}" data-oferta-id="${OFERTA_ID}" style="width: 80px; height: 35px;">
            Ver CV
          </button>
          ${
            estado === "enviada"
              ? '<button class="btn btn-sm btn-outline-danger toggle-heart" style="width: 80px; height: 35px;">❤</button>'
              : ""
          }

        </div>

      </div>
    </div>
  `;
}

// =============================
// EVENTOS — CUALIFICAR
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
