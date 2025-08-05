document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePasswordBtn.innerHTML = `<i class="far fa-eye${isHidden ? '-slash' : ''}"></i>`;
    });
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!messageEl) return;
    messageEl.textContent = '';

    const email = loginForm.querySelector('#email')?.value.trim();
    const password = loginForm.querySelector('#password')?.value.trim();

    if (!email || !password) {
      messageEl.textContent = 'Por favor, completa ambos campos.';
      return;
    }

    try {
      const res = await fetch(`${BASE_URL_API}/auth/login-empleador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.status === 401) {
        messageEl.textContent = 'Usuario no existe o contraseña incorrecta.';
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        messageEl.textContent = `Error en login: ${errorText}`;
        return;
      }

      const data = await res.json();
      const token = data.token;

      if (!token) {
        messageEl.textContent = 'No se recibió un token válido.';
        return;
      }

      console.log('✅ Token recibido:', token);
      localStorage.setItem('token', token);

      // Decodificar token para obtener el sub (id del usuario)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      // Verificar si el empleador ya tiene perfil creado
      const perfilRes = await fetch(`${BASE_URL_API}/empleador/idUser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (perfilRes.status === 404) {
        console.log('➡️ Empleador sin perfil, redirigiendo a formulario...');
        window.location.href = 'employer-form-register.html';
      } else if (perfilRes.ok) {
        console.log('➡️ Empleador con perfil, redirigiendo al dashboard...');
        window.location.href = 'employer-dashboard.html';
      } else {
        const text = await perfilRes.text();
        messageEl.textContent = `Error al verificar perfil: ${text}`;
      }

    } catch (error) {
      console.error('Error en login:', error);
      messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
  });
});
