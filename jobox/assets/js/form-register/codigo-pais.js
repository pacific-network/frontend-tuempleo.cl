async function cargarCodigosDePais() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2,region');
    const data = await response.json();

    const select = document.getElementById('codigo_pais');
    select.innerHTML = ''; // limpiar "Cargando..."

    // Filtrar solo América y que tengan prefijo telefónico
    const paises = data
      .filter(p => p.region === 'Americas' && p.idd && p.idd.root)
      .flatMap(p => {
        const root = p.idd.root || '';
        const suffixes = p.idd.suffixes || [''];
        return suffixes.map(suffix => ({
          nombre: p.name.common,
          codigo: root + suffix,
          bandera: p.flag,
          iso2: p.cca2
        }));
      });

    paises.sort((a, b) => a.nombre.localeCompare(b.nombre));

    for (const pais of paises) {
      const option = document.createElement('option');
      option.value = pais.codigo;
      option.textContent = `${pais.bandera} ${pais.codigo} (${pais.nombre})`;

      if (pais.nombre === 'Chile') {
        option.selected = true;
      }

      select.appendChild(option);
    }

  } catch (error) {
    console.error('Error al cargar países:', error);
    const select = document.getElementById('codigo_pais');
    select.innerHTML = '<option disabled>Error al cargar países</option>';
  }
}

document.addEventListener('DOMContentLoaded', cargarCodigosDePais);
