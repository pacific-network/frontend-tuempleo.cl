function showModalMessage(message, title = 'Mensaje') {
    document.getElementById('feedbackModalLabel').textContent = title;
    document.getElementById('feedbackMessage').textContent = message;
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    feedbackModal.show();
}

// ✅ Redirigir automáticamente si ya hay un token guardado
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        window.location.href = 'candidate-dashboard.html';
    }

    // ✅ Prellenar el correo si fue guardado anteriormente
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        document.querySelector('input[type="email"]').value = savedEmail;
        document.getElementById('remember').checked = true;
    }
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value.trim();
    const rememberMe = document.getElementById('remember').checked;

    if (!email || !password) {
        showModalMessage('Por favor completa ambos campos.');
        return;
    }

    try {
        const loginResponse = await fetch('http://172.25.100.201:3000/v1/auth/login-postulante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse.status === 401) {
            showModalMessage('Usuario no existe o la contraseña es incorrecta.', 'Error de Login');
            return;
        }

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            showModalMessage('Error en el login: ' + errorText, 'Error');
            return;
        }

        const loginData = await loginResponse.json();

        if (!loginData || !loginData.token) {
            showModalMessage('No se recibió un token válido.', 'Error de Token');
            return;
        }

        // ✅ Guardar token según "Recuérdame"
        if (rememberMe) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('rememberedEmail', email); // Opcional: guardar correo
        } else {
            sessionStorage.setItem('token', loginData.token);
            localStorage.removeItem('rememberedEmail');
        }

        // Decodificar el token para obtener el userId
        const base64Url = loginData.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const userId = payload.sub;

        // Verificar si ya tiene datos registrados
        const userCheckResponse = await fetch(`http://172.25.100.201:3000/v1/postulante/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (userCheckResponse.status === 404) {
            window.location.href = 'candidate-form-register.html';
        } else if (userCheckResponse.ok) {
            window.location.href = 'candidate-dashboard.html';
        } else {
            const errorText = await userCheckResponse.text();
            showModalMessage('Error verificando usuario: ' + errorText, 'Error');
        }

    } catch (error) {
        console.error('Error en login:', error);
        showModalMessage('No se pudo conectar con el servidor.', 'Error de conexión');
    }
});
