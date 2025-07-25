let empleadorData = null; // Se guarda globalmente para uso en crearOferta()

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (e) {
    console.error('Error al decodificar el token:', e);
    return null;
  }
}

function mostrarError(inputElement, mensaje) {
  let errorElement = inputElement.parentElement.querySelector('.error-msg');
  if (!errorElement) {
    errorElement = document.createElement('small');
    errorElement.className = 'text-danger error-msg';
    inputElement.parentElement.appendChild(errorElement);
  }
  errorElement.textContent = mensaje;
}

function limpiarErrores() {
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
}

function validarFormulario(data) {
  let valido = true;

  if (!data.titulo) {
    mostrarError(document.querySelector('input[placeholder="Ingrese el título del trabajo"]'), 'El título es obligatorio');
    valido = false;
  }
  if (!data.area_trabajo) {
    mostrarError(document.querySelector('#area_cargo_select'), 'Seleccione un área de trabajo');
    valido = false;
  }
  if (!data.anios_experiencia) {
    mostrarError(document.querySelector('input[placeholder="Ingresa Exp..."]'), 'Ingrese los años de experiencia');
    valido = false;
  }
  if (!data.region) {
    mostrarError(document.querySelector('#region-select'), 'Seleccione una región');
    valido = false;
  }
  if (!data.educacion_requerida) {
    mostrarError(document.querySelectorAll('select')[2], 'Seleccione nivel educativo');
    valido = false;
  }
  if (!data.tipo_contrato) {
    mostrarError(document.querySelectorAll('select')[3], 'Seleccione tipo de contrato');
    valido = false;
  }
  if (!data.modalidad) {
    mostrarError(document.querySelectorAll('select')[4], 'Seleccione modalidad');
    valido = false;
  }
  if (!data.descripcion_puesto) {
    mostrarError(document.querySelector('#descripcion'), 'Ingrese la descripción del puesto');
    valido = false;
  }
  if (data.responsabilidades.length === 0) {
    mostrarError(document.querySelector('#responsabilidades'), 'Ingrese al menos una responsabilidad');
    valido = false;
  }
  if (data.requisitos_minimos.length === 0) {
    mostrarError(document.querySelector('#requisitos'), 'Ingrese al menos un requisito');
    valido = false;
  }
  if (data.beneficios.length === 0) {
    mostrarError(document.querySelector('#beneficios'), 'Ingrese al menos un beneficio');
    valido = false;
  }
  if (!data.renta_salarial.desde || !data.renta_salarial.hasta) {
    mostrarError(document.querySelector('#salaryFrom'), 'Indique la renta mínima');
    mostrarError(document.querySelector('#salaryTo'), 'Indique la renta máxima');
    valido = false;
  }
  if (data.herramientas_basicas.length === 0) {
    mostrarError(document.querySelector('#checkbox-container'), 'Seleccione o escriba al menos una herramienta');
    valido = false;
  }

  return valido;
}

async function crearOferta() {
  limpiarErrores();

  if (!empleadorData) {
    alert('No se pudo cargar la información del empleador. Intenta recargar la página.');
    return;
  }

  const { empleador_id, empresa_id } = empleadorData;

  const fechaHoy = new Date().toISOString().split('T')[0];
  const fechaCierre = new Date();
  fechaCierre.setDate(fechaCierre.getDate() + 30);

  const titulo = document.querySelector('input[placeholder="Ingrese el título del trabajo"]').value.trim();
  const areaTrabajo = document.querySelector('#area_cargo_select').value;
  const aniosExperiencia = document.querySelector('input[placeholder="Ingresa Exp..."]').value.trim();
  const region = document.querySelector('#region-select').value;
  const educacion = document.querySelectorAll('select')[2].value;
  const tipoContrato = document.querySelectorAll('select')[3].value;
  const modalidad = document.querySelectorAll('select')[4].value;
  const descripcion = document.querySelector('#descripcion').value.trim();
  const responsabilidades = document.querySelector('#responsabilidades').value.split('\n').filter(Boolean);
  const requisitos = document.querySelector('#requisitos').value.split('\n').filter(Boolean);
  const beneficios = document.querySelector('#beneficios').value.split('\n').filter(Boolean);
  const rentaDesde = document.querySelector('#salaryFrom').value.trim();
  const rentaHasta = document.querySelector('#salaryTo').value.trim();

  // ✅ Obtener herramientas
  const herramientasSeleccionadas = Array.from(
    document.querySelectorAll('#checkbox-container input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const herramientasPersonalizadas = document
    .getElementById('otras_herramientas')
    ?.value
    .split(',')
    .map(str => str.trim())
    .filter(Boolean) || [];

  const herramientas = [...herramientasSeleccionadas, ...herramientasPersonalizadas];

  // ✅ Obtener preguntas personalizadas
  const preguntasInputs = document.querySelectorAll('#preguntas-container input[name^="pregunta_"]');
  const preguntas_personalizadas = Array.from(preguntasInputs)
    .map(input => input.value.trim())
    .filter(p => p.length > 0);

  const data = {
    titulo,
    area_trabajo: areaTrabajo,
    anios_experiencia: aniosExperiencia,
    region,
    educacion_requerida: educacion,
    tipo_contrato: tipoContrato,
    modalidad,
    descripcion_puesto: descripcion,
    responsabilidades,
    requisitos_minimos: requisitos,
    beneficios,
    renta_salarial: {
      desde: rentaDesde,
      hasta: rentaHasta,
      de_acuerdo_al_mercado: true
    },
    herramientas_basicas: herramientas,
    preguntas_personalizadas // ✅ se incluye en el objeto final
  };

  // Validación del formulario
  if (!validarFormulario(data)) return;

  const payload = {
    titulo,
    empresa_id,
    empleador_id,
    fecha_publicacion: fechaHoy,
    duracion_publicacion: 30,
    fecha_cierre: fechaCierre.toISOString().split('T')[0],
    es_activa: true,
    data: JSON.stringify(data)
  };

  try {
    const response = await fetch(`${BASE_URL_API}/ofertas`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Oferta publicada con éxito');
      window.location.href = 'employer-manage-job.html';
    } else {
      const err = await response.json();
      console.error(err);
      alert('Error al publicar la oferta');
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    alert('Error al conectar con el servidor');
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formulario-publicar');
  if (!form) {
    console.error('Formulario no encontrado');
    return;
  }

  const userId = getUserIdFromToken();
  if (!userId) {
    alert('Token inválido o expirado');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`);
    if (!res.ok) throw new Error('No se pudo obtener info del empleador');
    empleadorData = await res.json();
    console.log('Info empleador cargada:', empleadorData);
  } catch (e) {
    console.error('Error cargando info de empleador:', e);
    alert('No se pudo cargar la información del empleador');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    crearOferta();
  });
});
