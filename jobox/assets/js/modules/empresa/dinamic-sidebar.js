// loadPerfilEmpresa.js

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
  
  function toTitleCase(str) {
    if (!str) return 'N/A';
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  async function cargarPerfilEmpresa() {
    const userId = getUserIdFromToken();
    if (!userId) return console.error('No se pudo obtener userId');
  
    try {
      const response = await fetch(`${BASE_URL_API}/empleador/${userId}`);
      if (!response.ok) throw new Error('Error en la solicitud');
      console.log('✅ Datos del empleador cargados correctamente');
    } catch (err) {
      console.error('❌ Error al cargar datos del empleador:', err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', cargarPerfilEmpresa);
  