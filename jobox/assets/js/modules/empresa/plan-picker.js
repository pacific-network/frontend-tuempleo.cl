// assets/js/modules/empresa/plan-picker.js
// UI del selector de plan (Gratis / Basica / Estandar / Premium)

(function () {
  const root = document.getElementById('plan-picker');
  if (!root || !window.PublicationClient) return;

  const P = window.PublicationClient.PLAN;
  const state = { summary: null, selected: null };

  const $ = (s,r=document)=>r.querySelector(s);

  function card({ title, key, hint, qty, selectable, selected }) {
    const active = selected ? 'border-primary shadow-sm' : '';
    const disabled = selectable ? '' : 'data-disabled="1"';
    const opacity = selectable ? '' : 'opacity-50';
    return `
      <div class="col-12 col-md-6 col-xl-3 mb-3">
        <div class="p-3 border rounded ${active} ${opacity}" data-plan="${key}" ${disabled} style="cursor:${selectable?'pointer':'not-allowed'}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-bold">${title}</div>
              <div class="small text-muted">${hint}</div>
            </div>
            <div class="display-6 m-0 fw-bold">${qty}</div>
          </div>
        </div>
      </div>`;
  }

  function render(){
    const s = state.summary; if (!s) return;
    const freeLeft = Math.max(0, (s.free?.monthlyCap ?? 3) - (s.free?.usedThisMonth ?? 0));
    const paid = s.paid || {};

    const rest = (k) => Math.max(0,
      (paid[k]?.authorized ?? 0) - (paid[k]?.reserved ?? 0) - (paid[k]?.confirmed ?? 0)
    );

    const b = rest('BASICA'), e = rest('ESTANDAR'), p = rest('PREMIUM');

    root.innerHTML = `
      <div class="mb-3"><h5>1) Selecciona el tipo de aviso</h5></div>
      <div class="row">
        ${card({ title:'Gratis',   key:P.FREE,     hint:'3 por mes / empresa', qty:freeLeft, selectable:freeLeft>0, selected:state.selected===P.FREE })}
        ${card({ title:'Basica',   key:P.BASICA,   hint:'Autorizado',          qty:b,       selectable:b>0,       selected:state.selected===P.BASICA })}
        ${card({ title:'Estandar', key:P.ESTANDAR, hint:'Autorizado',          qty:e,       selectable:e>0,       selected:state.selected===P.ESTANDAR })}
        ${card({ title:'Premium',  key:P.PREMIUM,  hint:'Autorizado',          qty:p,       selectable:p>0,       selected:state.selected===P.PREMIUM })}
      </div>
      <div id="no-cupos-alert" class="alert alert-warning mt-2 ${ (freeLeft+b+e+p)>0 ? 'd-none' : ''}">
        No tienes cupos disponibles para publicar. Compra en <a href="carrito.html">Carrito</a>.
      </div>
    `;

    root.querySelectorAll('[data-plan]').forEach(el=>{
      el.addEventListener('click', async ()=>{
        if (el.dataset.disabled==='1') return;
        const planKey = el.getAttribute('data-plan');
        state.selected = planKey;
        window.PublicationClient.selectPlan(planKey);

        // Para pagados, guarda una autorización disponible (si hay varias puedes hacer modal)
        if (planKey !== P.FREE) {
          try{
            const list = await window.PublicationClient.listPaidAuthorizations({
              employerId: window.PublicationClient.getEmployerId(),
              planKey
            });
            if (Array.isArray(list) && list.length) {
              window.PublicationClient.setPaidAuthorizationId(list[0].id);
            }
          }catch(_){}
        }
        render();
      });
    });
  }

  async function boot(){
    const employerId = window.PublicationClient.getEmployerId();
    if (!employerId) return;
    state.summary = await window.PublicationClient.summary(employerId);
    render();
  }

  boot();
})();
