function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('User ID obtenido del token:', payload.sub);
      return payload.sub || null;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }
  
  function setFieldValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
    else console.warn(`⚠️ Campo con ID '${id}' no encontrado`);
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error('No se pudo obtener userId del token');
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL_API}/empleador/${userId}`);
      if (!res.ok) throw new Error('Error al obtener los datos del empleador');
  
      const empleador = await res.json();
      const empresa = empleador.empresa || {};
      const empresaData = empresa.data || {};
      const usuario = empleador.usuario || {};
      const empleadorData = empleador.data || {};
  
      // === Empresa ===
      setFieldValue('rut_empresa', empresa.rut);
      setFieldValue('razon_social', empresa.razon_social);
      setFieldValue('nombre_fantasia', empresa.nombre_fantasia);
      setFieldValue('telefono_empresa', empresaData.telefono);
      setFieldValue('descripcion_empresa', empresaData.descripcion);
      setFieldValue('empresa_region', empresaData.region);
      setFieldValue('empresa_comuna', empresaData.comuna);
      setFieldValue('empresa_direccion', Array.isArray(empresaData.domicilios) ? empresaData.domicilios[0] : '');
      setFieldValue('empresa_pais', empresaData.pais);
  
      setFieldValue('actividad_empresa', Array.isArray(empresaData.actividades_economicas) ? empresaData.actividades_economicas[0] : '');
  
      if (empresaData.fecha_inicio_actividades) {
        const anio = new Date(empresaData.fecha_inicio_actividades).getFullYear();
        setFieldValue('empresa_inicio_actividades', anio);
      } else {
        setFieldValue('empresa_inicio_actividades', '');
      }
  
      // === Usuario ===
      setFieldValue('nombre_usuario', usuario.nombres);
      setFieldValue('usuario_apellido', usuario.apellidos);
      setFieldValue('usuario_correo', usuario.email);
      setFieldValue('usuario_telefono', empleadorData.telefono);
      setFieldValue('usuario_cargo', empleadorData.cargo);
  
      // === Redes sociales ===
      setFieldValue('empresa_facebook', empleadorData.facebook);
      setFieldValue('empresa_twitter', empleadorData.twitter);
      setFieldValue('empresa_linkedin', empleadorData.linkedin);
      setFieldValue('empresa_pinterest', empleadorData.pinterest);
      setFieldValue('empresa_whatsapp', empleadorData.whatsapp);
  
      console.log('✅ Datos cargados correctamente', empleador);
  
    } catch (error) {
      console.error('❌ Error al cargar datos del empleador:', error);
    }
  });
  