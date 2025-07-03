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
  
  function renderPerfilEmpresa(empresa) {
    const contenedor = document.querySelector('.user-profile-sidebar-top');
    if (!contenedor) return;
  
    const nombreFantasia = empresa.nombre_fantasia || 'Nombre no disponible';
    const descripcion = empresa.data?.descripcion || 'Sin descripción';
  
    contenedor.innerHTML = `
      <div class="user-profile-img">
        <img src="${empresa.logo_url || '../assets/img/job/04.jpg'}" alt="Logo Empresa">
        <button type="button" class="profile-img-btn"><i class="far fa-camera"></i></button>
        <input type="file" class="profile-img-file">
      </div>
      <h4>${toTitleCase(nombreFantasia)}</h4>
      <p>${toTitleCase(descripcion)}</p>
    `;
  }
  
  function toTitleCase(str) {
    if (!str) return 'N/A';
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  async function cargarPerfilEmpresa() {
    const userId = getUserIdFromToken();
    if (!userId) return console.error('No se pudo obtener userId');
  
    try {
      const response = await fetch(`${BASE_URL_API}/empleador/empresa/${userId}`);
      if (!response.ok) throw new Error('Error en la solicitud');
  
      const empresa = await response.json(); // <--- importante
      renderPerfilEmpresa(empresa); // <--- renderizamos aquí
  
      console.log('✅ Datos del empleador cargados correctamente');
    } catch (err) {
      console.error('❌ Error al cargar datos del empleador:', err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', cargarPerfilEmpresa);
  