function showModalMessage(message, title = 'Mensaje') {
            document.getElementById('feedbackModalLabel').textContent = title;
            document.getElementById('feedbackMessage').textContent = message;
            const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
            feedbackModal.show();
        }

        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value.trim();
            const password = this.querySelector('input[type="password"]').value.trim();

            if (!email || !password) {
                showModalMessage('Por favor completa ambos campos.');
                return;
            }

            try {
<<<<<<< HEAD
                const loginResponse = await fetch('http://localhost:3000/v1/auth/login', {
=======
                const loginResponse = await fetch('http://172.25.100.201:3000/v1/auth/login-postulante', {
>>>>>>> 9fbb323ba6581844dcbb1548f49e2ab9d9bfa8a4
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

                localStorage.setItem('token', loginData.token);

                const base64Url = loginData.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(base64));
                const userId = payload.sub;

                const userCheckResponse = await fetch(`http://localhost:3000/v1/postulante/${userId}`, {
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