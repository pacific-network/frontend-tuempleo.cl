// assets/js/modules/auth/oauth-candidate.js
document.addEventListener('DOMContentLoaded', () => {
  // Orígenes permitidos (dinámicos + estáticos + regex)
  const FRONT_ORIGIN = window.location.origin;
  const API_ORIGIN = (() => {
    try { return new URL(window.BASE_URL_API).origin; } catch { return null; }
  })();

  const ALLOWED_STATIC = ['https://tuempleo.cl'];
  const ALLOWED_REGEX = [
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,   // http local en cualquier puerto
    /^https:\/\/(localhost|127\.0\.0\.1):\d+$/   // https local en cualquier puerto (si usas mkcert/ngrok)
  ];

  const origenPermitido = (origin) => {
    if (!origin) return false;
    if (origin === FRONT_ORIGIN) return true;
    if (origin === API_ORIGIN) return true;
    if (ALLOWED_STATIC.includes(origin)) return true;
    return ALLOWED_REGEX.some(r => r.test(origin));
  };

  const isCandidateLogin = location.pathname.includes('login.html');
  const isCandidateRegister = location.pathname.includes('register.html');
  const isCandidateDashboard = location.pathname.includes('candidate-dashboard.html');
  const isCandidateForm = location.pathname.includes('candidate-form-register.html');

  const openPopup = (url, name) => window.open(url, name, 'width=600,height=700');

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch {
      return null;
    }
  };

  const goTo = (href) => { if (!location.pathname.endsWith(href)) location.href = href; };

  const verificarYRedirigir = async (token, hintRequierePostulante) => {
    if (!token) return;

    // Si backend ya manda la bandera para candidato
    if (typeof hintRequierePostulante === 'boolean') {
      if (hintRequierePostulante) {
        if (!isCandidateForm) goTo('candidate-form-register.html');
      } else {
        if (!isCandidateDashboard) goTo('candidate-dashboard.html');
      }
      return;
    }

    // Fallback: consultar si existe el postulante
    const payload = parseJwt(token);
    const userId = payload?.sub;
    if (!userId) return;

    try {
      const res = await fetch(`${window.BASE_URL_API}/postulante/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 404) {
        if (!isCandidateForm) goTo('candidate-form-register.html');
      } else if (res.ok) {
        if (!isCandidateDashboard) goTo('candidate-dashboard.html');
      } else {
        if (!isCandidateForm) goTo('candidate-form-register.html');
      }
    } catch {
      if (!isCandidateForm) goTo('candidate-form-register.html');
    }
  };

  // Botones en páginas de candidato
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // Ideal: backend soporta audience=candidate
      openPopup(`${window.BASE_URL_API}/oauth/google?audience=candidate`, 'googleAuthPopup');
    });
  }

  const linkedinBtn = document.getElementById('linkedinLoginBtn');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      openPopup(`${window.BASE_URL_API}/oauth/linkedin?audience=candidate`, 'linkedinAuthPopup');
    });
  }

  // Si ya hay token guardado (recarga / volvió de otra página)
  const savedToken = localStorage.getItem('token');
  if (savedToken && (isCandidateLogin || isCandidateRegister)) {
    verificarYRedirigir(savedToken);
  }

  // Recibir mensaje del popup OAuth
  window.addEventListener('message', (event) => {
    if (!origenPermitido(event.origin)) {
      console.warn('Origen no permitido:', event.origin, { FRONT_ORIGIN, API_ORIGIN });
      return;
    }

    const { token, requierePostulante } = event.data || {};
    if (!token) return;

    localStorage.setItem('token', token);

    // Preferir la bandera de candidato si existe, si no, usar fallback
    if (typeof requierePostulante === 'boolean') {
      verificarYRedirigir(token, requierePostulante);
    } else {
      verificarYRedirigir(token);
    }
  });
});
