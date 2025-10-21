// assets/js/modules/auth/oauth-candidate.js
document.addEventListener('DOMContentLoaded', () => {
  // Orígenes permitidos (igual que empresa)
  const ALLOWED_ORIGINS = window.isDev
    ? ['http://localhost:3000', 'http://127.0.0.1:5500']
    : ['https://tuempleo.cl'];

  // Detección de páginas (versión candidato)
  const pathname = window.location.pathname;
  const isLoginPage     = pathname.includes('login.html') || pathname.includes('candidate-login.html');
  const isDashboardPage = pathname.includes('candidate-dashboard.html');
  const isRegisterPage  = pathname.includes('candidate-form-register.html') || pathname.includes('register.html');

  // Helpers
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (err) {
      console.error('[oauth-candidate] Error decodificando token:', err);
      return null;
    }
  };

  const go = (to) => { if (!window.location.pathname.endsWith(to)) window.location.href = to; };

  // Igual que empresa, pero validando existencia de postulante
  const verificarYRedirigir = async (inputToken) => {
    const token = inputToken || localStorage.getItem('token');
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload?.sub) return;

    try {
      // 1) ¿Existe usuario?
      const uRes = await fetch(`${window.BASE_URL_API}/user/${payload.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (uRes.status === 404) {
        // No existe user -> ir a registro candidato
        if (!isRegisterPage) go('candidate-form-register.html');
        return;
      }

      if (!uRes.ok) {
        console.error('[oauth-candidate] Error /user:', await uRes.text());
        return;
      }

      // 2) ¿Existe postulante?
      const pRes = await fetch(`${window.BASE_URL_API}/postulante/${payload.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pRes.status === 404) {
        // Tiene user pero no perfil postulante -> completar registro
        if (!isRegisterPage) go('candidate-form-register.html');
        return;
      }

      if (!pRes.ok) {
        console.error('[oauth-candidate] Error /postulante:', await pRes.text());
        if (!isRegisterPage) go('candidate-form-register.html');
        return;
      }

      // OK: tiene postulante -> al dashboard
      if (!isDashboardPage) go('candidate-dashboard.html');
    } catch (error) {
      console.error('[oauth-candidate] Error verificando usuario/postulante:', error);
    }
  };

  // Botones (mismo IDs que empresa)
  const googleBtn   = document.getElementById('googleLoginBtn');    // botón "Continuar con Google"
  const linkedinBtn = document.getElementById('linkedinLoginBtn');  // botón "Continuar con LinkedIn"

  const openPopup = (url, name) => window.open(url, name, 'width=600,height=700');

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // Igual que empresa: el backend abre el flujo y al final hace postMessage({token})
      openPopup(`${window.BASE_URL_API}/oauth/google`, 'googleAuthPopup');
    });
  }

  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      openPopup(`${window.BASE_URL_API}/oauth/linkedin`, 'LinkedIn Login');
    });
  }

  // Si ya hay token guardado, verifica (como empresa)
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    verificarYRedirigir(savedToken);
  }

  // Recibir token desde el popup (igual que empresa)
  window.addEventListener('message', (event) => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) {
      console.warn('[oauth-candidate] Origen no permitido:', event.origin);
      return;
    }

    const { token } = event.data || {};
    if (!token) return;

    localStorage.setItem('token', token);
    verificarYRedirigir(token);
  });
});
