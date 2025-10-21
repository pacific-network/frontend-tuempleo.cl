document.addEventListener('DOMContentLoaded', async () => {
  // =========================
  // 0) Utilidades
  // =========================
  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const qs = new URLSearchParams(location.search);
  let jobId = qs.get('jobId') || sessionStorage.getItem('fromJobId') || null;

  // =========================
  // 1) Botón "Volver a la oferta"
  // =========================
  const btnVolver = document.getElementById('btn-volver-job');
  if (btnVolver) {
    if (jobId) {
      btnVolver.href = `job-single-2-si.html?id=${encodeURIComponent(jobId)}`;
      // (Opcional) ocultar ?jobId= tras cargar:
      // history.replaceState({}, '', 'candidate-employer-view-si.html');
    } else {
      btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.referrer) history.back();
        else location.href = 'job-list.html';
      });
    }
  }

  // =========================
  // 2) Resolver RUT sin exponerlo
  // =========================
  let rut = sessionStorage.getItem('selectedEmployerRut');

  if (!rut && jobId) {
    try {
      const r = await fetch(`${BASE_URL_API}/ofertas/${encodeURIComponent(jobId)}`, { headers });
      if (r.ok) {
        const of = await r.json();
        rut = of?.empresa?.rut || null;
        if (rut) sessionStorage.setItem('selectedEmployerRut', rut);
      }
    } catch (e) {
      console.warn('No se pudo resolver RUT desde oferta:', e);
    }
  }

  // Fallback: aceptar ?rut= y limpiar la URL visible
  if (!rut) {
    const rutFromUrl = qs.get('rut');
    if (rutFromUrl) {
      rut = rutFromUrl;
      sessionStorage.setItem('selectedEmployerRut', rutFromUrl);
      history.replaceState({}, '', 'candidate-employer-view-si.html' + (jobId ? `?jobId=${encodeURIComponent(jobId)}` : ''));
    }
  }

  if (!rut) {
    console.warn('No se encontró RUT de empresa (ni en storage ni por oferta ni en URL).');
    return;
  }

  // =========================
  // 3) Fetch de la empresa y pintado (incluye título y redes)
  // =========================
  try {
    const res = await fetch(`${BASE_URL_API}/empresas/${encodeURIComponent(rut)}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const empresa = await res.json();
    const datos = empresa.data || {};

    // Logo (con fallback robusto)
    setImgSrcWithFallback('empresa-logo', empresa.logo_url);

    // Nombre + título de la pestaña
    const nombreFantasia = empresa.nombre_fantasia || 'Sin nombre';
    setText('empresa-nombre', nombreFantasia);
    setPageTitle(nombreFantasia);

    // Rubro (manteniendo el ícono)
    const rubroTxt = (Array.isArray(datos.actividades_economicas) && datos.actividades_economicas[0]) || 'Sin especificar';
    const rubroEl = byId('empresa-rubro');
    if (rubroEl) rubroEl.innerHTML = '<a class="fas fa-buildings"></a> ' + escapeHtml(rubroTxt);

    // Ubicación
    const ubicacion = `${datos.comuna || ''}${datos.comuna && datos.region ? ' - ' : ''}${datos.region || ''}` || 'Sin ubicación';
    setText('empresa-ubicacion', ubicacion);

    // Desde (año)
    const fechaInicio = datos.fecha_inicio_actividades
      ? new Date(datos.fecha_inicio_actividades).getFullYear()
      : 'Sin datos';
    setText('empresa-fecha', fechaInicio);

    // Tamaño
    const tamano = datos.empresa_menor_tamano ? 'Entre 10 - 49 Trabajadores' : '50 o más trabajadores';
    setText('empresa-tamano', tamano);

    // Descripción
    setText('empresa-descripcion', datos.descripcion || 'Sin descripción');

    // --- Redes sociales dinámicas ---
    const redesEl = byId('empresa-redes');                 // contenedor de links
    const redesCol = redesEl ? redesEl.closest('.col-lg-6') : null; // columna que envuelve
    // título "Redes Sociales" (h4 inmediatamente anterior a la col)
    let redesTitle = redesCol ? redesCol.previousElementSibling : null;
    if (redesTitle && !redesTitle.classList.contains('user-profile-card-title')) {
      redesTitle = null;
    }

    const redesCandidates = [
      { url: datos.facebook || datos.facebook_url || empresa.facebook || empresa.facebook_url,   icon: 'fab fa-facebook-f',  label: 'Facebook'  },
      { url: datos.twitter  || datos.twitter_url  || empresa.twitter  || empresa.twitter_url,    icon: 'fab fa-twitter',     label: 'Twitter'   },
      { url: datos.linkedin || datos.linkedin_url || empresa.linkedin || empresa.linkedin_url,   icon: 'fab fa-linkedin-in', label: 'LinkedIn'  },
      { url: datos.instagram|| datos.instagram_url|| empresa.instagram|| empresa.instagram_url,  icon: 'fab fa-instagram',   label: 'Instagram' },
      { url: datos.pinterest|| datos.pinterest_url|| empresa.pinterest|| empresa.pinterest_url,  icon: 'fab fa-pinterest',   label: 'Pinterest' },
      { url: datos.whatsapp || datos.whatsapp_url || empresa.whatsapp || empresa.whatsapp_url,   icon: 'fab fa-whatsapp',    label: 'WhatsApp'  }
    ];

    const redesValidas = redesCandidates
      .filter(r => isValidHttpUrl(r.url))
      .map(r => ({ href: r.url, icon: r.icon, label: r.label }));

    if (redesEl) {
      if (redesValidas.length > 0) {
        redesEl.innerHTML = redesValidas.map(r => `
          <a href="${escapeAttr(r.href)}" target="_blank" rel="noopener">
            <i class="${escapeAttr(r.icon)}" aria-hidden="true"></i>
            <span class="sr-only">${escapeHtml(r.label)}</span>
          </a>
        `).join('');
        if (redesCol) redesCol.classList.remove('d-none');
        if (redesTitle) redesTitle.classList.remove('d-none');
      } else {
        redesEl.innerHTML = '';
        if (redesCol) redesCol.classList.add('d-none');
        if (redesTitle) redesTitle.classList.add('d-none');
      }
    }

  } catch (error) {
    console.error('❌ Error al obtener datos de la empresa:', error);
  }

  // =========================
  // Helpers
  // =========================
  function byId(id) {
    return document.getElementById(id) || null;
  }
  function setText(id, value) {
    const el = byId(id);
    if (el != null) el.textContent = value ?? '';
  }

  // Fallback de imagen: intenta primary -> assets/img/default-logo.png -> /assets/img/default-logo.png
  function setImgSrcWithFallback(id, primarySrc) {
    const img = byId(id);
    if (!img || img.tagName !== 'IMG') return;

    const candidates = [];
    if (primarySrc && typeof primarySrc === 'string') candidates.push(primarySrc);
    candidates.push('assets/img/job/01.jpg', '/assets/img/job/01.jpg');

    let i = 0;
    const tryNext = () => {
      img.src = candidates[i];
    };
    img.onerror = () => {
      i++;
      if (i < candidates.length) {
        tryNext();
      } else {
        // evitar loop infinito
        img.onerror = null;
      }
    };
    tryNext();
  }

  function setPageTitle(name) {
    const finalTitle = `${name} | TuEmpleo`;
    document.title = finalTitle;
    const titleEl = document.getElementById('empresa_nombre') || document.querySelector('head > title');
    if (titleEl) titleEl.textContent = finalTitle;
  }
  function escapeHtml(s) {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }
  function escapeAttr(s) {
    return escapeHtml(String(s)).replaceAll('`','&#096;');
  }
  function isValidHttpUrl(u) {
    if (!u || typeof u !== 'string') return false;
    try {
      const url = new URL(u.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch { return false; }
  }
});