// =======================
// CONFIG AUTOMÁTICA
// =======================
if (typeof window.isDev === "undefined") {
    window.isDev =
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost";
  
    window.BASE_URL_API = window.isDev
      ? "http://localhost:3000/v1"
      : "https://tuempleo.cl/api/v1";
  
    console.log("✅ config.js cargado, BASE_URL_API =", window.BASE_URL_API);
  }
  
  // =======================
  // HEADERS AUTOCONTENIDOS
  // =======================
  function getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`
    };
  }
  
  // =======================
  // ENDPOINTS POSTULACIONES
  // =======================
  
  export async function getPostulantesOferta(ofertaId) {
    const res = await fetch(`${window.BASE_URL_API}/postulaciones/oferta/${ofertaId}`, {
      credentials: "include",
      headers: getAuthHeaders()
    });
    return res.json();
  }
  
  export async function getCualificados(ofertaId) {
    const res = await fetch(`${window.BASE_URL_API}/postulaciones/oferta/${ofertaId}/cualificados`, {
      credentials: "include",
      headers: getAuthHeaders()
    });
    return res.json();
  }
  
  // =======================
  // ACCIONES DE SELECCIÓN
  // =======================
  
  export async function cualificar(id) {
    return fetch(`${window.BASE_URL_API}/seleccion/${id}/cualificar`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "cualificado" })
    });
  }
  
  export async function preseleccionar(id) {
    return fetch(`${window.BASE_URL_API}/seleccion/${id}/preseleccionar`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "preseleccionado" })
    });
  }
  
  export async function contratar(id) {
    return fetch(`${window.BASE_URL_API}/seleccion/${id}/contratar`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "contratado" })
    });
  }
  
  export async function descartar(id) {
    return fetch(`${window.BASE_URL_API}/seleccion/${id}/descartar`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: "descartado" })
    });
  }
  