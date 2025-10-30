// ====== PUBLICAR OFERTA (FINAL CORREGIDO) ======
// - Restaura compatibilidad con backend: modalidad guarda valor crudo + modalidad_text legible
// - region, comuna y tipo_contrato usan el value del select (como antes)
// - Mantiene todo el flujo GRATIS / pagado y toasts

const API = BASE_URL_API.replace(/\/$/, "");
const OFERTAS_URL = `${API}/ofertas`;
const STOCK_URL   = `${API}/stock/empresa`;
const PUB_URL     = `${API}/publication`;

let empleadorCtx = { employerId: 0, empresaId: 0 };
let selection = null;

const $  = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

/* ========== Auth / contexto ========== */
function getAnyToken() {
  const keys = ["token","auth_token","authToken","accessToken","jwt","Authorization","authorization"];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v && v.split(".").length===3) return v.replace(/^Bearer\s+/i,"");
  }
  for (const store of [localStorage, sessionStorage]) {
    for (let i=0;i<store.length;i++){
      const v = store.getItem(store.key(i));
      if (v && v.split(".").length===3) return v.replace(/^Bearer\s+/i,"");
    }
  }
  return null;
}
function parseJwtSub(token){
  try{
    const b64 = token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    const json = decodeURIComponent(atob(b64).split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return Number(JSON.parse(json).sub)||null;
  }catch{ return null; }
}
async function fetchEmployerBySub(sub, token){
  const opts = token ? { headers:{ Authorization:"Bearer "+token } } : {};
  const u1 = `${API}/empleador/userid/${sub}`;
  const r1 = await fetch(u1, opts);
  if(r1.ok) return r1.json();
  const u2 = `${API}/empleador/${sub}`;
  const r2 = await fetch(u2, opts);
  if(r2.ok) return r2.json();
  throw new Error("No se pudo obtener empleador");
}
async function ensureContext(){
  const b = document.body;
  const token = getAnyToken();
  if(!token) throw new Error("Sin token");
  const sub = parseJwtSub(token);
  if(!sub) throw new Error("Token sin sub");
  const emp = await fetchEmployerBySub(sub, token);
  const employerId = Number(emp?.id||0);
  const empresaId  = Number(emp?.empresa?.id || emp?.usuario?.id_empresa || 0);
  if(!employerId || !empresaId) throw new Error("ctx incompleto");
  b.setAttribute("data-employer-id", String(employerId));
  b.setAttribute("data-empresa-id",  String(empresaId));
  empleadorCtx = { employerId, empresaId };
  return empleadorCtx;
}

/* ========== Helpers ========== */
function splitLines(v){ return String(v||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean); }

function getModalidadLabel(v){
  const m = String(v || "");
  return m==="1" ? "Full Time"
       : m==="2" ? "Part Time"
       : m==="3" ? "Remoto"
       : m==="4" ? "Freelancer"
       : m==="5" ? "Temporal"
       : "";
}

/* ========== Construcción de datos del formulario (RESTABLECIDO) ========== */
function collectOfferForm(){
  const fd = new FormData($("#formulario-publicar"));

  const titulo = String(fd.get("titulo")||"Aviso").slice(0,255);
  const area_trabajo = String(fd.get("area_cargo")||"");
  const anios_experiencia = String(fd.get("anios_experiencia")||"");

  // 🔁 vuelven a usarse los value del select
  const region = String(fd.get("region")||"");
  const comuna = String(fd.get("comuna")||"");
  const tipo_contrato = String(fd.get("tipo_contrato")||"");
  const educacion_requerida = String(fd.get("educacion_requerida")||"");

  // ✅ modalidad con valor y texto
  const modalidad_val  = String(fd.get("modalidad") || "");
  const modalidad_text = getModalidadLabel(modalidad_val);

  const descripcion_puesto = String(fd.get("descripcion_puesto")||"");
  const responsabilidades  = splitLines(fd.get("responsabilidades"));
  const requisitos_minimos = splitLines(fd.get("requisitos_minimos"));
  const beneficios         = splitLines(fd.get("beneficios"));

  const renta_desde = Number(String(fd.get("renta_desde")||"").replace(/[^0-9]/g,"")) || null;
  const renta_hasta = Number(String(fd.get("renta_hasta")||"").replace(/[^0-9]/g,"")) || null;

  const marcadas = Array.from(document.querySelectorAll('#checkbox-container input[type="checkbox"]:checked')).map(x=>x.value);
  const otras = String(fd.get("otras_herramientas")||"").split(",").map(s=>s.trim()).filter(Boolean);
  const herramientas = [...marcadas, ...otras].filter(Boolean);

  const preguntasInputs = document.querySelectorAll('#preguntas-container input[name^="pregunta_"]');
  const preguntas_personalizadas = Array.from(preguntasInputs).map(i=>i.value.trim()).filter(Boolean);

  const dataObj = {
    titulo,
    area_trabajo,
    anios_experiencia,
    region,
    comuna,
    tipo_contrato,
    educacion_requerida,
    modalidad: modalidad_val,       // valor crudo
    modalidad_text,                 // texto legible
    descripcion_puesto,
    responsabilidades,
    requisitos_minimos,
    beneficios,
    renta_salarial: { desde: renta_desde, hasta: renta_hasta, de_acuerdo_al_mercado: true },
    herramientas_basicas: herramientas,
    preguntas_personalizadas,
    // alias
    area: area_trabajo,
    experiencia: anios_experiencia,
    educacion: educacion_requerida,
    descripcion: descripcion_puesto,
    requisitos: requisitos_minimos,
    renta: { desde: renta_desde, hasta: renta_hasta },
    herramientas
  };

  return { titulo, dataObj };
}

/* ========== STOCK + FREE ========== */
let STOCK = { BASICO:0, ESTANDAR:0, PREMIUM:0 };
let FREE_REMAINING = 0;

async function loadStock() {
  const token = getAnyToken();
  const res = await fetch(`${STOCK_URL}/${empleadorCtx.empresaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j = await res.json();
  const map = { BASICO:0, ESTANDAR:0, PREMIUM:0 };
  (j?.stock||[]).forEach(s=>{
    const k = String(s?.tipoAviso||"").toUpperCase();
    if (map[k] !== undefined) map[k] = Number(s?.cantidad_disponible||0);
  });
  STOCK = map;
}
async function loadFreeRemaining(){
  const res = await fetch(`${PUB_URL}/free/remaining?employerId=${empleadorCtx.employerId}`);
  const j = await res.json();
  FREE_REMAINING = Number(j?.remaining ?? 0);
}

/* ========== Picker ========== */
function renderPicker(){
  const grid = $("#plan-picker");
  if(!grid) return;
  grid.innerHTML = `
    <button type="button" class="tu-card-plan ${FREE_REMAINING<=0?'disabled':''}" data-plan="FREE">
      <div class="tu-card-title">Gratis</div>
      <div class="tu-card-badge">${Math.max(FREE_REMAINING,0)}</div>
      <div class="tu-card-info">Restantes del mes</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.BASICO<=0?'disabled':''}" data-plan="BASICO">
      <div class="tu-card-title">Básico</div>
      <div class="tu-card-badge">${STOCK.BASICO}</div>
      <div class="tu-card-info">Stock disponible</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.ESTANDAR<=0?'disabled':''}" data-plan="ESTANDAR">
      <div class="tu-card-title">Estándar</div>
      <div class="tu-card-badge">${STOCK.ESTANDAR}</div>
      <div class="tu-card-info">Stock disponible</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.PREMIUM<=0?'disabled':''}" data-plan="PREMIUM">
      <div class="tu-card-title">Premium</div>
      <div class="tu-card-badge">${STOCK.PREMIUM}</div>
      <div class="tu-card-info">Stock disponible</div>
    </button>
  `;
  $("#no-cupos-alert")?.classList.toggle(
    "d-none",
    FREE_REMAINING>0 || STOCK.BASICO>0 || STOCK.ESTANDAR>0 || STOCK.PREMIUM>0
  );
  refreshSubmitState();
}
function refreshSubmitState(){
  $("#btn-submit").disabled = !selection;
  $("#formulario-publicar")?.classList.toggle("tu-blocked", !selection);
}
function setSelection(planKey){
  selection = { planKey };
  $$(".tu-card-plan").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.tu-card-plan[data-plan="${planKey}"]`)?.classList.add("active");
  $("#chosen-text").textContent = planKey==='FREE'
    ? `Plan GRATIS · se usará 1 cupo mensual`
    : `Plan ${planKey} · se descontará 1 crédito de stock`;
  $("#chosen-pill").classList.remove("d-none");
  $("#no-choice-msg").classList.add("d-none");
  refreshSubmitState();
}

