document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("businessForm");

    // ✅ Extraer user_id desde el token JWT
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
                    actividades_economicas: [formData.get("actividad_empresa")],
                    condicion_fiscal: "Regular",
                    domicilios: [formData.get("direccion")],
                    inicio_actividades: true,
                    fecha_inicio_actividades: `${formData.get("anio_inicio_actividades")}-01-01T00:00:00.000Z`,
                    empresa_menor_tamano: formData.get("tamano_equipo") === "1",
                    web_factuacion: formData.get("correo_empresa"), // puedes cambiarlo si tienes campo de facturación
                    pais: formData.get("pais"),
                    region: formData.get("region_empresa"),
                    comuna: formData.get("comuna_empresa"),
                    telefono: `${formData.get("codigo_pais_empresa")}${formData.get("numero_telefono_empresa")}`,
                    descripcion: formData.get("descripcion_empresa")
                }
            },
            employer: {
                rut: formData.get("rut_empleador"),
                userId: obtenerUserIdDelToken(),
                nombre: formData.get("nombre_empleador"),
                apellido: formData.get("apellido_empleador"),
                correo: formData.get("correo_empleador"),
                telefono: `${formData.get("codigo_pais_empleador")}${formData.get("numero_telefono_empleador")}`,
                cargo: formData.get("cargo_empleador"), // ⚠️ este ID está duplicado en tu HTML
                data: {
                    pais: formData.get("pais_empleador"),
                    region: formData.get("region_empleador"),
                    comuna: formData.get("comuna_empleador"),
                    direccion: formData.get("direccion_empleador"),
                    cargo: formData.get("cargo_empleador"),
                    telefono: `${formData.get("codigo_pais_empleador")}${formData.get("numero_telefono_empleador")}`,
                    facebook: formData.get("facebook"),
                    instagram: formData.get("instagram"),
                    linkedin: formData.get("linkedin"),
                    twitter: formData.get("twitter")
                }
            }
        };

        try {
            const response = await fetch(`${BASE_URL_API}/formularios/register-employer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("✅ Datos enviados correctamente.");
                window.location.href = 'empresa/employer-dashboard.html'; 
            } else {
                const error = await response.json();
                console.error("❌ Error al enviar datos:", error);
                alert("Hubo un error al enviar los datos.");
            }
        } catch (error) {
            console.error("❌ Error de red:", error);
            alert("Hubo un problema de conexión.");
        }
    });
});

document.getElementById('businessForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // evitar envío tradicional
  
    // Aquí podrías validar o preparar tu payload
    const formData = new FormData(this);
  
    try {
      const response = await fetch('/api/tu-endpoint', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const alertBox = document.getElementById('custom-alert');
        alertBox.classList.remove('d-none');
  
        setTimeout(() => {
          window.location.href = 'empresa/employer-dashboard.html';
        }, 2000);
      } else {
        alert('❌ Error al enviar datos');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de red o del servidor');
    }
  });
  
