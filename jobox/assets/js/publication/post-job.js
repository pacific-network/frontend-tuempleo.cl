import { PUBLICATION_API, getJSON, getContextIds } from './api.js';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

// ====== Config del flujo ======
const SUBMIT_MODE = 'ajax'; 
// 'ajax' => el script crea la oferta con POST /ofertas y redirige al manage.
// 'noop' => NO intercepta el submit: solo valida/bloquea si no hay cupos y deja que tu form haga su submit tradicional.
// Cambia a 'noop' si quieres mantener tu endpoint original de creación.

// ====== Estado ======
let AVAIL = { FREE: 0, PAID: { BASICA:{ledgerIds:[]}, ESTANDAR:{ledgerIds:[]}, PREMIUM:{ledgerIds:[]} } };
let selection = null; // {planKey:'FREE'} o {ledgerId:123, planKey:'BASICA'}

// ====== UI helpers ======
function fmtCount(n) { return Number(n || 0); }

function renderCards(root) {
  const paid = AVAIL.PAID || {};
  const variants = [
    { key:'FREE',     title:'Gratis',     badge: fmtCount(AVAIL.FREE), disabled: fmtCount(AVAIL.FREE) <= 0, info:'3 por mes / empresa' },
    { key:'BASICA',   title:'Simple',     badge: fmtCount(paid.BASICA?.ledgerIds?.length),   disabled: !(paid.BASICA?.ledgerIds?.length),   info:'Autorizado' },
    { key:'ESTANDAR', title:'Destacado',  badge: fmtCount(paid.ESTANDAR?.ledgerIds?.length), disabled: !(paid.ESTANDAR?.ledgerIds?.length), info:'Autorizado' },
    { key:'PREMIUM',  title:'Conecta',    badge: fmtCount(paid.PREMIUM?.ledgerIds?.length),  disabled: !(paid.PREMIUM?.ledgerIds?.length),  info:'Autorizado' },
  ];

  root.innerHTML = '';
  for (const v of variants) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `tu-card-plan${v.disabled ? ' disabled':''}`;
    card.dataset.plan = v.key;
    card.innerHTML = `
      <div class="tu-card-title">${v.title}</div>
      <div class="tu-card-badge">${v.badge}</div>
      <div class="tu-card-info">${v.info}</div>
    `;
    card.addEventListener('click', () => choosePlan(v));
    root.appendChild(card);
  }
  // Estado global de bloqueo del formulario
  const any = variants.some(x => !x.disabled);
  setFormBlocked(!any);
}

function choosePlan(v) {
  // Limpia selección visual
  $$('.tu-card-plan').forEach(n => n.classList.remove('active'));
  const btn = $(`.tu-card-plan[data-plan="${v.key}"]`);
  if (btn) btn.classList.add('active');

  // Asigna selección
  if (v.key === 'FREE') {
    if (AVAIL.FREE <= 0) return;
    selection = { planKey: 'FREE' };
  } else {
    const ids = AVAIL.PAID?.[v.key]?.ledgerIds || [];
    if (!ids.length) return;
    // Toma el primer crédito disponible de ese plan
    selection = { planKey: v.key, ledgerId: ids[0] };
  }
}

function setFormBlocked(blocked) {
  const form = $('#post-job-form');
  const btn  = form?.querySelector('[type="submit"], .btn-submit');
  const alert = $('#tu-no-cupos');

  if (blocked) {
    alert?.classList.remove('d-none');
    form?.classList.add('tu-blocked');
    btn && (btn.disabled = true);
  } else {
    alert?.classList.add('d-none');
    form?.classList.remove('tu-blocked');
    btn && (btn.disabled = false);
  }
}

function collectOfferFromForm() {
  const form = $('#post-job-form') || $('form');
  const fd = new FormData(form);
  // Título robusto por varios nombres comunes
  const titulo = (
    fd.get('titulo') || fd.get('title') || fd.get('job_title') ||
    $('input[name="titulo"]')?.value || $('input[name="title"]')?.value ||
    $('input[placeholder*="Título" i]')?.value || 'Aviso'
  ).toString().slice(0,255);

  // Serializa TODO el form como data
  const data = {};
  for (const [k, v] of fd.entries()) {
    if (k === 'titulo' || k === 'title' || k === 'job_title') continue; // ya lo tomamos como titulo
    if (k in data) {
      if (Array.isArray(data[k])) data[k].push(v);
      else data[k] = [data[k], v];
    } else data[k] = v;
  }
  return { titulo, data };
}

// ====== Flujo principal ======
async function loadAvailability() {
  const { employerId, empresaId } = getContextIds();
  if (!employerId || !empresaId) throw new Error('Faltan employerId/empresaId en <body data-*>');
  const d = await getJSON(`${PUBLICATION_API}/available?employerId=${employerId}&empresaId=${empresaId}`);
  AVAIL = {
    FREE: Number(d.FREE || 0),
    PAID: {
      BASICA:   { ledgerIds: d.PAID?.BASICA?.ledgerIds   || d.BASICA   || [] },
      ESTANDAR: { ledgerIds: d.PAID?.ESTANDAR?.ledgerIds || d.ESTANDAR || [] },
      PREMIUM:  { ledgerIds: d.PAID?.PREMIUM?.ledgerIds  || d.PREMIUM  || [] },
    }
  };
}

async function handleSubmit(e) {
  if (SUBMIT_MODE === 'noop') return; // Deja que tu back maneje el POST del form
  e.preventDefault();

  if (!selection) {
    alert('Selecciona el tipo de aviso antes de publicar.');
    return;
  }

  const { employerId, empresaId } = getContextIds();
  const oferta = collectOfferFromForm();

  try {
    const res = await getJSON(`${PUBLICATION_API}/ofertas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employerId, empresaId, selection, oferta })
    });
    // Redirige al manage
    window.location.href = `employer-manage-job.html?id=${res.ofertaId}`;
  } catch (err) {
    alert(err.message || 'No se pudo publicar.');
  }
}

// ====== Bootstrap ======
export async function initPostJob() {
  // Render inicial de las tarjetas
  const host = document.getElementById('tu-plan-selector');
  if (!host) return;
  host.innerHTML = ''; // limpio
  renderCards(host);

  // Trae disponibilidad real y re-renderiza
  try {
    await loadAvailability();
    renderCards(host);
  } catch (e) {
    console.error(e);
    setFormBlocked(true);
  }

  // Intercepta submit (si modo ajax)
  const form = $('#post-job-form') || $('form');
  if (form) form.addEventListener('submit', handleSubmit);
}
