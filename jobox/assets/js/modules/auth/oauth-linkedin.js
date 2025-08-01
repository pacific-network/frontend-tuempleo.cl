document.addEventListener('DOMContentLoaded', () => {
  const ALLOWED_ORIGINS = window.isDev
    ? ['http://localhost:3000', 'http://127.0.0.1:5500']
    : ['https://tuempleo.cl'];

  const linkedinBtn = document.getElementById('linkedinLoginBtn');
  if (!linkedinBtn) return;

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

  const verificarYRedirigir = async (inputToken) => {
    const token = inputToken || localStorage.getItem('token');
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload?.sub) return;

    try {
      const res = await fetch(`${window.BASE_URL_API}/empleador/basic-info/${payload.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        if (!window.location.href.includes('login-employer.html')) {
          window.location.href = 'login-employer.html';
        }
        return;
      }

      if (!res.ok) {
        console.error('Error en la respuesta:', await res.text());
        return;
      }

      const user = await res.json();

      if (user.empresa_id && user.empleador_id) {
        window.location.href = 'employer-dashboard.html';
      } else {
        window.location.href = 'employer-form-register.html';
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
    }
  };

  linkedinBtn.addEventListener('click', () => {
    window.open(
      `${window.BASE_URL_API}/oauth/linkedin`,
      'LinkedIn Login',
      'width=500,height=600'
    );
  });

  // ✅ Al cargar la página, revisar si hay un token guardado
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    verificarYRedirigir(savedToken);
  }

  // ✅ Escuchar token enviado desde popup
  window.addEventListener('message', (event) => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) {
      console.warn('Origen no permitido:', event.origin);
      return;
    }

    const { token } = event.data || {};
    if (!token) return;

    localStorage.setItem('token', token);
    verificarYRedirigir(token);
  });
});
