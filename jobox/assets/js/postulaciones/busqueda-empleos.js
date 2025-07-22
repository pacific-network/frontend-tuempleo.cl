const form = document.getElementById('form-busqueda');
const listaBusquedas = document.getElementById('lista-busquedas');

// Mapas de región y categoría
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

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const keyword = document.getElementById('input-keyword').value.trim();
  const region = document.getElementById('region-select').value.trim(); // valor numérico
  const categoria = document.getElementById('categoria-select').value.trim(); // valor numérico

  const busqueda = { keyword, region, categoria };
  guardarBusqueda(busqueda);
  mostrarBusquedas();
});

function guardarBusqueda(nueva) {
  let busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || [];
  busquedas.unshift(nueva);
  busquedas = busquedas.filter((b, i, arr) =>
    i === arr.findIndex(x =>
      x.keyword === b.keyword &&
      x.region === b.region &&
      x.categoria === b.categoria
    )
  );
  if (busquedas.length > 5) busquedas.length = 5;
  localStorage.setItem('busquedas_recientes', JSON.stringify(busquedas));
}

function mostrarBusquedas() {
  const busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || [];
  listaBusquedas.innerHTML = '';

  if (busquedas.length === 0) {
    listaBusquedas.innerHTML = '<li class="text-muted">Sin historial aún.</li>';
    return;
  }

  busquedas.forEach(b => {
    const li = document.createElement('li');
    li.classList.add('mb-1', 'text-primary');
    li.style.cursor = 'pointer';

    const regionNombre = regiones[b.region] || 'Todas';
    const categoriaNombre = categorias[b.categoria] || 'Todas';

    li.textContent = `${b.keyword || '🔎'} · ${regionNombre} · ${categoriaNombre}`;
    li.addEventListener('click', () => {
      document.getElementById('input-keyword').value = b.keyword;
      document.getElementById('region-select').value = b.region;
      document.getElementById('categoria-select').value = b.categoria;
      form.requestSubmit();
    });
    listaBusquedas.appendChild(li);
  });
}

function precargarUltimaBusqueda() {
  const busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || [];
  if (busquedas.length === 0) return;

  const ultima = busquedas[0];
  document.getElementById('input-keyword').value = ultima.keyword;
  document.getElementById('region-select').value = ultima.region;
  document.getElementById('categoria-select').value = ultima.categoria;

  form.requestSubmit();
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarBusquedas();
  precargarUltimaBusqueda();
});
