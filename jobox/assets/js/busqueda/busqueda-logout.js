const formIndex = document.getElementById('form-busqueda-index');

  formIndex.addEventListener('submit', function (e) {
    e.preventDefault();

    const keyword = document.getElementById('keyword-index').value.trim();
    const region = document.getElementById('region-select').value.trim();
    const categoria = document.getElementById('categoria-index').value.trim();

    const busqueda = { keyword, region, categoria };
    guardarBusquedaDesdeIndex(busqueda);

    // Redirigir a job-list-2.html
    window.location.href = 'job-list-2.html';
  });

  function guardarBusquedaDesdeIndex(nueva) {
    let busquedas = JSON.parse(localStorage.getItem('busquedas_recientes')) || [];
    busquedas.unshift(nueva);

    // Evita duplicados exactos
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