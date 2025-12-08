export function renderizarRentaPorPlan(plan) {
    const range = document.getElementById("salary-range");
    const market = document.getElementById("salary-market");
  
    const from = document.getElementById("salaryFrom");
    const to = document.getElementById("salaryTo");
    const mercado = document.getElementById("acuerdoMercado");
  
    if (!range || !market || !from || !to || !mercado) return;
  
    // Normalizar plan FREE → GRATIS
    const p = plan === "FREE" ? "GRATIS" : plan;
  
    if (p === "GRATIS" || p === "BASICO") {
      // Mostrar desde/hasta
      range.style.display = "block";
      // Ocultar checkbox "mercado"
      market.style.display = "none";
  
      // Required ON
      from.required = true;
      to.required = true;
  
      mercado.checked = false;
    }
  
    if (p === "ESTANDAR" || p === "PREMIUM") {
      // Ocultar desde/hasta
      range.style.display = "none";
      // Mostrar checkbox
      market.style.display = "block";
  
      // Required OFF
      from.required = false;
      to.required = false;
  
      mercado.checked = false;
    }
  }
  