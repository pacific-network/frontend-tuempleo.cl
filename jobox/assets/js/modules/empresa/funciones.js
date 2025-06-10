document.addEventListener('DOMContentLoaded', function() {
        const dataUrl = 'https://gist.githubusercontent.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd/raw/';
        const regionSelect = document.getElementById('region');
        const comunaSelect = document.getElementById('comuna');
      
        fetch(dataUrl)
          .then(response => response.json())
          .then(data => {
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
      
              if (regionData?.comunas?.length) {
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
          .catch(error => console.error('Error al cargar los datos:', error));
          
        async function cargarCodigosDePais(selectId) {
          try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,idd,region,cca2');
            const data = await response.json();
        
            const select = document.getElementById(selectId);
            select.innerHTML = ''; // limpiar "Cargando..."
        
            // Filtrar solo América y que tengan prefijo telefónico
            const paises = data
              .filter(p => p.region === 'Americas' && p.idd && p.idd.root)
              .map(p => {
                const root = p.idd.root || '';
                const suffixes = p.idd.suffixes || [''];
                return suffixes.map(suffix => ({
                  nombre: p.name.common,
                  codigo: root + suffix,
                  bandera: p.flag,
                  iso2: p.cca2
                }));
              })
              .flat();
          
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
            const select = document.getElementById(selectId);
            select.innerHTML = '<option disabled>Error al cargar países</option>';
          }
        }
    
        cargarCodigosDePais('codigo_pais');
        cargarCodigosDePais('codigo_pais_1');

document.addEventListener('DOMContentLoaded', function() {
    const consultarRutBtn = document.getElementById('consultarRutBtn');
    const rutInput = document.getElementById('rutInput');

    // Función para formatear RUT (12345678-9)
    function formatRut(rut) {
        rut = rut.replace(/\./g, '').replace(/-/g, '');
        if (rut.length > 1) {
            rut = rut.slice(0, -1) + '-' + rut.slice(-1).toUpperCase();
        }
        return rut;
    }

    // Función para validar RUT
    function validateRut(rut) {
        if (!rut || rut.trim().length < 3) return false;
        
        rut = rut.replace(/\./g, '').replace(/-/g, '');
        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1).toUpperCase();
        
        if (!cuerpo || !dv) return false;
        if (!/^[0-9]+$/.test(cuerpo)) return false;
        
        // Cálculo del dígito verificador
        let suma = 0;
        let multiplo = 2;
        
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }
        
        const dvEsperado = 11 - (suma % 11);
        const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
        
        return dvCalculado === dv;
    }

    // Función para consultar el RUT en la API
    async function consultarRut() {
        const rut = rutInput.value.trim();
        
        if (!rut) {
            alert('Por favor ingrese un RUT');
            return;
        }

        if (!validateRut(rut)) {
            alert('El RUT ingresado no es válido');
            return;
        }

        try {
            // Mostrar carga
            consultarRutBtn.disabled = true;
            consultarRutBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Consultando...';

            // Formatear RUT para la API (sin puntos ni guión)
            const rutApi = rut.replace(/\./g, '').replace(/-/g, '');
            
            // Hacer la petición a la API
            const response = await fetch(`https://rut.simpleapi.cl/v2/${rutApi}`);
            
            if (!response.ok) {
                throw new Error('Error al consultar el RUT');
            }
            
            const data = await response.json();
            
            // Llenar los campos del formulario con los datos obtenidos
            llenarFormulario(data);
            
        } catch (error) {
            console.error('Error al consultar RUT:', error);
            alert('Error al consultar el RUT. Por favor intente nuevamente.');
        } finally {
            // Restaurar botón
            consultarRutBtn.disabled = false;
            consultarRutBtn.textContent = 'Consultar';
        }
    }

    // Función para llenar el formulario con los datos
    function llenarFormulario(data) {
        // RUT ya está en el input
        
        // Razón Social
        document.querySelector('input[placeholder="Ingrese la Razón Social"]').value = data.razonSocial || '';
        
        // Nombre Empresa (usamos razón social por defecto)
        document.querySelector('input[name="nombre_empresa"]').value = data.razonSocial || '';
        
        // Categoría
        if (data.actividadesEconomicas && data.actividadesEconomicas.length > 0) {
            const categoria = data.actividadesEconomicas[0].categoria;
            const selectCategoria = document.querySelector('select[name="categoria"]');
            for (let i = 0; i < selectCategoria.options.length; i++) {
                if (selectCategoria.options[i].text.toLowerCase().includes(categoria.toLowerCase())) {
                    selectCategoria.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Correo Empresa
        document.querySelector('input[placeholder="Ingrese Correo"]').value = data.correoIntercambio || '';
        
        // Actividad Económica
        const actividadSelect = document.getElementById('actividad_empresa_select');
        actividadSelect.innerHTML = ''; // Limpiar opciones anteriores
        
        if (data.actividadesEconomicas && data.actividadesEconomicas.length > 0) {
            data.actividadesEconomicas.forEach(actividad => {
                const option = document.createElement('option');
                option.value = actividad.codigo;
                option.textContent = `${actividad.codigo} - ${actividad.descripcion}`;
                actividadSelect.appendChild(option);
            });
        }
        
        // Dirección y Comuna (tomamos el primer domicilio)
        if (data.domicilios && data.domicilios.length > 0) {
            const domicilio = data.domicilios[0];
            document.querySelector('input[placeholder="Ingrese dirección"]').value = domicilio.direccion || '';
            
            // Comuna (asumiendo que el select ya tiene las comunas cargadas)
            if (domicilio.comuna) {
                const comunaSelect = document.getElementById('comuna');
                for (let i = 0; i < comunaSelect.options.length; i++) {
                    if (comunaSelect.options[i].text.toLowerCase() === domicilio.comuna.toLowerCase()) {
                        comunaSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        
        // Año Inicio Actividades
        if (data.fechaInicioActividades) {
            const year = data.fechaInicioActividades.split('-')[2];
            document.querySelector('input[placeholder="Ingrese Año"]').value = year || '';
        }
    }

    // Eventos
    consultarRutBtn.addEventListener('click', consultarRut);
    
    rutInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            consultarRut();
        }
    });
    
    // Opcional: Formatear RUT mientras se escribe
    rutInput.addEventListener('input', function(e) {
        const cursorPosition = this.selectionStart;
        const originalLength = this.value.length;
        let rut = this.value.replace(/\./g, '').replace(/-/g, '');
        
        if (rut.length > 1) {
            rut = formatRut(rut);
        }
        
        this.value = rut;
        
        // Mantener posición del cursor
        const newLength = this.value.length;
        const lengthDiff = newLength - originalLength;
        this.setSelectionRange(cursorPosition + lengthDiff, cursorPosition + lengthDiff);
    });
});
});
