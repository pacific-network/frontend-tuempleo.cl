(function () {
  try {
    // 1) Resolver y ocultar el id de la OFERTA en la URL
    const sp = new URLSearchParams(location.search);
    const offerId = sp.get('id') || sp.get('ofertaId');
    if (offerId) {
      sessionStorage.setItem('sel_offer_id', offerId);
      // Fallback para abrir en nueva pestaña (TTL 60s)
      localStorage.setItem('tmp_sel_offer_id', JSON.stringify({ v: offerId, t: Date.now() }));

      sp.delete('id'); sp.delete('ofertaId');
      const qs = sp.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } else {
      // Fallback nueva pestaña: si no hay en sessionStorage, tomar tmp de localStorage
      if (!sessionStorage.getItem('sel_offer_id')) {
        const raw = localStorage.getItem('tmp_sel_offer_id');
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && Date.now() - obj.t < 60000) {
            sessionStorage.setItem('sel_offer_id', obj.v);
          }
        }
      }
    }

    // 2) Guardar la ruta de retorno (SIN id) para el botón "Volver"
    sessionStorage.setItem('return_to_offer_page', location.pathname);

    // 3) Interceptar clic en "ver candidato": guardar id y navegar SIN id en la URL
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a.view-btn, a[data-user-id]');
      if (!a) return;

      const uid = a.getAttribute('data-user-id');
      if (!uid) return;

      e.preventDefault();
      // Guardar id candidato (y fallback para nueva pestaña)
      sessionStorage.setItem('sel_cand_id', uid);
      localStorage.setItem('tmp_sel_cand_id', JSON.stringify({ v: uid, t: Date.now() }));

      // Navegar al detalle sin querystring
      location.href = 'employer-view-candidate.html';
    }, true);
  } catch (e) {
    console.warn('Init lista candidatos (oferta) =>', e);
  }
})();