(() => {
  // ====== Config ======
  const PATHS = {
    OFERTA: '/postulaciones/oferta',
    SELECCION: '/seleccion',
    POSTULACIONES: '/postulaciones'
  };

  // ====== Tokens ======
  const TOKEN_KEYS = ['auth_token_emp','auth_token','empleador_token','access_token','token','jwt','jwtToken'];
  function getAuthToken() {
    for (const k of TOKEN_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return { token: v, key: k };
    }
    const anyKey = Object.keys(localStorage).find((x) => /token/i.test(x));
    return anyKey ? { token: localStorage.getItem(anyKey), key: anyKey } : { token: null, key: null };
  }
  const { token } = getAuthToken();
  const AUTH_HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};
  const JSON_HEADERS = { ...AUTH_HEADERS, 'Content-Type': 'application/json' };

  // ====== Utils ======
  const container = document.getElementById('candidates-container');

  function moneyCL(v) {
    const n = Number(v || 0);
    return n.toLocaleString('es-CL');
  }

  function estadoBadge(estado) {
    const map = {
      postulado: 'badge bg-light text-dark',
      pendiente: 'badge bg-light text-dark',
      preseleccionado: 'badge bg-info',
      descartado: 'badge bg-secondary',
      no_seleccionado: 'badge bg-secondary',
      contratado: 'badge bg-success'
    };
    const cls = map[estado] || 'badge bg-light text-dark';
    return `<span class="${cls}" data-role="estado-badge">${estado}</span>`;
  }

  // Reemplazamos alert/confirm por SweetAlert2
  function popup(title, msg, icon = 'success') {
    return Swal.fire({
      title: title,
      text: msg,
      icon: icon,
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Aceptar',
      timer: icon === 'success' ? 1800 : undefined
    });
  }

  // ====== Obtener id oferta ======
  function resolveOfferId() {
    const sp = new URLSearchParams(location.search);
    let id = sp.get('id') || sp.get('ofertaId');
    if (id) {
      sessionStorage.setItem('sel_offer_id', id);
      localStorage.setItem('tmp_sel_offer_id', JSON.stringify({ v: id, t: Date.now() }));
      sp.delete('id'); sp.delete('ofertaId');
      const qs = sp.toString();
      const newUrl = location.pathname + (qs ? '?' + qs : '') + location.hash;
      history.replaceState(null, '', newUrl);
      return id;
    }
    id = sessionStorage.getItem('sel_offer_id');
    if (id) return id;
    try {
      const raw = localStorage.getItem('tmp_sel_offer_id');
      if (raw) {
        const o = JSON.parse(raw);
        if (o && Date.now() - o.t < 60000) return o.v;
      }
    } catch {}
    return null;
  }

  // ====== API ======
  async function fetchPostulantesPorOferta(ofertaId) {
    const url = `${BASE_URL_API}${PATHS.OFERTA}/${ofertaId}`;
    if (token) {
      const r1 = await fetch(url, { headers: AUTH_HEADERS });
      if (r1.ok) return r1.json();
      if (r1.status !== 401 && r1.status !== 403) throw new Error(`Error ${r1.status}: ${await r1.text()}`);
    }
    const r2 = await fetch(url, { credentials: 'include' });
    if (!r2.ok) throw new Error(`Error ${r2.status}: ${await r2.text()}`);
    return r2.json();
  }

  async function patchSeleccion(postulacionId, accion, observaciones = '') {
    const url = `${BASE_URL_API}${PATHS.SELECCION}/${postulacionId}/${accion}`;
    const res = await fetch(url, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ observaciones }) });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async function borrarPostulacion(postulacionId) {
    const url = `${BASE_URL_API}${PATHS.POSTULACIONES}/${postulacionId}`;
    const res = await fetch(url, { method: 'DELETE', headers: AUTH_HEADERS });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return true;
  }

  // ====== Render ======
  function labelByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'Seleccionado';
      case 'contratado': return 'Contratado';
      default: return 'Preseleccionar';
    }
  }
  function iconByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'fa-check';
      case 'contratado': return 'fa-badge-check';
      default: return 'fa-star';
    }
  }
  function nextActionByEstado(estado) {
    if (estado === 'preseleccionado') return 'contratar';
    if (estado === 'contratado') return '';
    return 'preseleccionar';
  }

  function cardTemplate(post) {
  const postulacionId = post.id;
  const estado = post.estado || 'postulado';
  const postulante = post.postulante || {};
  const usuario = postulante.usuario || {};
  const data = postulante.data || {};
  const personales = data.datos_personales || {};

  const nombre = (usuario.nombres && usuario.apellidos)
    ? `${usuario.nombres} ${usuario.apellidos}`
    : (usuario.nombres || 'Nombre no disponible');

  const categoria_empleo = data.preferencias?.categoria_empleo || 'Sin cargo';
  const region = personales.region || 'Región no especificada';
  const comuna = personales.comuna || 'Comuna no especificada';
  const salario = data.preferencias?.salario_esperado || 0;

  const usuarioId = usuario.id || '';
  const btnLabel = labelByEstado(estado);
  const btnIcon = iconByEstado(estado);
  const nextAct = nextActionByEstado(estado);
  const disabledAttr = (estado === 'contratado') ? 'disabled' : '';

  return `
    <div class="col-12 px-1" data-postulacion-id="${postulacionId}">
      <div class="candidate-item border-bottom bg-white px-2" 
           style="min-height:42px; padding-top:3px; padding-bottom:3px;">
        <div class="row align-items-center text-center gx-0" style="font-size:13px;">
          
          <!-- Nombre -->
          <div class="col-md-2 fw-semibold text-dark" style="font-size:14px; line-height:1.1;">
            <a href="employer-view-candidate.html"
               class="view-btn text-decoration-none text-dark"
               data-user-id="${usuarioId}">
              ${nombre}
            </a>
            <div class="mt-1" style="font-size:11px;">${estadoBadge(estado)}</div>
          </div>

          <!-- Cargo -->
          <div class="col-md-2 text-muted" style="font-size:11px;">${categoria_empleo}</div>

          <!-- Región -->
          <div class="col-md-2 text-muted" style="font-size:11.5px;">${region}</div>

          <!-- Comuna -->
          <div class="col-md-2 text-muted" style="font-size:12.5px;">${comuna}</div>

          <!-- Pretensiones -->
          <div class="col-md-2 fw-semibold" style="font-size:14px;">$ ${moneyCL(salario)}</div>

          <!-- Acciones -->
          <div class="col-md-2">
            <div class="d-flex flex-column align-items-center justify-content-center" style="gap:2px;">
              <div class="d-flex justify-content-center gap-1 w-100">
                <a href="employer-view-candidate.html"
                   class="btn btn-outline-secondary btn-sm view-btn flex-fill"
                   data-user-id="${usuarioId}" title="Ver CV"
                   style="min-width:70px; padding:1px 4px; font-size:11px;">
                  <i class="far fa-eye me-1"></i>Ver CV
                </a>
                <button class="btn btn-primary btn-sm next-btn flex-fill"
                        data-next-action="${nextAct}" ${disabledAttr}
                        title="${btnLabel}" style="min-width:70px; padding:1px 4px; font-size:11px;">
                  <i class="far ${btnIcon} me-1"></i>${btnLabel}
                </button>
              </div>
              <div class="d-flex justify-content-center gap-1 w-100">
                <button class="btn btn-outline-secondary btn-sm discard-btn flex-fill"
                        title="Descartar" style="min-width:70px; padding:1px 4px; font-size:11px;">
                  <i class="far fa-xmark me-1"></i>Descartar
                </button>
                <button class="btn btn-outline-danger btn-sm delete-btn flex-fill"
                        title="Eliminar" data-candidate="${nombre}" 
                        style="min-width:70px; padding:1px 4px; font-size:11px;">
                  <i class="far fa-trash-can me-1"></i>Eliminar
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;
}

  async function renderPostulantes(ofertaId) {
    if (!container) return;
    if (!ofertaId) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se encontró el ID de la oferta.</div></div>`;
      return;
    }
    container.innerHTML = `<div class="col-12 text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Cargando candidatos...</div>`;
    try {
      const data = await fetchPostulantesPorOferta(ofertaId);
      const lista = Array.isArray(data) ? data : (data.items || []);
      if (!lista.length) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-3">No hay candidatos para esta oferta.</div>`;
        return;
      }
      container.innerHTML = lista.slice(0, 20).map(cardTemplate).join('');
    } catch (e) {
      popup('Error', 'No se pudieron cargar los candidatos', 'error');
      container.innerHTML = `<div class="col-12 text-center text-danger py-3">Error al cargar candidatos.</div>`;
    }
  }

  // ====== Eventos ======
  function wireEvents() {
    if (!container) return;

    document.addEventListener('click', (e) => {
      const view = e.target.closest('a.view-btn');
      if (!view) return;
      e.preventDefault();
      const uid = view.dataset.userId;
      if (!uid) return;
      sessionStorage.setItem('sel_cand_id', uid);
      localStorage.setItem('tmp_sel_cand_id', JSON.stringify({ v: uid, t: Date.now() }));
      sessionStorage.setItem('return_to_offer_page', location.pathname);
      location.href = 'employer-view-candidate.html';
    }, true);

    container.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-postulacion-id]');
      if (!card) return;
      const postulacionId = card.getAttribute('data-postulacion-id');

      // siguiente estado
      const nextBtn = e.target.closest('.next-btn');
      if (nextBtn) {
        e.preventDefault();
        if (nextBtn.disabled) return;
        const accion = nextBtn.getAttribute('data-next-action');
        if (!accion) return;
        try {
          await patchSeleccion(postulacionId, accion, `Cambio desde UI (${accion})`);
          let nuevoEstado = (accion === 'preseleccionar') ? 'preseleccionado'
                        : (accion === 'contratar') ? 'contratado' : 'postulado';
          const badge = card.querySelector('[data-role="estado-badge"]');
          if (badge) badge.outerHTML = estadoBadge(nuevoEstado);
          nextBtn.innerHTML = `<i class="far ${iconByEstado(nuevoEstado)}"></i>${labelByEstado(nuevoEstado)}`;
          const siguienteAccion = (nuevoEstado === 'preseleccionado') ? 'contratar' : (nuevoEstado === 'contratado' ? '' : 'preseleccionar');
          nextBtn.setAttribute('data-next-action', siguienteAccion || '');
          if (!siguienteAccion) nextBtn.disabled = true;
          popup('Éxito', 'Estado actualizado correctamente', 'success');
        } catch (err) {
          popup('Error', err.message || 'Error al actualizar estado', 'error');
        }
        return;
      }

      // descartar
      const discardBtn = e.target.closest('.discard-btn');
      if (discardBtn) {
        e.preventDefault();
        try {
          await patchSeleccion(postulacionId, 'descartar', 'Descartado desde UI');
          const badge = card.querySelector('[data-role="estado-badge"]');
          if (badge) badge.outerHTML = estadoBadge('descartado');
          const nextBtn2 = card.querySelector('.next-btn');
          if (nextBtn2) {
            nextBtn2.disabled = false;
            nextBtn2.setAttribute('data-next-action', 'preseleccionar');
            nextBtn2.innerHTML = `<i class="far ${iconByEstado('postulado')}"></i>Preseleccionar`;
          }
          popup('Hecho', 'Candidato descartado', 'info');
        } catch {
          popup('Error', 'No se pudo descartar al candidato', 'error');
        }
        return;
      }

      // eliminar
      const delBtn = e.target.closest('.delete-btn');
      if (delBtn) {
        e.preventDefault();
        const nombre = delBtn.getAttribute('data-candidate') || 'este candidato';
        Swal.fire({
          title: '¿Eliminar candidato?',
          html: `Se eliminará <b>${nombre}</b> de la lista.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await borrarPostulacion(postulacionId);
              card.remove();
              popup('Eliminado', 'El candidato fue eliminado correctamente', 'success');
            } catch {
              popup('Error', 'No se pudo eliminar al candidato', 'error');
            }
          }
        });
      }
    });
  }

  // ====== Init ======
  document.addEventListener('DOMContentLoaded', async () => {
    sessionStorage.setItem('return_to_offer_page', location.pathname);
    const ofertaId = resolveOfferId();
    await renderPostulantes(ofertaId);
    wireEvents();
  });
})();
