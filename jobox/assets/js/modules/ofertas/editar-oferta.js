document.getElementById('confirmarBtn').addEventListener('click', async () => {
  const params = new URLSearchParams(window.location.search);
  const ofertaId = params.get('id');
  
  if (!ofertaId) {
    Swal.fire({
      icon: 'warning',
      title: 'ID no encontrado',
      text: 'ID de oferta no encontrado en la URL.'
    });
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Sesión requerida',
      text: 'No se encontró token de autenticación.'
    });
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
    .split('\n').map(line => line.trim()).filter(line => line !== '');

  const requisitos_minimos = document.getElementById('requisitos').value
    .split('\n').map(line => line.trim()).filter(line => line !== '');

  const beneficios = document.getElementById('beneficios').value
    .split('\n').map(line => line.trim()).filter(line => line !== '');

  // Renta salarial limpiando números
  const renta_salarial = {
    desde: document.getElementById('salaryFrom').value.replace(/[^\d]/g, ''),
    hasta: document.getElementById('salaryTo').value.replace(/[^\d]/g, ''),
    de_acuerdo_al_mercado: true
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

  // Mostrar loading mientras se actualiza
  Swal.fire({
    title: 'Actualizando oferta…',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => { Swal.showLoading(); }
  });

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
      let msg = await res.text();
      try {
        const asJson = JSON.parse(msg);
        if (asJson?.message) msg = asJson.message;
      } catch {}
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: msg || `HTTP ${res.status}`
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Oferta actualizada correctamente',
      showConfirmButton: false,
      timer: 1300,
      timerProgressBar: true
    }).then(() => {
      // redirección opcional
      location.href = 'employer-manage-job.html';
    });

  } catch (err) {
    console.error('Error al actualizar oferta:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: err?.message || 'Ocurrió un error al actualizar.'
    });
  }
});
