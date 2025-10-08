// assets/js/publication-client.js
// Cliente para saldos, reserva/confirmación y política efectiva por oferta.

(function (global) {
  const BASE = `${window.API_BASE || ''}/api/v1/publication`;

  async function api(path, opts = {}) {
    const r = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    const isJSON = r.headers.get('content-type')?.includes('application/json');
    const data   = isJSON ? await r.json() : await r.text();
    if (!r.ok) throw new Error(data?.error || data?.message || `HTTP ${r.status}`);
    return data;
  }

  const PLAN = { FREE:'FREE', BASICA:'BASICA', ESTANDAR:'ESTANDAR', PREMIUM:'PREMIUM' };

  let _employerId   = null;
  let _selectedPlan = null;  // FREE | BASICA | ESTANDAR | PREMIUM
  let _reservationId = null; // id en ledger (FREE reservado o pagado autorizado)

  function setEmployerId(id){ _employerId = Number(id || 0); }
  function getEmployerId(){ return _employerId; }

  function selectPlan(planKey){ _selectedPlan = planKey; _reservationId = null; }
  function getSelectedPlan(){ return _selectedPlan; }

  function getReservationId(){ return _reservationId; }
  function setPaidAuthorizationId(id){ _reservationId = Number(id || 0); }

  // Saldos del picker
  // { free: { usedThisMonth, monthlyCap }, paid: { BASICA:{authorized,reserved,confirmed}, ... } }
  function summary(employerId){
    return api(`/ledger/summary?employerId=${employerId}`);
  }

  async function freeRemaining(employerId){
    const s = await summary(employerId);
    const cap = s?.free?.monthlyCap ?? 3;
    const used= s?.free?.usedThisMonth ?? 0;
    return { remaining: Math.max(0, cap - used), cap };
  }

  // Reserva FREE (crea fila ledger FREE: RESERVED)
  function reserveFree({ employerId }){
    return api(`/ledger/reserve/free`, {
      method:'POST', body: JSON.stringify({ employerId })
    }).then(r => { _reservationId = r?.reservationId ?? null; return r; });
  }

  // Listar autorizaciones pagadas disponibles (para un plan)
  function listPaidAuthorizations({ employerId, planKey }){
    return api(`/ledger/available-authorizations?employerId=${employerId}&planKey=${planKey}`);
  }

  // Confirmar en ledger después de crear la oferta (FREE: RESERVED->CONFIRMED; PAGADO: AUTHORIZED->CONFIRMED)
  function confirmAfterCreate(ofertaId){
    return api(`/ledger/confirm-after-create`, {
      method:'POST',
      body: JSON.stringify({
        employerId: _employerId,
        planKey: _selectedPlan,
        reservationId: _reservationId,
        ofertaId
      })
    });
  }

  // Política efectiva por oferta (para límites de CV, prioridad, etc.)
  function getOfferPolicy(ofertaId){
    return api(`/ofertas/${ofertaId}/policy`);
  }

  global.PublicationClient = {
    PLAN,
    setEmployerId, getEmployerId,
    selectPlan, getSelectedPlan,
    getReservationId, setPaidAuthorizationId,
    summary, freeRemaining, reserveFree,
    listPaidAuthorizations, confirmAfterCreate, getOfferPolicy
  };
})(window);
