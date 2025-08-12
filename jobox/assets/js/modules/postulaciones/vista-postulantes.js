// function getIdFromURL() {
//     const params = new URLSearchParams(window.location.search);
//     return params.get('id');
//   }
  
//   const idOferta = getIdFromURL();
  
//   if (!idOferta) {
//     console.error('ID de oferta no proporcionado en la URL');
//   } else {
//     fetch(`${BASE_URL_API}/postulaciones/oferta/${idOferta}`)
//       .then(res => res.json())
//       .then((postulantes) => {
//         if (!Array.isArray(postulantes)) {
//           console.warn('⚠️ No se recibió un array de postulantes:', postulantes);
//           return;
//         }
  
//         const container = document.getElementById('candidates-container');
//         container.innerHTML = '';
  
//         postulantes.forEach(post => {
//           const postulante = post.postulante || {};
//           const usuario = postulante.usuario || {};
//           const data = postulante.data || {};
//           const personales = data.datos_personales || {};
  
//           // Nombre completo concatenando nombres y apellidos de usuario
//           const nombre = usuario.nombres && usuario.apellidos
//             ? `${usuario.nombres} ${usuario.apellidos}`
//             : 'Nombre no disponible';
  
//           // Cargo de la primera experiencia si existe
//           const cargo = data.experiencias?.[0]?.cargo || 'Sin cargo';
  
//           // Comuna y salario esperado
//           const comuna = personales.comuna || 'Comuna no especificada';
//           const salario = data.preferencias?.salario_esperado || 0;
  
//           // Idiomas en links
//           const idiomasHTML = Array.isArray(data.idiomas)
//             ? data.idiomas.map(i => `<a href="#">${i.idioma}</a>`).join('')
//             : '';
  
//           const html = `
//             <div class="col-md-6 col-lg-6">
//               <div class="candidate-item">
//                 <div class="candidate-bio">
//                   <div class="candidate-img">
//                     <img src="../assets/img/candidate/default.jpg" alt="thumb">
//                   </div>
//                   <div class="candidate-bio-content">
//                     <h5><a href="#">${nombre}</a></h5>
//                     <span>${cargo}</span>
//                   </div>
//                 </div>
//                 <div class="candidate-content">
//                   <p><i class="far fa-location-dot"></i> ${comuna}</p>
//                   <div class="candidate-skill">
//                     ${idiomasHTML}
//                   </div>
//                   <div class="candidate-bottom">
//                     <div class="candidate-salary">
//                       $ ${Number(salario).toLocaleString('es-CL')} <span>Mensual</span>
//                     </div>
//                     <div class="profile-btns">
//                       <a href=""employer-view-candidate.html=${id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-eye"></i></a>
//                       <a href="#" class="btn btn-outline-secondary btn-sm"><i class="far fa-check"></i></a>
//                       <a href=" class="btn btn-outline-danger btn-sm delete-btn" data-candidate="${nombre}"><i class="far fa-trash-can"></i></a>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           `;
//           container.insertAdjacentHTML('beforeend', html);
//         });
//       })
//       .catch(err => {
//         console.error('❌ Error al obtener postulantes:', err);
//       });
//   }
  
