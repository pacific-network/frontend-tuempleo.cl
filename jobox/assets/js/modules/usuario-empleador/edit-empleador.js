function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }
  
  async function actualizarUsuarioYEmpleador() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado');
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
        alert('❌ Error actualizando datos de usuario: ' + errorText);
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
        alert('⚠️ Usuario actualizado, pero error en datos de empleador: ' + errorText);
        return;
      }
  
      alert('✅ Usuario y datos de empleador actualizados correctamente');
  
    } catch (error) {
      console.error('Error general:', error);
      alert('Error al conectar con el servidor');
    }
  }
  
  // Evento al botón
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actualizarEmpleadorBtn');
    if (btn) {
      btn.addEventListener('click', actualizarUsuarioYEmpleador);
    }
  });
  