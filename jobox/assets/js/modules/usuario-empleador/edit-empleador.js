function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
  
    toastBody.textContent = message;
  
    if (type === 'success') {
      toastTitle.textContent = '✅ Éxito';
      toastEl.classList.remove('bg-danger');
      toastEl.classList.add('bg-success');
    } else if (type === 'error') {
      toastTitle.textContent = '❌ Error';
      toastEl.classList.remove('bg-success');
      toastEl.classList.add('bg-danger');
    } else {
      toastTitle.textContent = '⚠️ Aviso';
      toastEl.classList.remove('bg-success', 'bg-danger');
    }
  
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
  
  async function actualizarUsuarioYEmpleador() {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('No estás autenticado', 'error');
      return;
    }
  
    // === Datos Usuario ===
    const nombres = document.getElementById('nombre_usuario')?.value.trim() || '';
    const apellidos = document.getElementById('usuario_apellido')?.value.trim() || '';
    const email = document.getElementById('usuario_correo')?.value.trim() || '';
  
    // === Datos Empleador ===
    const pais = document.getElementById('empleador_pais')?.value.trim() || '';
    const region = document.getElementById('empleador_region')?.value.trim() || '';
    const comuna = document.getElementById('empleador_comuna')?.value.trim() || '';
    const direccion = document.getElementById('empleador_direccion')?.value.trim() || '';
  
    const telefono = document.getElementById('usuario_telefono')?.value.trim() || '';
    const cargo = document.getElementById('usuario_cargo')?.value.trim() || '';
    const facebook = document.getElementById('empresa_facebook')?.value.trim() || '';
    const twitter = document.getElementById('empresa_twitter')?.value.trim() || '';
    const linkedin = document.getElementById('empresa_linkedin')?.value.trim() || '';
    const pinterest = document.getElementById('empresa_pinterest')?.value.trim() || '';
    const whatsapp = document.getElementById('empresa_whatsapp')?.value.trim() || '';
    const instagram = document.getElementById('empresa_instagram')?.value.trim() || '';
  
    try {
      // PATCH usuario
      const userRes = await fetch(`${BASE_URL_API}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombres, apellidos, email })
      });
  
      if (!userRes.ok) {
        const errorText = await userRes.text();
        showToast('Error actualizando datos de usuario: ' + errorText, 'error');
        return;
      }
  
      // PATCH empleador/data
      const empleadorPayload = {
        data: {
          pais,
          region,
          comuna,
          direccion,
          telefono,
          cargo,
          facebook,
          twitter,
          linkedin,
          pinterest,
          whatsapp,
          instagram
        }
      };
  
      const empleadorRes = await fetch(`${BASE_URL_API}/empleador/data`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadorPayload)
      });
  
      if (!empleadorRes.ok) {
        const errorText = await empleadorRes.text();
        showToast('Usuario actualizado, pero error en datos de empleador: ' + errorText, 'error');
        return;
      }
  
      showToast('Usuario y datos de empleador actualizados correctamente', 'success');
  
    } catch (error) {
      console.error('Error general:', error);
      showToast('Error al conectar con el servidor', 'error');
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actualizarEmpleadorBtn');
    if (btn) {
      btn.addEventListener('click', actualizarUsuarioYEmpleador);
    }
  });
  