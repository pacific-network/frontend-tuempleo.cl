// Función para mostrar notificación tipo popup (alert Bootstrap con animación)
function showAlert(message, type = 'success') {
    const alert = document.getElementById('custom-alert');
    if (!alert) return;
    alert.textContent = message;
    alert.className = `alert alert-${type} shadow fixed-top m-3 rounded`;
    alert.style.display = 'block';
    alert.style.opacity = '1';
    alert.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => {
            alert.style.display = 'none';
            alert.style.opacity = '1';
        }, 300);
    }, 3000);
}

// Permitir cerrar el alert con click
document.addEventListener('DOMContentLoaded', () => {
    const alert = document.getElementById('custom-alert');
    if (alert) {
        alert.addEventListener('click', () => {
            alert.style.display = 'none';
        });
    }
});

// Evento submit del login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value.trim();

    if (!email || !password) {
        showAlert('Por favor completa ambos campos.', 'warning');
        return;
    }

    try {
        const loginResponse = await fetch(`${BASE_URL_API}/v1/auth/login-postulante`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse.status === 401) {
            showAlert('Usuario no existe o la contraseña es incorrecta.', 'danger');
            return;
        }

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            showAlert('Error en el login: ' + errorText, 'danger');
            return;
        }

        const loginData = await loginResponse.json();

        if (!loginData || !loginData.token) {
            showAlert('No se recibió un token válido.', 'danger');
            return;
        }

        localStorage.setItem('token', loginData.token);

        // Extraer userId del payload JWT
        const base64Url = loginData.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const userId = payload.sub;

        const userCheckResponse = await fetch(`${BASE_URL_API}/v1/postulante/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (userCheckResponse.status === 404) {
            window.location.href = 'candidate-form-register.html';
        } else if (userCheckResponse.ok) {
            // Aquí mostramos el popup y luego redirigimos
            const alert = document.getElementById('custom-alert');
            if (alert) {
                alert.textContent = 'Iniciando sesión...';
                alert.className = 'alert alert-info shadow fixed-top m-3 rounded';
                alert.style.display = 'block';
                alert.style.opacity = '1';
                alert.style.transition = 'opacity 0.3s ease';
            }
            // Esperamos 1.5 segundos para que el usuario vea el mensaje
            setTimeout(() => {
                window.location.href = 'candidate-dashboard.html';
            }, 1500);
        } else {
            const errorText = await userCheckResponse.text();
            showAlert('Error verificando usuario: ' + errorText, 'danger');
        }

    } catch (error) {
        console.error('Error en login:', error);
        showAlert('No se pudo conectar con el servidor.', 'danger');
    }
});
