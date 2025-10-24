

const planes = [
  { id: 1, nombre: "Publicación Gratis", precio: 0, descripcion: "Ideal para pequeñas empresas.", caracteristicas: ["Hasta 2 publicaciones", "Duración: 7 días", "Soporte básico"], popular: false },
  { id: 2, nombre: "Publicación Básica", precio: 80000, precioLista: 100000, descripcion: "Ideal para pequeñas empresas.", caracteristicas: ["Hasta 2 publicaciones", "Duración: 7 días", "Soporte básico"], popular: false },
  { id: 3, nombre: "Publicación Estándar", precio: 140000, precioLista: 170000, descripcion: "Para empresas medianas.", caracteristicas: ["Hasta 5 publicaciones", "Duración: 30 días", "Soporte prioritario", "Reportes básicos"], popular: true },
  { id: 4, nombre: "Publicación Premium", precio: 180000, precioLista: 200000, descripcion: "Para alto volumen de contratación.", caracteristicas: ["Publicaciones ilimitadas", "Duración: 60 días", "Soporte 24/7", "Consultoría avanzada"], popular: false }
];

let carrito = [];

const planGrid = document.getElementById("planGrid");
const cartSummary = document.getElementById("cartSummary");
const emptyCartMsg = document.getElementById("emptyCartMsg");
const cartItemsBox = document.getElementById("cartItems");
const elSubtotal = document.getElementById("cartSubtotal");
const elIva = document.getElementById("cartIva");
const elDiscount = document.getElementById("cartDiscount");
const elTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const fmtCLP = (n) => n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// ==========================
// FUNCIONES AUXILIARES
// ==========================
function generarOrderId(longitud = 12) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    resultado += caracteres.charAt(indice);
  }
  return resultado;
}

function renderPlanes() {
  planGrid.innerHTML = planes.map(plan => {
    const isFree = plan.id === 1;
    const btnDisabled = isFree && freeLeft <= 0;
    const btnText = isFree && freeLeft <= 0 ? 'Agotado este mes' : 'Agregar al carrito';

    return `
  <div class="pricing-item ${plan.popular ? 'active' : ''}">
    ${plan.popular ? `<div class="pricing-popular">Más popular</div>` : ''}
    <div class="pricing-content">
      <h4>${plan.nombre}</h4>
      <div class="pricing-amount">
        ${plan.precioLista ? `<span class="price-list">${fmtCLP(plan.precioLista)}</span>` : ''}
        ${fmtCLP(plan.precio)} <span>CLP</span>
      </div>
      <p>${plan.descripcion}</p>
      ${isFree ? `
        <div class="free-badge" title="Cupos gratis mensuales. Se reinician cada mes.">
          <i class="fa fa-gift" aria-hidden="true"></i>
          Gratis disponibles: <strong>${freeLeft}/${FREE_MONTHLY_LIMIT}</strong> este mes
        </div>
      ` : ''}
    </div>
    <div class="pricing-feature">
      <ul>${plan.caracteristicas.map(c => `<li>${c}</li>`).join('')}</ul>
    </div>
    <button class="theme-btn" data-id="${plan.id}" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
  </div>
  `;
  }).join('');
}

function calcularTotales() {
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const descuento = 0;
  const subtotal = Math.round(total / 1.19);
  const iva = total - subtotal;
  return { subtotal, descuento, iva, total };
}

function renderRows() {
  cartItemsBox.innerHTML = carrito
    .map(
      (item) => `
      <div class="row">
        <div>${item.nombre}</div>
        <div class="qty">
          <span>x${item.cantidad}</span>
          <button class="btn-remove" title="Eliminar" data-id="${item.id}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.5 4.5V6h3.75a.75.75 0 010 1.5H3.75a.75.75 0 010-1.5H7.5V4.5A2.25 2.25 0 019.75 2.25h4.5A2.25 2.25 0 0116.5 4.5zM17.25 9v9a2.25 2.25 0 01-2.25 2.25h-6A2.25 2.25 0 016.75 18V9h10.5z" clip-rule="evenodd"/></svg>
          </button>
        </div>
        <div>${fmtCLP(item.precio * item.cantidad)}</div>
      </div>`
    )
    .join("");
}

function renderCarrito() {
  if (carrito.length === 0) {
    cartSummary.style.display = "none";
    emptyCartMsg.style.display = "block";
  } else {
    cartSummary.style.display = "flex";
    emptyCartMsg.style.display = "none";
    renderRows();
    const { subtotal, descuento, iva, total } = calcularTotales();
    elSubtotal.textContent = fmtCLP(subtotal);
    elIva.textContent = fmtCLP(iva);
    elDiscount.textContent = fmtCLP(descuento);
    elTotal.textContent = fmtCLP(total);
  }
}

// ==========================
// MANEJO DEL CARRITO
// ==========================
function agregarAlCarrito(id) {
  const plan = planes.find((p) => p.id === id);
  if (!plan || plan.precio <= 0) return;

  const existente = carrito.find((p) => p.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ ...plan, cantidad: 1 });

  renderCarrito();
  alert(`"${plan.nombre}" agregado al carrito.`);
}

planGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("theme-btn")) {
    const id = parseInt(e.target.dataset.id);
    agregarAlCarrito(id);
  }
});

document.querySelector(".cart-table").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-remove");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  carrito = carrito.filter((item) => item.id !== id);
  renderCarrito();
});

// ==========================
// API HELPERS
// ==========================
async function createPendingTransaction(empresaId, sessionId, carrito, token) {
  const response = await fetch(`${BASE_URL_API}/transactions/create-pending`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      empresaId,
      sessionId,
      items: carrito.map((p) => ({
        tipoAviso: p.tipoAviso,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error al crear transacción pendiente:", errorData);
    throw new Error("No se pudo registrar la transacción.");
  }

  return response.json();
}

async function startWebpayTransaction(orderId, amount, token) {
  const response = await fetch(`${BASE_URL_API}/webpay/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, amount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error al crear transacción Webpay:", errorData);
    throw new Error("No se pudo iniciar Webpay.");
  }

  return response.json();
}

// ==========================
// CHECKOUT (PROCESO DE PAGO)
// ==========================
checkoutBtn.addEventListener("click", async () => {
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  if (total <= 0) {
    alert("El carrito está vacío o el monto no es válido.");
    return;
  }

  const token = localStorage.getItem("token");
  const empresaId = localStorage.getItem("empresaId");
  const userId = localStorage.getItem("userId");

  if (!token) {
    alert("Debes iniciar sesión para proceder con el pago.");
    return;
  }

  try {
    const pendingData = await createPendingTransaction(empresaId, userId, carrito, token);
    const orderId = pendingData.orderId;
    const totalBackend = pendingData.total;

    const webpayData = await startWebpayTransaction(orderId, totalBackend, token);

    if (webpayData.url && webpayData.token) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = webpayData.url;

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token_ws";
      tokenInput.value = webpayData.token;

      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();

      carrito = [];
      renderCarrito();
    } else {
      alert("Error al iniciar el proceso de pago.");
      console.error("Respuesta inesperada:", webpayData);
    }
  } catch (error) {
    console.error("Error durante el pago:", error);
    alert("Ocurrió un error al procesar el pago.");
  }
});

// ==========================
// INICIALIZACIÓN
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  renderPlanes();
  renderCarrito();
});
