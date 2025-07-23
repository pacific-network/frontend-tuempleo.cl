document.addEventListener('DOMContentLoaded', () => {
    // Botón de login con LinkedIn
    const linkedinBtn = document.getElementById('linkedinLoginBtn');
    if( !linkedinBtn ) return;

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
              headers: { 'Authorization': `Bearer ${token}` }
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

  window.addEventListener('message', (event) => {
    const { token } = event.data;
    if (token) {
        localStorage.setItem('auth_token', token);
        verificarYRedirigir(token);
    }
});

    linkedinBtn.addEventListener('click', () => {
        window.open(`${BASE_URL_API}/oauth/linkedin/login`, 'LinkedIn Login', 'width=500,height=600');
    });


  });
  