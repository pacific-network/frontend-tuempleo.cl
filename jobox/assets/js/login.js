document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromOAuth = urlParams.get('token');

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
      if (messageEl) messageEl.textContent = 'Token inválido.'; //cambiar a mensaje mas amigable, el user no sabe del token
      return;
    }

    const userId = payload.sub;

    try {
      const res = await fetch(`${BASE_URL_API}/postulante/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        if (messageEl) messageEl.textContent = `Error verificando usuario: ${errText}`;
        return;
      }

      let candidatoData = null;
      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > 0) {
        candidatoData = await res.json();
      }

      if (!candidatoData || candidatoData.postulante?.id === 0) {
        window.location.href = 'candidate-form-register.html';
      } else {
        window.location.href = 'candidate-dashboard.html';
      }
    } catch (error) {
      console.error('Error validando token:', error);
      if (messageEl) messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
  };

  if (tokenFromOAuth) {
    localStorage.setItem('token', tokenFromOAuth);
    window.history.replaceState(null, '', window.location.pathname); // Limpia el token de la URL
    verificarYRedirigir(tokenFromOAuth);
    return;
  }

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePasswordBtn.innerHTML = `<i class="far fa-eye${isHidden ? '-slash' : ''}"></i>`;
    });
  }

  // Botón login con Google
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `${BASE_URL_API}/auth/google`;
    });
  }

  // Botón login con LinkedIn
  const linkedinBtn = document.getElementById('linkedinLoginBtn');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `${BASE_URL_API}/auth/linkedin`;
    });
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (messageEl) messageEl.textContent = '';

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value.trim() || '';

    if (!email || !password) {
      if (messageEl) messageEl.textContent = 'Por favor, completa ambos campos.';
      return;
    }

    try {
      const res = await fetch(`${BASE_URL_API}/auth/login-postulante`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.status === 401) {
        if (messageEl) messageEl.textContent = 'Usuario no existe o contraseña incorrecta.';
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        if (messageEl) messageEl.textContent = `Error en login: ${errorText}`;
        return;
      }

      const data = await res.json();

      if (!data.token) {
        if (messageEl) messageEl.textContent = 'No se recibió un token válido.';
        return;
      }

      localStorage.setItem('token', data.token);
      verificarYRedirigir(data.token);

    } catch (error) {
      console.error('Error en login:', error);
      if (messageEl) messageEl.textContent = 'No se pudo conectar con el servidor.';
    }
<<<<<<< HEAD
});
=======
  });
});
>>>>>>> dev
