/* ------------------ Popup TuEmpleo (inyecta HTML + CSS si falta) ------------------ */
function ensurePopupContainer() {
  // Inyecta estilos una sola vez
  if (!document.getElementById('popupStylesTuEmpleo')) {
    const style = document.createElement('style');
    style.id = 'popupStylesTuEmpleo';
    style.textContent = `
      #estado-postulacion {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        background: #fff;
        border-left: 5px solid #28a745;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        z-index: 9999;
        display: none;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity .4s ease-in-out, transform .4s ease-in-out;
      }
      #estado-postulacion.show { display:flex; opacity:1; transform:translateY(0); }
      #estado-postulacion .alert-icon { font-size:24px; color:#28a745; }
      #estado-postulacion .alert-contnet { font-size:14px; }
      #estado-postulacion.error { border-left-color:#dc3545; }
      #estado-postulacion.error .alert-icon { color:#dc3545; }
    `;
    document.head.appendChild(style);
  }

  // Crea/reusa el contenedor
  let popup = document.getElementById('estado-postulacion');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'estado-postulacion';
    document.body.appendChild(popup);
  }

  // Normaliza estructura interna (icono + contenido)
  let iconWrap = popup.querySelector('.alert-icon');
  if (!iconWrap) {
    iconWrap = document.createElement('div');
    iconWrap.className = 'alert-icon';
    const i = document.createElement('i');
    i.className = 'fe-check-circle';
    iconWrap.appendChild(i);
    popup.appendChild(iconWrap);
  } else if (!iconWrap.querySelector('i')) {
    const i = document.createElement('i');
    i.className = 'fe-check-circle';
    iconWrap.appendChild(i);
  }

  // Acepta tanto .alert-contnet (typo) como .alert-content
  let content = popup.querySelector('.alert-contnet, .alert-content');
  if (!content) {
    content = document.createElement('div');
    content.className = 'alert-contnet';
    popup.appendChild(content);
  }
  if (!content.querySelector('strong') || !content.querySelector('span')) {
    content.innerHTML = `<strong></strong><br><span></span>`;
  }

  return popup;
}

let __popupHideTimer = null;
function mostrarPopup({ titulo, texto }, tipo = 'success', duracion = 4000) {
  const popup = ensurePopupContainer();

  // Limpia ocultadores de Bootstrap si existieran
  popup.classList.remove('d-none', 'invisible', 'visually-hidden', 'opacity-0');
  if (!popup.classList.contains('d-flex')) popup.classList.add('d-flex');

  const icon = popup.querySelector('.alert-icon i');
  const content = popup.querySelector('.alert-contnet, .alert-content');
  const strong = content.querySelector('strong');
  const span = content.querySelector('span');

  // Tipo e ícono
  popup.classList.remove('error');
  if (tipo === 'error') {
    popup.classList.add('error');
    icon.className = 'fe-alert-triangle';
  } else {
    icon.className = 'fe-check-circle';
  }

  // Texto
  strong.textContent = titulo || '';
  span.textContent = texto || '';

  // Mostrar
  popup.style.zIndex = '9999';
  popup.style.display = 'flex';
  void popup.offsetWidth; // reflow
  popup.classList.add('show');

  // Autocierre
  if (__popupHideTimer) clearTimeout(__popupHideTimer);
  __popupHideTimer = setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => { popup.style.display = 'none'; }, 400);
  }, duracion);
}
/* ------------------ /Popup TuEmpleo ------------------ */


/* ------------------ Helpers para el botón Postular ------------------ */
function setBtnPostulado(btn) {
  btn.innerHTML = `<span class="fe-check-circle"></span> Ya estás postulado`;
  // Conserva el estilo del tema
  btn.classList.add('theme-btn', 'btn-secondary', 'disabled');
  btn.classList.remove('btn-primary');
  btn.href = '#';
  btn.setAttribute('aria-disabled', 'true');
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.65';
  btn.style.cursor = 'not-allowed';
}

