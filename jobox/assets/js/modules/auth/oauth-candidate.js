// assets/js/modules/auth/oauth-candidate.js (híbrido: localhost + tuempleo.cl)
document.addEventListener('DOMContentLoaded', () => {
  // ------- Orígenes permitidos -------
  const API_ORIGIN = (() => {
    try { return new URL(window.BASE_URL_API).origin; } catch { return null; }
  })();

  const STATIC_ORIGINS = [
    // Producción
    'https://tuempleo.cl',
    'https://www.tuempleo.cl',
    // Dev
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    // El propio origin de esta página
    window.location.origin
  ];

  const ALLOWED_REGEX = [
    /^https?:\/\/([a-z0-9-]+\.)*tuempleo\.cl(?::\d+)?$/i,
    /^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i,
    /^https:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i
  ];

  const ALLOWED_ORIGINS = API_ORIGIN
    ? Array.from(new Set([...STATIC_ORIGINS, API_ORIGIN]))
    : STATIC_ORIGINS;

  const isAllowed = (origin) => {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    return ALLOWED_REGEX.some(r => r.test(origin));
  };

  // ------- Rutas donde estamos -------
  const p = window.location.pathname;
  const isLoginOrRegister = p.includes('login.html') || p.includes('register.html');
  const isFormPage        = p.includes('candidate-form-register.html');
  const isDashboardPage   = p.includes('candidate-dashboard.html');

  // ------- Helpers -------
  const TOKEN_KEY = 'token';

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (err) {
      console.error('[oauth-candidate] Error decodificando JWT:', err);
      return null;
    }
  };

  const captureTokenFromUrl = () => {
    const qs = new URLSearchParams(location.search);
    const hs = new URLSearchParams(location.hash.replace(/^#/, ''));
    const t  = qs.get('token') || hs.get('access_token') || hs.get('id_token');
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      try { history.replaceState({}, document.title, location.origin + location.pathname); } catch {}
    }
  };

  const go = (href) => { if (!location.pathname.endsWith(href)) location.href = href; };

  // ----- Flujo principal posterior a guardar token -----
  const verificarYRedirigir = async (inputToken) => {
    const token = inputToken || localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const payload = parseJwt(token);
    const sub = Number(payload?.sub);
    if (!Number.isFinite(sub)) {
      console.warn('[oauth-candidate] JWT sin sub numérico; quedarse en la página.');
      return;
    }

    try {
      // 1) ¿Existe el usuario?
      const uRes = await fetch(`${window.BASE_URL_API}/user/${sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (uRes.status === 404) {
        if (!isFormPage) go('candidate-form-register.html');
        return;
      }
      if (!uRes.ok) {
        console.error('[oauth-candidate] /user/{sub} error:', await uRes.text());
        if (!isFormPage) go('candidate-form-register.html');
        return;
      }

      // 2) ¿Tiene Postulante?
      const pRes = await fetch(`${window.BASE_URL_API}/postulante/${sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pRes.status === 404) {
        if (!isFormPage) go('candidate-form-register.html');
        return;
      }
      if (pRes.ok) {
        if (!isDashboardPage) go('candidate-dashboard.html');
        return;
      }

      if (!isFormPage) go('candidate-form-register.html');
    } catch (err) {
      console.error('[oauth-candidate] verificarYRedirigir error:', err);
      if (!isFormPage) go('candidate-form-register.html');
    }
  };

  // ------- Botón Google / LinkedIn (popup) -------
  const openPopup = (url, name) => window.open(url, name, 'width=600,height=700');

  const googleBtn   = document.getElementById('googleLoginBtn')   || document.querySelector('.btn-gl');
  const linkedinBtn = document.getElementById('linkedinLoginBtn') || document.querySelector('.btn-li');

  googleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup(`${window.BASE_URL_API}/oauth/google?audience=candidate&origin=${encodeURIComponent(window.location.origin)}`, 'googleAuthPopup');
  });

  linkedinBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup(`${window.BASE_URL_API}/oauth/linkedin?audience=candidate&origin=${encodeURIComponent(window.location.origin)}`, 'linkedinAuthPopup');
  });

  // ------- Captura token si viene en URL (fallback) -------
  captureTokenFromUrl();

  // ------- Si ya hay token (recarga), decide -------
  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken && isLoginOrRegister) {
    verificarYRedirigir(savedToken);
  }

  // ------- Recibir token del popup -------
  window.addEventListener('message', (event) => {
    if (!isAllowed(event.origin)) {
      console.warn('[oauth-candidate] Origen no permitido:', event.origin);
      return;
    }

    const { token, id_token, access_token } = event.data || {};
    const t = token || id_token || access_token;
    if (!t) return;

    localStorage.setItem(TOKEN_KEY, t);
    verificarYRedirigir(t);
  });
});
