// assets/js/modules/ofertas/view-candidate-offer.js
// Aplica la política de oferta (p.ej. FREE -> ver solo 5) en la vista de candidatos.

(function(){
  const BASE = `${window.API_BASE || ''}/api/v1/publication`;
  const wrap = document.getElementById('candidates-container');
  if (!wrap) return;

  const params   = new URLSearchParams(location.search);
  const ofertaId = Number(params.get('ofertaId') || params.get('id') || 0);

  async function getJSON(url, opts){
    const r = await fetch(url, { credentials:'include', ...(opts||{}) });
    const j = r.headers.get('content-type')?.includes('application/json') ? await r.json() : null;
    if (!r.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);
    return j;
  }

  async function loadPolicy(){
    try{ return await getJSON(`${BASE}/ofertas/${ofertaId}/policy`); }
    catch{ return { planKey:'FREE', policy:{ profilesLimit:5 } }; }
  }

  function lockCard(card){
    card.classList.add('position-relative');
    const o = document.createElement('div');
    o.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    o.style.background = 'rgba(255,255,255,.85)';
    o.style.border = '1px dashed #bdbdbd';
    o.style.borderRadius = '12px';
    o.innerHTML = `
      <div class="bg-white p-3 rounded shadow-sm text-center">
        <div class="fw-bold">Plan FREE</div>
        <div class="small mb-2">Solo puedes ver los 5 primeros postulantes</div>
        <a href="carrito.html" class="btn btn-sm btn-primary">Mejorar plan</a>
      </div>`;
    card.appendChild(o);
  }

  async function boot(){
    if (!ofertaId) return;

    const pol = await loadPolicy();
    const limit = Number(pol?.policy?.profilesLimit || 0);

    const data = await getJSON(`${BASE}/ofertas/${ofertaId}/postulaciones`);
    document.getElementById('total-postulantes')?.replaceChildren(document.createTextNode(String(data.length || 0)));

    wrap.innerHTML = '';
    data.forEach((c, idx)=>{
      const lock = limit>0 && idx>=limit;
      wrap.insertAdjacentHTML('beforeend', `
        <div class="col-md-6 col-lg-6">
          <div class="candidate-card p-3 border rounded d-flex align-items-center" data-postulante-id="${c.id}">
            <img alt="" class="me-3 rounded-circle ${lock?'opacity-75':''}" src="${c.avatar || '../assets/img/placeholder/user.png'}" width="64" height="64">
            <div>
              <div class="${lock?'text-muted':''} fw-bold">${lock?'****':(c.nombre || 'Candidato')}</div>
              <div class="${lock?'text-muted':''} small">${lock?'correo oculto':(c.email || 'correo@dominio')}</div>
              <div class="${lock?'text-muted':''} small">${lock?'+56 ****':(c.telefono || '')}</div>
            </div>
          </div>
        </div>
      `);
      if (lock) lockCard(wrap.lastElementChild.firstElementChild);
    });

    if (limit>0 && data.length>limit) {
      wrap.insertAdjacentHTML('afterend', `
        <div class="alert alert-warning mt-3">
          Tu plan <b>${pol.planKey}</b> permite ver solo los primeros <b>${limit}</b> perfiles.
          Puedes <a href="carrito.html">mejorar tu plan</a> para verlos todos.
        </div>
      `);
    }
  }

  boot();
})();
