document.addEventListener('DOMContentLoaded', async () => {
  const qs = new URLSearchParams(location.search);
  const idOferta = qs.get('id');
  if (!idOferta) return;

  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const BASE = typeof BASE_URL_API !== 'undefined' ? BASE_URL_API : 'https://tuempleo.cl/api';

  async function j(url) {
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function getOferta(id) {
    // usa primero v1 si lo tienes; de lo contrario el legacy
    const urls = [
      `${BASE}/ofertas/${encodeURIComponent(id)}`,
      `${BASE}/ofertas/${encodeURIComponent(id)}`
    ];
    for (const u of urls) {
      try { return await j(u); } catch {}
    }
    return null;
  }

  async function getEmpresaByRut(rut) {
    // según tu mensaje: GET /v1/empresas/:rut devuelve { id, rut, ... }
    try { return await j(`${BASE}/empresas/${encodeURIComponent(rut)}`); }
    catch { return null; }
  }

  function renderStars(el, avg) {
    if (!el) return;
    const full = Math.floor(avg);
    const half = avg - full >= 0.5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= full) html += '<i class="fa fa-star" style="color:#f4c150"></i>';
      else if (i === full + 1 && half) html += '<i class="fa fa-star-half-alt" style="color:#f4c150"></i>';
      else html += '<i class="fa fa-star" style="color:#ccc"></i>';
    }
    el.innerHTML = html;
  }

  try {
    // 1) Oferta -> rut empresa
    const oferta = await getOferta(idOferta);
    if (!oferta) return;

    const rutEmpresa =
      oferta?.empresa?.rut ||
      oferta?.empleador?.rut ||
      oferta?.rutEmpresa ||
      null;

    // 2) Con rut -> empresa (id)
    let companyId = null;
    if (rutEmpresa) {
      const empresa = await getEmpresaByRut(rutEmpresa);
      companyId = empresa?.id ?? null; // <- AQUÍ obtienes 37 en tu ejemplo
      if (companyId) sessionStorage.setItem('selectedCompanyId', String(companyId));
      sessionStorage.setItem('selectedEmployerRut', rutEmpresa); // por si lo quieres luego
    }

    // 3) Pintar resumen si hay companyId
    if (companyId) {
      let sum = { average: 0, total: 0, histogram: {1:0,2:0,3:0,4:0,5:0} };
      try {
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

    // 4) Botón Calificar → pasa companyId e id oferta
    const btn = document.getElementById('btn-calificar');
    if (btn) {
      let url = `calification.html?id=${encodeURIComponent(idOferta)}`;
      if (companyId) url += `&company=${encodeURIComponent(companyId)}`;
      else if (rutEmpresa) url += `&rut=${encodeURIComponent(rutEmpresa)}`;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        location.href = url;
      });
    }
  } catch (e) {
    console.error('calificación empresa:', e);
  }
});