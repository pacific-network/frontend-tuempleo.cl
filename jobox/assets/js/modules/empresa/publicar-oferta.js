// ====== PUBLICAR OFERTA (CON ASTERISCOS SEGÚN PLAN ACTUALIZADO) ======
const API = BASE_URL_API.replace(/\/$/, "");
const OFERTAS_URL = `${API}/ofertas`;
const STOCK_URL   = `${API}/stock/empresa`;
const PUB_URL     = `${API}/publication`;

let empleadorCtx = { employerId: 0, empresaId: 0 };
let selection = null;

const $  = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

/* ====== TOKEN Y CONTEXTO ====== */
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
  const token = getAnyToken();
  if(!token) throw new Error("Sin token");
  const sub = parseJwtSub(token);
  if(!sub) throw new Error("Token sin sub");
  const emp = await fetchEmployerBySub(sub, token);
  const employerId = Number(emp?.id||0);
  const empresaId  = Number(emp?.empresa?.id || emp?.usuario?.id_empresa || 0);
  empleadorCtx = { employerId, empresaId };
  return empleadorCtx;
}

/* ====== HELPERS ====== */
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

/* ====== ASTERISCOS ====== */
function setAsterisk(fieldId, show){
  const label = document.querySelector(`label[for="${fieldId}"]`);
  if(!label) return;
  let star = label.querySelector(".required-star");
  if(!star){
    star = document.createElement("span");
    star.className = "required-star";
    star.style.color = "red";
    star.style.marginLeft = "4px";
    star.textContent = "*";
    label.appendChild(star);
  }
  star.style.display = show ? "inline" : "none";
}

/* ====== FORMULARIO ====== */
function collectOfferForm(){
  const fd = new FormData($("#formulario-publicar"));
  const titulo = String(fd.get("titulo")||"Aviso").slice(0,255);
  const area_trabajo = String(fd.get("area_cargo")||"");
  const anios_experiencia = String(fd.get("anios_experiencia")||"");
  const region = String(fd.get("region")||"");
  const comuna = String(fd.get("comuna")||"");
  const tipo_contrato = String(fd.get("tipo_contrato")||"");
  const educacion_requerida = String(fd.get("educacion_requerida")||"");
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

  return {
    titulo,
    dataObj: {
      titulo,
      area_trabajo,
      anios_experiencia,
      region,
      comuna,
      tipo_contrato,
      educacion_requerida,
      modalidad: modalidad_val,
      modalidad_text,
      descripcion_puesto,
      responsabilidades,
      requisitos_minimos,
      beneficios,
      renta_salarial: { desde: renta_desde, hasta: renta_hasta, de_acuerdo_al_mercado: true },
      herramientas_basicas: herramientas,
      preguntas_personalizadas,
    }
  };
}

/* ====== STOCK ====== */
let STOCK = { BASICO:0, ESTANDAR:0, PREMIUM:0 };
let FREE_REMAINING = 0;
async function loadStock(){
  const token = getAnyToken();
  const res = await fetch(`${STOCK_URL}/${empleadorCtx.empresaId}`,{
    headers:{ Authorization:`Bearer ${token}` }
  });
  const j = await res.json();
  const map = { BASICO:0, ESTANDAR:0, PREMIUM:0 };
  (j?.stock||[]).forEach(s=>{
    const k = String(s?.tipoAviso||"").toUpperCase();
    if(map[k]!==undefined) map[k]=Number(s?.cantidad_disponible||0);
  });
  STOCK = map;
}
async function loadFreeRemaining(){
  const res = await fetch(`${PUB_URL}/free/remaining?employerId=${empleadorCtx.employerId}`);
  const j = await res.json();
  FREE_REMAINING = Number(j?.remaining ?? 0);
}

/* ====== REGLAS POR PLAN ====== */
function aplicarReglasPorPlan(plan){
  const preguntasBtn=$("#agregar-pregunta");
  const preguntasCont=$("#preguntas-container");

  // Todos los campos del formulario
  const fieldIds = [
    "titulo","area_cargo_select","anios_experiencia","region-select",
    "educacion_requerida","tipo_contrato","modalidad","descripcion",
    "responsabilidades","requisitos","beneficios",
    "salaryFrom","salaryTo","otras_herramientas"
  ];

  // 🔁 Reset: todos obligatorios
  fieldIds.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.required = true;
    setAsterisk(id,true);
  });

  preguntasBtn.disabled = false;
  preguntasCont.classList.remove("opacity-50");

  switch(plan){
    case "FREE":
      // Todo obligatorio, sin preguntas
      preguntasBtn.disabled = true;
      preguntasCont.classList.add("opacity-50");
      break;

    case "BASICO":
      // Todo obligatorio, puede agregar preguntas
      break;

    case "ESTANDAR":
      // Sueldo y herramientas no obligatorios
      ["salaryFrom","salaryTo","otras_herramientas"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.required=false;
        setAsterisk(id,false);
      });
      break;

    case "PREMIUM":
      // Contrato, modalidad, sueldo, herramientas no obligatorios
      ["tipo_contrato","modalidad","salaryFrom","salaryTo","otras_herramientas"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.required=false;
        setAsterisk(id,false);
      });
      break;
  }
}

