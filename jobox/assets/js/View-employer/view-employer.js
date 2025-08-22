document.addEventListener('DOMContentLoaded', async () => {
  // --------------------------
  // 1) Botón "Volver a la oferta"
  // --------------------------
  const btnVolver = document.getElementById('btn-volver-job');

  const qs = new URLSearchParams(location.search);
  let jobId = qs.get('jobId') || sessionStorage.getItem('fromJobId') || null;

  if (!jobId && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      jobId = new URLSearchParams(ref.search).get('id');
    } catch {}
  }

  if (btnVolver) {
    if (jobId) {
      btnVolver.href = `job-single-2.html?id=${encodeURIComponent(jobId)}`;
      // (Opcional) ocultar ?jobId= tras cargar:
      // history.replaceState({}, '', 'candidate-employer-view.html');
    } else {
      btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.referrer) history.back();
        else location.href = 'job-list.html';
      });
    }
  }

  // --------------------------
  // 2) Resolver RUT sin exponerlo
  // --------------------------
  let rut = sessionStorage.getItem('selectedEmployerRut');

  if (!rut && jobId) {
    try {
      const r = await fetch(`${BASE_URL_API}/ofertas/${encodeURIComponent(jobId)}`);
      if (r.ok) {
        const of = await r.json();
        rut = of?.empresa?.rut || null;
        if (rut) sessionStorage.setItem('selectedEmployerRut', rut);
      }
    } catch (e) {
      console.warn('No se pudo resolver RUT desde oferta:', e);
    }
  }

  if (!rut) {
    const rutFromUrl = qs.get('rut');
    if (rutFromUrl) {
      rut = rutFromUrl;
      sessionStorage.setItem('selectedEmployerRut', rutFromUrl);
      history.replaceState({}, '', 'candidate-employer-view.html' + (jobId ? `?jobId=${encodeURIComponent(jobId)}` : ''));
    }
  }

  if (!rut) {
    console.warn('No se encontró RUT de empresa (ni en storage, ni por oferta, ni en URL).');
    return;
  }

  // --------------------------
  // 3) Fetch de la empresa y pintado de UI (IDs públicos)
  // --------------------------
  try {
    const res = await fetch(`${BASE_URL_API}/empresas/${encodeURIComponent(rut)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const empresa = await res.json();
    const datosEmpresa = empresa.data || {};

    // Logo con fallback robusto
    setImgSrcWithFallback('empresa-logo', empresa.logo_url);

    const nombreFantasia = empresa.nombre_fantasia || 'Sin nombre';
    setText('empresa-nombre', nombreFantasia);
    setPageTitle(nombreFantasia); // título de la pestaña

    const rubroTxt = (Array.isArray(datosEmpresa.actividades_economicas) && datosEmpresa.actividades_economicas[0]) || 'Sin especificar';
    const rubroEl = byId('empresa-rubro');
    if (rubroEl) rubroEl.textContent = rubroTxt;

    const comuna = datosEmpresa.comuna || '';
    const region = datosEmpresa.region || '';
    setText('empresa-ubicacion', `${comuna}${comuna && region ? ' - ' : ''}${region}`);

    const fechaInicio = datosEmpresa.fecha_inicio_actividades
      ? new Date(datosEmpresa.fecha_inicio_actividades).getFullYear()
      : 'Sin datos';
    setText('empresa-fecha', fechaInicio);

    const tamano = datosEmpresa.empresa_menor_tamano ? 'Entre 10 - 49 Trabajadores' : '50 o más trabajadores';
    setText('empresa-tamano', tamano);

    setText('empresa-descripcion', datosEmpresa.descripcion || 'Sin descripción');

  } catch (error) {
    console.error('❌ Error al obtener datos de la empresa:', error);
  }

  // --------------------------
  // Helpers
  // --------------------------
  function byId(id) { return document.getElementById(id) || null; }
  function setText(id, value) { const el = byId(id); if (el) el.textContent = value ?? ''; }

  // Fallback de imagen: intenta primary -> assets/img/default-logo.png -> /assets/img/default-logo.png
  function setImgSrcWithFallback(id, primarySrc) {
    const img = byId(id);
    if (!img || img.tagName !== 'IMG') return;

    const candidates = [];
    if (primarySrc && typeof primarySrc === 'string') candidates.push(primarySrc);
    candidates.push('assets/img/job/01.jpg', '/assets/img/job/01.jpg');

    let i = 0;
    const tryNext = () => { img.src = candidates[i]; };
    img.onerror = () => {
      i++;
      if (i < candidates.length) {
        tryNext();
      } else {
        img.onerror = null; // evita loop
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
});