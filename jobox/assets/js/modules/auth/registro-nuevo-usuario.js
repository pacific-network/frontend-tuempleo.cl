
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
        const res = await fetch(" http://localhost:3000/v1/auth/register", {
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
                window.location.href = "login.html";
            }, 1500);
        } else {
            const error = await res.text();
            mensaje.textContent = "Error en el registro: " + error;
        }

    } catch (err) {
        mensaje.textContent = "Error de conexión al servidor.";
        console.error(err);
    }
});
