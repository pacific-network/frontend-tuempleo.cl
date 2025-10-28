// ===============================
// 🛒 CARRITO DE COMPRAS 
// ===============================

const BASE_URL_API = "http://localhost:3000/v1";

const planes = [
  { id: 1, tipoAviso: "FREE", nombre: "Publicación Gratis", precio: 0, descripcion: "Ideal para pequeñas empresas.", caracteristicas: ["Hasta 2 publicaciones", "Duración: 7 días", "Soporte básico"], popular: false },
  { id: 2, tipoAviso: "BASICO", nombre: "Publicación Básica", precio: 80000, precioLista: 100000, descripcion: "Ideal para pequeñas empresas.", caracteristicas: ["Hasta 2 publicaciones", "Duración: 7 días", "Soporte básico"], popular: false },
  { id: 3, tipoAviso: "ESTANDAR", nombre: "Publicación Estándar", precio: 140000, precioLista: 170000, descripcion: "Para empresas medianas.", caracteristicas: ["Hasta 5 publicaciones", "Duración: 30 días", "Soporte prioritario", "Reportes básicos"], popular: true },
  { id: 4, tipoAviso: "PREMIUM", nombre: "Publicación Premium", precio: 180000, precioLista: 200000, descripcion: "Para alto volumen de contratación.", caracteristicas: ["Publicaciones ilimitadas", "Duración: 60 días", "Soporte 24/7", "Consultoría avanzada"], popular: false }
];

// ===============================
// 🔢 Variables globales
// ===============================
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
const fmtCLP = n => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// ===============================
// 🎁 FREE mensual
// ===============================
const FREE_MONTHLY_LIMIT = 3;
function periodKey(d = new Date()) { return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`; }
function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { const p = token.split('.')[1]; const d = JSON.parse(atob(p)); return d.sub || d.userId || d.id || null; } catch { return null; }
}
function getFreeRemaining() {
  const key = `free_pub_remaining_${getUserIdFromToken()}_${periodKey()}`;
  const val = localStorage.getItem(key);
  if (val === null || isNaN(+val)) { localStorage.setItem(key, String(FREE_MONTHLY_LIMIT)); return FREE_MONTHLY_LIMIT; }
  return Math.max(0, parseInt(val, 10));
}
function setFreeRemaining(v) {
  const key = `free_pub_remaining_${getUserIdFromToken()}_${periodKey()}`;
  localStorage.setItem(key, String(Math.max(0, v)));
}

// ===============================
// 💾 Persistencia carrito
// ===============================
function guardarCarrito() {
  localStorage.setItem('cart_items', JSON.stringify(carrito));
}
function cargarCarrito() {
  try {
    const data = JSON.parse(localStorage.getItem('cart_items') || '[]');
    if (Array.isArray(data)) carrito = data;
  } catch { carrito = []; }
}

// ===============================
// 💰 Totales
// ===============================
function calcularTotales() {
  const total = carrito.reduce((s, i) => s + (i.precio * i.cantidad), 0);
  const descuento = 0;
  const subtotal = Math.round((total - descuento) / 1.19);
  const iva = (total - descuento) - subtotal;
  return { subtotal, descuento, iva, total };
}

// ===============================
// 🧾 Renderización
// ===============================
function renderPlanes() {
  const freeLeft = getFreeRemaining();
  planGrid.innerHTML = planes.map(p => {
    const isFree = p.id === 1;
    const disabled = isFree && freeLeft <= 0;
    const btnText = isFree ? (disabled ? 'Agotado este mes' : 'Gratis') : 'Agregar al carrito';
    return `
      <div class="pricing-item ${p.popular ? 'active' : ''}">
        ${p.popular ? `<div class="pricing-popular">Más popular</div>` : ''}
        <div class="pricing-content">
          <h4>${p.nombre}</h4>
          <div class="pricing-amount">
            ${p.precioLista ? `<span class="price-list">${fmtCLP(p.precioLista)}</span>` : ''}
            ${fmtCLP(p.precio)} <span>CLP</span>
          </div>
          <p>${p.descripcion}</p>
          ${isFree ? `<div class="free-badge"><i class="fa fa-gift"></i> Gratis disponibles: <strong>${freeLeft}/${FREE_MONTHLY_LIMIT}</strong></div>` : ''}
        </div>
        <div class="pricing-feature"><ul>${p.caracteristicas.map(c => `<li>${c}</li>`).join('')}</ul></div>
        <button class="theme-btn" data-id="${p.id}" ${disabled ? 'disabled' : ''}>${btnText}</button>
      </div>`;
  }).join('');
}

function renderRows() {
  cartItemsBox.innerHTML = carrito.map(i => `
    <div class="row">
      <div>${i.nombre}</div>
      <div class="qty">
        <span>x${i.cantidad}</span>
        <button class="btn-remove" data-id="${i.id}">🗑️</button>
      </div>
      <div>${fmtCLP(i.precio * i.cantidad)}</div>
    </div>`).join('');
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

// ===============================
// ➕➖ Agregar / eliminar
// ===============================
function agregarAlCarrito(id) {
  const plan = planes.find(p => p.id === id);
  if (!plan) return;

  // FREE control
  if (plan.id === 1) {
    const freeLeft = getFreeRemaining();
    if (freeLeft <= 0) {
      alert('Ya usaste tus 3 publicaciones gratis este mes.');
      return;
    }
  }

  const existente = carrito.find(p => p.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ ...plan, cantidad: 1 });

  guardarCarrito();
  renderCarrito();
  alert(`"${plan.nombre}" agregado al carrito.`);
}

document.querySelector(".cart-table").addEventListener("click", e => {
  const btn = e.target.closest(".btn-remove");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  renderCarrito();
});

planGrid.addEventListener("click", e => {
  const btn = e.target.closest(".theme-btn");
  if (!btn || btn.disabled) return;
  agregarAlCarrito(parseInt(btn.dataset.id));
});

// ===============================
// ✅ Checkout redirección
// ===============================
checkoutBtn.addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  // Guardar carrito para checkout
  localStorage.setItem('checkout_cart', JSON.stringify(carrito));

  // Redirigir
  window.location.href = 'checkout.html';
});

// ===============================
// 🚀 Inicialización
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  cargarCarrito();
  renderPlanes();
  renderCarrito();
});
