// ====== PUBLICAR OFERTA (CON ASTERISCOS SEGÚN PLAN ACTUALIZADO) ======
const API = BASE_URL_API.replace(/\/$/, "");
const OFERTAS_URL = `${API}/ofertas`;
const STOCK_URL   = `${API}/stock/empresa`;
const PUB_URL     = `${API}/publication`;

let empleadorCtx = { employerId: 0, empresaId: 0 };
let selection = null;

const $  = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));


const selectedCustomTools = new Set(); // 🧠 Estado en memoria

const input = document.getElementById("customToolsInput");
const listContainer = document.getElementById("customToolsList");

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const value = e.target.value.trim();
    if (value && !selectedCustomTools.has(value.toLowerCase())) {
      selectedCustomTools.add(value.toLowerCase());
      renderCustomTools();
      e.target.value = "";
    }
  }
});

function renderCustomTools() {
  listContainer.innerHTML = "";
  selectedCustomTools.forEach((tool) => {
    const badge = document.createElement("span");
    badge.className = "badge bg-primary d-flex align-items-center gap-1";
    badge.innerHTML = `${tool} <i class="fa-solid fa-xmark" style="cursor:pointer;"></i>`;
    badge.querySelector("i").addEventListener("click", () => {
      selectedCustomTools.delete(tool);
      renderCustomTools();
    });
    listContainer.appendChild(badge);
  });
}

// 🔹 Capturar todas las herramientas antes de enviar el formulario
function getHerramientasSeleccionadas() {
  const checks = Array.from(
    document.querySelectorAll(".tools-section input[type='checkbox']:checked")
  ).map(el => el.parentElement.textContent.trim());

  const custom = Array.from(selectedCustomTools);
  return [...new Set([...checks, ...custom])];
}


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

const otrasTools = new Set();
const inputOtras = document.getElementById("customToolsInput");
const listOtras = document.getElementById("customToolsList");

// ➕ Agregar herramienta con Enter o coma
if (inputOtras) {
  inputOtras.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !otrasTools.has(val)) {
        otrasTools.add(val);
        renderOtras();
      }
      e.target.value = "";
    }
  });

  // Guardar también si el usuario hace blur sin presionar Enter
  inputOtras.addEventListener("blur", () => {
    const val = inputOtras.value.trim();
    if (val && !otrasTools.has(val)) {
      otrasTools.add(val);
      renderOtras();
    }
    inputOtras.value = "";
  });
}

// 🧱 Renderizar los chips visualmente
function renderOtras() {
  listOtras.innerHTML = "";
  if (otrasTools.size === 0) {
    listOtras.innerHTML =
      `<small class="text-muted">Agrega otras herramientas que manejes</small>`;
    return;
  }

  Array.from(otrasTools).forEach((tool) => {
    const chip = document.createElement("span");
    chip.className =
      "badge bg-primary text-light d-inline-flex align-items-center gap-1 px-2 py-1 me-1 mb-1";
    chip.innerHTML = `${tool} <i class="fa-solid fa-xmark ms-1" style="cursor:pointer; font-size:13px;"></i>`;
    chip.querySelector("i").addEventListener("click", () => {
      otrasTools.delete(tool);
      renderOtras();
    });
    listOtras.appendChild(chip);
  });
}

// ✅ Captura también lo que el usuario dejó escrito sin confirmar
function getOtrasHerramientas() {
  const val = inputOtras?.value.trim();
  if (val && !otrasTools.has(val)) {
    otrasTools.add(val);
    renderOtras();
  }
  return Array.from(otrasTools);
}



