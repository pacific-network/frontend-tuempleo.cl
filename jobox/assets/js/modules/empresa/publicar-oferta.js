// ====== PUBLICAR OFERTA ======
// - Muestra stock (BASICO/ESTANDAR/PREMIUM) y cupo FREE/mes
// - En el POST /v1/ofertas envía tipo_aviso
// - Tras publicar, descuenta del stock (pagados) o consume FREE (publication)

const API = BASE_URL_API.replace(/\/$/, "");
const OFERTAS_URL = `${API}/ofertas`;
const STOCK_URL   = `${API}/stock/empresa`;
const PUB_URL     = `${API}/publication`;

let empleadorCtx = { employerId: 0, empresaId: 0 };
let selection = null; // { planKey: 'FREE'|'BASICO'|'ESTANDAR'|'PREMIUM' }

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

/* ========== UI helpers ========== */
function showToast(title, body){
  $("#toastTitle").textContent = title||"Mensaje";
  $("#toastBody").textContent  = body||"";
  new bootstrap.Toast($("#liveToast")).show();
}
function splitLines(v){ return String(v||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean); }
function mapModalidad(v){
  const m=String(v||"");
  return m==="1"?"Full Time":m==="2"?"Part Time":m==="3"?"Remoto":m==="4"?"Freelancer":m==="5"?"Temporal":"";
}
function collectOfferForm(){
  const fd = new FormData($("#formulario-publicar"));
  const titulo = String(fd.get("titulo")||"Aviso").slice(0,255);

  const herrMarcadas = Array.from(document.querySelectorAll('#checkbox-container input[type="checkbox"]:checked')).map(x=>x.value);
  const otras = String(fd.get("otras_herramientas")||"").split(",").map(s=>s.trim()).filter(Boolean);
  const herramientas = [...herrMarcadas, ...otras].filter(Boolean);

  const dataObj = {
    area: String(fd.get("area_cargo")||""),
    experiencia: String(fd.get("anios_experiencia")||""),
    region: String(fd.get("region")||""),
    educacion: String(fd.get("educacion_requerida")||""),
    tipo_contrato: String(fd.get("tipo_contrato")||""),
    modalidad: mapModalidad(fd.get("modalidad")),
    descripcion: String(fd.get("descripcion_puesto")||""),
    responsabilidades: splitLines(fd.get("responsabilidades")),
    requisitos: splitLines(fd.get("requisitos_minimos")),
    beneficios: splitLines(fd.get("beneficios")),
    renta: {
      desde: Number(String(fd.get("renta_desde")||"").replace(/[^0-9]/g,"")) || null,
      hasta: Number(String(fd.get("renta_hasta")||"").replace(/[^0-9]/g,"")) || null
    },
    herramientas
  };
  return { titulo, dataObj };
}

/* ========== STOCK + FREE desde backend ========== */
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
  selection = { planKey }; // FREE | BASICO | ESTANDAR | PREMIUM
  $$(".tu-card-plan").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.tu-card-plan[data-plan="${planKey}"]`)?.classList.add("active");
  $("#chosen-text").textContent = planKey==='FREE'
    ? `Plan FREE · se usará 1 cupo mensual`
    : `Plan ${planKey} · se descontará 1 crédito de stock`;
  $("#chosen-pill").classList.remove("d-none");
  $("#no-choice-msg").classList.add("d-none");
  refreshSubmitState();
}

document.addEventListener("click",(e)=>{
  const b = e.target.closest(".tu-card-plan");
  if(!b || b.classList.contains("disabled")) return;
  const plan = b.getAttribute("data-plan");
  // reglas: FREE según cuota; pagados según stock
  if (plan==='FREE' && FREE_REMAINING<=0) return;
  if (plan!=='FREE' && (STOCK[plan]||0)<=0) return;
  setSelection(plan);
});
$("#btn-change-choice")?.addEventListener("click", ()=>{
  selection = null;
  $$(".tu-card-plan").forEach(n=>n.classList.remove("active"));
  $("#chosen-pill").classList.add("d-none");
  $("#no-choice-msg").classList.remove("d-none");
  refreshSubmitState();
});

/* ========== Crear oferta + consumir cupo ========== */
async function crearOfertaYConsumir(e){
  e.preventDefault();
  if(!selection){
    await Swal.fire("Selecciona un plan","Debes elegir FREE o un plan con stock.","warning");
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

  // Enviar tipo_aviso para eliminar validación del backend
  const payload = {
    titulo,
    empresa_id: empleadorCtx.empresaId,
    empleador_id: empleadorCtx.employerId,
    fecha_publicacion,
    duracion_publicacion: 30,
    es_activa: true,
    fecha_cierre,
    tipo_aviso: selection.planKey,        // <<<<<< CLAVE
    data: JSON.stringify(dataObj)
  };

  try{
    // 1) crear oferta
    const r = await fetch(OFERTAS_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if(!r.ok) throw new Error(j?.message||"Error al crear la oferta");
    const ofertaId = Number(j?.id || j?.ofertaId || j?.insertId || j?.data?.id || 0);

    // 2) consumir cupo
    if (selection.planKey === 'FREE') {
      // FREE usa reserva + confirm (publication)
      const resvRes = await fetch(`${PUB_URL}/reservations`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ employerId: empleadorCtx.employerId, planKey: 'FREE' })
      });
      const resv = await resvRes.json();
      if(!resvRes.ok) throw new Error(resv?.message || "No se pudo reservar FREE");
      const confRes = await fetch(`${PUB_URL}/confirm`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ reservationId: resv.reservationId, ofertaId })
      });
      if(!confRes.ok){
        const e2 = await confRes.json().catch(()=>({}));
        throw new Error(e2?.message || "No se pudo confirmar FREE");
      }
      FREE_REMAINING = Math.max(0, FREE_REMAINING-1);
    } else {
      // Pagados: consume stock de tu endpoint real (usar/Tipo)
      const tipo = selection.planKey; // BASICO|ESTANDAR|PREMIUM
      const token = getAnyToken();
      const useRes = await fetch(`${STOCK_URL}/${empleadorCtx.empresaId}/usar/${tipo}`, {
        method:"POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if(!useRes.ok){
        const e = await useRes.json().catch(()=>({}));
        console.warn("No se pudo descontar stock:", e?.message||useRes.status);
        showToast("Publicación creada", "No se pudo descontar stock automáticamente. Revisa el endpoint usar/:tipoAviso.");
      } else {
        STOCK[tipo] = Math.max(0, (STOCK[tipo]||0)-1);
      }
    }

    // 3) feedback + refrescar visual
    await Swal.fire({
      icon:"success",
      title:"¡Oferta publicada!",
      html:`Tu aviso fue publicado correctamente.<br>Id de oferta: <code>${ofertaId}</code>`,
      confirmButtonText:"Ir a gestionar aviso",
      showCancelButton:true,
      cancelButtonText:"Seguir aquí"
    }).then(res=>{
      if(res.isConfirmed) window.location.href = "employer-manage-job.html?id="+ofertaId;
    });

    renderPicker();
    setSelection(selection.planKey); // mantener pill
  }catch(err){
    console.error(err);
    await Swal.fire("No se pudo publicar", err?.message||"Error al publicar el aviso", "error");
  }finally{
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
    await Swal.fire("Sesión/Stock","No se pudo cargar contexto o stock.", "warning");
  }
  renderPicker();
  $("#chosen-pill").classList.add("d-none");
  $("#no-choice-msg").classList.remove("d-none");
  $("#formulario-publicar")?.addEventListener("submit", crearOfertaYConsumir);
});
