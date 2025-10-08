import { PUBLICATION_API, getJSON } from './api.js';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

function lockCard(card) {
  card.classList.add('tu-locked');
  if (!card.querySelector('.tu-locked-overlay')) {
    const layer = document.createElement('div');
    layer.className = 'tu-locked-overlay';
    layer.innerHTML = `
      <div class="tu-locked-box">
        <strong>Plan FREE:</strong> solo puedes ver los <b>5 primeros postulantes</b> de esta oferta.
        <div style="margin-top:8px"><a href="carrito.html" class="btn btn-sm btn-primary">Desbloquear comprando</a></div>
      </div>`;
    card.style.position = 'relative';
    card.appendChild(layer);
  }
}

// Si no tienes data-postulante-id en el DOM, como fallback bloquea todo >5 por orden visual.
function applyLock(perms) {
  const totalSpan = $('#total-postulantes');
  if (totalSpan) totalSpan.textContent = String(perms.total ?? 0);

  if (perms.allowedPostulanteIds === 'ALL') return; // planes de pago: nada que bloquear

  const allowed = new Set(perms.allowedPostulanteIds || []);

  // Caso 1: hay data-postulante-id
  const cards = $$('[data-postulante-id]');
  if (cards.length) {
    for (const c of cards) {
      const pid = Number(c.getAttribute('data-postulante-id'));
      if (!allowed.has(pid)) lockCard(c);
    }
    return;
  }

  // Caso 2: fallback por índice DOM (primero 5 visibles, resto bloqueado)
  const items = $$('.candidate-card, .candidate-item, .list-group-item, [data-candidate]');
  items.forEach((c, i) => { if (i >= 5) lockCard(c); });
}

export async function initCandidatePerms() {
  // Busca ofertaId desde body data o querystring
  const b = document.body || document.documentElement;
  let ofertaId = Number(b.dataset.ofertaId || 0);
  if (!ofertaId) {
    const qs = new URLSearchParams(location.search);
    ofertaId = Number(qs.get('id') || 0);
  }
  if (!ofertaId) return;

  try {
    const perms = await getJSON(`${PUBLICATION_API}/offer-candidate-permissions?ofertaId=${ofertaId}`);
    applyLock(perms);
  } catch (e) {
    console.error(e);
  }
}
