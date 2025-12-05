import { getPreseleccionados } from "../api-postulaciones.js";

let OFERTA_ID = null;

// Auto-inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("❌ Falta ?id= en la URL");
    return;
  }

  console.log("📌 ID OFERTA:", id);
  initPreseleccionados(id);
});

// Inicializa la carga de preseleccionados
export async function initPreseleccionados(ofertaId) {
  OFERTA_ID = ofertaId;
  await loadPreseleccionados();
}

// Carga los datos desde la API
async function loadPreseleccionados() {
  try {
    const data = await getPreseleccionados(OFERTA_ID);
    console.log("📌 Preseleccionados:", data);
    renderPreseleccionados(data || []);
    attachVerCvEvents();
  } catch (error) {
    console.error("❌ Error cargando preseleccionados:", error);
  }
}

// Renderiza la lista en la pestaña
export function renderPreseleccionados(lista) {
  const contenedor = document.getElementById("lista-preseleccionados");
  const empty = document.getElementById("empty-preseleccionados");
  const count = document.getElementById("count-preseleccionados");

  if (!contenedor || !empty) return;

  contenedor.innerHTML = "";
  if (count) count.textContent = lista.length;

  if (lista.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  lista.forEach(item => {
    const div = document.createElement("div");
    div.className = "col-12 mb-3";
    div.innerHTML = crearCardPreSeleccionado(item);
    contenedor.appendChild(div);
  });
}

// Eventos del botón Ver CV
export function attachVerCvEvents() {
  document.querySelectorAll(".ver-cv").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id");
      const postulacionId = btn.getAttribute("data-postulacion-id");
      const estado = btn.getAttribute("data-estado");
      const OFERTA_ID = btn.getAttribute("data-oferta-id");

      if (!userId || !postulacionId) {
        console.error("❌ Faltan datos para la redirección");
        return;
      }

      // Parámetros a encodear
      const params = { userId, postulacionId, estado};

      // Base64 encode
      const encoded = btoa(JSON.stringify(params));

      console.log("➡️ Redirigiendo con data:", encoded);

      // Redirección limpia
      window.location.href = `/empresas/employer-view-candidate.html?data=${encoded}`;
    });
  });
}


// Crea la card de cada candidato
function crearCardPreSeleccionado(item) {
  const postulante = item.postulante || {};
  const usuario = postulante.usuario || {};
  const data = postulante.data || {};

  const nombre = `${data.nombre || usuario.nombres || ""} ${data.apellido || usuario.apellidos || ""}`.trim() || "Sin nombre";
  const usuarioId = usuario.id ?? null;
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
    <div class="candidate-card border rounded shadow-sm p-3 mb-3 bg-white" data-user-id="${usuarioId}">
      <div class="d-flex align-items-center justify-content-between w-100">
        <img src="${perfil}" class="rounded-circle me-3 border border-secondary" width="60" height="60" style="object-fit: cover;">
        <div class="flex-grow-1 d-flex align-items-center justify-content-between">
          <div class="text-center" style="width: 160px;">
            <div class="fw-bold fs-6">${nombre}</div>
            <div class="small ${estadoColor}">${estadoTexto}</div>
          </div>
          <div class="text-center" style="width: 180px;"><div class="fw-semibold">${region}</div></div>
          <div class="text-center" style="width: 140px;"><div class="fw-semibold">${comuna}</div></div>
          <div class="text-center" style="width: 150px;"><div class="fw-semibold">${area}</div></div>
          <div class="text-center" style="width: 120px;">
            <div class="fw-semibold text-primary">$${rentaFormateada}</div>
            <div class="small text-muted">CLP</div>
          </div>
        </div>
        <div class="ms-3">
          <button class="btn btn-sm btn-outline-primary ver-cv" data-postulacion-id="${postulacionId}" data-user-id="${usuarioId}" data-estado="${estado}" data-oferta-id="${OFERTA_ID}" style="width: 80px; height: 35px;">
            Ver CV
          </button>
        </div>
      </div>
    </div>
  `;
}