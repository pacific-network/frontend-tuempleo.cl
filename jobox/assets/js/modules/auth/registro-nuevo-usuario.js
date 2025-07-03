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

// Referencias globales
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPasswordBtn");

// Toggle para contraseña principal
if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        togglePasswordBtn.innerHTML = isVisible
            ? '<i class="far fa-eye"></i>'
            : '<i class="far fa-eye-slash"></i>';
    });
}

// Toggle para repetir contraseña
if (toggleConfirmPasswordBtn && confirmPasswordInput) {
    toggleConfirmPasswordBtn.addEventListener("click", () => {
        const isVisible = confirmPasswordInput.type === "text";
        confirmPasswordInput.type = isVisible ? "password" : "text";
        toggleConfirmPasswordBtn.innerHTML = isVisible
            ? '<i class="far fa-eye"></i>'
            : '<i class="far fa-eye-slash"></i>';
    });
}

// Validaciones en el formulario de registro
document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Evita recarga del form

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const agree = document.getElementById("agree").checked;

    if (!nombre || !email || !password || !confirmPassword) {
        showAlert("Por favor completa todos los campos.", "warning");
        return;
    }

    if (password.length < 8) {
        showAlert("La contraseña debe tener al menos 8 caracteres.", "warning");
        return;
    }

    if (!/[A-Z]/.test(password)) {
        showAlert("La contraseña debe contener al menos una letra mayúscula.", "warning");
        return;
    }

    if (!/[a-z]/.test(password)) {
        showAlert("La contraseña debe contener al menos una letra minúscula.", "warning");
        return;
    }

    if (!/[0-9]/.test(password)) {
        showAlert("La contraseña debe contener al menos un número.", "warning");
        return;
    }

    if (!/^[A-Za-z0-9]+$/.test(password)) {
        showAlert("La contraseña debe ser alfanumérica (solo letras y números).", "warning");
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Las contraseñas no coinciden.", "warning");
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
                window.location.href = "login-employer.html";
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

// Monitoreo en tiempo real de requisitos de contraseña
if (passwordInput) {
    passwordInput.addEventListener("input", function () {
        const val = passwordInput.value;

        const requisitos = {
            "req-char": val.length >= 8,
            "req-upper": /[A-Z]/.test(val),
            "req-lower": /[a-z]/.test(val),
            "req-alnum": /[A-Za-z]/.test(val) && /\d/.test(val)
        };

        let allValid = true;
        for (const [id, cumple] of Object.entries(requisitos)) {
            const item = document.getElementById(id);
            if (item) {
                if (cumple) {
                    item.classList.add("d-none");
                } else {
                    item.classList.remove("d-none");
                    allValid = false;
                }
            }
        }

        const reqBox = document.getElementById("password-requirements");
        if (reqBox) {
            reqBox.style.display = allValid ? "none" : "block";
        }
    });
}