document.addEventListener("click",(e)=>{
  const b = e.target.closest(".tu-card-plan");
  if(!b || b.classList.contains("disabled")) return;
  const plan = b.getAttribute("data-plan");
  if (plan==='FREE' && FREE_REMAINING<=0) return;
  if (plan!=='FREE' && (STOCK[plan]||0)<=0) return;
  setSelection(plan);
});

/* ========== Crear oferta ========== */
async function crearOfertaYConsumir(e){
  e.preventDefault();
  if(!selection){
    await Swal.fire("Selecciona un plan","Debes elegir GRATIS o un plan con stock.","warning");
    return;
  }

  const btn = $("#btn-submit");
  const prev = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Publicando...`;

  const { titulo, dataObj } = collectOfferForm();
  const now = new Date();
  const fecha_publicacion = now.toISOString();
  const fecha_cierre = new Date(now.getTime() + 30*24*3600*1000).toISOString();

  const token = getAnyToken();
  const headers = { "Content-Type":"application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const payload = {
    titulo,
    empresa_id: empleadorCtx.empresaId,
    empleador_id: empleadorCtx.employerId,
    fecha_publicacion,
    duracion_publicacion: 30,
    es_activa: true,
    fecha_cierre,
    tipo_aviso: selection.planKey === "FREE" ? "GRATIS" : selection.planKey,
    data: JSON.stringify(dataObj)
  };

  try{
    const r = await fetch(OFERTAS_URL, { method:"POST", headers, body: JSON.stringify(payload) });
    const text = await r.text();
    let j = {};
    try { j = JSON.parse(text); } catch {}
    const ofertaId = Number(j?.id || j?.data?.id || j?.ofertaId || 0);

    if (!r.ok && !ofertaId) throw new Error(j?.message || "Error al crear la oferta");

    if (selection.planKey === "FREE") {
      try {
        const resv = await fetch(`${PUB_URL}/reservations`, {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ employerId: empleadorCtx.employerId, planKey: 'FREE' })
        });
        if(resv.ok){
          const d = await resv.json();
          await fetch(`${PUB_URL}/confirm`, {
            method:"POST", headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ reservationId: d.reservationId, ofertaId })
          });
        }
        FREE_REMAINING = Math.max(0, FREE_REMAINING-1);
      } catch(e){ console.warn("FREE flow error", e); }
    }

    await Swal.fire({
      icon:"success",
      title:"¡Oferta publicada!",
      html:`Tu aviso fue publicado correctamente.<br>ID de oferta: <code>${ofertaId}</code>`,
      confirmButtonText:"Ir a gestionar aviso",
      showCancelButton:true,
      cancelButtonText:"Seguir aquí"
    }).then(res=>{
      if(res.isConfirmed) window.location.href = "employer-manage-job.html?id="+ofertaId;
    });

    renderPicker();
    setSelection(selection.planKey);

  } catch(err){
    console.error(err);
    await Swal.fire("Error", err?.message || "No se pudo publicar la oferta", "error");
  } finally {
    btn.disabled = !selection;
    btn.innerHTML = prev;
  }
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    await ensureContext();
    await Promise.all([loadStock(), loadFreeRemaining()]);
  }catch(e){
    console.warn(e);
    await Swal.fire("Sesión/Stock","No se pudo cargar contexto o stock.","warning");
  }
  renderPicker();
  $("#chosen-pill").classList.add("d-none");
  $("#no-choice-msg").classList.remove("d-none");
  $("#formulario-publicar")?.addEventListener("submit", crearOfertaYConsumir);
});
