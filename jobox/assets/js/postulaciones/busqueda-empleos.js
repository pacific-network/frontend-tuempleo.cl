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
      const li = document.createElement('li');
      li.classList.add('mb-1', 'text-primary');
      li.style.cursor = 'pointer';
      li.textContent = `${b.keyword || '🔎'} · ${b.region || 'Todas'} · ${b.categoria || 'Todas'}`;
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