const form = document.getElementById('form-busqueda');
const listaBusquedas = document.getElementById('lista-busquedas');

// Mapas (opcionales si te sirven para mostrar nombres bonitos)
const regiones = {
  "1": "Región de Arica y Parinacota",
  "2": "Región de Tarapacá",
  "3": "Región de Antofagasta",
  "4": "Región de Atacama",
  "5": "Región de Coquimbo",
  "6": "Región de Valparaíso",
  "7": "Región Metropolitana de Santiago",
  "8": "Región del Libertador General Bernardo O’Higgins",
  "9": "Región del Maule",
  "10": "Región de Ñuble",
  "11": "Región del Biobío",
  "12": "Región de La Araucanía",
  "13": "Región de Los Ríos",
  "14": "Región de Los Lagos",
  "15": "Región de Aysén del General Carlos Ibáñez del Campo",
  "16": "Región de Magallanes y de la Antártica Chilena"
};

const categorias = {
  "1": "Informática / Tecnología",
  "2": "Administración / Oficina",
  "3": "Operaciones / Logística",
  "4": "Finanzas / Contabilidad",
  "5": "Gerencia / Dirección",
  "6": "Salud / Medicina",
  "7": "Recursos Humanos",
  "8": "Ventas / Comercial",
  "9": "Atención al Cliente",
  "10": "Educación / Docencia",
  "11": "Construcción",
  "12": "Electricidad / Electrónica",
  "13": "Mecánica / Automotriz",
  "14": "Transporte / Choferes",
  "15": "Gastronomía / Cocina",
  "16": "Panadería / Pastelería",
  "17": "Aseo / Limpieza",
  "18": "Seguridad / Guardia",
  "19": "Agricultura / Ganadería",
  "20": "Minería",
  "21": "Turismo / Hotelería",
  "22": "Periodismo / Comunicación",
  "23": "Diseño / Creatividad",
  "24": "Legal / Jurídico",
  "25": "Manufactura / Producción",
  "26": "Servicios Generales",
  "27": "Cuidado de Personas / Niñera",
  "28": "Veterinaria / Mascotas",
  "29": "Soldadura / Metalurgia",
  "30": "Gasfitería / Plomería"
};

// Guarda {keyword, region, categoria} (solo para "Últimas búsquedas")
form?.addEventListener('submit', function (e) {
  e.preventDefault();

  const keyword = document.getElementById('input-keyword')?.value.trim() || '';
  const region = document.getElementById('region-select')?.value.trim() || '';
  const categoria = document.getElementById('categoria-select')?.value.trim() || '';

  const busqueda = { keyword, region, categoria };
  guardarBusqueda(busqueda);
  mostrarBusquedas();

  // Dispara la búsqueda real (el listener en lista-trabajos.js ya hará loadOfertas())
  form.requestSubmit?.(); // por compatibilidad
});

function guardarBusqueda(nueva) {
  let busquedas = [];
  try { busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || []; } catch {}
  busquedas.unshift(nueva);
  // Unicos por triple clave (keyword, region, categoria)
  busquedas = busquedas.filter((b, i, arr) =>
    i === arr.findIndex(x =>
      x.keyword === b.keyword && x.region === b.region && x.categoria === b.categoria
    )
  );
  if (busquedas.length > 5) busquedas.length = 5;
  localStorage.setItem('busquedas_recientes', JSON.stringify(busquedas));
}

function mostrarBusquedas() {
  let busquedas = [];
  try { busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || []; } catch {}
  if (!listaBusquedas) return;
  listaBusquedas.innerHTML = '';

  if (busquedas.length === 0) {
    listaBusquedas.innerHTML = '<li class="text-muted">Sin historial aún.</li>';
    return;
  }

  busquedas.forEach(b => {
    const li = document.createElement('li');
    li.classList.add('mb-1', 'text-primary');
    li.style.cursor = 'pointer';

    const regionNombre = regiones[b.region] || (b.region || 'Todas');
    const categoriaNombre = categorias[b.categoria] || (b.categoria || 'Todas');

    li.textContent = `${b.keyword || '🔎'} · ${regionNombre} · ${categoriaNombre}`;
    li.addEventListener('click', () => {
      // Rellena la UI pero NO se auto-aplica al refrescar; solo al hacer clic aquí
      const kw = document.getElementById('input-keyword');
      const rs = document.getElementById('region-select');
      const cs = document.getElementById('categoria-select');

      if (kw) kw.value = b.keyword || '';
      if (rs) rs.value = b.region || '';
      if (cs) cs.value = b.categoria || '';

      // Envía el formulario para aplicar filtros ahora
      form?.requestSubmit();
    });
    listaBusquedas.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Mostramos la lista guardada, pero NO precargamos nada ni auto-buscamos.
  mostrarBusquedas();

  // Importante: NO LLAMAR a "precargarUltimaBusqueda()" ni submit automático.
});
