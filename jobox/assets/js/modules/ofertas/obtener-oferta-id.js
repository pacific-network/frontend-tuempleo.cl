// Función para convertir tipo de contrato a texto amigable
function formatoContrato(tipo) {
  const mapping = {
    plazo_fijo: 'Plazo Fijo',
    indefinido: 'Indefinido',
    temporal: 'Temporal',
    otro_tipo_de_contrato: 'Otro tipo de contrato',
    reemplazo: 'Reemplazo',
    practica: 'Práctica',
  };
  return mapping[tipo] || tipo || 'No especificado';
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const ofertaId = params.get('id');

  if (!ofertaId) {
    console.error('ID de oferta no encontrado en la URL');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
    if (!res.ok) throw new Error('Error al obtener los datos');

    const oferta = await res.json();

    // Parsear data que viene en string JSON
    const data = typeof oferta.data === 'string' ? JSON.parse(oferta.data) : oferta.data;

    // Empresa sidebar
    document.getElementById('empresa-nombre').textContent = oferta.empresa?.razon_social || 'Sin nombre';
    document.getElementById('empresa-rubro').textContent = oferta.empresa?.data?.actividades_economicas?.[0] || 'Sin rubro';
    if (oferta.empresa?.logo_url) {
      document.getElementById('empresa-logo').src = oferta.empresa.logo_url;
    }

    // Título principal
    document.querySelector('h4.titulo-oferta').textContent = oferta.titulo || 'Sin título';

    // Fechas (formato local Chile)
    document.querySelector('p.fecha-publicacion').textContent = new Date(oferta.fecha_publicacion).toLocaleDateString('es-CL');
    document.querySelector('p.fecha-cierre').textContent = new Date(oferta.fecha_cierre).toLocaleDateString('es-CL');

    // Otros datos
    document.querySelector('p.area-trabajo').textContent = data.area_trabajo || 'No especificado';
    document.querySelector('p.experiencia').textContent = data.anios_experiencia ? `${data.anios_experiencia} años` : 'No especificado';
    document.querySelector('p.region').textContent = data.region || 'No disponible';
    document.querySelector('p.educacion').textContent = data.educacion_requerida || 'No especificado';

    // Aquí usamos la función para mostrar contrato formateado
    document.querySelector('p.contrato').textContent = formatoContrato(data.tipo_contrato);

    document.querySelector('p.modalidad').textContent = data.modalidad || 'No especificado';

    // Renta salarial
    const renta = data.renta_salarial;
    document.querySelector('p.renta').textContent =
      renta?.desde && renta?.hasta
        ? `$${renta.desde} - $${renta.hasta}`
        : renta?.de_acuerdo_al_mercado
        ? 'De acuerdo al mercado'
        : 'No informado';

    // Descripción y listas
    document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto || 'Sin descripción';

    renderLista('.responsabilidades-list', data.responsabilidades);
    renderLista('.requisitos-list', data.requisitos_minimos);
    renderLista('.beneficios-list', data.beneficios);

  } catch (error) {
    console.error('Error al cargar la oferta:', error);
  }
});

// Función para renderizar listas en ul
function renderLista(selector, items = []) {
  const ul = document.querySelector(selector);
  if (!ul) return;

  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'mb-2';
    li.textContent = item;
    ul.appendChild(li);
  });
}
