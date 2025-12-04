import { showToast } from './utils/toast.js';
import { contratar } from '../api-postulaciones.js';

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalContratar");
    const btnOpen = document.getElementById("btnContratar");
    const btnConfirm = document.getElementById("confirmarContratacion");
    const btnCancel = document.getElementById("cancelarContratacion");

    const modalText = modal.querySelector(".modal-user-info"); 
    // 👆 asegúrate de agregar <p class="modal-user-info"></p> dentro del modal

    let SELECTED_POSTULACION_ID = null;
    let SELECTED_USER = null;

    console.log("BTN:", btnOpen);

    // 🔹 Abrir modal
    btnOpen.addEventListener("click", async () => {
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
            const userId = decoded.userId;

            // ============================
            // 🔥 1) Obtener datos del usuario
            // ============================
            const res = await fetch(`${BASE_URL_API}/v1/user/${userId}`);
            if (!res.ok) throw new Error("No se pudo obtener el usuario");

            SELECTED_USER = await res.json();

            // ============================
            // 🔥 2) Mostrar datos en Modal
            // ============================
            modalText.innerHTML = `
                <strong>Candidato:</strong> ${SELECTED_USER.nombres} ${SELECTED_USER.apellidos}<br>
                <strong>Email:</strong> ${SELECTED_USER.email}<br>
                <strong>RUT:</strong> ${SELECTED_USER.rut}
            `;

            modal.classList.remove("hidden");

        } catch (e) {
            console.error(e);
            showToast("Error al procesar datos", "error");
        }
    });

    // 🔹 Cancelar
    btnCancel.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // 🔹 Confirmar
    btnConfirm.addEventListener("click", async () => {
        if (!SELECTED_POSTULACION_ID) return;

        const res = await contratar(SELECTED_POSTULACION_ID);

        modal.classList.add("hidden");

        if (res.ok) {
            showToast(
                `Candidato ${SELECTED_USER.nombres} contratado correctamente`,
                "success"
            );
            setTimeout(() => location.reload(), 1000);
        } else {
            const err = await res.json();
            showToast(err.message || "Error al actualizar", "error");
        }
    });
});
