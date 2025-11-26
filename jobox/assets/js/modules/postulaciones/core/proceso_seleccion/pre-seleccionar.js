import { showToast } from './utils/toast.js';
import { preseleccionar } from '../../core/api-postulaciones.js';

let OFERTA_ID = null;

document.getElementById("preselectCandidate").addEventListener("click", async () => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");

    if (!encodedData) {
        showToast("No se encontró información del candidato", "error");
        return;
    }

    // Decodificar Base64
    let decoded;
    try {
        decoded = JSON.parse(atob(encodedData));
    } catch (e) {
        showToast("Error al procesar datos del candidato", "error");
        return;
    }

    const postulacionId = decoded.postulacionId;

    console.log("📌 Candidato:", decoded);

    if (!postulacionId) {
        showToast("Falta ID de la postulación", "error");
        return;
    }

    const res = await preseleccionar(postulacionId);

    if (res.ok) {
        showToast("Candidato preseleccionado correctamente", "success");
    } else {
        const err = await res.json();
        showToast(err.message || "Error al actualizar", "error");
    }
});
