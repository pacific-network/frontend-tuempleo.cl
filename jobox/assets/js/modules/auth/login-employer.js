
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const messageEl = document.getElementById('message');
    messageEl.textContent = '';

    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value.trim();

    if (!email || !password) {
        messageEl.textContent = 'Por favor completa ambos campos.';
        return;
    }

    try {
        // Paso 1: Login
        const loginResponse = await fetch('http://172.25.100.201:3000/v1/auth/login-empleador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse.status === 401) {
            messageEl.textContent = 'Usuario no existe o la contraseña es incorrecta.';
            return;
        }

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            messageEl.textContent = 'Error en el login: ' + errorText;
            return;
        }

        const loginData = await loginResponse.json();

        if (!loginData || !loginData.token) {
            messageEl.textContent = 'No se recibió un token válido.';
            return;
        }

        localStorage.setItem('token', loginData.token);

        // Decodificar token (extraer sub)
        const base64Url = loginData.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const userId = payload.sub;

        // Paso 2: Verificar si el usuario ya está registrado
        const userCheckResponse = await fetch(`http://172.25.100.201:3000/v1/postulante/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (userCheckResponse.status === 404) {
            window.location.href = 'employer-form-register.html';
        } else if (userCheckResponse.ok) {
            window.location.href = 'employer-dashboard.html';
        } else {
            const errorText = await userCheckResponse.text();
            messageEl.textContent = 'Error verificando usuario: ' + errorText;
        }

    } catch (error) {
        console.error('Error en login:', error);
        messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
});
