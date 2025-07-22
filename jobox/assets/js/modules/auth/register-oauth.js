//assets/js/modules/auth/register-oauth.js
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.querySelector('.btn-gl');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Redirecciona al endpoint del backend OAuth
            window.location.href = 'https://tuempleo.cl/api/v1/auth/google';
        });
    }
});