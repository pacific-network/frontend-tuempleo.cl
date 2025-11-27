import { showToast } from './utils/toast.js';
import { contratar } from '../api-postulaciones.js';document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalContratar");
    const btnOpen = document.getElementById("btnContratar");
    const btnConfirm = document.getElementById("confirmarContratacion");
    const btnCancel = document.getElementById("cancelarContratacion");

    let SELECTED_POSTULACION_ID = null;

    // 💥 Si este console sale NULL, el problema está resuelto con este wrap
    console.log("BTN:", btnOpen);
    // Abrir modal
    btnOpen.addEventListener("click", () => {
        console.log("CLICK BOTÓN → Abrir Modal");

        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get("data");

        if (!encodedData) {
            showToast("No se encontró información del candidato", "error");
            return;
        }

        try {
            const decoded = JSON.parse(atob(encodedData));
            SELECTED_POSTULACION_ID = decoded.postulacionId;

            modal.classList.remove("hidden");

        } catch (e) {
            showToast("Error al procesar datos", "error");
        }
    });

    // Cancelar
    btnCancel.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Confirmar
    btnConfirm.addEventListener("click", async () => {
        if (!SELECTED_POSTULACION_ID) return;

        const res = await contratar(SELECTED_POSTULACION_ID);

        modal.classList.add("hidden");

        if (res.ok) {
            showToast("Candidato contratado correctamente", "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            const err = await res.json();
            showToast(err.message || "Error al actualizar", "error");
        }
    });

});
