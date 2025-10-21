// assets/js/cv-manager/view-cv.js
document.addEventListener("DOMContentLoaded", () => {
  const previewContainer = document.getElementById("previewContainer");
  const pdfMiniPreview = document.getElementById("pdfMiniPreview");
  const uploadInstructions = document.getElementById("uploadInstructions");
  const verBtn = document.getElementById("verPdfBtn");

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Token no encontrado en localStorage.");
    // Mostrar UI de instrucciones si no hay sesión
    safeHidePreview();
    return;
  }

  const payload = parseJwt(token);
  const userId = payload?.sub;
  if (!userId) {
    console.warn("No se pudo extraer el ID del usuario del token.");
    safeHidePreview();
    return;
  }

  // Base de API (con /v1) y base pública (sin /v1) con fallbacks
  const API_BASE = getApiBase();          
  const PUBLIC_BASE = getPublicBase();    

  // expone un refresco global para que upload-cv.js lo pueda invocar tras subir
  window.reloadCvPreview = async function () {
    try {
      // 1) obtener rut por userId
      const rutRes = await fetch(`${API_BASE}/postulante/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!rutRes.ok) throw new Error("Error al obtener RUT del usuario");
      const rutData = await rutRes.json();
      const rut = rutData?.usuario?.rut;
      if (!rut) throw new Error("RUT no encontrado en la respuesta del servidor.");

      // 2) obtener registro(s) de CV
      const cvRes = await fetch(`${API_BASE}/curriculum/${rut}`);
      if (!cvRes.ok) throw new Error("Error al obtener CV del usuario");
      const cvList = await cvRes.json();
      const cv = Array.isArray(cvList) ? cvList[0] : cvList;

      // 3) construir URL pública
      const pdfUrl = buildPublicUrl(PUBLIC_BASE, API_BASE, rut, cv?.cv_path);

      if (pdfUrl) {
        pdfMiniPreview.src = pdfUrl;
        previewContainer.style.display = "block";
        uploadInstructions.style.display = "none";
        verBtn.style.display = "inline-block";
        verBtn.onclick = () => window.open(pdfUrl, "_blank");
      } else {
        // no hay CV
        safeHidePreview();
      }
    } catch (err) {
      console.error("Error al cargar el CV:", err.message);
      safeHidePreview();
    }
  };

  // primer render
  window.reloadCvPreview();

  // Helpers de UI locales
  function safeHidePreview() {
    pdfMiniPreview.src = "";
    if (previewContainer) previewContainer.style.display = "none";
    if (uploadInstructions) uploadInstructions.style.display = "block";
    if (verBtn) verBtn.style.display = "none";
  }
});

/** Devuelve la base de API (con /v1). Si no existe BASE_URL_API, deriva desde PUBLIC_BASE. */
function getApiBase() {
  // Si existe BASE_URL_API úsala
  if (typeof BASE_URL_API !== "undefined" && BASE_URL_API) {
    return String(BASE_URL_API).replace(/\/+$/, ""); // sin / al final
  }
  // Derivar desde PUBLIC_BASE
  const pub = getPublicBase();
  return `${pub}/v1`;
}

/** Devuelve la base pública sin /v1 (para servir /uploads/*) con fallback a window.location.origin. */
function getPublicBase() {
  // Si hay BASE_URL_PUBLIC, úsala
  if (typeof BASE_URL_PUBLIC !== "undefined" && BASE_URL_PUBLIC) {
    return String(BASE_URL_PUBLIC).replace(/\/+$/, ""); // sin / al final
  }
  // Si no, intenta derivar desde BASE_URL_API
  if (typeof BASE_URL_API !== "undefined" && BASE_URL_API) {
    // quita /v1 al final si existe
    return String(BASE_URL_API).replace(/\/v1\/?$/, "").replace(/\/+$/, "");
  }
  // Fallback: origen actual del navegador
  return window.location.origin;
}

/** Construye URL pública para ver el CV (si hay path) o usa el endpoint /view como fallback. */
function buildPublicUrl(PUBLIC_BASE, API_BASE, rut, cvPath) {
  // Si hay un path almacenado, intenta servirlo directo desde /uploads
  if (typeof cvPath === "string" && cvPath.length) {
    // Caso 1: ya es web (/uploads/xxx.pdf)
    if (cvPath.startsWith("/uploads/")) {
      return `${PUBLIC_BASE}${cvPath}`;
    }
    // Caso 2: es ruta absoluta en disco (/var/www/html/uploads/xxx.pdf)
    if (cvPath.startsWith("/var/www/html/")) {
      return `${PUBLIC_BASE}${cvPath.replace("/var/www/html", "")}`;
    }
  }

  // Fallback: deja que el backend resuelva y redirija
  return `${API_BASE}/curriculum/${encodeURIComponent(rut)}/view`;
}

// Decodificador JWT simple
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error("Error al decodificar el token JWT:", e);
    return null;
  }
}
