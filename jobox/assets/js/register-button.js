function showAlert(message, type = 'success') {
    const alert = document.getElementById('custom-alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} text-center`;
    alert.style.display = 'block';
    alert.style.animation = 'fadeIn 0.3s ease-out';

    setTimeout(() => {
        alert.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            alert.style.display = 'none';
            alert.style.animation = 'fadeIn 0.3s ease-out';
        }, 300);
    }, 3000);
}

document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Evita recarga del form

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const agree = document.getElementById("agree").checked;
    const mensaje = document.getElementById("mensaje"); // Conservado por estructura, pero no se usa

    // Validación simple
    if (!nombre || !email || !password) {
        showAlert("Por favor completa todos los campos.", "warning");
        return;
    }

    if (!agree) {
        showAlert("Debes aceptar los Términos de Servicio.", "warning");
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
            showAlert("Ya existe una cuenta asociada a este correo.", "danger");
        } else if (res.ok) {
            showAlert("¡Registro exitoso! Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            const error = await res.text();
            showAlert("Error en el registro: " + error, "danger");
        }

    } catch (err) {
        showAlert("Error de conexión al servidor.", "danger");
        console.error(err);
    }
});