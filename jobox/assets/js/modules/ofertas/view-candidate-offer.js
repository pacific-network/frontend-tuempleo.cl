(async function(){
  const BASE = `${window.API_BASE || ''}/api/v1`;
  const wrap = document.getElementById('candidates-container-postulantes');
  const wrapPotenciales = document.getElementById('candidates-container-potenciales');
  if (!wrap || !wrapPotenciales) return;

  const ofertaId = Number(new URLSearchParams(location.search).get('ofertaId') || 0);
  if (!ofertaId) return;

  async function getJSON(url, opts){
    const r = await fetch(url, { credentials:'include', ...(opts||{}) });
    const j = r.headers.get('content-type')?.includes('application/json') ? await r.json() : null;
    if (!r.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);
    return j;
  }

  function renderPostulante(c, container){
    // Si el candidato ya fue cualificado, lo mandamos directo al tab de "potenciales" y no al principal
    if (c.estado === 'cualificado') {
      container = wrapPotenciales; // append directamente al tab de cualificados
    }
  
    const usuario = c.postulante?.usuario || {};
    const dataPostulante = c.postulante?.data || {};
  
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-6';
    card.innerHTML = `
      <div class="candidate-card p-3 border rounded d-flex align-items-center" data-postulante-id="${c.id}">
        <img alt="" class="me-3 rounded-circle" 
             src="${usuario.perfil_foto || '../assets/img/placeholder/user.png'}" width="64" height="64">
        <div class="flex-grow-1">
          <div class="fw-bold">${dataPostulante.nombre || usuario.nombres} ${dataPostulante.apellido || usuario.apellidos}</div>
          <div class="small text-muted">${c.estado || ''}</div>
          <div class="small text-muted">${new Date(c.fechaPostulacion).toLocaleDateString()}</div>
        </div>
        <div class="profile-btns ms-3 d-flex flex-column align-items-end">
          <button class="btn btn-sm btn-outline-primary mb-1 ver-cv">Ver CV</button>
          ${c.estado !== 'cualificado' ? '<button class="btn btn-sm btn-outline-danger toggle-heart">❤</button>' : ''}
        </div>
      </div>
    `;
  
    // Corazón toggle solo si no está cualificado
    const heartBtn = card.querySelector('.toggle-heart');
    if (heartBtn) {
      heartBtn.addEventListener('click', async () => {
        try {
          await fetch(`${BASE}/seleccion/${c.id}/cualificar`, { method: 'POST', credentials:'include' });
          // Mover al tab de candidatos cualificados
          wrapPotenciales.appendChild(card);
          actualizarTotal();
        } catch(e){
          console.error('Error cualificando:', e);
        }
      });
    }
  
    container.appendChild(card);
  }
  

  function actualizarTotal(){
    document.getElementById('total-postulantes').textContent = wrap.children.length;
    document.getElementById('total-potenciales').textContent = wrapPotenciales.children.length;
  }

  try {
    const data = await getJSON(`${BASE}/postulaciones/oferta/${ofertaId}`);
    wrap.innerHTML = '';
    wrapPotenciales.innerHTML = '';
  
    data?.forEach(c => {
      // Solo renderizar en el tab principal si está "enviada"
      if (c.estado === 'enviada') {
        renderPostulante(c, wrap);
      } 
      // Si ya está cualificado, lo mandamos al tab de potenciales
      else if (c.estado === 'cualificado') {
        renderPostulante(c, wrapPotenciales);
      }
      // Ignorar otros estados
    });
  
    actualizarTotal();
  } catch(e){
    console.error('Error cargando postulantes:', e);
    wrap.innerHTML = '<div class="text-muted">No hay postulantes por mostrar.</div>';
  }
  
})();