// vista-postulantes.js
(() => {
  // ====== Config ======
  const token = localStorage.getItem('token') || '';
  const AUTH_HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};
  const JSON_HEADERS = { ...AUTH_HEADERS, 'Content-Type': 'application/json' };

  const PATHS = {
    OFERTA: '/postulaciones/oferta',   // GET {BASE_URL_API}/postulaciones/oferta/:idOferta
    SELECCION: '/seleccion',           // PATCH {BASE_URL_API}/seleccion/:postId/{preseleccionar|descartar|contratar}
    POSTULACIONES: '/postulaciones'    // DELETE {BASE_URL_API}/postulaciones/:postId
  };

  // ====== Utils ======
  function getIdFromURL() {
    const p = new URLSearchParams(window.location.search);
    return p.get('id');
  }
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

  // ====== API ======
  async function fetchPostulantesPorOferta(ofertaId) {
    const res = await fetch(`${BASE_URL_API}${PATHS.OFERTA}/${ofertaId}`, { headers: AUTH_HEADERS });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  }
  async function patchSeleccion(postulacionId, accion, observaciones = '') {
    const url = `${BASE_URL_API}${PATHS.SELECCION}/${postulacionId}/${accion}`;
    const res = await fetch(url, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ observaciones }) });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return res.json(); // { success: true }
  }
  async function borrarPostulacion(postulacionId) {
    const url = `${BASE_URL_API}${PATHS.POSTULACIONES}/${postulacionId}`;
    const res = await fetch(url, { method: 'DELETE', headers: AUTH_HEADERS });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return true;
  }

  // ====== Render ======
  const container = document.getElementById('candidates-container');
  const idOferta = getIdFromURL();

  // Etiqueta del botón según estado actual
  function labelByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'Seleccionado';
      case 'contratado': return 'Contratado';
      default: return 'Preseleccionar';
    }
  }
  // Icono del botón según estado actual
  function iconByEstado(estado) {
    switch (estado) {
      case 'preseleccionado': return 'fa-check';
      case 'contratado': return 'fa-badge-check';
      default: return 'fa-star';
    }
  }
  // Próxima acción que ejecutará el botón
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

    const cargo = data.experiencias?.[0]?.cargo || 'Sin cargo';
    const comuna = personales.comuna || 'Comuna no especificada';
    const salario = data.preferencias?.salario_esperado || 0;
    const idiomasHTML = Array.isArray(data.idiomas)
      ? data.idiomas.map(i => `<a href="#" class="btn btn-xs btn-light me-1 mb-1">${i.idioma}</a>`).join('')
      : '';

    const usuarioId = usuario.id || '';
    const btnLabel = labelByEstado(estado);
    const btnIcon = iconByEstado(estado);
    const nextAction = nextActionByEstado(estado);
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
                <a href="employer-view-candidate.html?id=${usuarioId}" class="view-btn" data-user-id="${usuarioId}">
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
                <a href="employer-view-candidate.html?id=${usuarioId}"
                   class="btn btn-outline-secondary btn-sm view-btn"
                   data-user-id="${usuarioId}" title="Ver candidato">
                  <i class="far fa-eye"></i>
                </a>
                <button class="btn btn-primary btn-sm next-btn"
                        data-next-action="${nextAction}"
                        title="${nextAction === 'contratar' ? 'Contratar' : (nextAction ? 'Preseleccionar' : 'Sin acciones')}"
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

  async function renderPostulantes() {
    if (!container) return;
    if (!idOferta) {
      container.innerHTML = `<div class="col-12"><div class="alert alert-danger">ID de oferta no proporcionado en la URL.</div></div>`;
      return;
    }
    container.innerHTML = `<div class="col-12"><div class="alert alert-light border">Cargando candidatos...</div></div>`;
    try {
      const lista = await fetchPostulantesPorOferta(idOferta);
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

    // Modal eliminar
    const deleteModalEl = document.getElementById('confirmDeleteModal');
    const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
    const candidateNameSpan = document.getElementById('candidateName');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let pendingDeleteId = null;

    container.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-postulacion-id]');
      if (!card) return;
      const postulacionId = card.getAttribute('data-postulacion-id');

      // Ver perfil: dejamos que el <a href> navegue
      if (e.target.closest('.view-btn')) return;

      // Siguiente (preseleccionar/contratar) con botón que refleja estado actual
      const nextBtn = e.target.closest('.next-btn');
      if (nextBtn) {
        e.preventDefault();
        if (nextBtn.disabled) return;

        const accion = nextBtn.getAttribute('data-next-action'); // '', 'preseleccionar', 'contratar'
        if (!accion) return; // Sin acciones (contratado)

        try {
          await patchSeleccion(postulacionId, accion, `Cambio desde UI (${accion})`);

          // Actualizar badge y botón según NUEVO estado
          let nuevoEstado = (accion === 'preseleccionar') ? 'preseleccionado'
                          : (accion === 'contratar') ? 'contratado'
                          : 'postulado';

          // Badge
          const badge = card.querySelector('[data-role="estado-badge"]');
          if (badge) badge.outerHTML = estadoBadge(nuevoEstado);

          // Botón principal
          nextBtn.innerHTML = `<i class="far ${iconByEstado(nuevoEstado)} me-1"></i>${labelByEstado(nuevoEstado)}`;
          const siguienteAccion = nextActionByEstado(nuevoEstado);
          nextBtn.setAttribute('data-next-action', siguienteAccion || '');
          nextBtn.title = siguienteAccion
            ? (siguienteAccion === 'contratar' ? 'Contratar' : 'Preseleccionar')
            : 'Sin acciones';

          if (!siguienteAccion) {
            nextBtn.disabled = true; // contratado
          }

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

    // Confirmar eliminación (modal)
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
    await renderPostulantes();
    wireEvents();
  });
})();

