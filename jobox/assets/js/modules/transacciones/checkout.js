// ===============================
// 💳 CONFIG
// ===============================
const CART_KEY = "checkout_cart";
const TOKEN_KEY = "token"; // tu JWT guardado en localStorage

const fmtCLP = n =>
  Number(n || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

// ===============================
// 🛒 Cargar carrito
// ===============================
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function calcularTotales() {
  const carrito = getCart();
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const subtotal = Math.round(total / 1.19);
  const iva = total - subtotal;
  return { subtotal, iva, total };
}

function renderResumen() {
  const carrito = getCart();
  const { subtotal, iva, total } = calcularTotales();

  const tbody = document.getElementById("orderBody");
  tbody.innerHTML = carrito
    .map(
      i => `
        <tr>
          <td>${i.nombre}</td>
          <td class="right">${i.cantidad}</td>
          <td class="right">${fmtCLP(i.precio)}</td>
          <td class="right">${fmtCLP(i.precio * i.cantidad)}</td>
        </tr>`
    )
    .join("");

  document.getElementById("subtotalCell").textContent = fmtCLP(subtotal);
  document.getElementById("ivaCell").textContent = fmtCLP(iva);
  document.getElementById("totalCell").textContent = fmtCLP(total);
}

// ===============================
// 🎯 Selección de método
// ===============================
let selectedMethod = null;
document.querySelectorAll(".payopt").forEach(opt => {
  opt.addEventListener("click", () => {
    document.querySelectorAll(".payopt").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
    selectedMethod = opt.dataset.method;
  });
});

// ===============================
// 🚀 Pago con Webpay
// ===============================
async function iniciarPagoWebpay() {
  const carrito = getCart();
  if (!carrito.length) {
    Swal.fire("Carrito vacío", "Agrega productos antes de pagar.", "warning");
    return;
  }

  const { total } = calcularTotales();
  const token = localStorage.getItem(TOKEN_KEY);
  const empresaId = localStorage.getItem("empresaId") || 1;

  if (!token) {
    Swal.fire("Sesión requerida", "Inicia sesión para continuar.", "info");
    return;
  }

  try {
    // ✅ 1) Crear transacción pendiente (el backend GENERA el orderId)
    const pendingRes = await fetch(`${BASE_URL_API}/webpay/create-pending`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        empresaId,
        items: carrito.map(i => ({
          // Enviamos tipoAviso compatible con ENUM del backend
          tipoAviso: normalizarTipoAviso(i.nombre),
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.precio * i.cantidad,
        })),
      }),
    });

    if (!pendingRes.ok) {
      const errTxt = await pendingRes.text();
      throw new Error(`Error al crear transacción pendiente: ${errTxt}`);
    }

    // 🔹 Backend devuelve { orderId, total, ... }
    const pending = await pendingRes.json();
    if (!pending?.orderId || typeof pending?.total === "undefined") {
      throw new Error("Respuesta inválida de create-pending (faltan orderId/total).");
    }

    // ✅ 2) Crear transacción Webpay REAL con el orderId generado en backend
    const res = await fetch(`${BASE_URL_API}/webpay/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId: pending.orderId,
        amount: pending.total,
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Error al crear transacción Webpay: ${errTxt}`);
    }

    const data = await res.json();
    const { url, token: token_ws } = data || {};
    if (!url || !token_ws) {
      throw new Error("Respuesta inválida de /webpay/create (faltan url/token).");
    }

    // ✅ 3) Redirigir a Webpay (POST token_ws)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "token_ws";
    input.value = token_ws;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error("❌ Error procesando pago:", err);
    Swal.fire("Error", err.message || "No se pudo iniciar el pago Webpay.", "error");
  }
}

// 🔧 Función auxiliar para limpiar tipoAviso
function normalizarTipoAviso(nombre) {
  const n = (nombre || "").toLowerCase();
  if (n.includes("básic") || n.includes("basic")) return "BASICO";
  if (n.includes("estánd") || n.includes("estand")) return "ESTANDAR";
  if (n.includes("premi")) return "PREMIUM";
  return "BASICO"; // fallback seguro
}

// ===============================
// 🚀 Pago con Mercado Pago
// ===============================

// ✅ Función para obtener el userId decodificando el token JWT
async function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🧩 Payload decodificado:", payload);

    // Retorna el campo más confiable del token (sub, id o userId)
    return payload.sub || payload.id || payload.userId || null;
  } catch (e) {
    console.error("❌ Error al decodificar el token:", e);
    return null;
  }
}

// ✅ Función principal para iniciar el pago con Mercado Pago
async function iniciarPagoMercadoPago() {
  const carrito = getCart();
  if (!carrito.length) {
    Swal.fire("Carrito vacío", "Agrega productos antes de pagar.", "warning");
    return;
  }

  // ⚠️ Aquí había un error: estabas haciendo getItem(token) en lugar de getItem("token")
  const token = localStorage.getItem("token");
  const userId = await getUserIdFromToken();

  if (!token || !userId) {
    Swal.fire("Sesión requerida", "Inicia sesión para continuar.", "info");
    return;
  }

  try {
    Swal.fire({
      title: "Creando preferencia...",
      html: "Conectando con Mercado Pago...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    const carrito = getCart();
const tipoAviso = normalizarTipoAviso(carrito[0]?.nombre);

const res = await fetch(`${BASE_URL_API}/mercadopago/preferences`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    tipo: tipoAviso,
    userId,
    items: carrito.map(i => ({
      tipoAviso: normalizarTipoAviso(i.nombre),
      cantidad: i.cantidad,
      precioUnitario: i.precio,
      subtotal: i.precio * i.cantidad,
    })),
  }),
});


    const data = await res.json();

    if (!res.ok || !data.init_point) {
      throw new Error(data.message || "Error al crear preferencia de pago.");
    }

    // 🔹 Guardamos carrito temporal para mostrar en el resultado
    localStorage.setItem("cart_items", JSON.stringify(carrito));

    Swal.update({
      title: "Redirigiendo a Mercado Pago...",
      html: "<p>Abriendo el checkout seguro...</p>",
    });

    // ✅ Redirigir al checkout seguro de Mercado Pago
    setTimeout(() => {
      window.location.href = data.init_point;
    }, 1000);
  } catch (err) {
    console.error("❌ Error procesando pago:", err);
    Swal.fire("Error", err.message || "No se pudo iniciar el pago en Mercado Pago.", "error");
  }
}

// ===============================
// 🔘 Listeners
// ===============================
document.getElementById("payBtn").addEventListener("click", () => {
  if (!selectedMethod) {
    Swal.fire("Selecciona un método de pago", "", "info");
    return;
  }

  switch (selectedMethod) {
    case "webpay":
      iniciarPagoWebpay();
      break;

    case "mercadopago":
      iniciarPagoMercadoPago();
      break;

    default:
      Swal.fire("Método no disponible", "El método de pago seleccionado no está habilitado.", "warning");
      break;
  }
});

document.addEventListener("DOMContentLoaded", renderResumen);