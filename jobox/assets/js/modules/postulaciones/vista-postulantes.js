(() => {
  // ====== Config ======


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

  async function fetchCualificados(ofertaId) {
    const url = `${BASE}/postulaciones/oferta/${ofertaId}/cualificados`;
    const res = await fetch(url, { credentials: 'include' });
  
    if (!res.ok) throw new Error('Error al cargar cualificados');
    return res.json();
  }



  async function cualificarPostulante(postulacionId) {
    const url = `${BASE_URL_API}${PATHS.SELECCION}/${postulacionId}/cualificar`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ estado: 'cualificado' })
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return res.json();
  }



  // ====== Render ======

  function renderCualificadosLista(lista) {
    const cont = document.getElementById('candidates-container-potenciales');
    cont.innerHTML = '';
  
    if (!lista.length) {
      cont.innerHTML = `
        <div class="text-center text-muted mt-3">No hay candidatos cualificados.</div>
      `;
      return;
    }
  
    lista.forEach((c) => {
      cont.appendChild(renderCardCualificado(c));
    });
  }
  
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

    return `
      <div class="col-12 px-1" data-postulacion-id="${postulacionId}">
        <div class="candidate-item border-bottom bg-white px-2" style="min-height:50px; padding-top:5px; padding-bottom:5px;">
          <div class="row align-items-center text-center gx-0" style="font-size:14px;">

            <div class="col-md-2 fw-semibold text-dark" style="font-size:16px; line-height:1.2;">
              <a href="employer-view-candidate.html"
                 class="view-btn text-decoration-none text-dark"
                 data-user-id="${usuarioId}">
                ${nombre}
              </a>
              <div class="mt-1" style="font-size:12px;">${estadoBadge(estado)}</div>
            </div>

            <div class="col-md-2 text-muted" style="font-size:13px;">${categoria_empleo}</div>
            <div class="col-md-2 text-muted" style="font-size:13px;">${region}</div>
            <div class="col-md-2 text-muted" style="font-size:13px;">${comuna}</div>
            <div class="col-md-2 fw-semibold" style="font-size:16px;">$ ${moneyCL(salario)}</div>

            <div class="col-md-2">
              <div class="d-flex flex-column align-items-center justify-content-center" style="gap:4px;">
                <div class="d-flex justify-content-center gap-2 w-100">
                  <a href="employer-view-candidate.html"
                     class="btn btn-outline-secondary btn-sm view-btn flex-fill"
                     data-user-id="${usuarioId}" title="Ver CV"
                     style="min-width:80px; padding:2px 6px; font-size:12px;">
                    <i class="far fa-eye me-1"></i>Ver CV
                  </a>

                  <button class="btn btn-outline-danger btn-sm favorite-btn flex-fill"
                          data-postulacion-id="${postulacionId}"
                          title="Marcar como favorito"
                          style="min-width:80px; padding:2px 6px; font-size:12px;">
                    <i class="far fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  async function renderPostulantes(ofertaId) {
    if (!contPostulantes) return;
    if (!ofertaId) {
      contPostulantes.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se encontró el ID de la oferta.</div></div>`;
      return;
    }
  
    contPostulantes.innerHTML = `<div class="col-12 text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Cargando candidatos...</div>`;
    contCualificados.innerHTML = '';
  
    try {
      const data = await fetchPostulantesPorOferta(ofertaId);
      const lista = Array.isArray(data) ? data : (data.items || []);
  
      // ================================
      // SEPARACIÓN POR ESTADO
      // ================================
      const postulantes = lista.filter(x => x.estado !== 'cualificado');
      const cualificados = lista.filter(x => x.estado === 'cualificado');
  
      // ==== TAB Postulantes ====
      contPostulantes.innerHTML = postulantes.length
        ? postulantes.map(cardTemplate).join('')
        : `<div class="col-12 text-center text-muted py-3">No hay postulantes.</div>`;
  
      // ==== TAB Cualificados ====
      contCualificados.innerHTML = cualificados.length
        ? cualificados.map(cardTemplate).join('')
        : `<div class="col-12 text-center text-muted py-3">No hay candidatos cualificados.</div>`;
  
    } catch (e) {
      popup('Error', 'No se pudieron cargar los candidatos', 'error');
      contPostulantes.innerHTML = `<div class="col-12 text-center text-danger py-3">Error al cargar candidatos.</div>`;
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

      // ===== Botón corazón / cualificar =====
      const favBtn = e.target.closest('.favorite-btn');
      if (favBtn) {
        e.preventDefault();
        if (favBtn.disabled) return;
        favBtn.disabled = true;
      
        try {
          await cualificarPostulante(postulacionId);
      
          // Eliminar tarjeta del DOM
          const card = favBtn.closest('[data-postulacion-id]');
          if (card) card.remove();
      
          popup('Éxito', 'Candidato cualificado correctamente', 'success');
        } catch (err) {
          popup('Error', err.message || 'No se pudo cualificar al candidato', 'error');
        } finally {
          favBtn.disabled = false;
        }
        return;
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
