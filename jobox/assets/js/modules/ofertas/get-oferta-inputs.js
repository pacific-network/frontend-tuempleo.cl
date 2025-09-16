document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const ofertaId = params.get('id');
  if (!ofertaId) {
    console.error('ID de oferta no encontrado en la URL');
    return;
  }

  // Helper: selecciona valor; si la opción no existe, la crea y la selecciona
  function selectOptionByValue(selectEl, value, placeholderText) {
    if (!selectEl) return;
    const val = value == null ? '' : String(value);

    // Si aún no hay opciones (o solo el placeholder) y conocemos un catálogo global, lo re-llenamos
    if (selectEl.id === 'region-select' && window.regionesDeChile && selectEl.options.length <= 1) {
      const placeholder = placeholderText || '-- Seleccione una región --';
      selectEl.innerHTML = `<option value="">${placeholder}</option>`;
      window.regionesDeChile.forEach(r => {
        const opt = document.createElement('option');
        opt.value = String(r.numero);
        opt.textContent = r.nombre;
        selectEl.appendChild(opt);
      });
    }

    // Intentar marcar la opción
    selectEl.value = val;

    // Si no existe en la lista, la añadimos temporalmente para que quede seleccionada
    if (selectEl.value !== val && val !== '') {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val; // texto de respaldo por si no hay catálogo
      opt.selected = true;
      selectEl.appendChild(opt);
      selectEl.value = val;
    }
  }

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener los datos');

    const oferta = await res.json();

    // Sidebar empresa
    document.getElementById('empresa-nombre').textContent =
      oferta.empresa?.nombre_fantasia || 'Sin nombre';
    document.getElementById('empresa-rubro').textContent =
      (oferta.empresa?.data?.actividades_economicas?.[0]) || 'Sin rubro';
    document.getElementById('empresa-logo').src =
      oferta.empresa?.logo_url || 'assets/img/job/default-logo.png';

    // Título
    document.getElementById('titulo-trabajo').value = oferta.titulo || '';

    // Parsear data (puede venir como string)
    const data = typeof oferta.data === 'string' ? JSON.parse(oferta.data) : oferta.data || {};

    // Área de trabajo (si usas js/form-register/area_cargo.js, también puedes setear data-attribute)
    const areaEl = document.getElementById('area_cargo_select');
    if (areaEl) {
      // Si ya están las opciones, marcamos; si el script externo rellena luego, igual persistirá
      selectOptionByValue(areaEl, data.area_trabajo || '', '-- Seleccione Área --');
    }

    // Años experiencia
    document.getElementById('anios-experiencia').value = data.anios_experiencia || '';

    // Región (usa js/form-register/regiones.js si está cargado)
    const regionEl = document.getElementById('region-select');
    if (regionEl) {
      // Guardamos también en data-attribute por si tu script de regiones lo usa
      if (data.region) regionEl.setAttribute('data-region-seleccionada', String(data.region));
      selectOptionByValue(regionEl, data.region || '', '-- Seleccione una región --');
    }

    // Educación requerida (opciones están en el HTML)
    const eduEl = document.getElementById('educacion-requerida');
    if (eduEl) {
      selectOptionByValue(eduEl, data.educacion_requerida || '', '-- Selecciona Educación --');
    }

    // Tipo contrato
    selectOptionByValue(document.getElementById('tipo-contrato'), data.tipo_contrato || '', '-- Seleccione tipo Contrato --');

    // Modalidad
    selectOptionByValue(document.getElementById('modalidad'), data.modalidad || '', '-- Seleccione Modalidad --');

    // Descripción
    document.getElementById('descripcion').value = data.descripcion_puesto || '';

    // Textareas multilinea
    document.getElementById('responsabilidades').value = (data.responsabilidades || []).join('\n');
    document.getElementById('requisitos').value        = (data.requisitos_minimos || []).join('\n');
    document.getElementById('beneficios').value        = (data.beneficios || []).join('\n');

    // Renta salarial
    if (data.renta_salarial) {
      document.getElementById('salaryFrom').value = data.renta_salarial.desde || '';
      document.getElementById('salaryTo').value   = data.renta_salarial.hasta || '';
    }

    // Herramientas básicas (checkboxes)
    const cont = document.getElementById('checkbox-container');
    cont.innerHTML = '';
    if (Array.isArray(data.herramientas_basicas) && data.herramientas_basicas.length) {
      data.herramientas_basicas.forEach((herr) => {
        const id = `herr_${herr.replace(/\s+/g, '_').toLowerCase()}`;
        const div = document.createElement('div');
        div.classList.add('form-check');
        div.innerHTML = `
          <input class="form-check-input" type="checkbox" id="${id}" checked>
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
