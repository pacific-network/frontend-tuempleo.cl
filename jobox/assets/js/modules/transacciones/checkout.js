// ===============================
// 💳 CHECKOUT — Procesar Pago
// ===============================

const BASE_URL_API = "http://localhost:3000/v1";
const CART_KEY = 'checkout_cart';
const fmtCLP = n => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// ===============================
// 🧠 Helpers de carrito
// ===============================
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function calcularTotales() {
  const carrito = getCart();
  const total = carrito.reduce((s, i) => s + (i.precio * i.cantidad), 0);
  const subtotal = Math.round(total / 1.19);
  const iva = total - subtotal;
  return { subtotal, iva, total };
}

// ===============================
// 🧱 Render de tabla resumen
// ===============================
function renderCheckout() {
  const carrito = getCart();
  const tbody = document.getElementById("orderBody");
  const subtotalCell = document.getElementById("subtotalCell");
  const ivaCell = document.getElementById("ivaCell");
  const totalCell = document.getElementById("totalCell");

  if (carrito.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="muted">No hay productos en tu carrito.</td></tr>`;
    subtotalCell.textContent = ivaCell.textContent = totalCell.textContent = "$0";
    return;
  }

  tbody.innerHTML = carrito.map(item => `
    <tr>
      <td>${item.nombre}</td>
      <td class="right">${item.cantidad}</td>
      <td class="right">${fmtCLP(item.precio)}</td>
      <td class="right">${fmtCLP(item.precio * item.cantidad)}</td>
    </tr>
  `).join('');

  const { subtotal, iva, total } = calcularTotales();
  subtotalCell.textContent = fmtCLP(subtotal);
  ivaCell.textContent = fmtCLP(iva);
  totalCell.textContent = fmtCLP(total);
}

// ===============================
// ⚙️ Selección de método de pago
// ===============================
let metodoSeleccionado = null;

document.querySelectorAll('.payopt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payopt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    metodoSeleccionado = opt.dataset.method;
  });
});

// ===============================
// 📡 Llamadas API
// ===============================
async function createPendingTransaction(empresaId, items, token) {
  const res = await fetch(`${BASE_URL_API}/webpay/create-pending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ empresaId, items }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.message || 'No se pudo registrar la transacción.');
  return j; // {orderId, total}
}

async function startWebpay(orderId, amount, token) {
  const res = await fetch(`${BASE_URL_API}/webpay/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, amount }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.message || 'No se pudo iniciar Webpay.');
  return j; // {url, token}
}

async function startMercadoPago(tipoAviso, token) {
  const res = await fetch(`${BASE_URL_API}/mercadopago/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tipo: tipoAviso }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.message || 'No se pudo crear preferencia en MercadoPago.');
  return j; // {preferenceId, init_point, sandbox_init_point}
}

// ===============================
// 🧾 Procesar pago
// ===============================
document.getElementById("payBtn").addEventListener("click", async () => {
  const token = localStorage.getItem('token');
  if (!token) return alert('Debes iniciar sesión para continuar.');
  if (!metodoSeleccionado) return alert('Selecciona un método de pago.');
  const carrito = getCart();
  if (carrito.length === 0) return alert('Tu carrito está vacío.');

  const { total } = calcularTotales();
  const tipoAviso = carrito[0].tipoAviso; // asume un tipo por transacción

  try {
    if (metodoSeleccionado === "webpay") {
      // ===============================
      // 🟦 WEBPAY FLOW
      // ===============================
      const empresaId = localStorage.getItem('empresaId');
      const items = carrito.map(i => ({
        tipoAviso: i.tipoAviso,
        cantidad: i.cantidad,
        precioUnitario: i.precio,
      }));
      const pending = await createPendingTransaction(empresaId, items, token);
      const webpay = await startWebpay(pending.orderId, pending.total, token);

      if (webpay.url && webpay.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = webpay.url;
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'token_ws';
        inp.value = webpay.token;
        form.appendChild(inp);
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('Error al iniciar el pago con Webpay.');
      }

    } else if (metodoSeleccionado === "mercadopago") {
      // ===============================
      // 🟦 MERCADO PAGO FLOW
      // ===============================
      const pref = await startMercadoPago(tipoAviso, token);
      if (pref.init_point) {
        clearCart();
        window.location.href = pref.init_point;
      } else {
        throw new Error('No se pudo obtener el link de pago de Mercado Pago.');
      }
    }

  } catch (err) {
    console.error('❌ Error procesando pago:', err);
    alert(err.message || 'Ocurrió un error al procesar el pago.');
  }
});

// ===============================
// 🔙 Navegación
// ===============================
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = 'carrito.html';
});

// ===============================
// 🚀 Inicialización
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
});
