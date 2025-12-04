// assets/js/modules/postulaciones/core/cupos/cupo-ofertas.js
import { showToast } from '../proceso_seleccion/utils/toast.js';

// ================================
// Obtener datos del parámetro "data" en la URL
// ================================
function getDataFromParam() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");

    if (!dataParam) return null;

    try {
        const decoded = JSON.parse(atob(dataParam));
        console.log("🧩 DATA decodificada:", decoded);
        return decoded; // { userId, postulacionId, estado, OFERTA_ID }
    } catch (e) {
        console.error("❌ Error al decodificar data:", e);
        return null;
    }
}

// ================================
// Obtener userId desde el token JWT
// ================================
export function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🧩 Payload decodificado:', payload);
        return payload.sub || payload.id || payload.userId || null;
    } catch (e) {
        console.error('❌ Error al decodificar el token:', e);
        return null;
    }
}

// ================================
// Obtener info básica de la empresa por userId del token
// ================================
async function obtenerInfoBasica(userId) {
    try {
        const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`);
        if (!res.ok) throw new Error("No se pudo obtener la info básica");
        const info = await res.json();
        console.log("🏢 Info básica del empleador:", info);
        return info;
    } catch (error) {
        console.error("Error al obtener info básica del empleador:", error);
        showToast("Error al cargar información de la empresa", "error");
        return null;
    }
}

// ================================
// Obtener oferta por OFERTA_ID
// ================================
async function obtenerOferta(ofertaId) {
    try {
        const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
        if (!res.ok) throw new Error("No se pudo obtener la oferta");

        const oferta = await res.json();
        console.log("📌 Oferta recibida:", oferta);

        const vacantes = oferta.numero_vacantes ?? 0;
        const CUPOS_MAP = {
            GRATIS: 10,
            BASICA: 25,
            ESTANDAR: 50,
            PREMIUM: 100,
        };
        const cuposPlan = CUPOS_MAP[oferta.tipo_aviso] || 0;

        // Protección contra elementos inexistentes
        const vacantesEl = document.getElementById("vacantes-total");
        if (vacantesEl) vacantesEl.textContent = vacantes;

        const cuposPlanEl = document.getElementById("cupos-plan");
        if (cuposPlanEl) cuposPlanEl.textContent = cuposPlan;

    } catch (error) {
        console.error("Error:", error);
        showToast("Error al cargar la oferta", "error");
    }
}


// ================================
// Consumir cupo → POST /quota/consume
// ================================
async function consumirCupo(empresaId, ofertaId, usuarioId) {
    try {
        const body = {
            empresa_id: parseInt(empresaId, 10),
            oferta_id: parseInt(ofertaId, 10),
            usuario_id: parseInt(usuarioId, 10),
            action: "unlock"
        };

        console.log("📤 Enviando consumo de cupo:", body);

        const res = await fetch(`${BASE_URL_API}/quota/consume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const json = await res.json();
        console.log("🎯 Respuesta consumo:", json);
        return json;

    } catch (error) {
        console.error("❌ Error al consumir cupo:", error);
        showToast("No se pudo consumir el cupo", "error");
    }
}


// ================================
// Mostrar información de contacto desbloqueada
// ================================
function mostrarInformacionContacto() {
    const card = document.getElementById("contactCard");
    const overlay = document.getElementById("lockedOverlay");

    card.classList.remove("locked");
    overlay.style.display = "none";

    const content = card.querySelector(".locked-content");
    content.style.filter = "none";
    content.style.opacity = "1";
    content.style.pointerEvents = "auto";

    console.log("📨 Información de contacto desbloqueada");
}


// ================================
// DOMContentLoaded
// ================================
document.addEventListener("DOMContentLoaded", async () => {
    const dataFromParam = getDataFromParam();
    if (!dataFromParam) return showToast("No se encontró información en la URL", "error");

    const { userId, OFERTA_ID } = dataFromParam;
    if (!OFERTA_ID) return showToast("ID de oferta no proporcionado", "error");
    if (!userId) return showToast("UserId no proporcionado en la URL", "error");

    await obtenerOferta(OFERTA_ID);

    const tokenUserId = getUserIdFromToken();
    if (!tokenUserId) return showToast("No se pudo obtener userId desde el token", "error");

    const infoBasica = await obtenerInfoBasica(tokenUserId);
    if (!infoBasica) return;

    // 🔹 Verificar si ya está desbloqueado
    try {
        const statusRes = await fetch(
            `${BASE_URL_API}/quota/status?empresa_id=${infoBasica.empresa_id}&oferta_id=${OFERTA_ID}&usuario_id=${userId}`
        );
        const status = await statusRes.json();

        if (status?.isUnlocked) {
            mostrarInformacionContacto(); // Quita el blur
            showToast("Información ya desbloqueada previamente", "info");
        }
    } catch (e) {
        console.warn("No se pudo verificar el estado de desbloqueo", e);
    }

    // 🔑 Evento de desbloqueo
    const unlockBtn = document.getElementById("unlockBtn");
    unlockBtn.addEventListener("click", async () => {
        console.log("🔓 Intentando desbloquear…");

        const res = await consumirCupo(infoBasica.empresa_id, OFERTA_ID, userId);

        if (res?.success) {
            if (res?.duplicated) {
                showToast("Información ya desbloqueada previamente", "info");
            } else {
                showToast("Información desbloqueada", "success");
            }
            mostrarInformacionContacto();
        } else {
            showToast(res?.message || "No se pudo desbloquear", "error");
        }
    });
});

