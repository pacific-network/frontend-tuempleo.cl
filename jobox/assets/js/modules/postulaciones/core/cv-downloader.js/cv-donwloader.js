document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("downloadCandidateCv");
    if (!downloadBtn) return;
  
    // Obtenemos los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");
  
    if (!dataParam) {
      console.error("❌ No se encontró data en la URL");
      return;
    }
  
    let parsedData;
    try {
      parsedData = JSON.parse(atob(dataParam)); // asumimos Base64
    } catch (err) {
      console.error("❌ Error parseando data:", err);
      return;
    }
  
    const userId = parsedData.userId;
    if (!userId) {
      console.error("❌ No se encontró userId en los datos");
      return;
    }
  
    async function downloadCv() {
      try {
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
  
        const a = document.createElement("a");
        a.href = url;
        a.download = `CV_${parsedData.nombre || userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
  
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("❌ Error descargando el CV:", err);
        alert("No se pudo descargar el CV. Revisa la consola para más detalles.");
      }
    }
  
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault(); // evitamos navegación del <a>
      downloadCv();
    });
  });
  