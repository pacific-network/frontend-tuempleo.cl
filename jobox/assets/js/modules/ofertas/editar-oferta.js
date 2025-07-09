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

  // Obtener valores del formulario
  const titulo = document.getElementById('titulo-trabajo').value.trim();
  const area_trabajo = document.getElementById('area_cargo_select').value;
  const anios_experiencia = document.getElementById('anios-experiencia').value.trim();
  const region = document.getElementById('region-select').value;
  const educacion_requerida = document.getElementById('educacion-requerida').value;
  const tipo_contrato = document.getElementById('tipo-contrato').value;
  const modalidad = document.getElementById('modalidad').value;
  const descripcion_puesto = document.getElementById('descripcion').value.trim();

  // Textareas multilinea a array
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

  // Renta salarial limpiando números
  const renta_salarial = {
    desde: document.getElementById('salaryFrom').value.replace(/[^\d]/g, ''),
    hasta: document.getElementById('salaryTo').value.replace(/[^\d]/g, ''),
    de_acuerdo_al_mercado: true // si quieres agregar lógica para este campo, puedes
  };

  // Leer herramientas básicas seleccionadas (checkboxes)
  const checkboxes = document.querySelectorAll('#checkbox-container input[type="checkbox"]');
  const herramientas_basicas = [];
  checkboxes.forEach(chk => {
    if (chk.checked) {
      const label = document.querySelector(`label[for="${chk.id}"]`);
      if (label) herramientas_basicas.push(label.textContent.trim());
    }
  });

  // Construir objeto data para enviar en el body
  const data = {
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
    renta_salarial,
    herramientas_basicas
  };

  const payload = {
    titulo,
    data: JSON.stringify(data)
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
