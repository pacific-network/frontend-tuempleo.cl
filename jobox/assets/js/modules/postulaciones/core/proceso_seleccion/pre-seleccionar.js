import { showToast } from './utils/toast.js';
import { preseleccionar} from '../../core/api-postulaciones.js';

let OFERTA_ID = null;

document.getElementById("preselectCandidate").addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const postulacionId = params.get("postulacion");

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


