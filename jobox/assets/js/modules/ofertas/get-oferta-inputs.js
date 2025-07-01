document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const ofertaId = params.get('id');
  if (!ofertaId) {
    console.error('ID de oferta no encontrado en la URL');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
    if (!res.ok) throw new Error('Error al obtener los datos');

    const oferta = await res.json();

    // Mostrar datos de empresa en sidebar
    document.getElementById('empresa-nombre').textContent =
      oferta.empresa?.nombre_fantasia || 'Sin nombre';
    document.getElementById('empresa-rubro').textContent =
      (oferta.empresa?.data?.actividades_economicas?.[0]) || 'Sin rubro';
    if (oferta.empresa?.logo_url) {
      document.getElementById('empresa-logo').src = oferta.empresa.logo_url;
    } else {
      document.getElementById('empresa-logo').src = 'assets/img/job/default-logo.png'; // Imagen por defecto
    }

    // Parsear data que viene en JSON string
    const data = typeof oferta.data === 'string' ? JSON.parse(oferta.data) : oferta.data;

    // Rellenar inputs del formulario
    document.getElementById('titulo-trabajo').value = data.titulo || '';
    document.getElementById('area_cargo_select').value = data.area_trabajo || '';
    document.getElementById('anios-experiencia').value = data.anios_experiencia || '';
    document.getElementById('region-select').value = data.region || '';
    document.getElementById('educacion-requerida').value = data.educacion_requerida || '';
    document.getElementById('tipo-contrato').value = data.tipo_contrato || '';
    document.getElementById('modalidad').value = data.modalidad || '';
    document.getElementById('descripcion').value = data.descripcion_puesto || '';

    // Textareas multilinea, convertir array a texto con saltos de línea
    document.getElementById('responsabilidades').value = (data.responsabilidades || []).join('\n');
    document.getElementById('requisitos').value = (data.requisitos_minimos || []).join('\n');
    document.getElementById('beneficios').value = (data.beneficios || []).join('\n');

    // Renta salarial
    if (data.renta_salarial) {
      document.getElementById('salaryFrom').value = data.renta_salarial.desde || '';
      document.getElementById('salaryTo').value = data.renta_salarial.hasta || '';
    }

    // Herramientas básicas (checkboxes)
    const cont = document.getElementById('checkbox-container');
    cont.innerHTML = '';
    if (data.herramientas_basicas && data.herramientas_basicas.length) {
      data.herramientas_basicas.forEach((herr) => {
        const id = `herr_${herr.replace(/\s+/g, '_').toLowerCase()}`;
        const div = document.createElement('div');
        div.classList.add('form-check');
        div.innerHTML = `
          <input class="form-check-input" type="checkbox" id="${id}" checked disabled>
          <label class="form-check-label" for="${id}">${herr}</label>
        `;
        cont.appendChild(div);
      });
    } else {
      cont.textContent = 'No hay herramientas básicas registradas.';
    }
  } catch (error) {
    console.error('Error cargando la oferta:', error);
  }
});
