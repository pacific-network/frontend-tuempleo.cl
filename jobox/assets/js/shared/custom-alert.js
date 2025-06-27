// shared/custom-alert.js

function showSuccessAlertAndRedirect(message, redirectUrl, delay = 2000) {
    const alertBox = document.getElementById('custom-alert');
  
    if (!alertBox) return;
  
    alertBox.innerHTML = `
      ${message}
      <div class="spinner-border spinner-border-sm text-light ms-2" role="status"></div>
    `;
    alertBox.classList.remove('d-none');
  
    // Desactivar todos los campos del formulario si hay uno
    const form = document.querySelector('form');
    if (form) {
      form.querySelectorAll('input, select, button, textarea').forEach(el => el.disabled = true);
    }
  
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, delay);
  }
  
  // Exponer en el scope global
  window.showSuccessAlertAndRedirect = showSuccessAlertAndRedirect;
  