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

    const data = await response.json();
    const empresa = data.empresa || {};
    const datosEmpresa = empresa.data || {};
    const usuario = data.usuario || {};
    const datosUsuario = data.data || {};

    const cards = document.querySelectorAll('.user-profile-card');
    if (cards.length < 3) {
      console.warn('No se encontraron las tarjetas de perfil');
      return;
    }

    const [cardEmpresa, cardDescripcion, cardUsuario] = cards;

    // 🏢 Info Empresa
    const empresaItems = cardEmpresa.querySelectorAll('li');
    if (empresaItems.length >= 10) {
      empresaItems[0].querySelector('span').textContent = empresa.rut || 'N/A';
      empresaItems[1].querySelector('span').textContent = toTitleCase(empresa.nombre_fantasia);
      empresaItems[2].querySelector('span').textContent = toTitleCase(empresa.razon_social);
      empresaItems[3].querySelector('span').textContent = usuario.email || 'N/A';
      empresaItems[4].querySelector('span').textContent = (datosEmpresa.telefono || '').replace(/^null/, '') || 'N/A';
      empresaItems[5].querySelector('span').textContent = datosEmpresa.actividades_economicas?.[0] || 'No registrada';
      empresaItems[6].querySelector('span').textContent = datosEmpresa.condicion_fiscal || 'No especificada';
      empresaItems[7].querySelector('span').textContent = datosEmpresa.empresa_menor_tamano
        ? 'Micro o Pequeña Empresa'
        : 'Mediana o Gran Empresa';
      empresaItems[8].querySelector('span').textContent = datosEmpresa.inicio_actividades ? 'Sí' : 'No';
      empresaItems[9].querySelector('span').textContent = new Date(empresa.fecha_creacion).toLocaleDateString('es-CL');
    }

    // 📝 Descripción Empresa
    const descripcionElement = cardDescripcion.querySelector('p');
    if (descripcionElement) {
      descripcionElement.textContent = datosEmpresa.descripcion || 'Sin descripción.';
    }

    // 👤 Info Usuario
    const usuarioItems = cardUsuario.querySelectorAll('li');
    if (usuarioItems.length >= 7) {
      usuarioItems[0].querySelector('span').textContent = `${toTitleCase(usuario.nombres)} ${toTitleCase(usuario.apellidos)}` || 'N/A';
      usuarioItems[1].querySelector('span').textContent = usuario.email || 'N/A';
      usuarioItems[2].querySelector('span').textContent = toTitleCase(datosUsuario.region) || 'N/A';
      usuarioItems[3].querySelector('span').textContent = toTitleCase(datosUsuario.comuna) || 'N/A';
      usuarioItems[4].querySelector('span').textContent = toTitleCase(datosUsuario.pais) || 'N/A';
      usuarioItems[5].querySelector('span').textContent = datosUsuario.direccion || 'N/A';
      usuarioItems[6].querySelector('span').textContent = datosUsuario.numero || '#';
    }

    // 🌐 Redes Sociales
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
    console.error('❌ Error al cargar datos del empleador:', err);
  }
}

document.addEventListener('DOMContentLoaded', cargarPerfilEmpresa);
