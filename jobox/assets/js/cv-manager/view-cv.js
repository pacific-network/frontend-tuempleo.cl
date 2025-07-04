document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.warn("Token no encontrado en localStorage.");

    const userId = parseJwt(token)?.sub;
    if (!userId) return console.warn("No se pudo extraer el ID del usuario del token.");

    try {
        // 1. Obtener el rut del usuario
        const rutResponse = await fetch(`http://172.25.100.201:3000/v1/postulante/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!rutResponse.ok) throw new Error("Error al obtener RUT del usuario");
        const rutData = await rutResponse.json();
        const rut = rutData.usuario?.rut;
        if (!rut) throw new Error("RUT no encontrado en la respuesta del servidor.");

        // 2. Obtener el CV usando el rut
        const cvResponse = await fetch(`http://172.25.100.201:3000/v1/curriculum/${rut}`);
        if (!cvResponse.ok) throw new Error("Error al obtener CV del usuario");
        const cvData = await cvResponse.json();

        // 3. Mostrar previsualización si existe
        const cvPath = cvData[0]?.cv_path;
        if (cvPath) {
            const pdfUrl = `http://172.25.100.201:3000${cvPath.replace("/var/www/html", "")}`;
            document.getElementById("pdfMiniPreview").src = pdfUrl;
            document.getElementById("previewContainer").style.display = "block";
            document.getElementById("uploadInstructions").style.display = "none";
        } else {
            console.log("El usuario no tiene CV cargado.");
        }
    } catch (err) {
        console.error("Error al cargar el CV:", err.message);
    }
});

// Función para decodificar un JWT sin librerías externas
function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch (e) {
        console.error("Error al decodificar el token JWT:", e);
        return null;
    }
}