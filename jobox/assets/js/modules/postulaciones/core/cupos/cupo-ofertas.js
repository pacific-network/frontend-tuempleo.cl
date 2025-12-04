//assets/js/modules/postulaciones/core/cupos/cupo-ofertas.js

import { showToast } from '../proceso_seleccion/utils/toast.js';

// sacamos el userid que viene en el parámetro data de la URL
function getDataFromParam() {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");

    if (!dataParam) return null;

    try {
        const decoded = JSON.parse(atob(dataParam));
        console.log("🧩 DATA decodificada:", decoded);
        return decoded;
    } catch (e) {
        console.error("❌ Error al decodificar data:", e);
        return null;
    }
}




// ================================
// Obtener userId desde el token {
//   "email": "freddy@freddy.cl",
//   "sub": 37,
//   "rolId": 2,
//   "iat": 1764810335,
//   "exp": 1764821135
// }
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
// Consumir info básica del empleador con el user id del token obtenemos el empresa_id 
// ================================
async function obtenerInfoBasica(userId) {
    try {
        const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`); //"sub": 37,

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
// Consumir cupo → POST /quota/consume
// ================================
async function consumirCupo(empresaId, ofertaId, usuarioId) {
    //empresa id de basic info
    //oferta id de la url params
    //usuario id de la url params
    try {
        const body = {
            empresa_id: empresaId,
            oferta_id: ofertaId,
            usuario_id: usuarioId,
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

async function obtenerOferta(id) {
    try {
        const res = await fetch(`${BASE_URL_API}/ofertas/${oferta_id}`);
        if (!res.ok) throw new Error("No se pudo obtener la oferta");

        const oferta = await res.json();
        console.log("📌 Oferta recibida:", oferta);

        const vacantes = oferta.numero_vacantes ?? 0;
        document.getElementById("vacantes-total").textContent = vacantes;

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

function mostrarInformacionContacto() {
    const card = document.getElementById("contactCard");
    const overlay = document.getElementById("lockedOverlay");

    // quitar clases de bloqueo
    card.classList.remove("locked");

    // ocultar overlay
    overlay.style.display = "none";

    // reactivar la interacción del contenido
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

    const params = new URLSearchParams(window.location.search);
    const oferta_id = params.get("OFERTA_ID");
    if (!oferta_id) return showToast("ID de oferta no proporcionado", "error");

    await obtenerOferta(ofertaId);

    // usuario que desbloquea
    const userIdFromData = getUserIdFromDataParam();
    if (!userIdFromData) return showToast("No se encontró el userId en la URL", "error");

    // user_id desde token → para sacar empresa_id
    const tokenUserId = getUserIdFromToken();
    if (!tokenUserId) return showToast("No se pudo obtener userId desde el token", "error");

    const infoBasica = await obtenerInfoBasica(tokenUserId);
    if (!infoBasica) return;

    // 🔑 evento final del botón
    const unlockBtn = document.getElementById("unlockBtn");
    unlockBtn.addEventListener("click", async () => {

        console.log("🔓 Intentando desbloquear…");

        const res = await consumirCupo(infoBasica.empresa_id, OFERTA_ID, userIdFromData);

        if (res?.success) {
            showToast("Información desbloqueada", "success");
            mostrarInformacionContacto(); // 🔥 quitar blur y mostrar datos reales
        } else {
            showToast(res?.message || "No se pudo desbloquear", "error");
        }
    });
});



