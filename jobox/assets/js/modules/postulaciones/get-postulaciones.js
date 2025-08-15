/* ========= Popup TuEmpleo ========= */
function ensurePopupContainer() {
  if (!document.getElementById('popupStylesTuEmpleo')) {
    const style = document.createElement('style');
    style.id = 'popupStylesTuEmpleo';
    style.textContent = `
      #estado-postulacion {
        position: fixed; top: 20px; right: 20px; min-width: 300px;
        background: #fff; border-left: 5px solid #28a745; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 9999;
        display: none; align-items: center; gap: 10px; opacity: 0; transform: translateY(-10px);
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
  let popup = document.getElementById('estado-postulacion');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'estado-postulacion';
    popup.innerHTML = `
      <div class="alert-icon"><i class="fe-check-circle"></i></div>
      <div class="alert-contnet"><strong></strong><br><span></span></div>
    `;
    document.body.appendChild(popup);
  } else {
    if (!popup.querySelector('.alert-icon')) {
      const i = document.createElement('div');
      i.className = 'alert-icon';
      i.innerHTML = '<i class="fe-check-circle"></i>';
      popup.appendChild(i);
    }
    let c = popup.querySelector('.alert-contnet, .alert-content');
    if (!c) {
      c = document.createElement('div');
      c.className = 'alert-contnet';
      popup.appendChild(c);
    }
    if (!c.querySelector('strong')) c.innerHTML = '<strong></strong><br><span></span>';
  }
  return popup;
}
let __popupHideTimer = null;
function mostrarPopup({ titulo, texto }, tipo = 'success', duracion = 4000) {
  const popup = ensurePopupContainer();
  popup.classList.remove('d-none', 'invisible', 'visually-hidden', 'opacity-0');
  if (!popup.classList.contains('d-flex')) popup.classList.add('d-flex');

  const icon = popup.querySelector('.alert-icon i');
  const content = popup.querySelector('.alert-contnet, .alert-content');
  const strong = content.querySelector('strong');
  const span = content.querySelector('span');

  popup.classList.remove('error');
  icon.className = (tipo === 'error') ? 'fe-alert-triangle' : 'fe-check-circle';
  if (tipo === 'error') popup.classList.add('error');

  strong.textContent = titulo || '';
  span.textContent = texto || '';

  popup.style.display = 'flex'; void popup.offsetWidth; popup.classList.add('show');
  if (__popupHideTimer) clearTimeout(__popupHideTimer);
  __popupHideTimer = setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => { popup.style.display = 'none'; }, 400);
  }, duracion);
}
/* ========= /Popup ========= */


/* ========= Badges suaves (pill) ========= */
function ensureBadgeStyles() {
  if (document.getElementById('appliedJobsBadgeStyles')) return;
  const style = document.createElement('style');
  style.id = 'appliedJobsBadgeStyles';
  style.textContent = `
    .user-profile-card .badge {
      border-radius: 9999px; padding: .35rem .6rem; font-weight: 700;
      font-size: .75rem; line-height: 1; letter-spacing: .2px;
    }
    /* Paleta suave */
    .user-profile-card .badge-soft-orange { background: rgba(255,152,0,.18); color: #F57C00; }
    .user-profile-card .badge-soft-blue   { background: rgba(100,181,246,.22); color: #1E88E5; }
    .user-profile-card .badge-soft-red    { background: rgba(239,83,80,.20);  color: #E53935; }
    .user-profile-card .badge-soft-grey   { background: rgba(144,164,174,.20); color: #546E7A; }
    .user-profile-card .badge-soft-teal   { background: rgba(9,173,149,.20);   color: #09AD95; }
  `;
  document.head.appendChild(style);
}

/* Helper que además pone inline (por si algún CSS pisa las clases) */
function makeBadge(label, cls, bg, fg) {
  return `<span class="badge ${cls}" style="background-color:${bg} !important; color:${fg} !important;">
            ${escapeHtml(label)}
          </span>`;
}

/* ========= Utilidades ========= */
function safeParseJSON(s) { try { return s ? JSON.parse(s) : null; } catch { return null; } }
function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function formatFecha(fechaStr) { const d = new Date(fechaStr); if (isNaN(d)) return '—'; return d.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' }); }
function nombreRegion(code) {
  const mapa = {'1':'Tarapacá','2':'Antofagasta','3':'Atacama','4':'Coquimbo','5':'Valparaíso','6':'O’Higgins','7':'Maule','8':'Biobío','9':'La Araucanía','10':'Los Lagos','11':'Aysén','12':'Magallanes','13':'Metropolitana de Santiago','14':'Los Ríos','15':'Arica y Parinacota','16':'Ñuble'};
  return mapa[String(code)] || 'Sin ubicación';
}

/* ========= Mapeo de estados a tu paleta ========= */
function estadoBadge(estadoRaw) {
  const rawInput = estadoRaw == null ? '' : String(estadoRaw).trim();
  const raw = rawInput.toLowerCase();

  // Colores (coinciden con las clases)
  const ORANGE_BG = 'rgba(255,152,0,.18)', ORANGE_FG = '#F57C00';     // En proceso
  const BLUE_BG   = 'rgba(100,181,246,.22)', BLUE_FG   = '#1E88E5';   // Seleccionado/Contratado
  const RED_BG    = 'rgba(239,83,80,.20)',  RED_FG    = '#E53935';    // Rechazado / No seleccionado
  const GREY_BG   = 'rgba(144,164,174,.20)', GREY_FG  = '#546E7A';    // Otro
  const TEAL_BG   = 'rgba(9,173,149,.20)',  TEAL_FG   = '#09AD95';    // Activo (ejemplo)

  // En proceso: vacío / enviada / en revisión
  if (!raw || raw === '-' || raw === 'null' || raw === 'undefined' || raw.includes('envi') || raw.includes('rev')) {
    return makeBadge('En proceso', 'badge-soft-orange', ORANGE_BG, ORANGE_FG);
  }
  // Seleccionado
  if (raw.includes('seleccionado') && !raw.includes('no')) {
    return makeBadge('Preseleccionado', 'badge-soft-blue', BLUE_BG, BLUE_FG);
  }
  // Contratado
  if (raw.includes('contra')) {
    return makeBadge('Contratado', 'badge-soft-blue', BLUE_BG, BLUE_FG);
  }
  // Rechazado / No seleccionado (no_seleccionado, no seleccionado, no-seleccionado)
  if (
    raw.includes('rechaz') ||
    raw.includes('no_sele') ||
    raw.includes('no sele') ||
    raw.includes('no-sele') ||
    raw === 'no seleccionado' ||
    raw === 'no-seleccionado'
  ) {
    return makeBadge('No seleccionado', 'badge-soft-red', RED_BG, RED_FG);
  }
  // Activo (por si viene así desde backend)
  if (raw.includes('activ')) {
    return makeBadge('Activo', 'badge-soft-teal', TEAL_BG, TEAL_FG);
  }
  // Cualquier otro
  return makeBadge(rawInput, 'badge-soft-grey', GREY_BG, GREY_FG);
}

/* Elimina una columna por texto del <th> (case-insensitive) */
function removeColumnByHeaderText(table, headerText) {
  const ths = [...table.querySelectorAll('thead th')];
  const idx = ths.findIndex(th => th.textContent.trim().toLowerCase() === headerText.trim().toLowerCase());
  if (idx === -1) return -1;
  ths[idx].parentElement.removeChild(ths[idx]);
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(r => { const cells = r.querySelectorAll('td'); if (cells[idx]) r.removeChild(cells[idx]); });
  return idx;
}


/* ========= Render principal ========= */
document.addEventListener('DOMContentLoaded', async () => {
  const table = document.querySelector('.profile-applied-job table');
  const tbody = table?.querySelector('tbody');
  if (!tbody) return;

  // Inyecta estilos de badges suaves
  ensureBadgeStyles();

  // Elimina columna "Descargar CV" si existe
  removeColumnByHeaderText(table, 'Descargar CV');

  const token = localStorage.getItem('token');
  if (!token) {
    mostrarPopup({ titulo: 'Sesión requerida', texto: 'Inicia sesión para ver tus postulaciones.' }, 'error');
    return;
  }

  // Carga postulaciones
  let postulaciones = [];
  try {
    const res = await fetch(`${BASE_URL_API}/postulaciones/postulante`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudieron cargar tus postulaciones');
    postulaciones = await res.json();
  } catch (e) {
    console.error(e);
    mostrarPopup({ titulo: 'Error', texto: 'No se pudieron cargar tus postulaciones.' }, 'error');
    return;
  }

  // Limpia filas de ejemplo
  tbody.innerHTML = '';

  const colCount = table.querySelectorAll('thead th').length;
  if (!Array.isArray(postulaciones) || postulaciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-muted py-4">Aún no has postulado a ningún trabajo.</td></tr>`;
    return;
  }

  // Render
  for (const p of postulaciones) {
    const oferta = p.oferta || {};
    const data = safeParseJSON(oferta.data) || {};
    const titulo = oferta.titulo || data.titulo || 'Oferta sin título';
    const area_trabajo = data.area_trabajo || '—';
    const region = nombreRegion(data.region);
    const fechaPost = formatFecha(p.fechaPostulacion);
    const badgeHtml = estadoBadge(p.estado);
    const jobUrl = `job-single-2-si.html?id=${oferta.id ?? ''}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="profile-job-info">
          <img src="assets/img/job/01.jpg" alt="">
          <div class="profile-job-content">
            <h6><a href="${jobUrl}">${escapeHtml(titulo)}</a></h6>
            <ul class="profile-job-list">
              <li><i class="far fa-briefcase"></i> ${escapeHtml(area_trabajo)}</li>
            </ul>
            <ul>
              <li><i class="far fa-location-dot"></i> ${escapeHtml(region)}</li>
            </ul>
          </div>
        </div>
      </td>
      <td>${fechaPost}</td>
      <td class="col-estado">${badgeHtml}</td>
      <td>
        <a href="${jobUrl}" class="btn btn-outline-secondary btn-sm" title="Ver oferta">
          <i class="far fa-eye"></i>
        </a>
      </td>
    `;

    // Failsafe: si por CSS la celda queda vacía, fuerza "En proceso" con naranjo suave
    const estadoCell = tr.querySelector('.col-estado');
    if (!estadoCell.textContent.trim()) {
      estadoCell.innerHTML = makeBadge('En proceso', 'badge-soft-orange', 'rgba(255,152,0,.18)', '#F57C00');
    }

    tbody.appendChild(tr);
  }

  /* ---- Filtro "Hace X ..." ---- */
  const filtro = document.querySelector('.user-profile-sort select.select');
  if (filtro) {
    filtro.addEventListener('change', () => {
      const dias = ({'1':1,'2':2,'3':7,'4':14,'5':21})[filtro.value] ?? null;
      const rows = [...tbody.querySelectorAll('tr')];
      if (!dias) { rows.forEach(r => r.style.display = ''); return; }
      rows.forEach(r => {
        const fechaTxt = r.children[1]?.textContent?.trim() || '';
        const normalized = new Date(fechaTxt);
        const diff = isNaN(normalized) ? Infinity : Math.floor((Date.now() - normalized.getTime())/(1000*60*60*24));
        r.style.display = (diff <= dias) ? '' : 'none';
      });
    });
  }
});
