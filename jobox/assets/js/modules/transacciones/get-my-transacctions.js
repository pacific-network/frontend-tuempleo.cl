document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No se encontró token de autenticación.');
    return;
  }

  // ====== ELEMENTOS DEL DOM ======
  const searchInput = document.getElementById('searchInput');
  const fechaInicio = document.getElementById('fechaInicio');
  const fechaFin = document.getElementById('fechaFin');
  const tbody = document.querySelector('#tablaTransacciones tbody');
  const paginationInfo = document.getElementById('paginationInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // ====== ESTADO LOCAL ======
  let page = 1;
  const take = 10;
  let search = '';
  let fechaInicioVal = '';
  let fechaFinVal = '';

  // ====== OBTENER TRANSACCIONES ======
  async function obtenerTransacciones() {
    try {
      const params = new URLSearchParams({ page, take });
      if (search) params.append('search', search);
      if (fechaInicioVal) params.append('fechaInicio', fechaInicioVal);
      if (fechaFinVal) params.append('fechaFin', fechaFinVal);

      const res = await fetch(`${BASE_URL_API}/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Error al obtener transacciones (${res.status})`);

      const json = await res.json();
      renderTabla(json.data, json.meta);
      renderPaginacion(json.meta);
    } catch (err) {
      console.error('❌ Error cargando transacciones:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-danger text-center">Error al cargar transacciones</td>
        </tr>`;
    }
  }

  // ====== RENDERIZAR TABLA ======
  function renderTabla(data, meta) {
    if (!data || !data.length) {
      tbody.innerHTML = `
        <tr><td colspan="7" class="text-center text-muted">Sin resultados</td></tr>`;
      return;
    }

    const startIndex = (meta.page - 1) * meta.take; // Para numeración secuencial global

    tbody.innerHTML = data
      .map((tx, index) => {
        const rowNumber = startIndex + index + 1;

        const detalleBtn = `
          <button class="btn btn-action" data-id="${tx.id}" title="Ver detalle">
            <i class="far fa-eye"></i>
          </button>
        `;

        const card = tx.response_data?.card_detail?.card_number
          ? '**** ' + tx.response_data.card_detail.card_number
          : '-';
        const fecha = new Date(tx.createdAt).toLocaleString('es-CL');
        const estado =
  ['AUTHORIZED', 'APPROVED'].includes(String(tx.status).toUpperCase())
    ? `<span class="badge bg-success">Aprobado</span>`
    : String(tx.status).toUpperCase() === 'PENDING'
    ? `<span class="badge bg-warning text-dark">Pendiente</span>`
    : `<span class="badge bg-danger">Rechazado</span>`;

        return `
          <tr>
            <td class="fw-bold text-secondary">${rowNumber}</td>
            <td>${tx.origen === 'WEBPAY' ? 'Webpay' : 'Mercado Pago'}</td>
            <td>${Number(tx.amount).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
            <td>${estado}</td>
            <td>${fecha}</td>
            <td class="text-center">${detalleBtn}</td>
          </tr>`;
      })
      .join('');
  }

  // ====== RENDERIZAR PAGINACIÓN ======
  function renderPaginacion(meta) {
    if (!meta) return;
    paginationInfo.textContent = `Página ${meta.page} de ${meta.pageCount} (Total: ${meta.itemCount})`;
    prevBtn.disabled = !meta.hasPreviousPage;
    nextBtn.disabled = !meta.hasNextPage;
  }

  // ====== DEBOUNCE ======
  function debounce(fn, delay = 400) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // ====== EVENTOS DE FILTROS ======
  searchInput.addEventListener(
    'input',
    debounce((e) => {
      search = e.target.value.trim();
      page = 1;
      obtenerTransacciones();
    }, 400)
  );

  fechaInicio.addEventListener('change', (e) => {
    fechaInicioVal = e.target.value;
    page = 1;
    obtenerTransacciones();
  });

  fechaFin.addEventListener('change', (e) => {
    fechaFinVal = e.target.value;
    page = 1;
    obtenerTransacciones();
  });

  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      page--;
      obtenerTransacciones();
    }
  });

  nextBtn.addEventListener('click', () => {
    page++;
    obtenerTransacciones();
  });

// // ====== EVENTO: CLICK EN "VER DETALLE" ======
// tbody.addEventListener('click', async (e) => {
//   const btn = e.target.closest('.btn-action');
//   if (!btn) return;

//   const txId = btn.getAttribute('data-id');
//   const modalElement = document.getElementById('detalleModal');
//   const modal = new bootstrap.Modal(modalElement);
//   const body = document.getElementById('detalleModalBody');

//   // Mostrar loader y abrir modal
//   body.innerHTML = `<div class="text-center text-muted py-4">Cargando información...</div>`;
//   modal.show();

//   try {
//     const res = await fetch(`${BASE_URL_API}/transactions/${txId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!res.ok) throw new Error(`Error al obtener transacción (${res.status})`);

//     const tx = await res.json();
// const data = tx.response_data || {};
// const items = data.items || [];
// const fecha = new Date(tx.createdAt).toLocaleString('es-CL');

// // 🔹 Normalizamos el estado
// const normalizedStatus = String(tx.status || '').toUpperCase();
// const isApproved = ['APPROVED', 'AUTHORIZED'].includes(normalizedStatus);

// // ===============================
// // 🧾 Render principal con OrderID
// // ===============================
// body.innerHTML = `
//   <div class="d-flex align-items-center mb-4">
//     <img src="../assets/img/logo/favicon.png" width="50" class="me-3 rounded-3" alt="Logo Tu Empleo">
//     <div>
//       <h4 class="m-0 fw-bold">Comprobante de Pago</h4>
//       <small class="text-muted">Generado automáticamente por TuEmpleo.cl</small>
//       <div class="mt-1">
//         <small class="text-muted">
//           Orden de compra: <span class="fw-semibold text-dark">${tx.orderId || '—'}</span>
//         </small>
//       </div>
//     </div>

//     <span class="badge-status-modal ${
//       isApproved
//         ? 'badge-success'
//         : normalizedStatus === 'PENDING'
//         ? 'badge-pending'
//         : 'badge-fail'
//     } ms-auto">
//       ${
//         isApproved
//           ? 'APROBADO'
//           : normalizedStatus === 'PENDING'
//           ? 'PENDIENTE'
//           : 'RECHAZADO'
//       }
//     </span>
//   </div>


//       <!-- 🔹 GRID PRINCIPAL: Datos de transacción + Emisor -->
//       <div class="detalle-grid">
//         <div class="detalle-section">
//           <h6>Datos de Transacción</h6>
//           <ul class="kv">
//             <li><b>Fecha</b> <span>${fecha}</span></li>
//             <li><b>Pasarela</b> <span>${tx.origen || 'Desconocido'}</span></li>
//             <li><b>Tipo de pago</b> <span>${tipoPago(data.payment_type_code)}</span></li>
//             <li><b>Tarjeta</b> <span>${data.card_detail?.card_number ? '**** ' + data.card_detail.card_number : '-'}</span></li>
//             <li><b>Autorización</b> <span>${data.authorization_code || '-'}</span></li>
//             <li><b>VCI</b> <span>${data.vci || '-'}</span></li>
//           </ul>
//         </div>

//         <div class="detalle-section">
//           <h6>Emisor</h6>
//           <ul class="kv">
//             <li><b>Empresa</b> <span>TuEmpleo.cl SpA</span></li>
//             <li><b>RUT</b> <span>77.777.777-7</span></li>
//             <li><b>Giro</b> <span>Servicios de Tecnología</span></li>
//             <li><b>Dirección</b> <span>Av. Providencia 1234, Santiago</span></li>
//             <li><b>Correo</b> <span>facturacion@tuempleo.cl</span></li>
//           </ul>
//         </div>
//       </div>

//       <!-- 🔹 Tabla de ítems -->
//       <h6 class="mt-4">Detalle de Avisos</h6>
//       <table class="table table-sm align-middle">
//         <thead>
//           <tr>
//             <th>Producto</th>
//             <th class="text-center">Cant.</th>
//             <th class="text-end">Precio Unit.</th>
//             <th class="text-end">Subtotal</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${
//             items.length
//               ? items
//                   .map(
//                     (i) => `
//                   <tr>
//                     <td>${i.title || i.tipoAviso || 'Aviso'}</td>
//                     <td class="text-center">${i.quantity || i.cantidad || 1}</td>
//                     <td class="text-end">$${Number(i.unit_price || i.precioUnitario || 0).toLocaleString('es-CL')}</td>
//                     <td class="text-end">$${Number((i.quantity || i.cantidad || 1) * (i.unit_price || i.precioUnitario || 0)).toLocaleString('es-CL')}</td>
//                   </tr>`
//                   )
//                   .join('')
//               : `<tr><td colspan="4" class="text-center text-muted">Sin ítems asociados</td></tr>`
//           }
//         </tbody>
//       </table>

//       <!-- 🔹 Totales -->
//       <h6 class="mt-4">Resumen</h6>
//       <table class="w-100">
//         <tbody>
//           <tr><td>Subtotal</td><td class="text-end">$${Math.round(tx.amount / 1.19).toLocaleString('es-CL')}</td></tr>
//           <tr><td>IVA (19%)</td><td class="text-end">$${Math.round(tx.amount - tx.amount / 1.19).toLocaleString('es-CL')}</td></tr>
//           <tr><td class="fw-bold">Total</td><td class="text-end fw-bold">$${Number(tx.amount).toLocaleString('es-CL')}</td></tr>
//         </tbody>
//       </table>

//       <div class="text-center text-muted mt-4 small">
//         Documento no tributario — ID interno: <b>${tx.id}</b>
//       </div>
//     `;

//   } catch (err) {
//     console.error('❌ Error obteniendo detalle:', err);
//     body.innerHTML = `
//       <div class="alert alert-danger text-center my-3">
//         No se pudo cargar el detalle de la transacción.<br>
//         <small>${err.message}</small>
//       </div>`;
//   }
// });

// // ====== FUNCIÓN AUXILIAR ======
// function tipoPago(code) {
//   const tipos = {
//     VD: 'Débito',
//     VN: 'Crédito (sin cuotas)',
//     VC: 'Crédito (con cuotas)',
//     SI: 'Crédito (3 sin interés)',
//     S2: 'Crédito (2 sin interés)',
//     NC: 'Crédito (cuotas sin interés)',
//   };
//   return tipos[code] || '-';
// }

//   // 🚀 CARGA INICIAL
//   obtenerTransacciones();
tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-action');
  if (!btn) return;

  const txId = btn.getAttribute('data-id');
  const modalElement = document.getElementById('detalleModal');
  const modal = new bootstrap.Modal(modalElement);
  const body = document.getElementById('detalleModalBody');

  body.innerHTML = `<div class="text-center text-muted py-4">Cargando información...</div>`;
  modal.show();

  try {
    const res = await fetch(`${BASE_URL_API}/transactions/${txId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error al obtener transacción (${res.status})`);

    const tx = await res.json();
    const data = tx.response_data || {};
    const items = data.items || tx.items || [];
    const fecha = new Date(tx.createdAt).toLocaleString('es-CL');

    // 🔹 Normalizar estado (para MP o Webpay)
    const normalizedStatus = String(tx.status || '').toUpperCase();
    const isApproved = ['APPROVED', 'AUTHORIZED'].includes(normalizedStatus);

    // 🔹 Normalizar información común
    const origen = tx.origen || 'Desconocido';
    const medioPago =
      origen === 'WEBPAY'
        ? tipoPago(data.payment_type_code)
        : data.payment_type_id?.toUpperCase() || 'Tarjeta / Transferencia';

    const tarjeta =
      data.card_detail?.card_number
        ? `**** ${data.card_detail.card_number}`
        : data.card?.last_four_digits
        ? `**** ${data.card.last_four_digits}`
        : '-';

    const autorizacion =
      data.authorization_code ||
      data.authorization_id ||
      data.transaction_details?.external_resource_url ||
      '-';

    const vci = data.vci || data.status_detail || '-';

    // ===============================
    // 🧾 Render principal del comprobante
    // ===============================
    body.innerHTML = `
      <div class="d-flex align-items-center mb-4">
        <img src="../assets/img/logo/favicon.png" width="50" class="me-3 rounded-3" alt="Logo Tu Empleo">
        <div>
          <h4 class="m-0 fw-bold">Comprobante de Pago</h4>
          <small class="text-muted">Generado automáticamente por TuEmpleo.cl</small>
          <div class="mt-1">
            <small class="text-muted">
              Orden de compra: <span class="fw-semibold text-dark">${tx.orderId || '—'}</span>
            </small>
          </div>
        </div>

        <span class="badge-status-modal ${
          isApproved
            ? 'badge-success'
            : normalizedStatus === 'PENDING'
            ? 'badge-pending'
            : 'badge-fail'
        } ms-auto">
          ${
            isApproved
              ? 'APROBADO'
              : normalizedStatus === 'PENDING'
              ? 'PENDIENTE'
              : 'RECHAZADO'
          }
        </span>
      </div>

      <!-- 🔹 GRID PRINCIPAL -->
      <div class="detalle-grid">
        <div class="detalle-section">
          <h6>Datos de Transacción</h6>
          <ul class="kv">
            <li><b>Fecha</b> <span>${fecha}</span></li>
            <li><b>Pasarela</b> <span>${origen}</span></li>
            <li><b>Tipo de pago</b> <span>${medioPago}</span></li>
            <li><b>Tarjeta</b> <span>${tarjeta}</span></li>
            <li><b>Autorización</b> <span>${autorizacion}</span></li>
            <li><b>Detalle</b> <span>${vci}</span></li>
          </ul>
        </div>

        <div class="detalle-section">
          <h6>Emisor</h6>
          <ul class="kv">
            <li><b>Empresa</b> <span>Pacific Network</span></li>
            <li><b>RUT</b> <span>77.155.498-9</span></li>
            <li><b>Giro</b> <span>Servicios empresariales</span></li>
            <li><b>Dirección</b> <span>Av. Del Valle Sur</span></li>
            <li><b>Correo</b> <span>facturacion@tuempleo.cl</span></li>
          </ul>
        </div>
      </div>

      <!-- 🔹 Tabla de ítems -->
      <h6 class="mt-4">Detalle de Avisos</h6>
      <table class="table table-sm align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">Precio Unit.</th>
            <th class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length
              ? items
                  .map(
                    (i) => `
                    <tr>
                      <td>${i.title || i.tipoAviso || 'Aviso'}</td>
                      <td class="text-center">${i.quantity || i.cantidad || 1}</td>
                      <td class="text-end">$${Number(
                        i.unit_price || i.precioUnitario || 0
                      ).toLocaleString('es-CL')}</td>
                      <td class="text-end">$${Number(
                        (i.quantity || i.cantidad || 1) *
                          (i.unit_price || i.precioUnitario || 0)
                      ).toLocaleString('es-CL')}</td>
                    </tr>`
                  )
                  .join('')
              : `<tr><td colspan="4" class="text-center text-muted">Sin ítems asociados</td></tr>`
          }
        </tbody>
      </table>

      <!-- 🔹 Totales -->
      <h6 class="mt-4">Resumen</h6>
      <table class="w-100">
        <tbody>
          <tr><td>Subtotal</td><td class="text-end">$${Math.round(
            tx.amount / 1.19
          ).toLocaleString('es-CL')}</td></tr>
          <tr><td>IVA (19%)</td><td class="text-end">$${Math.round(
            tx.amount - tx.amount / 1.19
          ).toLocaleString('es-CL')}</td></tr>
          <tr><td class="fw-bold">Total</td><td class="text-end fw-bold">$${Number(
            tx.amount
          ).toLocaleString('es-CL')}</td></tr>
        </tbody>
      </table>

      <div class="text-center text-muted mt-4 small">
        Documento no tributario — ID interno: <b>${tx.id}</b>
      </div>
    `;
  } catch (err) {
    console.error('❌ Error obteniendo detalle:', err);
    body.innerHTML = `
      <div class="alert alert-danger text-center my-3">
        No se pudo cargar el detalle de la transacción.<br>
        <small>${err.message}</small>
      </div>`;
  }
});

// ====== FUNCIÓN AUXILIAR ======
function tipoPago(code) {
  const tipos = {
    VD: 'Débito',
    VN: 'Crédito (sin cuotas)',
    VC: 'Crédito (con cuotas)',
    SI: 'Crédito (3 sin interés)',
    S2: 'Crédito (2 sin interés)',
    NC: 'Crédito (cuotas sin interés)',
  };
  return tipos[code] || '-';
}

// 🚀 CARGA INICIAL
obtenerTransacciones();

});
