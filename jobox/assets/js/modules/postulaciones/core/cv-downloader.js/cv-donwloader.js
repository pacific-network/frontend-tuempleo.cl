document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("downloadCandidateCv");
    if (!downloadBtn) return;
  
    // 1. Obtener "data" desde la URL (Codificada en Base64)
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");
  
    if (!dataParam) {
      console.error("❌ No se encontró data en la URL");
      return;
    }
  
    let parsedData;
    try {
      parsedData = JSON.parse(atob(dataParam));
    } catch (err) {
      console.error("❌ Error parseando data:", err);
      return;
    }
  
    const userId = parsedData.userId;
    if (!userId) {
      console.error("❌ No se encontró userId en los datos");
      return;
    }
  
    // ----------------------------------------------------------
    // 2. Traer datos del postulante para obtener nombre/apellido
    // ----------------------------------------------------------
    async function fetchPostulante() {
      try {
        const res = await fetch(`${BASE_URL_API}/postulante/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          }
        });
  
        if (!res.ok) throw new Error("No se pudo obtener postulante");
  
        return res.json(); // { usuario:{nombres, apellidos}, data:{...} }
      } catch (err) {
        console.error("❌ Error obteniendo postulante:", err);
        return null;
      }
    }
  
    // ----------------------------------------------------------
    // 3. Descargar el CV desde backend
    // ----------------------------------------------------------
    async function downloadCv() {
      try {
        // Obtener datos reales del postulante
        const postulante = await fetchPostulante();
  
        let nombreArchivo = "CV_sin_nombre.pdf";
  
        if (postulante?.usuario) {
          const nom = postulante.usuario.nombres || "";
          const ape = postulante.usuario.apellidos || "";
          nombreArchivo = `CV_${nom}_${ape}.pdf`
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_\-\.]/g, ""); // limpiar caracteres raros
        }
  
        // Llamar al generador del CV (PDF)
        const response = await fetch(`${window.BASE_URL_API}/cv-generator/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          }
        });
  
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Error al generar el CV");
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        // Crear descarga
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo; // 👈 NOMBRE FINAL DEL ARCHIVO
        document.body.appendChild(a);
        a.click();
        a.remove();
  
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("❌ Error descargando el CV:", err);
        alert("No se pudo descargar el CV. Revisa la consola para más detalles.");
      }
    }
  
    // ----------------------------------------------------------
    // 4. Evento click del botón — evitar abrir enlaces
    // ----------------------------------------------------------
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // 👈 evita el redirect al /view
      downloadCv();
    });
  });
  