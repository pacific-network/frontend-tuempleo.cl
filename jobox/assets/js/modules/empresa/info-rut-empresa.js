
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
    let rut = document.getElementById('rutInput').value.trim().toUpperCase().replace(/\./g, '');

    if (!rut) {
      alert("Por favor, ingrese un RUT.");
      return;
    }

    if (!validarRut(rut)) {
      alert("RUT inválido. Verifique el dígito verificador.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL_API}/sii/situacion-tributaria/${rut}`);

      if (!response.ok) throw new Error("No se pudo obtener la información del RUT.");

      const data = await response.json();

      document.querySelector('input[placeholder="Ingrese la Razón Social"]').value = data.razon_social || '';
      document.getElementById('nombre_empresa').value = data.razon_social || '';

      document.querySelector('input[placeholder="Ingrese Correo"]').value = '';

      const actividad = data.actividades?.[0]; // ✅ Tomamos la primera actividad
if (actividad) {
  const categoriaTexto = actividad.categoria === 1
    ? 'Primera Categoría'
    : actividad.categoria === 2
    ? 'Segunda Categoría'
    : `Categoría ${actividad.categoria}`;

  document.getElementById('categoria').value = categoriaTexto;
}

    
document.getElementById('actividad_empresa').value = data.actividades?.[0]?.glosa || '';

document.getElementById('anio_inicio_actividades').value = data.fecha_inicio_actividades ? new Date(data.fecha_inicio_actividades).getFullYear() : '';



      const domicilio = data.domicilios?.[0];
      if (domicilio) {
        document.querySelector('input[placeholder="Ingrese dirección"]').value = domicilio.direccion || '';
        document.querySelector('#comuna').innerHTML = `<option selected>${domicilio.comuna || 'Sin datos'}</option>`;
        document.querySelector('#region').innerHTML = `<option selected>${domicilio.ciudad || 'Sin datos'}</option>`;
      } else {
        document.querySelector('input[placeholder="Ingrese dirección"]').value = '';
        document.querySelector('#comuna').innerHTML = `<option selected>Sin datos</option>`;
        document.querySelector('#region').innerHTML = `<option selected>Sin datos</option>`;
      }

      if (data.fecha_inicio_actividades) {
        const year = new Date(data.fecha_inicio_actividades).getFullYear();
        document.querySelector('input[placeholder="Ingrese Año"]').value = data.fecha_inicio_actividades ? year : '';
      }

      if (data.actividades?.length > 0) {
        const giro = data.actividades[0].glosa || 'Sin datos';
        const actividadSelect = document.getElementById('actividad_empresa_select');
        actividadSelect.innerHTML = `<option selected>${giro}</option>`;
      }

      const existingError = document.getElementById('rutError');
      if (existingError) existingError.remove();

    } catch (error) {
      console.error(error);

      const rutInputContainer = document.getElementById('rutInput').parentElement;

      const existingError = document.getElementById('rutError');
      if (existingError) existingError.remove();



      rutInputContainer.appendChild(errorElement);
    }
  });
