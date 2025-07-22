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

      if (!data.token) {
        messageEl.textContent = 'No se recibió un token válido.';
        return;
      }

      console.log('Token recibido por login:', data.token);
      localStorage.setItem('auth_token', data.token);

      // Redirigir directo al dashboard sin validar
      window.location.href = 'employer-dashboard.html';

    } catch (error) {
      console.error('Error en login:', error);
      messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
  });
});

