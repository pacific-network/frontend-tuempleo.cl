// ===============================
// FUNCIONES DE FORMATEO
// ===============================

function formatoContrato(tipo) {
  const mapping = {
    plazo_fijo: 'Plazo Fijo',
    indefinido: 'Indefinido',
    temporal: 'Temporal',
    otro_tipo_de_contrato: 'Otro tipo de contrato',
    reemplazo: 'Reemplazo',
    practica: 'Práctica',
  };
  return mapping[tipo] || null;
}

function formatoModalidad(m) {
  if (!m) return null;
  return m === "1" ? "Full Time"
       : m === "2" ? "Part Time"
       : m === "3" ? "Remoto"
       : m === "4" ? "Freelancer"
       : m === "5" ? "Temporal"
       : null;
}

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
  if (!regionValor) return null;
  if (isNaN(regionValor)) return regionValor;
  const regionEncontrada = regionesDeChile.find(r => r.numero === parseInt(regionValor));
  return regionEncontrada ? regionEncontrada.nombre : null;
}

// ===============================
// INCREMENTAR CONTADOR DE VISITAS
// ===============================
async function registrarVisita(ofertaId) {
  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      console.warn("⚠️ No se pudo registrar la visita:", await res.text());
    } else {
      console.log("👁️ Visita registrada correctamente.");
    }
  } catch (err) {
    console.error("❌ Error al registrar la visita:", err);
  }
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

  // ✅ Registrar visita automáticamente
  registrarVisita(ofertaId);
  

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
    if (!res.ok) throw new Error('Error al obtener los datos');

    const oferta = await res.json();
    const data = typeof oferta.data === 'string' ? JSON.parse(oferta.data) : oferta.data || {};

    // ===============================
    // Datos de la empresa (sidebar)
    // ===============================
    mostrarTexto('empresa-nombre', oferta.empresa?.razon_social);
    mostrarTexto('empresa-rubro', oferta.empresa?.data?.actividades_economicas?.[0]);
    if (oferta.empresa?.logo_url) {
      document.getElementById('empresa-logo').src = oferta.empresa.logo_url;
    } else {
      document.getElementById('empresa-logo').style.display = 'none';
    }

    // ===============================
    // Datos principales de la oferta
    // ===============================
    mostrarTextoEnSelector('h4.titulo-oferta', oferta.titulo);

    mostrarTextoEnSelector(
      'p.fecha-publicacion',
      oferta.fecha_publicacion
        ? new Date(oferta.fecha_publicacion).toLocaleDateString('es-CL')
        : null
    );

    mostrarTextoEnSelector(
      'p.fecha-cierre',
      oferta.fecha_cierre
        ? new Date(oferta.fecha_cierre).toLocaleDateString('es-CL')
        : null
    );

    // ===============================
    // Datos adicionales
    // ===============================
    mostrarTextoEnSelector('p.area-trabajo', data.area_trabajo);
    mostrarTextoEnSelector(
      'p.experiencia',
      data.anios_experiencia ? `${data.anios_experiencia} año${data.anios_experiencia > 1 ? 's' : ''}` : null
    );
    mostrarTextoEnSelector('p.region', formatoRegion(data.region));
    mostrarTextoEnSelector('p.educacion', data.educacion_requerida);
    mostrarTextoEnSelector('p.contrato', formatoContrato(data.tipo_contrato));
    mostrarTextoEnSelector('p.modalidad', formatoModalidad(data.modalidad));

    // ===============================
    // Renta salarial
    // ===============================
    const renta = data.renta_salarial || {};
    const textoRenta =
      renta.desde && renta.hasta
        ? `$${renta.desde} - $${renta.hasta}`
        : renta.de_acuerdo_al_mercado
        ? 'De acuerdo al mercado'
        : renta.desde
        ? `$${renta.desde}`
        : renta.hasta
        ? `Hasta $${renta.hasta}`
        : null;
    mostrarTextoEnSelector('p.renta', textoRenta);

    // ===============================
    // Descripción y listas
    // ===============================
    mostrarTextoEnSelector('.descripcion-puesto', data.descripcion_puesto);
    renderLista('.responsabilidades-list', data.responsabilidades);
    renderLista('.requisitos-list', data.requisitos_minimos);
    renderLista('.beneficios-list', data.beneficios);

  } catch (error) {
    console.error('Error al cargar la oferta:', error);
  }
});

// ===============================
// Helpers visuales
// ===============================
function mostrarTexto(id, texto) {
  const el = document.getElementById(id);
  if (!el) return;
  if (texto && texto.trim() !== '') el.textContent = texto;
  else el.style.display = 'none';
}

function mostrarTextoEnSelector(selector, texto) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (texto && texto.trim() !== '') el.textContent = texto;
  else el.style.display = 'none';
}

// ===============================
// Renderizado de listas
// ===============================
function renderLista(selector, items) {
  const ul = document.querySelector(selector);
  if (!ul) return;

  if (!items || !Array.isArray(items) || items.length === 0) {
    ul.style.display = 'none';
    return;
  }

  ul.style.display = 'block';
  ul.innerHTML = '';
  items.forEach(item => {
    if (!item || item.trim() === '') return;
    const li = document.createElement('li');
    li.className = 'mb-2';
    li.textContent = item;
    ul.appendChild(li);
  });
}
