// assets/js/modules/postulaciones/vista-postulantes.js
(() => {
  // ====== Config ======
  const PATHS = {
    OFERTA: '/postulaciones/oferta',   // GET {BASE_URL_API}/postulaciones/oferta/:idOferta
    SELECCION: '/seleccion',           // PATCH {BASE_URL_API}/seleccion/:postId/{preseleccionar|descartar|contratar}
    POSTULACIONES: '/postulaciones'    // DELETE {BASE_URL_API}/postulaciones/:postId
  };

  // ====== Tokens (robusto) ======
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
  function showToast(msg, type = 'success') {
    const el = document.getElementById('liveToast');
    const title = document.getElementById('toastTitle');
    const body = document.getElementById('toastBody');
    if (!el || !title || !body) {
      if (type === 'error') alert(`Error: ${msg}`); else alert(msg);
      return;
    }
    body.textContent = msg;
    if (type === 'success') {
      title.textContent = '✅ Éxito';
      el.classList.remove('bg-danger');
      el.classList.add('bg-success');
    } else if (type === 'error') {
      title.textContent = '❌ Error';
      el.classList.remove('bg-success');
      el.classList.add('bg-danger');
    } else {
      title.textContent = '⚠️ Aviso';
      el.classList.remove('bg-success', 'bg-danger');
    }
    new bootstrap.Toast(el).show();
  }

  // Quita id/ofertaId de la URL y lo guarda
  function resolveOfferId() {
    const sp = new URLSearchParams(location.search);
    let id = sp.get('id') || sp.get('ofertaId');

    if (id) {
      sessionStorage.setItem('sel_offer_id', id);
      // fallback para nueva pestaña (1 min)
      localStorage.setItem('tmp_sel_offer_id', JSON.stringify({ v: id, t: Date.now() }));

      // limpiamos la URL
      sp.delete('id'); sp.delete('ofertaId');
      const qs = sp.toString();
      const newUrl = location.pathname + (qs ? '?' + qs : '') + location.hash;
      history.replaceState(null, '', newUrl);
      return id;
    }

    // sin query: usar sessionStorage
    id = sessionStorage.getItem('sel_offer_id');
    if (id) return id;

    // último recurso: nueva pestaña en la última 1 min
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

    // 1) Con Bearer si hay token
    if (token) {
      const r1 = await fetch(url, { headers: AUTH_HEADERS });
      if (r1.ok) return r1.json();
      if (r1.status !== 401 && r1.status !== 403) throw new Error(`Error ${r1.status}: ${await r1.text()}`);
    }
    // 2) Reintento con cookies (sesión por cookie)
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
    if (estado === 'contratado') return ''; // no hay siguiente
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

    const cargo   = data.experiencias?.[0]?.cargo || 'Sin cargo';
    const comuna  = personales.comuna || 'Comuna no especificada';
    const salario = data.preferencias?.salario_esperado || 0;
    const idiomasHTML = Array.isArray(data.idiomas)
      ? data.idiomas.map(i => `<a href="#" class="btn btn-xs btn-light me-1 mb-1">${i.idioma}</a>`).join('')
      : '';

    const usuarioId = usuario.id || '';
    const btnLabel = labelByEstado(estado);
    const btnIcon  = iconByEstado(estado);
    const nextAct  = nextActionByEstado(estado);
    const disabledAttr = (estado === 'contratado') ? 'disabled' : '';

    return `
      <div class="col-md-6 col-lg-6" data-postulacion-id="${postulacionId}">
        <div class="candidate-item">
          <div class="candidate-bio">
            <div class="candidate-img">
              <img src="../assets/img/candidate/default.jpg" alt="thumb">
            </div>
            <div class="candidate-bio-content">
              <h5 class="mb-1">
                <a href="employer-view-candidate.html" class="view-btn" data-user-id="${usuarioId}">
                  ${nombre}
                </a>
              </h5>
              <div class="small text-muted mb-1">${estadoBadge(estado)}</div>
              <span>${cargo}</span>
            </div>
          </div>
          <div class="candidate-content">
            <p><i class="far fa-location-dot"></i> ${comuna}</p>
            <div class="candidate-skill">${idiomasHTML}</div>
            <div class="candidate-bottom">
              <div class="candidate-salary">
                $ ${moneyCL(salario)} <span>Mensual</span>
              </div>
              <div class="profile-btns d-flex gap-2">
                <a href="employer-view-candidate.html"
                   class="btn btn-outline-secondary btn-sm view-btn"
                   data-user-id="${usuarioId}" title="Ver candidato">
                  <i class="far fa-eye"></i>
                </a>
                <button class="btn btn-primary btn-sm next-btn"
                        data-next-action="${nextAct}"
                        title="${nextAct === 'contratar' ? 'Contratar' : (nextAct ? 'Preseleccionar' : 'Sin acciones')}"
                        ${disabledAttr}>
                  <i class="far ${btnIcon} me-1"></i>${btnLabel}
                </button>
                <button class="btn btn-outline-secondary btn-sm discard-btn" data-action="descartar" title="Descartar">
                  <i class="far fa-xmark me-1"></i>Descartar
                </button>
                <button class="btn btn-outline-danger btn-sm delete-btn" data-candidate="${nombre}" title="Eliminar">
                  <i class="far fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async function renderPostulantes(ofertaId) {
    if (!container) return;
    if (!ofertaId) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se encontró el ID de la oferta. Abre esta página desde la gestión de avisos.</div></div>`;
      return;
    }
    container.innerHTML = `<div class="col-12"><div class="alert alert-light border">Cargando candidatos...</div></div>`;
    try {
      const data  = await fetchPostulantesPorOferta(ofertaId);
      const lista = Array.isArray(data) ? data : (data.items || []);
      if (!lista.length) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-light border">No hay candidatos para esta oferta.</div></div>`;
        return;
      }
      container.innerHTML = lista.map(cardTemplate).join('');
    } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los candidatos.</div></div>`;
    }
  }

  // ====== Eventos (delegación) ======
  function wireEvents() {
    if (!container) return;

    // Navegar al perfil SIN id en la URL: guardamos sel_cand_id
    document.addEventListener('click', (e) => {
      const view = e.target.closest('a.view-btn');
      if (!view) return;
      e.preventDefault();
      const uid = view.dataset.userId || view.getAttribute('data-user-id');
      if (!uid) return;

      // Guarda candidato y página de retorno; navega sin querystring
      sessionStorage.setItem('sel_cand_id', uid);
      localStorage.setItem('tmp_sel_cand_id', JSON.stringify({ v: uid, t: Date.now() }));
      // A dónde volver desde el perfil
      sessionStorage.setItem('return_to_offer_page', location.pathname);
      location.href = 'employer-view-candidate.html';
    }, true);

    // Modal eliminar
    const deleteModalEl = document.getElementById('confirmDeleteModal');
    const deleteModal   = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
    const candidateNameSpan = document.getElementById('candidateName');
    const confirmDeleteBtn  = document.getElementById('confirmDeleteBtn');
    let pendingDeleteId = null;

    container.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-postulacion-id]');
      if (!card) return;
      const postulacionId = card.getAttribute('data-postulacion-id');

      // Botón siguiente estado
      const nextBtn = e.target.closest('.next-btn');
      if (nextBtn) {
        e.preventDefault();
        if (nextBtn.disabled) return;
        const accion = nextBtn.getAttribute('data-next-action'); // '', 'preseleccionar', 'contratar'
        if (!accion) return;
        try {
          await patchSeleccion(postulacionId, accion, `Cambio desde UI (${accion})`);
          let nuevoEstado = (accion === 'preseleccionar') ? 'preseleccionado'
                        : (accion === 'contratar') ? 'contratado'
                        : 'postulado';

          const badge = card.querySelector('[data-role="estado-badge"]');
          if (badge) badge.outerHTML = estadoBadge(nuevoEstado);

          nextBtn.innerHTML = `<i class="far ${iconByEstado(nuevoEstado)} me-1"></i>${labelByEstado(nuevoEstado)}`;
          const siguienteAccion = (nuevoEstado === 'preseleccionado') ? 'contratar' : (nuevoEstado === 'contratado' ? '' : 'preseleccionar');
          nextBtn.setAttribute('data-next-action', siguienteAccion || '');
          nextBtn.title = siguienteAccion ? (siguienteAccion === 'contratar' ? 'Contratar' : 'Preseleccionar') : 'Sin acciones';
          if (!siguienteAccion) nextBtn.disabled = true;

          showToast('Estado actualizado correctamente');
        } catch (err) {
          console.error(err);
          showToast(err.message || 'No se pudo actualizar el estado', 'error');
        }
        return;
      }

      // Descartar
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
            nextBtn2.title = 'Preseleccionar';
            nextBtn2.innerHTML = `<i class="far ${iconByEstado('postulado')} me-1"></i>${labelByEstado('postulado')}`;
          }
          showToast('Candidato descartado');
        } catch (err) {
          console.error(err);
          showToast(err.message || 'No se pudo descartar', 'error');
        }
        return;
      }

      // Eliminar
      const delBtn = e.target.closest('.delete-btn');
      if (delBtn) {
        e.preventDefault();
        const nombre = delBtn.getAttribute('data-candidate') || 'este candidato';
        if (candidateNameSpan) candidateNameSpan.textContent = nombre;
        pendingDeleteId = postulacionId;

        if (deleteModal) {
          deleteModal.show();
        } else if (confirm(`¿Desea eliminar a ${nombre}?`)) {
          try {
            await borrarPostulacion(pendingDeleteId);
            card.remove();
            showToast('Candidato eliminado');
          } catch (err) {
            console.error(err);
            showToast('No se pudo eliminar', 'error');
          } finally {
            pendingDeleteId = null;
          }
        }
        return;
      }
    });

    if (confirmDeleteBtn && deleteModal) {
      confirmDeleteBtn.addEventListener('click', async () => {
        if (!pendingDeleteId) return;
        try {
          await borrarPostulacion(pendingDeleteId);
          const card = container.querySelector(`[data-postulacion-id="${pendingDeleteId}"]`);
          if (card) card.remove();
          showToast('Candidato eliminado');
        } catch (err) {
          console.error(err);
          showToast('No se pudo eliminar', 'error');
        } finally {
          pendingDeleteId = null;
          deleteModal.hide();
        }
      });
    }
  }

  // ====== Init ======
  document.addEventListener('DOMContentLoaded', async () => {
    // Guardar “ruta de retorno” (para el botón Volver del perfil)
    sessionStorage.setItem('return_to_offer_page', location.pathname);

    const ofertaId = resolveOfferId();
    await renderPostulantes(ofertaId);
    wireEvents();
  });
})();
