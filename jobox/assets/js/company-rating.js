// assets/js/company-rating.js
if (!window.__companyRatingInit) {
  window.__companyRatingInit = true;

  document.addEventListener('DOMContentLoaded', async () => {
    const qs = new URLSearchParams(location.search);
    const idOferta = qs.get('id');
    if (!idOferta) return;

    // ✅ Usar SOLO la BASE_URL_API definida en main.js
    if (typeof BASE_URL_API === 'undefined' || !BASE_URL_API) {
      console.error('[company-rating] BASE_URL_API no está definida en main.js');
      return;
    }

    const BASE = BASE_URL_API.replace(/\/$/, '');      // sin slash final
    const api  = (p) => `${BASE}${p}`;                 // no añadimos /v1 automáticamente

    const headers = { Accept: 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const $ = (sel) => document.querySelector(sel);

    async function j(url) {
      const sep = url.includes('?') ? '&' : '?';
      const full = `${url}${sep}_=${Date.now()}`;
      const r = await fetch(full, { headers, cache: 'no-store' });
      if (!r.ok) throw new Error(`GET ${full} → HTTP ${r.status}`);
      return r.json();
    }

    async function getOferta(id) {
      // ✅ Un solo endpoint, basado en BASE_URL_API
      return j(api(`/ofertas/${encodeURIComponent(id)}`));
    }

    async function getEmpresaByRut(rut) {
      return j(api(`/empresas/${encodeURIComponent(rut)}`));
    }

    async function getSummarySmartByRut(rut) {
      // 1) summary por RUT
      try {
        return await j(api(`/empresas/${encodeURIComponent(rut)}/reviews/summary`));
      } catch (e1) {
        console.warn('[company-rating] summary por RUT falló, probando por ID…', e1.message);
      }
      // 2) empresa -> summary por ID
      try {
        const emp = await getEmpresaByRut(rut);
        if (emp?.id) {
          return await j(api(`/companies/${emp.id}/reviews/summary`));
        }
      } catch (e2) {
        console.error('[company-rating] summary por ID también falló', e2.message);
      }
      return { average: 0, total: 0, histogram: {1:0,2:0,3:0,4:0,5:0} };
    }

    function renderStars(el, avg) {
      if (!el) return;
      el.innerHTML = '';
      const full = Math.floor(avg);
      const half = avg - full >= 0.5;
      for (let i = 1; i <= 5; i++) {
        const icon = document.createElement('i');
        if (i <= full)                 icon.className = 'fa fa-star';
        else if (i === full+1 && half) icon.className = 'fa fa-star-half-alt';
        else                           icon.className = 'fa fa-star';
        icon.style.color = (i <= full || (i === full+1 && half)) ? '#f4c150' : '#ccc';
        el.appendChild(icon);
      }
    }

    try {
      // 1) Oferta -> RUT
      const oferta = await getOferta(idOferta);
      if (!oferta) return;

      const rut =
        oferta?.empresa?.rut ||
        oferta?.empleador?.rut ||
        oferta?.rutEmpresa || null;

      if (!rut) return;

      sessionStorage.setItem('selectedEmployerRut', rut);

      // 2) Summary con fallback
      const sum = await getSummarySmartByRut(rut);
      console.debug('[company-rating] summary:', sum);

      // 3) Pintar UI
      renderStars($('.company-rating .stars'), sum.average || 0);
      const ratingNumEl = $('.rating-number');
      if (ratingNumEl) ratingNumEl.textContent = `${(sum.average || 0).toFixed(1)} / 5`;

      const basedText = $('#rating-based-on');
      if (basedText) basedText.textContent = `Basado en ${sum.total || 0} opiniones`;

      const breakdown = $('#rating-breakdown');
      if (breakdown) {
        breakdown.innerHTML = '';
        for (let s = 5; s >= 1; s--) {
          const li = document.createElement('li');
          li.className = 'd-flex align-items-center justify-content-between mb-1';
          li.innerHTML = `<span>${'★'.repeat(s)}${'☆'.repeat(5-s)}</span><span>${sum.histogram?.[s] || 0}</span>`;
          breakdown.appendChild(li);
        }
      }

      // 4) Botón Calificar
      const btn = document.getElementById('btn-calificar');
      if (btn) {
        const url = `calification.html?id=${encodeURIComponent(idOferta)}&rut=${encodeURIComponent(rut)}`;
        btn.addEventListener('click', (e) => { e.preventDefault(); location.href = url; });
      }
    } catch (e) {
      console.error('[company-rating] error:', e);
    }
  });
}
