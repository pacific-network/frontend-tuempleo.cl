document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Decodificar payload del JWT (base64url)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return null;
        }
    }

    const payload = parseJwt(token);
    if (!payload || !payload.sub) return;

    const userId = payload.sub;
    const apiUrl = `${BASE_URL_API}/postulante/${userId}`;

    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const nombres = data.usuario.nombres || "";
        const apellidos = data.usuario.apellidos || "";
        const categoria = data.data?.preferencias?.categoria_empleo || "Sin categoría";

        // Asignar nombre completo y categoría al HTML
        document.querySelector('.user-profile-sidebar-top h4').textContent = `${nombres} ${apellidos}`;
        document.querySelector('.user-profile-sidebar-top p').textContent = categoria;
    })
    .catch(error => {
        console.error("Error al obtener datos del postulante:", error);
    });
});