// ==============================
// Mostrar búsquedas recientes
// ==============================
function mostrarBusquedas() {
  const listaBusquedas = document.getElementById('lista-busquedas');
  if (!listaBusquedas) return;

  let busquedas = [];
  try {
    busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || [];
  } catch (e) {
    console.error('Error al leer búsquedas:', e);
  }

  listaBusquedas.innerHTML = '';

  if (busquedas.length === 0) {
    listaBusquedas.innerHTML = '<li class="text-muted">Sin historial aún.</li>';
    return;
  }

  // Mapas opcionales (nombre región / categoría)
  const regiones = {
    "7": "Región Metropolitana de Santiago",
    "1": "Región de Arica y Parinacota",
    "2": "Región de Tarapacá",
    "3": "Región de Antofagasta",
    "4": "Región de Atacama",
    "5": "Región de Coquimbo",
    "6": "Región de Valparaíso",
    "8": "Región del Libertador General Bernardo O’Higgins",
    "9": "Región del Maule",
    "10": "Región de Ñuble",
    "11": "Región del Biobío",
    "12": "Región de La Araucanía",
    "13": "Región de Los Ríos",
    "14": "Región de Los Lagos",
    "15": "Región de Aysén",
    "16": "Región de Magallanes"
  };

  busquedas.forEach((b) => {
    const regionNombre = regiones[b.region] || (b.region || 'Todas');
    const categoriaNombre = b.categoria || 'Todas';

    const li = document.createElement('li');
    li.classList.add('mb-1', 'text-primary');
    li.style.cursor = 'pointer';
    li.textContent = `${b.keyword || '🔎'} · ${regionNombre} · ${categoriaNombre}`;

    li.addEventListener('click', () => {
      const kw = document.getElementById('input-keyword');
      const rs = document.getElementById('region-select');
      const cs = document.getElementById('categoria-select');
      if (kw) kw.value = b.keyword || '';
      if (rs) rs.value = b.region || '';
      if (cs) cs.value = b.categoria || '';
      document.getElementById('form-busqueda')?.requestSubmit();
    });

    listaBusquedas.appendChild(li);
  });
}

// ==============================
// Ejecutar al cargar página
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  mostrarBusquedas();
});