function setBtnPostular(btn) {
  btn.innerHTML = `<span class="fe-briefcase"></span> Postular`;
  btn.classList.add('theme-btn', 'btn-primary');
  btn.classList.remove('btn-secondary', 'disabled');
  btn.removeAttribute('aria-disabled');
  btn.style.pointerEvents = 'auto';
  btn.style.opacity = '1';
  btn.style.cursor = 'pointer';
}
/* ------------------ /Helpers botón ------------------ */


document.addEventListener('DOMContentLoaded', async () => {
  const idOferta = getIdOfertaFromURL();
  if (!idOferta) {
    mostrarPopup({ titulo: 'No se encontró la oferta', texto: 'Verifica el enlace o vuelve atrás.' }, 'error');
    return;
  }

  try {
    // Obtener oferta
    const response = await fetch(`${BASE_URL_API}/ofertas/${idOferta}`);
    const oferta = await response.json();
    const data = JSON.parse(oferta.data);
    const preguntas = data.preguntas_personalizadas;

    // Renderizar preguntas personalizadas
    if (Array.isArray(preguntas) && preguntas.length > 0) {
      const form = document.getElementById('formulario-preguntas');
      preguntas.forEach(pregunta => {
        const div = document.createElement('div');
        div.classList.add('mb-3');
        div.innerHTML = `
          <label class="form-label fw-semibold">${pregunta}</label>
          <input type="text" class="form-control pregunta-input" data-pregunta="${pregunta}" placeholder="Escribe tu respuesta aquí" required>
        `;
        form.appendChild(div);
      });
      document.body.dataset.tienePreguntas = '1';
    }

    // Datos oferta en DOM
    document.title = `${oferta.titulo} - ${oferta.empresa.nombre_fantasia}`;
    document.querySelector('h4.mb-4').textContent = oferta.titulo || '';

    const infoEmpresa = document.querySelector('.job-single-employer-info');
    if (infoEmpresa) {
      const nombreEl = infoEmpresa.querySelector('h5 a');
      const giroEl = infoEmpresa.querySelector('p');
      if (nombreEl) nombreEl.textContent = oferta.empresa?.nombre_fantasia || '';
      if (giroEl) {
        const act = oferta.empresa?.data?.actividades_economicas?.[0];
        if (act && act.trim() !== '') giroEl.textContent = act;
        else giroEl.remove();
      }
    }

    // Fechas
    if (oferta.fecha_publicacion)
      document.querySelector('.fecha-publicacion').textContent = formatFecha(oferta.fecha_publicacion);
    else
      document.querySelector('.fecha-publicacion').closest('li')?.remove();

    if (oferta.fecha_cierre)
      document.querySelector('.fecha-cierre').textContent = formatFecha(oferta.fecha_cierre);
    else
      document.querySelector('.fecha-cierre').closest('li')?.remove();

    // Área
    if (data.area_trabajo && data.area_trabajo.trim() !== '')
      document.querySelector('.area-trabajo').textContent = data.area_trabajo;
    else
      document.querySelector('.area-trabajo').closest('li')?.remove();

    // Experiencia
    if (data.anios_experiencia)
      document.querySelector('.experiencia').textContent = `${data.anios_experiencia} años`;
    else
      document.querySelector('.experiencia').closest('li')?.remove();

    // Ubicación
    if (oferta.empleador?.data?.region && oferta.empleador.data.region.trim() !== '')
      document.querySelector('.ubicacion').textContent = oferta.empleador.data.region;
    else
      document.querySelector('.ubicacion').closest('li')?.remove();

    // Educación
    if (data.educacion_requerida)
      document.querySelector('.educacion').textContent = formatEducacion(data.educacion_requerida);
    else
      document.querySelector('.educacion').closest('li')?.remove();

    // Tipo de contrato
    if (data.tipo_contrato)
      document.querySelector('.tipo-contrato').textContent = formatTextoBonito(data.tipo_contrato);
    else
      document.querySelector('.tipo-contrato').closest('li')?.remove();

    // Modalidad
    if (data.modalidad)
      document.querySelector('.modalidad').textContent = formatModalidad(data.modalidad);
    else
      document.querySelector('.modalidad').closest('li')?.remove();

    // Renta
    if (data.renta_salarial?.desde && data.renta_salarial?.hasta) {
      document.querySelector('.renta').textContent =
        `$${formatNum(data.renta_salarial.desde)} - $${formatNum(data.renta_salarial.hasta)}`;
    } else if (data.renta_salarial?.desde || data.renta_salarial?.hasta) {
      const soloUno = data.renta_salarial.desde
        ? `$${formatNum(data.renta_salarial.desde)}`
        : `$${formatNum(data.renta_salarial.hasta)}`;
      document.querySelector('.renta').textContent = soloUno;
    } else {
      document.querySelector('.renta').closest('li')?.remove();
    }

    // Descripción
    if (data.descripcion_puesto && data.descripcion_puesto.trim() !== '')
      document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto;
    else
      document.querySelector('.descripcion-puesto').closest('section, div, li')?.remove();

    // Listas (solo si tienen contenido real)
    renderLista(data.responsabilidades?.filter(t => !!t?.trim()), '.responsabilidades-list');
    renderLista(data.requisitos_minimos?.filter(t => !!t?.trim()), '.requisitos-list');
    renderLista(data.beneficios?.filter(t => !!t?.trim()), '.beneficios-list');
    renderLista(data.herramientas_basicas?.filter(t => !!t?.trim()), '.herramientas-list');
    renderLista(data.preguntas_personalizadas?.filter(t => !!t?.trim()), '.preguntas-list');
    
    // Token/usuario
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const usuarioId = decoded.sub;

    // Postulaciones del usuario
    try {
      const postulacionesRes = await fetch(`${BASE_URL_API}/postulaciones/postulante`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!postulacionesRes.ok) throw new Error('Error al obtener postulaciones');
      const postulaciones = await postulacionesRes.json();

      const yaPostulado = postulaciones.some(p => p.oferta?.id === parseInt(idOferta));
      const btnPostular = document.getElementById('btn-postular');

      if (yaPostulado) {
        setBtnPostulado(btnPostular);                 // ← unificado
      } else {
        setBtnPostular(btnPostular);                  // ← unificado
        btnPostular.addEventListener('click', handlePostularClick);
      }
    } catch (error) {
      console.error('Error verificando postulación:', error);
    }

    // Mostrar/ocultar alerta de preguntas
    if (Array.isArray(preguntas) && preguntas.length > 0) {
      const form = document.getElementById('formulario-preguntas');
      // (opcional) si ya las agregaste arriba, omite duplicarlas
      const alerta = document.getElementById('alerta-preguntas');
      if (alerta) alerta.classList.remove('d-none');
      document.body.dataset.tienePreguntas = '1';
    } else {
      const alerta = document.getElementById('alerta-preguntas');
      if (alerta) alerta.classList.add('d-none');
      document.body.dataset.tienePreguntas = '0';
    }

  } catch (error) {
    console.error('Error cargando la oferta:', error);
  }
});