/* ====== PICKER ====== */
function renderPicker(){
  const grid=$("#plan-picker");
  if(!grid) return;
  grid.innerHTML=`
    <button type="button" class="tu-card-plan ${FREE_REMAINING<=0?'disabled':''}" data-plan="FREE">
      <div class="tu-card-title">Gratis</div><div class="tu-card-badge">${Math.max(FREE_REMAINING,0)}</div><div class="tu-card-info">Restantes</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.BASICO<=0?'disabled':''}" data-plan="BASICO">
      <div class="tu-card-title">Básico</div><div class="tu-card-badge">${STOCK.BASICO}</div><div class="tu-card-info">Stock</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.ESTANDAR<=0?'disabled':''}" data-plan="ESTANDAR">
      <div class="tu-card-title">Estándar</div><div class="tu-card-badge">${STOCK.ESTANDAR}</div><div class="tu-card-info">Stock</div>
    </button>
    <button type="button" class="tu-card-plan ${STOCK.PREMIUM<=0?'disabled':''}" data-plan="PREMIUM">
      <div class="tu-card-title">Premium</div><div class="tu-card-badge">${STOCK.PREMIUM}</div><div class="tu-card-info">Stock</div>
    </button>`;
  $("#no-cupos-alert")?.classList.toggle("d-none",FREE_REMAINING>0||STOCK.BASICO>0||STOCK.ESTANDAR>0||STOCK.PREMIUM>0);
  refreshSubmitState();
}

/* ====== ESTADO FORM ====== */
function refreshSubmitState(){
  $("#btn-submit").disabled=!selection;
  $("#formulario-publicar")?.classList.toggle("tu-blocked",!selection);
}

/* ====== SELECCIONAR PLAN ====== */
function setSelection(planKey){
  selection={planKey};
  $$(".tu-card-plan").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.tu-card-plan[data-plan="${planKey}"]`)?.classList.add("active");
  $("#chosen-text").textContent=planKey==='FREE'
    ? `Plan GRATIS · se usará 1 cupo mensual`
    : `Plan ${planKey} · se descontará 1 crédito`;
  $("#chosen-pill").classList.remove("d-none");
  $("#no-choice-msg").classList.add("d-none");
  refreshSubmitState();
  aplicarReglasPorPlan(planKey);
}

/* ====== ANULAR ELECCIÓN ====== */
$("#btn-change-choice")?.addEventListener("click",()=>{
  selection=null;
  $$(".tu-card-plan").forEach(n=>n.classList.remove("active"));
  $("#chosen-pill").classList.add("d-none");
  $("#no-choice-msg").classList.remove("d-none");
  $("#btn-submit").disabled=true;
  $("#formulario-publicar").classList.add("tu-blocked");
  $$(".required-star").forEach(s=>s.style.display="none");
});

/* ====== CLICK EN PLAN ====== */
document.addEventListener("click",(e)=>{
  const b=e.target.closest(".tu-card-plan");
  if(!b||b.classList.contains("disabled"))return;
  const plan=b.getAttribute("data-plan");
  if(plan==='FREE'&&FREE_REMAINING<=0)return;
  if(plan!=='FREE'&&(STOCK[plan]||0)<=0)return;
  setSelection(plan);
});

/* ====== CREAR OFERTA ====== */
async function crearOfertaYConsumir(e){
  e.preventDefault();
  if(!selection){
    await Swal.fire("Selecciona un plan","Debes elegir GRATIS o un plan con stock.","warning");
    return;
  }
  const btn=$("#btn-submit");
  const prev=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span> Publicando...`;

  const { titulo, dataObj }=collectOfferForm();
  const now=new Date();
  const fecha_publicacion=now.toISOString();
  const fecha_cierre=new Date(now.getTime()+30*24*3600*1000).toISOString();

  const token=getAnyToken();
  const headers={ "Content-Type":"application/json" };
  if(token) headers.Authorization=`Bearer ${token}`;

  const payload={
    titulo,
    empresa_id:empleadorCtx.empresaId,
    empleador_id:empleadorCtx.employerId,
    fecha_publicacion,
    duracion_publicacion:30,
    es_activa:true,
    fecha_cierre,
    tipo_aviso:selection.planKey==="FREE"?"GRATIS":selection.planKey,
    data:JSON.stringify(dataObj)
  };

  try{
    const r=await fetch(OFERTAS_URL,{method:"POST",headers,body:JSON.stringify(payload)});
    const j=await r.json();
    const ofertaId=Number(j?.id||j?.data?.id||j?.ofertaId||0);
    if(!r.ok&&!ofertaId) throw new Error(j?.message||"Error al crear la oferta");

    await Swal.fire({
      icon:"success",
      title:"¡Oferta publicada!",
      html:`Tu aviso fue publicado correctamente.<br>
<strong>Oferta:</strong> <code>${titulo}</code><br>
📅 Fecha de publicación: <strong>${fecha_publicacion}</strong>
`,
      confirmButtonText:"Ir a gestionar aviso",
      showCancelButton:true,
      cancelButtonText:"Seguir aquí"
    }).then(res=>{
      if(res.isConfirmed) window.location.href="employer-manage-job.html?id="+ofertaId;
    });

    renderPicker();
    setSelection(selection.planKey);

  }catch(err){
    console.error(err);
    await Swal.fire("Error",err?.message||"No se pudo publicar la oferta","error");
  }finally{
    btn.disabled=!selection;
    btn.innerHTML=prev;
  }
}

/* ====== INIT ====== */
document.addEventListener("DOMContentLoaded",async()=>{
  try{
    await ensureContext();
    await Promise.all([loadStock(),loadFreeRemaining()]);
  }catch(e){
    console.warn(e);
    await Swal.fire("Sesión/Stock","No se pudo cargar contexto o stock.","warning");
  }
  renderPicker();
  $("#chosen-pill").classList.add("d-none");
  $("#no-choice-msg").classList.remove("d-none");
  $("#formulario-publicar")?.addEventListener("submit",crearOfertaYConsumir);
});
