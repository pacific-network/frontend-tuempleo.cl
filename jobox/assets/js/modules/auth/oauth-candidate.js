// assets/js/modules/auth/oauth-candidate.js — usa el id real de /auth/me para routing
document.addEventListener('DOMContentLoaded', () => {
  // ===================== Config =====================
  const TOKEN_KEY = 'token';
  const ME_ID_KEY = 'me_user_id'; // <<--- NUEVO
  const FRONT_ORIGIN = window.location.origin;
  const API_BASE = window.BASE_URL_API; // ej: http://localhost:3000/v1
  const API_ORIGIN = (() => { try { return new URL(API_BASE).origin; } catch { return null; } })();

  const ALLOWED_STATIC = ['https://tuempleo.cl', 'https://www.tuempleo.cl'];
  const ALLOWED_REGEX = [
    /^https?:\/\/([a-z0-9-]+\.)*tuempleo\.cl(?::\d+)?$/i,
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

  // ===================== Routing flags =====================
  const isLoginPage     = location.pathname.includes('login.html');
  const isRegisterPage  = location.pathname.includes('register.html');
  const isFormPage      = location.pathname.includes('candidate-form-register.html');
  const isDashboardPage = location.pathname.includes('candidate-dashboard.html');

  // ===================== Utils =====================
  const openPopup = (url, name) => window.open(url, name, 'width=600,height=700');

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch { return null; }
  };

  const isExpired = (payload) => {
    const now = Math.floor(Date.now() / 1000);
    return !!payload?.exp && payload.exp < now;
  };

  const goTo = (href) => { if (!location.pathname.endsWith(href)) location.href = href; };

  // ===================== Token capture (URL) =====================
  function captureTokenFromUrl() {
    const qs = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const token = qs.get('token') || hash.get('access_token') || hash.get('id_token');
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      try { history.replaceState({}, document.title, location.origin + location.pathname); } catch {}
    }
  }

  // ===================== Prefill helpers =====================
  function savePrefillFrom(eventData = {}, payload = {}) {
    const given =
      eventData.given_name || eventData.profile?.given_name || eventData.first_name || eventData.profile?.first_name ||
      payload.given_name || payload.givenName || null;

    const family =
      eventData.family_name || eventData.profile?.family_name || eventData.last_name || eventData.profile?.last_name ||
      payload.family_name || payload.familyName || null;

    const full =
      eventData.name || eventData.displayName || eventData.profile?.name ||
      payload.name || payload.nickname || payload.preferred_username || null;

    let g = given, f = family, fn = full;
    if ((!g || !f) && fn) {
      const t = String(fn).trim();
      const i = t.lastIndexOf(' ');
      if (i > 0) { g = g || t.slice(0, i); f = f || t.slice(i + 1); }
      else { g = g || t; }
    }
    if (!fn && (g || f)) fn = [g, f].filter(Boolean).join(' ').trim();

    if (fn) localStorage.setItem('oauth_name_full', fn.trim());
    if (g)  localStorage.setItem('oauth_given', g.trim());
    if (f)  localStorage.setItem('oauth_family', f.trim());
    if (eventData?.email || payload?.email) {
      const em = (eventData.email || payload.email || '').toString().trim().toLowerCase();
      if (em) localStorage.setItem('oauth_email', em);
    }
  }

  // ===================== Post-login routing =====================
  async function afterLoginRouting(token, hintRequierePostulante) {
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload || isExpired(payload)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ME_ID_KEY);
      goTo('login.html');
      return;
    }

    // 0) Validar token y obtener el id REAL del usuario desde /auth/me
    let myId = null;
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meRes.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ME_ID_KEY);
        goTo('login.html');
        return;
      }
      const meJson = await meRes.json();
      myId = meJson?.id || meJson?.user?.id || meJson?.data?.id || null;
      if (!myId) throw new Error('Respuesta /auth/me sin id');
      localStorage.setItem(ME_ID_KEY, String(myId));
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ME_ID_KEY);
      goTo('login.html');
      return;
    }

    // 1) En register.html → al formulario
    if (isRegisterPage) {
      if (!isFormPage) goTo('candidate-form-register.html');
      return;
    }

    // 2) Hint del backend (si lo manda)
    if (typeof hintRequierePostulante === 'boolean') {
      if (hintRequierePostulante) {
        if (!isFormPage) goTo('candidate-form-register.html');
      } else {
        if (!isDashboardPage) goTo('candidate-dashboard.html');
      }
      return;
    }

    // 3) Verificar existencia de postulante usando el ID REAL (NO payload.sub)
    try {
      const res = await fetch(`${API_BASE}/postulante/${myId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 404) {
        if (!isFormPage) goTo('candidate-form-register.html');
      } else if (res.ok) {
        if (!isDashboardPage) goTo('candidate-dashboard.html');
      } else {
        if (!isFormPage) goTo('candidate-form-register.html');
      }
    } catch {
      if (!isFormPage) goTo('candidate-form-register.html');
    }
  }

  // ===================== Abrir OAuth (Google/LinkedIn) =====================
  function openOAuth(provider /* 'google' | 'linkedin' */) {
    const url = `${API_BASE}/oauth/${provider}?audience=candidate&origin=${encodeURIComponent(FRONT_ORIGIN)}`;
    openPopup(url, `${provider}AuthPopup`);
  }

  // ===================== Hooks de botones =====================
  const googleBtn   = document.getElementById('googleLoginBtn')   || document.querySelector('.btn-gl');
  const linkedinBtn = document.getElementById('linkedinLoginBtn') || document.querySelector('.btn-li');

  googleBtn?.addEventListener('click', (e) => { e.preventDefault(); openOAuth('google'); });
  linkedinBtn?.addEventListener('click', (e) => { e.preventDefault(); openOAuth('linkedin'); });

  // ===================== 1) Captura token por URL =====================
  captureTokenFromUrl();

  // ===================== 2) Si hay token guardado y estás en login/register, decide =====================
  const savedToken = localStorage.getItem(TOKEN_KEY);
  if (savedToken && (isLoginPage || isRegisterPage)) {
    afterLoginRouting(savedToken);
  }

  // ===================== 3) postMessage desde popup OAuth =====================
  window.addEventListener('message', (event) => {
    if (!origenPermitido(event.origin)) {
      console.warn('[oauth-candidate] Origen no permitido:', event.origin, { FRONT_ORIGIN, API_ORIGIN });
      return;
    }

    const { token, requierePostulante, ...eventData } = event.data || {};
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);

    const payload = parseJwt(token) || {};
    savePrefillFrom(eventData, payload);

    // Limpia el id previo y vuelve a calcularlo desde /auth/me
    localStorage.removeItem(ME_ID_KEY);
    afterLoginRouting(token, requierePostulante);
  });
});
