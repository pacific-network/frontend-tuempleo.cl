document.addEventListener("DOMContentLoaded", () => {
    // Función para extraer user_id (sub) del token JWT
    function obtenerUserIdDelToken() {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub; // user_id está en "sub"
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return null;
        }
    }

    const form = document.getElementById("businessForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const payload = {
            business: {
                rut: formData.get("rutInput"),
                razon_social: formData.get("razon_social"),
                nombre_fantasia: formData.get("nombre_empresa"),
                plan_id: 1,
                data: {
                    actividades_economicas: ["960909", "123456"],
                    condicion_fiscal: "Regular",
                    domicilios: [
                        "Calle Falsa 123, Santiago",
                        "Avenida Siempre Viva 742, Puente Alto"
                    ],
                    inicio_actividades: true,
                    fecha_inicio_actividades: "2025-05-14T00:00:00.000Z",
                    empresa_menor_tamano: false,
                    web_factuacion: "https://www.pruebacorp.cl",
                    pais: "Chile",
                    telefono: "+56 9 1234 5678",
                    descripcion: "Empresa dedicada a servicios de consultoría"
                }
            },
            employer: {
                rut: formData.get("rut_empleador"),
                userId: obtenerUserIdDelToken(),
                nombre: formData.get("nombre_empleador"),
                apellido: formData.get("apellido_empleador"),
                correo: formData.get("correo_empleador"),
                telefono: `${formData.get("codigo_pais_empleador")}${formData.get("numero_telefono_empleador")}`,
                cargo: formData.get("cargo_empleador"),
                data: {
                    cargo: "Gerente de Ventas",
                    telefono: "+56987654321",
                    facebook: "https://facebook.com/gerente",
                    instagram: "https://instagram.com/gerente",
                    linkedin: "https://linkedin.com/in/gerente",
                    twitter: "https://twitter.com/gerente"
                }
            }
        };

        try {
            const response = await fetch("http://172.25.100.201:3000/v1/formularios/register-employer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Datos enviados correctamente.");
            } else {
                const error = await response.json();
                console.error("Error al enviar datos:", error);
                alert("Hubo un error al enviar los datos.");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("Hubo un problema de conexión.");
        }
    });
});
