document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado');

    const googleBtn = document.getElementById('googleLoginBtn');

    if (googleBtn) {
        console.log('Botón de Google Login detectado');
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Click en botón de Google Login');
            const redirectUrl = `${BASE_URL_API}/auth/google`;
            console.log('Redirigiendo a:', redirectUrl);
            window.location.href = redirectUrl;
        });
    } else {
        console.warn('Botón de Google Login NO encontrado en el DOM');
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        console.log('Token detectado en URL:', token);
        localStorage.setItem('auth_token', token);
        console.log('Token guardado en localStorage como auth_token');
        window.location.href = '/dashboard.html';
    } else {
        console.log('No se detectó token en la URL');
    }
});
