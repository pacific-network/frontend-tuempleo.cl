document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (!googleBtn) return;

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

      window.addEventListener('message', (event) => {
        const { token } = event.data;
        if (token) {
            localStorage.setItem('token', token);
            verificarYRedirigir(token);
        }
    });

    googleBtn.addEventListener('click', () => {
        window.open(`${BASE_URL_API}/oauth/google`, 'Google Login', 'width=500,height=600');
    });

    window.addEventListener('message', (event) => {
        if (event.origin !== BASE_URL_API && !event.origin.includes('localhost')) return;
    
        const { token, user } = event.data || {};
        if (!token) return;
    
        localStorage.setItem('token', token); // opcional: guardar token
        verificarYRedirigir(token);
      });
});
