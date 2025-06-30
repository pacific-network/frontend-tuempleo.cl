document.getElementById('confirmarBtn').addEventListener('click', async () => {
  const params = new URLSearchParams(window.location.search);
  const ofertaId = params.get('id');
  
  if (!ofertaId) {
    alert('ID de oferta no encontrado en la URL.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No se encontró token de autenticación.');
    return;
  }

  // Obtener valores del formulario con selectores más específicos
  const titulo = document.getElementById('titulo-trabajo').value.trim();

  const area_trabajo = document.getElementById('area_cargo_select').value;
  const anios_experiencia = document.querySelector('input[placeholder="3"]').value.trim();
  const region = document.getElementById('region-select').value;
  
  // Para selects con opciones, tomar el valor del select en sí, no solo la opción seleccionada
  const educacion_requerida = document.querySelector('select[aria-label="Educación Requerida"]')?.value
    || document.querySelector('select').value; // fallback si no tiene aria-label

  const tipo_contrato = document.querySelector('select[aria-label="Tipo de Contratación"]')?.value
    || document.querySelectorAll('select')[1].value;

  const modalidad = document.querySelector('select[aria-label="Modalidad"]')?.value
    || document.querySelectorAll('select')[2].value;

  const descripcion_puesto = document.getElementById('descripcion').value.trim();

  const responsabilidades = document.getElementById('responsabilidades').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const requisitos_minimos = document.getElementById('requisitos').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const beneficios = document.getElementById('beneficios').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const renta_salarial = {
    desde: document.getElementById('salaryFrom').value.replace(/[^\d]/g, ''),
    hasta: document.getElementById('salaryTo').value.replace(/[^\d]/g, ''),
    de_acuerdo_al_mercado: true // puedes agregar lógica si quieres obtenerlo del formulario
  };

  const payload = {
    titulo,
    area_trabajo,
    anios_experiencia,
    region,
    educacion_requerida,
    tipo_contrato,
    modalidad,
    descripcion_puesto,
    responsabilidades,
    requisitos_minimos,
    beneficios,
    renta_salarial
  };

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      alert(`Error al actualizar: ${err}`);
      return;
    }

    alert('Oferta actualizada correctamente');
    location.href = 'employer-manage-job.html'; // redirección opcional

  } catch (err) {
    console.error('Error al actualizar oferta:', err);
    alert('Error inesperado al actualizar');
  }
});
