document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("businessForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const payload = {
            business: {
                rut: formData.get("rutInput"),
                razon_social: formData.get("razon_social"),
                nombre_fantasia: formData.get("nombre_empresa"),
                plan_id: parseInt(formData.get("categoria"), 10),
                data: {
                    actividades_economicas: [formData.get("actividad_empresa")],
                    condicion_fiscal: "General",
                    domicilios: [formData.get("direccion")],
                    inicio_actividades: true,
                    fecha_inicio_actividades: new Date(formData.get("anio_inicio_actividades")),
                    empresa_menor_tamano: formData.get("tamano_equipo") === "1",
                    web_factuacion: formData.get("web_facturacion"),
                    pais: formData.get("pais"),
                    telefono: `${formData.get("codigo_pais")}${formData.get("numero_telefono")}`,
                    descripcion: formData.get("descripcion_empresa"),
                },
            },
            employer: {
                rut: formData.get("rutInput"),
                userId: 1, // Cambiar por el ID del usuario actual si está disponible
                data: {
                    cargo: formData.get("cargo"),
                    telefono: `${formData.get("codigo_pais_1")}${formData.get("numero_telefono")}`,
                    facebook: formData.get("facebook"),
                    instagram: formData.get("instagram"),
                    linkedin: formData.get("linkedin"),
                    twitter: formData.get("twitter"),
                },
            },
        };

        try {
            const response = await fetch("http://localhost:3000/v1/formularios/register-employer", {
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

