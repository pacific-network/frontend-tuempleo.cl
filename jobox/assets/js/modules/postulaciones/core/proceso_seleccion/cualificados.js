// //assets/js/modules/postulaciones/core/proceso_seleccion/cualificados.js
// import { getCualificados } from "../api-postulaciones.js";

// let OFERTA_ID = null;

// // =============================
// // Auto-inicialización
// // =============================
// document.addEventListener("DOMContentLoaded", () => {
//   const params = new URLSearchParams(window.location.search);
//   const id = params.get("id");

//   if (!id) {
//     console.error("❌ Falta ?id= en la URL");
//     return;
//   }

//   console.log("📌 ID OFERTA:", id);
//   initCualificados(id);
// });

// // =============================
// // Inicializar módulo
// // =============================
// export async function initCualificados(ofertaId) {
//   OFERTA_ID = ofertaId;
//   await loadCualificados();
// }

// // =============================
// // Cargar postulaciones CUALIFICADAS
// // =============================
// async function loadCualificados() {
//   try {
//     const data = await getCualificados(OFERTA_ID);
//     renderCualificados(data || []);
//   } catch (error) {
//     console.error("❌ Error cargando cualificados:", error);
//   }
// }

// // =============================
// // Render lista
// // =============================
// function renderCualificados(lista) {
//   const contenedor = document.getElementById("lista-compatibles");
//   const empty = document.getElementById("empty-compatibles");
//   const count = document.getElementById("count-compatibles");

//   if (!contenedor || !empty) return;

//   contenedor.innerHTML = "";
//   if (count) count.textContent = lista.length;

//   if (lista.length === 0) {
//     empty.style.display = "block";
//     return;
//   }
//   empty.style.display = "none";

//   lista.forEach(item => {
//     contenedor.innerHTML += crearCardCualificado(item);
//   });
// }

// // =============================
// // Card HTML — SOLO BOTÓN VER CV
// // =============================
// function crearCardCualificado(item) {
//   const usuario = item.postulante?.usuario || {};
//   const data = item.postulante?.data || {};

//   const nombre = `${data.nombre || ""} ${data.apellido || ""}`.trim() || "Sin nombre";
//   const perfil = usuario.perfil_foto || "../assets/img/candidate/02.jpg";
//   const estado = (item.estado || "").toLowerCase();
//   const region = data.datos_personales?.region || "N/A";
//   const comuna = data.datos_personales?.comuna || "N/A";
//   const area = data.preferencias?.categoria_empleo || "N/A";
//   const renta = data.preferencias?.salario_esperado || 0;

//   // Formatear salario con puntos
//   const rentaFormateada = renta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

//   // Mapear estados para mostrar nombre amigable
//   const estadoMap = {
//     enviada: "Enviada",
//     rechazada: "Rechazada",
//     pendiente: "Pendiente",
//     cualificado: "Calificado" // <-- aquí cambiamos
//   };

//   const estadoTexto = estadoMap[estado] || estado.charAt(0).toUpperCase() + estado.slice(1);

//   const estadoColor = {
//     enviada: "text-success",
//     rechazada: "text-danger",
//     pendiente: "text-warning",
//     cualificado: "text-primary"
//   }[estado] || "text-muted";

//   return `
//     <div class="candidate-card border rounded shadow-sm p-3 mb-3 bg-white" 
//          style="transition: transform 0.2s, box-shadow 0.2s;" 
//          data-postulacion-id="${item.id}">

//       <div class="d-flex align-items-center justify-content-between w-100">

//         <!-- FOTO -->
//         <img 
//           src="${perfil}" 
//           class="rounded-circle me-3 border border-secondary" 
//           width="60" 
//           height="60"
//           style="object-fit: cover;"
//         >

//         <!-- INFORMACIÓN -->
//         <div class="flex-grow-1 d-flex align-items-center justify-content-between">

//           <!-- NOMBRE + ESTADO -->
//           <div class="text-center" style="width: 160px;">
//             <div class="fw-bold fs-6">${nombre}</div>
//             <div class="small ${estadoColor} text-capitalize">${estadoTexto}</div>
//           </div>

//           <!-- REGIÓN -->
//           <div class="text-center" style="width: 180px;">
//             <div class="fw-semibold">${region}</div>
//           </div>

//           <!-- COMUNA -->
//           <div class="text-center" style="width: 140px;">
//             <div class="fw-semibold">${comuna}</div>
//           </div>

//           <!-- ÁREA -->
//           <div class="text-center" style="width: 150px;">
//             <div class="fw-semibold">${area}</div>
//           </div>

//           <!-- RENTA -->
//           <div class="text-center" style="width: 120px;">
//             <div class="fw-semibold text-primary">$${rentaFormateada}</div>
//             <div class="small text-muted">CLP</div>
//           </div>

