document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('changePasswordBtn');
  
    if (!btn) {
      console.warn('Botón de cambio de contraseña no encontrado');
      return;
    }
  
    // Función para alternar visibilidad de contraseña
    function setupTogglePassword(buttonId, inputId) {
      const toggleBtn = document.getElementById(buttonId);
      const input = document.getElementById(inputId);
  
      if (!toggleBtn || !input) {
        console.warn(`Elementos toggle o input no encontrados: ${buttonId}, ${inputId}`);
        return;
      }
  
      toggleBtn.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      });
    }
  
    setupTogglePassword('toggleOldPass', 'old_password');
    setupTogglePassword('toggleNewPass', 'new_password');
    setupTogglePassword('toggleConfirmPass', 'confirm_password');
  
    // Validación visual en tiempo real para nueva contraseña
    const newPasswordInput = document.getElementById('new_password');
    newPasswordInput?.addEventListener('input', () => {
      const val = newPasswordInput.value;
      updateRequirement('req-char', val.length >= 8);
      updateRequirement('req-upper', /[A-Z]/.test(val));
      updateRequirement('req-lower', /[a-z]/.test(val));
      updateRequirement('req-alnum', /\d/.test(val)); // Solo números aquí, letras ya validadas
    });
  
    function updateRequirement(id, isValid) {
      const el = document.getElementById(id);
      if (!el) return;
      const icon = el.querySelector('i');
  
      if (isValid) {
        icon.classList.remove('fa-exclamation-triangle', 'text-warning');
        icon.classList.add('fa-check-circle', 'text-success');
      } else {
        icon.classList.remove('fa-check-circle', 'text-success');
        icon.classList.add('fa-exclamation-triangle', 'text-warning');
      }
    }
  
    // Evento click para enviar cambio de contraseña
    btn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('⚠️ No estás autenticado');
        return;
      }
  
      const oldPassword = document.getElementById('old_password')?.value.trim();
      const newPassword = document.getElementById('new_password')?.value.trim();
      const confirmPassword = document.getElementById('confirm_password')?.value.trim();
  
      if (!oldPassword || !newPassword || !confirmPassword) {
        alert('⚠️ Todos los campos son obligatorios');
        return;
      }
  
      if (newPassword !== confirmPassword) {
        alert('❌ Las contraseñas no coinciden');
        return;
      }
  
      const isValidPassword =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /\d/.test(newPassword);
  
      if (!isValidPassword) {
        alert('⚠️ La nueva contraseña no cumple con los requisitos mínimos.');
        return;
      }
  
      try {
        const res = await fetch(`${BASE_URL_API}/auth/me`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: newPassword,
            oldPassword: oldPassword // necesario para backend validar
          })
        });
  
        if (!res.ok) {
          const errorText = await res.text();
          alert('❌ Error al cambiar la contraseña: ' + errorText);
          return;
        }
  
        alert('✅ Contraseña actualizada correctamente');
  
        // Limpiar campos
        ['old_password', 'new_password', 'confirm_password'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
      } catch (error) {
        console.error('❌ Error al conectar con el servidor:', error);
        alert('Error al cambiar la contraseña');
      }
    });
  });
  