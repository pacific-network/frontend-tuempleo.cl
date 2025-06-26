function cargarRegionesYComunas(idRegion, idComuna) {
  const dataUrl = 'https://gist.githubusercontent.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd/raw/';
  const regionSelect = document.getElementById(idRegion);
  const comunaSelect = document.getElementById(idComuna);

  if (!regionSelect || !comunaSelect) return;

  fetch(dataUrl)
    .then(res => res.json())
    .then(data => {
      regionSelect.innerHTML = '<option value="">Seleccione una región</option>';
      comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaSelect.disabled = true;

      data.regiones.forEach(region => {
        const option = document.createElement('option');
        option.value = region.region;
        option.textContent = region.region;
        regionSelect.appendChild(option);
      });

      regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        const regionData = data.regiones.find(r => r.region === selectedRegion);

        comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunaSelect.disabled = true;

        if (regionData && regionData.comunas && regionData.comunas.length) {
          regionData.comunas.forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            comunaSelect.appendChild(option);
          });
          comunaSelect.disabled = false;
        }
      });
    })
    .catch(e => console.error('Error cargando regiones/comunas:', e));
}

// Ejecutar al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
  cargarRegionesYComunas('region_empresa', 'comuna_empresa');
  cargarRegionesYComunas('region_empleador', 'comuna_empleador');
});
;




