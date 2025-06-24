document.addEventListener('DOMContentLoaded', () => {
    // Botón de login con Google
    const googleBtn = document.getElementById('googleLoginBtn');

    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Redirige al backend para iniciar OAuth con Google
            window.location.href = 'https://tuempleo.cl/api/v1/auth/google';
        });
    }

    // Captura del token devuelto por Google
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        localStorage.setItem('auth_token', token);
        // Redirigir al dashboard o página principal
        window.location.href = '/dashboard.html';
    }
}
);