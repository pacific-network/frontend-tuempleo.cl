document.addEventListener('DOMContentLoaded', () => {
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
  
    const verificarYRedirigir = async (token) => {
      if (!token) return;
  
      const payload = parseJwt(token);
      if (!payload?.sub) return;
  
      try {
        const res = await fetch(`${BASE_URL_API}/user/${payload.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (res.status === 404) {
          window.location.href = 'employer-register.html';
          return;
        }
  
        if (!res.ok) return;
  
        const user = await res.json();
  
        if (!user.rut) {
          window.location.href = 'employer-form-register.html';
        } else {
          window.location.href = 'employer-dashboard.html';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    // Extraemos el token del query string si está
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('auth_token', tokenFromUrl);
      // Limpio query string para no tener token visible en URL
      window.history.replaceState({}, document.title, window.location.pathname);
      verificarYRedirigir(tokenFromUrl);
    } else {
      // No token en URL, verifico si hay token guardado para seguir sesión
      const tokenStored = localStorage.getItem('auth_token');
      if (tokenStored) {
        verificarYRedirigir(tokenStored);
      }
    }
  
    linkedinBtn.addEventListener('click', () => {
        window.open(`${BASE_URL_API}/oauth/linkedin`, 'LinkedIn Login', 'width=500,height=600');
      });
  });
  