const regiones = [
    { numero: "1", nombre: "Región de Arica y Parinacota" },
    { numero: "2", nombre: "Región de Tarapacá" },
    { numero: "3", nombre: "Región de Antofagasta" },
    { numero: "4", nombre: "Región de Atacama" },
    { numero: "5", nombre: "Región de Coquimbo" },
    { numero: "6", nombre: "Región de Valparaíso" },
    { numero: "7", nombre: "Región Metropolitana de Santiago" },
    { numero: "8", nombre: "Región del Libertador General Bernardo O’Higgins" },
    { numero: "9", nombre: "Región del Maule" },
    { numero: "10", nombre: "Región de Ñuble" },
    { numero: "11", nombre: "Región del Biobío" },
    { numero: "12", nombre: "Región de La Araucanía" },
    { numero: "13", nombre: "Región de Los Ríos" },
    { numero: "14", nombre: "Región de Los Lagos" },
    { numero: "15", nombre: "Región de Aysén del General Carlos Ibáñez del Campo" },
    { numero: "16", nombre: "Región de Magallanes y de la Antártica Chilena" }
  ];

  const categorias = [
    { id: "1", nombre: "Informática / Tecnología" },
    { id: "2", nombre: "Administración / Oficina" },
    { id: "3", nombre: "Operaciones / Logística" },
    { id: "4", nombre: "Finanzas / Contabilidad" },
    { id: "5", nombre: "Gerencia / Dirección" },
    { id: "6", nombre: "Salud / Medicina" },
    { id: "7", nombre: "Recursos Humanos" },
    { id: "8", nombre: "Ventas / Comercial" },
    { id: "9", nombre: "Atención al Cliente" },
    { id: "10", nombre: "Educación / Docencia" },
    { id: "11", nombre: "Construcción" },
    { id: "12", nombre: "Electricidad / Electrónica" },
    { id: "13", nombre: "Mecánica / Automotriz" },
    { id: "14", nombre: "Transporte / Choferes" },
    { id: "15", nombre: "Gastronomía / Cocina" },
    { id: "16", nombre: "Panadería / Pastelería" },
    { id: "17", nombre: "Aseo / Limpieza" },
    { id: "18", nombre: "Seguridad / Guardia" },
    { id: "19", nombre: "Agricultura / Ganadería" },
    { id: "20", nombre: "Minería" },
    { id: "21", nombre: "Turismo / Hotelería" },
    { id: "22", nombre: "Periodismo / Comunicación" },
    { id: "23", nombre: "Diseño / Creatividad" },
    { id: "24", nombre: "Legal / Jurídico" },
    { id: "25", nombre: "Manufactura / Producción" },
    { id: "26", nombre: "Servicios Generales" },
    { id: "27", nombre: "Cuidado de Personas / Niñera" },
    { id: "28", nombre: "Veterinaria / Mascotas" },
    { id: "29", nombre: "Soldadura / Metalurgia" },
    { id: "30", nombre: "Gasfitería / Plomería" }
  ];
  const form = document.getElementById('form-busqueda');
  const listaBusquedas = document.getElementById('lista-busquedas');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const keyword = document.getElementById('input-keyword').value.trim();
    const region = document.getElementById('region-select').value.trim();
    const categoria = document.getElementById('categoria-select').value.trim();

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
      const regionNombre = regiones.find(r => r.numero === b.region)?.nombre || 'Todas';
      const categoriaNombre = categorias.find(c => c.id === b.categoria)?.nombre || 'Todas';
      const keywordTexto = b.keyword || '🔎';
  
      const li = document.createElement('li');
      li.classList.add('mb-1', 'text-primary');
      li.style.cursor = 'pointer';
      li.textContent = `${keywordTexto} · ${regionNombre} · ${categoriaNombre}`;
  
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

    form.requestSubmit(); // ejecuta automáticamente la búsqueda
  }

  document.addEventListener('DOMContentLoaded', () => {
    mostrarBusquedas();
    precargarUltimaBusqueda();
  });