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
            localStorage.setItem('token', token);
            verificarYRedirigir(token);
        }
    });

    googleBtn.addEventListener('click', () => {
        window.open(`${BASE_URL_API}/oauth/google`, 'Google Login', 'width=500,height=600');
    });
});