function handlePostularClick(e) {
  e.preventDefault();
  const tienePreguntas = document.body.dataset.tienePreguntas === '1';
  const modalElement = document.getElementById('modalPreguntas');

  if (tienePreguntas) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    setTimeout(() => {
      modalElement.removeAttribute('aria-hidden');
      const firstInput = modalElement.querySelector('input.pregunta-input');
      if (firstInput) firstInput.focus();
    }, 200);
  } else {
    enviarPostulacion();
  }
}

document.getElementById('btn-confirmar-postulacion').addEventListener('click', async () => {
  const form = document.getElementById('formulario-preguntas');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  await enviarPostulacion();
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalPreguntas'));
  if (modal) modal.hide();
});

async function enviarPostulacion() {
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarPopup({ titulo: 'Sesión requerida', texto: 'Token no encontrado. Inicia sesión para postular.' }, 'error');
    return;
  }

  const decoded = JSON.parse(atob(token.split('.')[1]));
  const usuarioId = decoded.sub;

  try {
    const postulanteResp = await fetch(`${BASE_URL_API}/postulante/${usuarioId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!postulanteResp.ok) throw new Error('No se pudo obtener el postulante');
    const postulanteData = await postulanteResp.json();
    const postulanteId = postulanteData.id;
    const ofertaId = getIdOfertaFromURL();
    if (!ofertaId || !postulanteId) {
      mostrarPopup({ titulo: 'Faltan datos', texto: 'Faltan datos para postular.' }, 'error');
      return;
    }

    const inputs = document.querySelectorAll('.pregunta-input');
    const preguntasRespuestas = [...inputs].map(input => ({
      pregunta: input.dataset.pregunta,
      respuesta: input.value.trim()
    }));

    const payload = {
      postulante_id: postulanteId,
      oferta_id: parseInt(ofertaId),
      data: { preguntas: preguntasRespuestas }
    };

    const res = await fetch(`${BASE_URL_API}/postulaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const btnPostular = document.getElementById('btn-postular');

    if (res.status === 409) {
      // Ya estaba postulado: dejamos el botón en estado postulado e informamos
      setBtnPostulado(btnPostular);
      mostrarPopup({ titulo: 'Ya estás postulado', texto: 'Has postulado anteriormente a esta oferta.' }, 'success');
    } else if (!res.ok) {
      throw new Error('Error inesperado al postular');
    } else {
      // Éxito
      mostrarPopup({ titulo: '¡Postulación enviada con éxito!', texto: 'Has postulado exitosamente a esta oferta.' }, 'success');

      // Estado unificado del botón (mismo look que al refrescar)
      // (dejamos tus líneas originales y luego unificamos con el helper)
      btnPostular.textContent = 'Ya estás postulado';
      btnPostular.classList.add('disabled', 'btn-secondary');
      btnPostular.classList.remove('theme-btn', 'btn-primary');
      btnPostular.removeEventListener('click', handlePostularClick);
      btnPostular.href = '#';
      btnPostular.setAttribute('aria-disabled', 'true');
      btnPostular.style.pointerEvents = 'none';
      btnPostular.style.opacity = '0.65';
      btnPostular.style.cursor = 'not-allowed';

      // Unificación final (reaplica theme-btn + icono)
      setBtnPostulado(btnPostular);
    }

  } catch (err) {
    console.error(err);
    mostrarPopup({ titulo: 'Ocurrió un error', texto: 'Ocurrió un error al postular. Intenta nuevamente.' }, 'error');
  }
}

// Funciones auxiliares
function renderLista(arr, selector) {
  const ul = document.querySelector(selector);
  if (!ul || !Array.isArray(arr)) return;
  ul.innerHTML = '';
  arr.forEach(texto => {
    const li = document.createElement('li');
    li.textContent = texto;
    li.classList.add('mb-2');
    ul.appendChild(li);
  });
}

function formatFecha(fechaStr) {
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-CL');
}

function formatNum(num) {
  return parseInt(num).toLocaleString('es-CL');
}

function formatEducacion(value) {
  const mapa = { superior: 'Superior - Universitario', media: 'Educación Media', basica: 'Educación Básica' };
  return mapa[value] || value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatTextoBonito(texto) {
  return texto.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatModalidad(val) {
  const mapa = { '1': 'Full Time', '2': 'Part Time', '3': 'Femoto', '4': 'Freelancer', '5': 'Temporal' };
  return mapa[val] || 'No especificado';
}

function getIdOfertaFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}
