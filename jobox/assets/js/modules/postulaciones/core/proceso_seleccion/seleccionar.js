import { showToast } from './utils/toast.js';
import { seleccionar } from '../api-postulaciones.js';

let OFERTA_ID = null;

//selectCandidate
document.getElementById("selectCandidate").addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");

    if (!encodedData) {
        showToast("No se encontró información del candidato", "error");
        return;
    }

    let decoded;
    try{
        decoded = JSON.parse(atob(encodedData));
    } catch(e){
        showToast("Error al procesar datos del candidato", "error");
        return;
    }

    const postulacionId = decoded.postulacionId;
    console.log("📌 Candidato:", decoded);

    if (!postulacionId) {
        showToast("Falta ID de la postulación", "error");
        return;
    }
    const res = await seleccionar(postulacionId);
    if (res.ok) {
        showToast("Candidato seleccionado correctamente", "success");
    } else {
        const err = await res.json();
        showToast(err.message || "Error al actualizar", "error");
    }
}); 