// ================================
// Obtener userId desde token
// ================================
function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.id || payload.userId || null;
    } catch (e) {
        console.error('Error al decodificar token:', e);
        return null;
    }
}

// ================================
// Obtener ofertaId desde URL
// ================================
function getOfertaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') ? parseInt(params.get('id'), 10) : null;
}

// ================================
// Obtener info básica de empresa
// ================================
async function obtenerInfoBasica(usuarioId) {
    try {
        const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${usuarioId}`);
        if (!res.ok) throw new Error("No se pudo obtener info básica");
        return await res.json();
    } catch (err) {
        console.error(err);
        showToast("Error al obtener info de la empresa", "error");
        return null;
    }
}

// ================================
// Obtener oferta
// ================================
async function obtenerOferta(ofertaId) {
    try {
        const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
        if (!res.ok) throw new Error("No se pudo obtener la oferta");
        return await res.json();
    } catch (err) {
        console.error(err);
        showToast("Error al obtener la oferta", "error");
        return null;
    }
}

// ================================
// Obtener cupos restantes
// ================================
async function obtenerCuposRestantes(empresaId, ofertaId) {
    try {
        const res = await fetch(`${BASE_URL_API}/quota/remaining?empresa_id=${empresaId}&oferta_id=${ofertaId}`);
        if (!res.ok) throw new Error("No se pudo obtener los cupos restantes");
        return await res.json();
    } catch (err) {
        console.error(err);
        showToast("Error al obtener los cupos restantes", "error");
        return null;
    }
}

// ================================
// Actualizar elementos HTML
// ================================
function mostrarResumenOferta(oferta, cupos) {
    // Vacantes de la oferta
    const vacantesTotalEl = document.getElementById("vacantes-total");
    if (vacantesTotalEl) vacantesTotalEl.textContent = oferta.numero_vacantes ?? 0;

    // Cupos disponibles
    const cuposPlanEl = document.getElementById("cupos-plan");
    if (cuposPlanEl) cuposPlanEl.textContent = cupos?.remaining ?? 0;

    // Vacantes cubiertas
    const vacantesCubiertasEl = document.getElementById("vacantes-cubiertas");
    if (vacantesCubiertasEl) vacantesCubiertasEl.textContent = cupos?.used ?? 0;
}

// ================================
// Ejecutar
// ================================
document.addEventListener("DOMContentLoaded", async () => {
    const ofertaId = getOfertaIdFromUrl();
    if (!ofertaId) return showToast("ID de oferta no encontrado en la URL", "error");

    const usuarioId = getUserIdFromToken();
    if (!usuarioId) return showToast("No se pudo obtener userId desde el token", "error");

    const infoBasica = await obtenerInfoBasica(usuarioId);
    if (!infoBasica?.empresa_id) return;

    // Obtener oferta y cupos
    const [oferta, cupos] = await Promise.all([
        obtenerOferta(ofertaId),
        obtenerCuposRestantes(infoBasica.empresa_id, ofertaId)
    ]);

    if (oferta) mostrarResumenOferta(oferta, cupos);
});
