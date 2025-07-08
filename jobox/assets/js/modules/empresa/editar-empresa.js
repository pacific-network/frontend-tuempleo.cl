
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

  async function actualizarEmpresa() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    const nombre_fantasia = document.getElementById('nombre_fantasia')?.value.trim() || '';
    const telefono = document.getElementById('telefono_empresa')?.value.trim() || '';
    const descripcion = document.getElementById('descripcion_empresa')?.value.trim() || '';
    const pais = document.getElementById('empresa_pais')?.value || '';
    const region = document.getElementById('empresa_region')?.value.trim() || '';
    const comuna = document.getElementById('empresa_comuna')?.value.trim() || '';
    const direccion = document.getElementById('empresa_direccion')?.value.trim() || '';
    const actividad = document.getElementById('actividad_empresa')?.value.trim() || '';

    // Crear array de domicilios con solo uno por ahora
    const domicilios = direccion ? [direccion] : [];

    const actividades_economicas = actividad ? [actividad] : [];

    const payload = {
      nombre_fantasia,
      telefono,
      descripcion,
      pais,
      region,
      comuna,
      domicilios,
  
    };

    try {
      const res = await fetch(`${BASE_URL_API}/empleador/empresa`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert('❌ Error actualizando empresa: ' + errorText);
        return;
      }

      alert('✅ Empresa actualizada correctamente');
    } catch (error) {
      console.error('Error en fetch:', error);
      alert('Error al conectar con el servidor');
    }
  }

  // 👉 Conectar botón al evento
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('actualizarEmpresaBtn');
    if (btn) {
      btn.addEventListener('click', actualizarEmpresa);
    }
  });
