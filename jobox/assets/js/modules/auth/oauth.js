document.addEventListener('DOMContentLoaded', () => {
    // Botones OAuth
    const googleBtn = document.getElementById('googleLoginBtn');
    const linkedinBtn = document.getElementById('linkedinLoginBtn');
  
    if (googleBtn) {
      googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'https://tuempleo.cl/api/v1/auth/google';
      });
    }
  
    if (linkedinBtn) {
      linkedinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'https://tuempleo.cl/api/v1/auth/linkedin';
      });
    }
  
    // Captura token y redirige (solo una vez)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (token) {
      localStorage.setItem('auth_token', token);
  
      // Opcional: si quieres redirigir a distinta página, puedes hacer lógica aquí,
      // pero normalmente el backend ya decide redirigir al lugar correcto,
      // así que aquí simplemente hacemos redirect genérico:
  
      window.location.href = '/dashboard.html'; // o la página que uses por defecto
    }
  });
  