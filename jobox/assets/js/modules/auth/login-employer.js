document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromGoogle = urlParams.get('token');

  const loginForm = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (err) {
      console.error('Error decodificando el token:', err);
      return null;
    }
  };

  const verificarYRedirigir = async (token) => {
    const payload = parseJwt(token);
    if (!payload || !payload.sub) {
      messageEl.textContent = 'Token inválido.';
      return;
    }

    const userId = payload.sub;

    try {
      const res = await fetch(`${BASE_URL_API}/empleador/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        messageEl.textContent = `Error verificando usuario: ${errText}`;
        return;
      }

      let employerData = null;
      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > 0) {
        employerData = await res.json();
      }

      if (!employerData || employerData.employer?.empresaId === 0) {
        window.location.href = 'employer-form-register.html';
      } else {
        window.location.href = 'employer-dashboard.html';
      }
    } catch (error) {
      console.error('Error validando token:', error);
      messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
  };

  if (tokenFromGoogle) {
    localStorage.setItem('token', tokenFromGoogle);
    window.history.replaceState(null, '', window.location.pathname); // Limpia el token de la URL
    verificarYRedirigir(tokenFromGoogle);
    return;
  }

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

      localStorage.setItem('token', data.token);
      verificarYRedirigir(data.token);

    } catch (error) {
      console.error('Error en login:', error);
      messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
  });
});
