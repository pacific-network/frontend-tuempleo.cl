document.addEventListener('DOMContentLoaded', async () => {
  const qs = new URLSearchParams(location.search);
  const idOferta = qs.get('id');
  if (!idOferta) return;

  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Usa el BASE_URL_API si está definido en config.js; si no, fallback
  const BASE = typeof BASE_URL_API !== 'undefined' ? BASE_URL_API : 'https://tuempleo.cl/api';

  // ---- Helpers HTTP
  async function j(url) {
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function getOferta(id) {
    // intenta endpoint actual; deja una alternativa por compatibilidad
    const urls = [
      `${BASE}/ofertas/${encodeURIComponent(id)}`,
      `${BASE}/v1/ofertas/${encodeURIComponent(id)}`
    ];
    for (const u of urls) {
      try { return await j(u); } catch {}
    }
    return null;
  }

  async function getEmpresaByRut(rut) {
    // GET /empresas/:rut debe devolver { id, rut, ... }
    try { return await j(`${BASE}/empresas/${encodeURIComponent(rut)}`); }
    catch { return null; }
  }

  function renderStars(el, avg) {
    if (!el) return;
    const full = Math.floor(avg || 0);
    const half = (avg || 0) - full >= 0.5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= full) html += '<i class="fa fa-star" style="color:#f4c150"></i>';
      else if (i === full + 1 && half) html += '<i class="fa fa-star-half-alt" style="color:#f4c150"></i>';
      else html += '<i class="fa fa-star" style="color:#ccc"></i>';
    }
    el.innerHTML = html;
  }

  try {
    // 1) Traer oferta -> obtener RUT empresa
    const oferta = await getOferta(idOferta);
    if (!oferta) return;

    const rutEmpresa =
      oferta?.empresa?.rut ||
      oferta?.empleador?.rut ||
      oferta?.rutEmpresa ||
      null;

    // 2) Con RUT -> obtener empresa (id)
    let companyId = null;
    if (rutEmpresa) {
      const empresa = await getEmpresaByRut(rutEmpresa);
      companyId = empresa?.id ?? null;
      if (companyId) sessionStorage.setItem('selectedCompanyId', String(companyId));
      sessionStorage.setItem('selectedEmployerRut', rutEmpresa);
    }

    // 3) Render resumen de calificaciones si hay companyId
    if (companyId) {
      let sum = { average: 0, total: 0, histogram: {1:0,2:0,3:0,4:0,5:0} };
      try {
        // ajusta si tu endpoint real es /v1/companies/:id/reviews/summary
        sum = await j(`${BASE}/companies/${companyId}/reviews/summary`);
      } catch {}

      renderStars(document.querySelector('.company-rating .stars'), sum.average || 0);

      const ratingNumEl = document.querySelector('.rating-number');
      if (ratingNumEl) ratingNumEl.textContent = `${(sum.average || 0).toFixed(1)} / 5`;

      const basedText = document.getElementById('rating-based-on');
      if (basedText) basedText.textContent = `Basado en ${sum.total || 0} opiniones`;

      const breakdown = document.getElementById('rating-breakdown');
      if (breakdown) {
        breakdown.innerHTML = '';
        for (let s = 5; s >= 1; s--) {
          const li = document.createElement('li');
          li.className = 'd-flex align-items-center justify-content-between mb-1';
          li.innerHTML = `<span>${'★'.repeat(s)}${'☆'.repeat(5-s)}</span><span>${sum.histogram?.[s] || 0}</span>`;
          breakdown.appendChild(li);
        }
      }
    }

    // 4) Configurar botón Calificar → pasa companyId e id oferta
    const btn = document.getElementById('btn-calificar');
    if (btn) {
      let url = `calification.html?id=${encodeURIComponent(idOferta)}`;
      if (companyId) url += `&company=${encodeURIComponent(companyId)}`;
      else if (rutEmpresa) url += `&rut=${encodeURIComponent(rutEmpresa)}`;

      // 🔒 Bloqueo de calificación si no hay token
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const hasToken = !!localStorage.getItem('token');
        if (!hasToken) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'info',
              title: 'Inicia sesión',
              text: 'Debes iniciar sesión para calificar una empresa.',
              confirmButtonText: 'Ir al inicio de sesión',
              showCancelButton: true,
              cancelButtonText: 'Cancelar'
            }).then((res) => {
              if (res.isConfirmed) window.location.href = 'sign-in.html';
            });
          } else {
            alert('Debes iniciar sesión para calificar una empresa.');
            window.location.href = 'sign-in.html';
          }
          return;
        }
        // Si hay token, redirige a calification
        location.href = url;
      }, { once: false });
    }
  } catch (e) {
    console.error('calificación empresa:', e);
  }
});
