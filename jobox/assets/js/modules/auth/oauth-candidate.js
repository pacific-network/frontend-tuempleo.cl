// assets/js/modules/auth/oauth-candidate.js
document.addEventListener('DOMContentLoaded', () => {
  // ===== Orígenes permitidos (dinámicos + estáticos + regex) =====
  const FRONT_ORIGIN = window.location.origin;
  const API_ORIGIN = (() => {
    try { return new URL(window.BASE_URL_API).origin; } catch { return null; }
  })();

  // dominios exactos
  const ALLOWED_STATIC = [
    'https://tuempleo.cl',
    'https://www.tuempleo.cl'
  ];

  // patrones (subdominios y entornos locales)
  const ALLOWED_REGEX = [
    // Cualquier subdominio de tuempleo.cl con http/https y puerto opcional
    /^https?:\/\/([a-z0-9-]+\.)*tuempleo\.cl(?::\d+)?$/i,
    // Localhost/127.0.0.1 en cualquier puerto
    /^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i,
    /^https:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i
  ];

  const origenPermitido = (origin) => {
    if (!origin) return false;
    if (origin === FRONT_ORIGIN) return true;
    if (origin === API_ORIGIN) return true;
    if (ALLOWED_STATIC.includes(origin)) return true;
    return ALLOWED_REGEX.some(r => r.test(origin));
  };

  // ===== Rutas/páginas =====
  const isCandidateLogin     = location.pathname.includes('login.html');
  const isCandidateRegister  = location.pathname.includes('register.html');
  const isCandidateDashboard = location.pathname.includes('candidate-dashboard.html');
  const isCandidateForm      = location.pathname.includes('candidate-form-register.html');

  // ===== Utils =====
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

  const goTo = (href) => {
    if (!location.pathname.endsWith(href)) location.href = href;
  };

  // ===== Lógica de verificación/redirección =====
  const verificarYRedirigir = async (token, hintRequierePostulante) => {
    if (!token) return;

    // Caso ideal: el backend ya envía la bandera para candidato
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

  // ===== Botones OAuth (páginas candidato) =====
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // Enviar el origin del front al backend (por si lo usas en la validación/postMessage)
      const url = `${window.BASE_URL_API}/oauth/google?audience=candidate&origin=${encodeURIComponent(FRONT_ORIGIN)}`;
      openPopup(url, 'googleAuthPopup');
    });
  }

  const linkedinBtn = document.getElementById('linkedinLoginBtn');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      const url = `${window.BASE_URL_API}/oauth/linkedin?audience=candidate&origin=${encodeURIComponent(FRONT_ORIGIN)}`;
      openPopup(url, 'linkedinAuthPopup');
    });
  }

  // ===== Token ya guardado (recarga / regreso de otra página) =====
  const savedToken = localStorage.getItem('token');
  if (savedToken && (isCandidateLogin || isCandidateRegister)) {
    verificarYRedirigir(savedToken);
  }

  // ===== postMessage desde el popup OAuth =====
  window.addEventListener('message', (event) => {
    if (!origenPermitido(event.origin)) {
      console.warn('Origen no permitido:', event.origin, { FRONT_ORIGIN, API_ORIGIN });
      return;
    }

    const { token, requierePostulante } = event.data || {};
    if (!token) return;

    localStorage.setItem('token', token);

    // Preferir la bandera; si no viene, usar el fallback
    if (typeof requierePostulante === 'boolean') {
      verificarYRedirigir(token, requierePostulante);
    } else {
      verificarYRedirigir(token);
    }
  });
});
