// assets/js/modules/postulaciones/gestionar-estado.js

/**
 * Decodifica el parámetro `data` de la URL
 * @returns {Object} { userId, postulacionId, estado }
 */
function getCandidateDataFromUrl() {
  const paramsData = new URLSearchParams(window.location.search).get("data");
  if (!paramsData) return null;

  try {
    const decoded = JSON.parse(atob(paramsData));
    return {
      userId: decoded.userId || null,
      postulacionId: decoded.postulacionId || null,
      estado: decoded.estado || null
    };
  } catch (e) {
    console.error("❌ Error decodificando data:", e);
    return null;
  }
}

/**
 * Actualiza la UI de los botones según el estado del candidato
 * @param {string} estado - "preseleccionado" | "seleccionado" | "descartado"
 */
function renderEstadoCandidato(estado) {
  const preselectBtn = document.getElementById("preselectCandidate");
  const selectBtn = document.getElementById("selectCandidate");
  const discardBtn = document.getElementById("discardCandidate");

  if (!preselectBtn || !selectBtn || !discardBtn) return;

  // Primero habilitamos todos
  [preselectBtn, selectBtn, discardBtn].forEach(btn => {
    btn.classList.remove("disabled");
    btn.style.pointerEvents = "auto";
    btn.style.opacity = "1";
  });

  switch (estado) {
    case "preseleccionado":
      preselectBtn.classList.add("disabled");
      preselectBtn.style.pointerEvents = "none";
      preselectBtn.style.opacity = "0.5";
      break;

    case "seleccionado":
      preselectBtn.classList.add("disabled");
      selectBtn.classList.add("disabled");

      preselectBtn.style.pointerEvents = "none";
      selectBtn.style.pointerEvents = "none";

      preselectBtn.style.opacity = "0.5";
      selectBtn.style.opacity = "0.5";
      break;

    case "descartado":
      [preselectBtn, selectBtn, discardBtn].forEach(btn => {
        btn.classList.add("disabled");
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.5";
      });
      break;

    default:
      break;
  }
}


// ----------------- INIT -----------------
document.addEventListener("DOMContentLoaded", () => {
  const candidate = getCandidateDataFromUrl();
  if (!candidate) {
    console.warn("❌ No se pudo obtener data del candidato");
    return;
  }

  console.log("📌 Candidato:", candidate);

  // Renderizamos los botones según estado
  renderEstadoCandidato(candidate.estado);

  // ----------------------------------------------------
  // 🔵 Mostrar botón de contratación SOLO si está “seleccionado”
  // ----------------------------------------------------
  const btnContratar = document.getElementById("btnContratar");
  if (btnContratar) {
    if (candidate.estado === "seleccionado") {
      btnContratar.classList.remove("hidden");
    } else {
      btnContratar.classList.add("hidden");
    }
  }

  // Aquí puedes agregar más lógica si quieres usar userId o postulacionId
});