/* ====== FORMULARIO ====== */
function collectOfferForm() {
  const fd = new FormData($("#formulario-publicar"));
  const titulo = String(fd.get("titulo") || "Aviso").slice(0, 255);

  // 🧩 usar los mismos nombres del form (con prefijo data.)
  const area_trabajo = String(fd.get("data.area_trabajo") || "");
  const nivel_experiencia = String(fd.get("data.nivel_experiencia") || "");
  const anios_experiencia = Number(fd.get("data.anios_experiencia") || 0) || null;
  const direccion_trabajo = String(fd.get("data.direccion_trabajo") || "");
  const region = String(fd.get("data.region") || "");
  const tipo_contrato = String(fd.get("data.tipo_contrato") || "");
  const educacion_requerida = String(fd.get("data.educacion_requerida") || "");
  const modalidad_val = String(fd.get("data.modalidad") || "");
  const numero_vacantes = Number(fd.get("data.numero_vacantes") || 0) || null;
  const descripcion_puesto = String(fd.get("data.descripcion_puesto") || "");
  const responsabilidades = splitLines(fd.get("data.responsabilidades"));
  const requisitos_minimos = splitLines(fd.get("data.requisitos_minimos"));
  const beneficios = splitLines(fd.get("data.beneficios"));

  // 💰 Renta Salarial
  const renta_desde = Number(String(fd.get("renta_desde") || "").replace(/[^0-9]/g, "")) || null;
  const renta_hasta = Number(String(fd.get("renta_hasta") || "").replace(/[^0-9]/g, "")) || null;
  const de_acuerdo_al_mercado = !!fd.get("renta_de_mercado");

  // ♿ Accesibilidad
  const acepta_discapacitados = !!fd.get("acepta_discapacitados");
/* ============================================================
   🧰 Herramientas básicas — checkboxes + input libre + chips (con cache)
============================================================ */
// 🧰 Herramientas básicas (checkboxes)
const herramientas_basicas = Array.from(
  document.querySelectorAll(".tools-section input[type='checkbox']:checked")
)
  .map((el) => el.parentElement.textContent.trim())
  .filter(Boolean);

  const otras_herramientas = getOtrasHerramientas();



  // ❓ Preguntas personalizadas
  const preguntas_personalizadas = Array.from(
    document.querySelectorAll('#preguntas-container input[name^="pregunta_"]')
  )
    .map(i => i.value.trim())
    .filter(Boolean);

  return {
    titulo,
    dataObj: {
      area_trabajo,
      nivel_experiencia,
      anios_experiencia,
      direccion_trabajo,
      region,
      educacion_requerida,
      tipo_contrato,
      modalidad: modalidad_val,
      numero_vacantes,
      descripcion_puesto,
      responsabilidades,
      requisitos_minimos,
      beneficios,
      acepta_discapacitados,
      renta_salarial: {
        desde: renta_desde,
        hasta: renta_hasta,
        de_acuerdo_al_mercado,
      },
      herramientas_basicas,
      otras_herramientas,
      preguntas_personalizadas,
    },
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
function aplicarReglasPorPlan(plan) {
  const preguntasSection = document.getElementById("preguntas-section");
  const preguntasBtn = document.getElementById("agregar-pregunta");
  const preguntasCont = document.getElementById("preguntas-container");

  // Todos los campos del formulario
  const fieldIds = [
    "titulo","area_cargo_select","anios_experiencia","region-select",
    "educacion_requerida","tipo_contrato","modalidad","descripcion",
    "responsabilidades","requisitos","beneficios",
    "salaryFrom","salaryTo","otras_herramientas"
  ];

  // 🔁 Reset: todos obligatorios + mostramos sección por defecto
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.required = true;
    setAsterisk(id, true);
  });

  // Mostrar sección completa por defecto
  if (preguntasSection) preguntasSection.style.display = "block";
  if (preguntasBtn) preguntasBtn.style.display = "inline-block";
  if (preguntasCont) preguntasCont.style.display = "block";

  switch (plan) {

    /* =============================
       🆓 PLAN FREE → OCULTAR TODO
       ============================= */
    case "FREE":
      if (preguntasSection) preguntasSection.style.display = "none";
      break;

    /* =============================
       🅱️ PLAN BÁSICO → FULL
       ============================= */
    case "BASICO":
      // sin cambios, todo visible
      break;

    /* =============================
       🅴 PLAN ESTÁNDAR
       ============================= */
    case "ESTANDAR":
      ["salaryFrom","salaryTo","otras_herramientas"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = false;
        setAsterisk(id, false);
      });
      break;

    /* =============================
       🅿️ PLAN PREMIUM
       ============================= */
    case "PREMIUM":
      ["tipo_contrato","modalidad","salaryFrom","salaryTo","otras_herramientas"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.required = false;
          setAsterisk(id, false);
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
  const now = new Date();
  const fecha_publicacion = now.toISOString();
  const fecha_cierre = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
  
  const fechaPublicacionFormateada = new Date(fecha_publicacion).toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const token=getAnyToken();
  const headers={ "Content-Type":"application/json" };
  if(token) headers.Authorization=`Bearer ${token}`;
  const payload = {
    titulo,
    empresa_id: empleadorCtx.empresaId,
    empleador_id: empleadorCtx.employerId,
    fecha_publicacion,
    duracion_publicacion: 30,
    es_activa: true,
    fecha_cierre,
    tipo_aviso: selection.planKey === "FREE" ? "GRATIS" : selection.planKey,
    estado: "PUBLICADA",
    data: dataObj // ✅ Envía el objeto anidado directamente
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
    📅 <b>Fecha de publicación:</b> ${fechaPublicacionFormateada}
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
