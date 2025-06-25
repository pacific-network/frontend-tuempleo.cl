document.addEventListener('DOMContentLoaded', () => {
    // Botón de login con LinkedIn
    const linkedinBtn = document.getElementById('linkedinLoginBtn');
  
    if (linkedinBtn) {
      linkedinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Redirige al backend para iniciar OAuth con LinkedIn
        window.location.href = `${BASE_API_URL}/auth/linkedin`;
      });
    }
  
    // Captura del token devuelto por LinkedIn
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (token) {
      localStorage.setItem('auth_token', token);
      // Redirigir al dashboard o página principal
      window.location.href = '/dashboard.html';
    }
  });
  