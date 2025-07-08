// ✅ Función para validar formato y dígito verificador del RUT
function validarRut(rut) {
  rut = rut.replace(/\./g, '').replace('-', '');
  if (rut.length < 8) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}

document.getElementById('consultarRutBtn').addEventListener('click', async () => {
  const rutInput = document.getElementById('rutInput');
  let rut = rutInput.value.trim().toUpperCase().replace(/\./g, '');

  if (!rut) return alert("Por favor, ingrese un RUT.");
  if (!validarRut(rut)) return alert("RUT inválido. Verifique el dígito verificador.");

  // Mostrar toast de carga
  document.getElementById('rut-loading-toast')?.classList.remove('d-none');
  document.getElementById('rut-overlay')?.classList.remove('d-none');

  try {
    const response = await fetch(`${BASE_URL_API}/sii/situacion-tributaria/${rut}`);
    if (!response.ok) throw new Error("No se pudo obtener la información del RUT.");

    const data = await response.json();

    // Asignar datos básicos
    document.getElementById('razon_social').value = data.razon_social || '';
    document.getElementById('nombre_empresa').value = data.razon_social || '';
    document.getElementById('correo_empresa').value = '';

    // Actividad económica
    const actividad = data.actividades?.[0];
    if (actividad) {
      const categoriaTexto = actividad.categoria === 1
        ? 'Primera Categoría'
        : actividad.categoria === 2
        ? 'Segunda Categoría'
        : `Categoría ${actividad.categoria}`;
      document.getElementById('categoria').value = categoriaTexto;
      document.getElementById('actividad_empresa').value = actividad.glosa || '';
    }

    // Año inicio de actividades
    document.getElementById('anio_inicio_actividades').value = data.fecha_inicio_actividades
      ? new Date(data.fecha_inicio_actividades).getFullYear()
      : '';

    // Domicilio: región, comuna, dirección
    const domicilio = data.domicilios?.[0];
    if (domicilio) {
      document.getElementById('direccion').value = domicilio.direccion || '';

      const regionSelect = document.getElementById('region_empresa');
      const comunaSelect = document.getElementById('comuna_empresa');

      // Espera a que las regiones estén cargadas
      setTimeout(() => {
        if (domicilio.ciudad) {
          regionSelect.value = domicilio.ciudad;

          // Dispara el evento 'change' para cargar comunas
          regionSelect.dispatchEvent(new Event('change'));

          // Espera breve para que se carguen las comunas antes de asignarla
          setTimeout(() => {
            if (domicilio.comuna) {
              comunaSelect.value = domicilio.comuna;
            }
          }, 300);
        }
      }, 300);
    } else {
      document.getElementById('direccion').value = '';
    }

    // Actividad secundaria (opcional)
    const actividadSelect = document.getElementById('actividad_empresa_select');
    if (data.actividades?.length > 0 && actividadSelect) {
      const giro = data.actividades[0].glosa || 'Sin datos';
      actividadSelect.innerHTML = `<option selected>${giro}</option>`;
    }

    // Limpia errores previos si existían
    document.getElementById('rutError')?.remove();

  } catch (error) {
    console.error(error);

    // Mostrar error debajo del input si no existía antes
    const rutInputContainer = document.getElementById('rutInput').parentElement;
    if (!document.getElementById('rutError')) {
      const errorElement = document.createElement('div');
      errorElement.id = 'rutError';
      errorElement.className = 'text-danger mt-1';
      errorElement.innerText = 'Error al consultar RUT.';
      rutInputContainer.appendChild(errorElement);
    }
  } finally {
    // Ocultar toast de carga
    setTimeout(() => {
      document.getElementById('rut-loading-toast')?.classList.add('d-none');
      document.getElementById('rut-overlay')?.classList.add('d-none');
    }, 1500);
  }
});
