// ===============================
// FUNCIONES DE FORMATEO
// ===============================

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

// Función para convertir modalidad a texto
function formatoModalidad(m) {
  if (!m) return 'No especificado';
  return m === "1" ? "Full Time"
       : m === "2" ? "Part Time"
       : m === "3" ? "Remoto"
       : m === "4" ? "Freelancer"
       : m === "5" ? "Temporal"
       : "No especificado";
}

// Función para obtener el nombre de la región según número o texto
function formatoRegion(regionValor) {
  const regionesDeChile = [
    { numero: 1, nombre: "Región de Arica y Parinacota" },
    { numero: 2, nombre: "Región de Tarapacá" },
    { numero: 3, nombre: "Región de Antofagasta" },
    { numero: 4, nombre: "Región de Atacama" },
    { numero: 5, nombre: "Región de Coquimbo" },
    { numero: 6, nombre: "Región de Valparaíso" },
    { numero: 7, nombre: "Región Metropolitana de Santiago" },
    { numero: 8, nombre: "Región del Libertador General Bernardo O’Higgins" },
    { numero: 9, nombre: "Región del Maule" },
    { numero: 10, nombre: "Región de Ñuble" },
    { numero: 11, nombre: "Región del Biobío" },
    { numero: 12, nombre: "Región de La Araucanía" },
    { numero: 13, nombre: "Región de Los Ríos" },
    { numero: 14, nombre: "Región de Los Lagos" },
    { numero: 15, nombre: "Región de Aysén del General Carlos Ibáñez del Campo" },
    { numero: 16, nombre: "Región de Magallanes y de la Antártica Chilena" }
  ];

  // Si ya es texto (no número), devuélvelo directo
  if (isNaN(regionValor)) return regionValor;

  const regionEncontrada = regionesDeChile.find(r => r.numero === parseInt(regionValor));
  return regionEncontrada ? regionEncontrada.nombre : "No especificada";
}

// ===============================
// CARGA DE DATOS DE LA OFERTA
// ===============================
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
    const data = typeof oferta.data === 'string' ? JSON.parse(oferta.data) : oferta.data;

    // ===============================
    // Datos de la empresa (sidebar)
    // ===============================
    document.getElementById('empresa-nombre').textContent =
      oferta.empresa?.razon_social || 'Sin nombre';
    document.getElementById('empresa-rubro').textContent =
      oferta.empresa?.data?.actividades_economicas?.[0] || 'Sin rubro';
    if (oferta.empresa?.logo_url) {
      document.getElementById('empresa-logo').src = oferta.empresa.logo_url;
    }

    // ===============================
    // Datos principales de la oferta
    // ===============================
    document.querySelector('h4.titulo-oferta').textContent = oferta.titulo || 'Sin título';

    document.querySelector('p.fecha-publicacion').textContent =
      new Date(oferta.fecha_publicacion).toLocaleDateString('es-CL');
    document.querySelector('p.fecha-cierre').textContent =
      new Date(oferta.fecha_cierre).toLocaleDateString('es-CL');

    // ===============================
    // Datos adicionales
    // ===============================
    document.querySelector('p.area-trabajo').textContent = data.area_trabajo || 'No especificado';
    document.querySelector('p.experiencia').textContent =
      data.anios_experiencia ? `${data.anios_experiencia} años` : 'No especificado';

    // Región / ubicación
    document.querySelector('p.region').textContent = formatoRegion(data.region);

    // Educación requerida
    document.querySelector('p.educacion').textContent = data.educacion_requerida || 'No especificado';

    // Tipo de contrato
    document.querySelector('p.contrato').textContent = formatoContrato(data.tipo_contrato);

    // Modalidad laboral
    document.querySelector('p.modalidad').textContent = formatoModalidad(data.modalidad);

    // ===============================
    // Renta salarial
    // ===============================
    const renta = data.renta_salarial;
    document.querySelector('p.renta').textContent =
      renta?.desde && renta?.hasta
        ? `$${renta.desde} - $${renta.hasta}`
        : renta?.de_acuerdo_al_mercado
        ? 'De acuerdo al mercado'
        : 'No informado';

    // ===============================
    // Descripción y listas
    // ===============================
    document.querySelector('.descripcion-puesto').textContent =
      data.descripcion_puesto || 'Sin descripción';

    renderLista('.responsabilidades-list', data.responsabilidades);
    renderLista('.requisitos-list', data.requisitos_minimos);
    renderLista('.beneficios-list', data.beneficios);

  } catch (error) {
    console.error('Error al cargar la oferta:', error);
  }
});

// ===============================
// Función para renderizar listas
// ===============================
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
