//assest/js/modules/auth/registro-nuevo-usuario.js
document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Evita recarga del form

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const agree = document.getElementById("agree").checked;
    const mensaje = document.getElementById("mensaje");

    // Validación simple
    if (!nombre || !email || !password) {
        mensaje.textContent = "Por favor completa todos los campos.";
        return;
    }

    if (!agree) {
        mensaje.textContent = "Debes aceptar los Términos de Servicio.";
        return;
    }

    const datos = {
        nombre_completo: nombre,
        email: email,
        password: password
    };

    try {
        const res = await fetch(`${BASE_URL_API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (res.status === 401) {
            mensaje.textContent = "Ya existe una cuenta asociada a este correo.";
        } else if (res.ok) {
            mensaje.style.color = "green";
            mensaje.textContent = "¡Registro exitoso! Redirigiendo...";
            setTimeout(() => {
                window.location.href = "login-employer.html";
            }, 1500);
        } else {
            const error = await res.json();
            mensaje.style.color = "red";
        
            // Función para traducir errores conocidos
            const traducirMensaje = (msg) => {
                if (msg.includes("password must be longer than or equal to 6 characters")) {
                    return "La contraseña debe contener al menos 6 caracteres.";
                }
                // Puedes agregar más traducciones aquí si lo deseas
                return msg;
            };
        
            if (Array.isArray(error.message)) {
                // Mostrar lista de errores traducidos
                mensaje.innerHTML = `
                    <strong>Se encontraron los siguientes errores:</strong>
                    <ul>${error.message.map(msg => `<li>${traducirMensaje(msg)}</li>`).join('')}</ul>
                `;
            } else {
                // Mostrar mensaje único traducido
                mensaje.textContent = "Error en el registro: " + traducirMensaje(error.message);
            }
        }
        

    } catch (err) {
        mensaje.textContent = "Error de conexión al servidor.";
        console.error(err);
    }
});
