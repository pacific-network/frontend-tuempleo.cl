// ../assets/js/modules/empresa/dashboard-availability.js
(function () {
  // === BASE exactamente igual que en tu publicar-oferta ===
  const API = (window.BASE_URL_API || "").replace(/\/$/, "");
  let empleadorCtx = { employerId: 0, empresaId: 0 };

  // ================== Helpers (copiados de PUBLICAR OFERTA) ==================
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
    // Igual que en tu código: primero /empleador/userid/{sub}, luego /empleador/{sub}
    const u1 = `${API}/empleador/${sub}`;
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

  // ================== Carga de datos (idéntico criterio) ==================
  async function loadStock() {
    const token = getAnyToken();
    const res = await fetch(`${API}/stock/empresa/${empleadorCtx.empresaId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error(`Stock HTTP ${res.status}`);
    const j = await res.json();
    const map = { BASICO:0, ESTANDAR:0, PREMIUM:0 };
    (j?.stock||[]).forEach(s=>{
      const k = String(s?.tipoAviso||"").toUpperCase(); // BASICO|ESTANDAR|PREMIUM
      if (map[k] !== undefined) map[k] = Number(s?.cantidad_disponible||0);
    });
    return map; // { BASICO, ESTANDAR, PREMIUM }
  }

  async function loadFreeRemaining(){
    const res = await fetch(`${API}/publication/free/remaining?employerId=${empleadorCtx.employerId}`);
    if (!res.ok) throw new Error(`FREE HTTP ${res.status}`);
    const j = await res.json();
    return Number(j?.remaining ?? 0);
  }

  // ================== Pintado en tarjetas ==================
  function paintCounters({ free, BASICO, ESTANDAR, PREMIUM }) {
    const $free = document.getElementById('avail-free');
    const $ba   = document.getElementById('avail-basica');
    const $es   = document.getElementById('avail-estandar');
    const $pr   = document.getElementById('avail-premium');

    if ($free) $free.textContent = Number(free)||0;
    if ($ba)   $ba.textContent   = Number(BASICO)||0;
    if ($es)   $es.textContent   = Number(ESTANDAR)||0;
    if ($pr)   $pr.textContent   = Number(PREMIUM)||0;
  }

  // ================== INIT ==================
  async function init(){
    try{
      await ensureContext();
      const [stock, free] = await Promise.all([loadStock(), loadFreeRemaining()]);
      paintCounters({ free, ...stock });
    }catch(err){
      // deja 0/0/0/0 si algo falla, pero loguea para debug
      console.warn('[dashboard-availability] No se pudo cargar:', err);
      paintCounters({ free:0, BASICO:0, ESTANDAR:0, PREMIUM:0 });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
