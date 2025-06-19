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
  
  async function cargarPerfilEmpresa() {
    const userId = getUserIdFromToken();
    if (!userId) return console.error('No se pudo obtener userId');
  
    try {
      const response = await fetch(`http://localhost:3000/v1/empleador/${userId}`);
      const data = await response.json();
  
      const empresa = data.empresa || {};
      const datosEmpresa = empresa.data || {};
      const usuario = data.usuario || {};
      const datosUsuario = data.data || {};
  
      // Datos Empresa
      const cards = document.querySelectorAll('.user-profile-card');
      if (cards.length < 3) return;
  
      const [cardEmpresa, cardDescripcion, cardUsuario] = cards;
  
      const empresaItems = cardEmpresa.querySelectorAll('li');
      empresaItems[0].querySelector('span').textContent = empresa.rut || 'N/A';
      empresaItems[1].querySelector('span').textContent = empresa.nombre_fantasia || 'N/A';
      empresaItems[2].querySelector('span').textContent = empresa.razon_social || 'N/A';
      empresaItems[3].querySelector('span').textContent = usuario.email || 'N/A';
      empresaItems[4].querySelector('span').textContent = datosEmpresa.telefono || 'N/A';
  
      // Descripción
      cardDescripcion.querySelector('p').textContent = datosEmpresa.descripcion || 'Sin descripción.';
  
      // Usuario y Dirección
      const usuarioItems = cardUsuario.querySelectorAll('li');
      usuarioItems[0].querySelector('span').textContent = `${usuario.nombres || ''} ${usuario.apellidos || ''}`;
      usuarioItems[1].querySelector('span').textContent = usuario.email || 'N/A';
      usuarioItems[2].querySelector('span').textContent = datosUsuario.region || 'N/A';
      usuarioItems[3].querySelector('span').textContent = datosUsuario.comuna || 'N/A';
      usuarioItems[4].querySelector('span').textContent = datosUsuario.pais || 'N/A';
      usuarioItems[5].querySelector('span').textContent = datosUsuario.direccion || 'N/A';
      usuarioItems[6].querySelector('span').textContent = datosUsuario.numero || '#';
  
      // Redes sociales
      const redes = document.querySelector('.profile-social');
      if (redes) {
        const enlaces = redes.querySelectorAll('a');
        if (enlaces.length >= 4) {
          enlaces[0].href = datosUsuario.facebook || '#';
          enlaces[1].href = datosUsuario.twitter || '#';
          enlaces[2].href = datosUsuario.linkedin || '#';
          enlaces[3].href = datosUsuario.instagram || '#';
        }
      }
  
    } catch (err) {
      console.error('Error al cargar datos del empleador:', err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', cargarPerfilEmpresa);
  