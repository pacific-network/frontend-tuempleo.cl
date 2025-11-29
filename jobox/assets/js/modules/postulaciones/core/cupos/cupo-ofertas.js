import { showToast } from '../proceso_seleccion/utils/toast.js';

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const ofertaId = params.get("id");

    if (!ofertaId) {
        showToast("ID de oferta no proporcionado", "error");
        return;
    }

    obtenerOferta(ofertaId);
});

/**
 * Obtiene y muestra información de la oferta.
 */
async function obtenerOferta(id) {
    try {
        const res = await fetch(`${BASE_URL_API}/ofertas/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener la oferta");

        const oferta = await res.json();
        console.log("📌 Oferta recibida:", oferta);

        // ======================
        // 1. Mostrar vacantes
        // ======================
        const vacantes = oferta.numero_vacantes ?? 0;
        document.getElementById("vacantes-total").textContent = vacantes;

        // ======================
        // 2. Mapeo tipo_aviso → cupos disponibles
        // ======================
        const CUPOS_MAP = {
            GRATIS: 10,
            BASICA: 25,
            ESTANDAR: 50,
            PREMIUM: 100,
        };

        const cuposPlan = CUPOS_MAP[oferta.tipo_aviso] || 0;

        document.getElementById("cupos-plan").textContent = cuposPlan;


    } catch (error) {
        console.error("Error:", error);
        showToast("Error al cargar la oferta", "error");
    }
}
