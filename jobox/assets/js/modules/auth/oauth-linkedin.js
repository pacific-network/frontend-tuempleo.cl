document.addEventListener('DOMContentLoaded', () => {
  const linkedinBtn = document.getElementById('linkedinLoginBtn');
  if (!linkedinBtn) return;

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1]; // payload está en la segunda parte
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
      const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${payload.sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.status === 404) {
        window.location.href = 'login-employer.html';
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
    window.open(`${BASE_URL_API}/oauth/linkedin`, 'LinkedIn Login', 'width=500,height=600');
  });

  // 🔥 Este es el código que faltaba
  window.addEventListener('message', (event) => {
    if (event.origin !== BASE_URL_API && !event.origin.includes('localhost')) return;

    const { token, user } = event.data || {};
    if (!token) return;

    localStorage.setItem('token', token); // opcional: guardar token
    verificarYRedirigir(token);
  });
});