//         </div>

//         <!-- BOTÓN VER CV -->
//         <div class="d-flex flex-column align-items-end ms-3">
//           <button class="btn btn-sm btn-outline-primary ver-cv" style="width: 80px; height: 35px;">Ver CV</button>
//         </div>

//       </div>
//     </div>

//     <style>
//       .candidate-card:hover {
//         transform: translateY(-3px);
//         box-shadow: 0 8px 20px rgba(0,0,0,0.15);
//       }
//       .ver-cv:hover {
//         transform: scale(1.05);
//       }
//     </style>
//   `;
// }
import { getCualificados } from "../api-postulaciones.js";

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
  initCualificados(id);
});

// =============================
// Inicializar módulo
// =============================
export async function initCualificados(ofertaId) {
  OFERTA_ID = ofertaId;
  await loadCualificados();
}

// =============================
// Cargar postulaciones CUALIFICADAS
// =============================
async function loadCualificados() {
  try {
    const data = await getCualificados(OFERTA_ID);
    console.log("📌 Cualificados:", data);
    renderCualificados(data || []);
    attachVerCvEvents(); 
  } catch (error) {
    console.error("❌ Error cargando cualificados:", error);
  }
}

// =============================
// Render lista
// =============================
function renderCualificados(lista) {
  const contenedor = document.getElementById("lista-compatibles");
  const empty = document.getElementById("empty-compatibles");
  const count = document.getElementById("count-compatibles");

  if (!contenedor || !empty) return;

  contenedor.innerHTML = "";
  if (count) count.textContent = lista.length;

  if (lista.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  lista.forEach(item => {
    contenedor.innerHTML += crearCardCualificado(item);
  });
}

// =============================
// Card HTML — con botón VER CV
// =============================
function crearCardCualificado(item) {
  const usuario = item.postulante?.usuario || {};
  const data = item.postulante?.data || {};

  const usuarioId = usuario.id ?? null;

  const nombre = `${data.nombre || ""} ${data.apellido || ""}`.trim() || "Sin nombre";
  const perfil = usuario.perfil_foto || "../assets/img/candidate/02.jpg";
  const estado = (item.estado || "").toLowerCase();
  const region = data?.datos_personales?.region || "N/A";
  const comuna = data?.datos_personales?.comuna || "N/A";
  const area = data?.preferencias?.categoria_empleo || "N/A";
  const renta = data?.preferencias?.salario_esperado || 0;
  const postulacionId = item.id;


  const rentaFormateada = renta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const estadoMapa = {
    enviada: "Enviada",
    descartado: "Descartado",
    preseleccionado: "Pre-Seleccionado",
    seleccionado: 'Seleccionado',
    cualificado: "Calificado"
  };

  const estadoTexto = estadoMapa[estado] || estado;
  const estadoColor = {
    enviada: "text-success",
    descartado: "text-danger",
    preseleccionado: "text-success",
    seleccionado: "text-success",
    cualificado: "text-primary"
  }[estado] || "text-muted";

  return `
    <div class="candidate-card border rounded shadow-sm p-3 mb-3 bg-white"
         data-user-id="${usuarioId}">

      <div class="d-flex align-items-center justify-content-between w-100">

        <img src="${perfil}" class="rounded-circle me-3 border border-secondary"
             width="60" height="60" style="object-fit: cover;">

        <div class="flex-grow-1 d-flex align-items-center justify-content-between">

          <div class="text-center" style="width: 160px;">
            <div class="fw-bold fs-6">${nombre}</div>
            <div class="small ${estadoColor}">${estadoTexto}</div>
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

        <div class="ms-3">
          <button 
            class="btn btn-sm btn-outline-primary ver-cv" 
            data-estado="${estado}"
            data-postulacion-id="${postulacionId}"
            data-user-id="${usuarioId}"
            style="width: 80px; height: 35px;">
            Ver CV
          </button>
        </div>

      </div>
    </div>
  `;
}

// =============================
// Evento → Redirección correcta
// =============================

function attachVerCvEvents() {
  document.querySelectorAll(".ver-cv").forEach(btn => {
    btn.addEventListener("click", e => {
      const userId = e.target.getAttribute("data-user-id");
      const postulacionId = e.target.getAttribute("data-postulacion-id");

      if (!userId || !postulacionId) {
        console.error("❌ Faltan datos para la redirección");
        return;
      }

      console.log("➡️ Redirigiendo:", { userId, postulacionId });

      window.location.href = `/jobox/empresas/employer-view-candidate.html?id=${userId}&postulacion=${postulacionId}`;
    });
  });
}

