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
            tx.status === 'AUTHORIZED'
              ? `<span class="badge bg-success">Aprobado</span>`
              : tx.status === 'PENDING'
              ? `<span class="badge bg-warning text-dark">Pendiente</span>`
              : `<span class="badge bg-danger">Rechazado</span>`;
  
          return `
            <tr>
              <td class="fw-bold text-secondary">${rowNumber}</td>
              <td><span class="badge badge-code">${tx.orderId}</span></td>
              <td>${Number(tx.amount).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
              <td>${estado}</td>
              <td>${card}</td>
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
  
    // ====== EVENTO: CLICK EN "VER DETALLE" ======
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-action');
      if (!btn) return;
  
      const txId = btn.getAttribute('data-id');
      const modal = new bootstrap.Modal(document.getElementById('detalleModal'));
      const body = document.getElementById('detalleModalBody');
  
      body.innerHTML = `<div class="text-center text-muted py-4">Cargando información...</div>`;
      modal.show();
  
      try {
        const res = await fetch(`${BASE_URL_API}/transactions/${txId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener detalle de transacción');
  
        const tx = await res.json();
        const data = tx.response_data || {};
        const items = tx.items || [];
        const fecha = new Date(tx.createdAt).toLocaleString('es-CL');
        const ok = (tx.status || '').toUpperCase() === 'AUTHORIZED';
  
        // 🧾 Tabla de ítems
        const itemsTable = items.length
          ? `
            <table class="table table-sm mt-2">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (i) => `
                  <tr>
                    <td>${i.tipoAviso}</td>
                    <td class="text-center">${i.cantidad}</td>
                    <td class="text-end">$${Number(i.subtotal).toLocaleString('es-CL')}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          `
          : `<p class="text-muted">No hay ítems asociados.</p>`;
  
        body.innerHTML = `
          <div class="d-flex align-items-center mb-3">
            <img src="../assets/img/logo/favicon.png" width="50" class="me-3 rounded-3" alt="Logo Tu Empleo">
            <div>
              <h4 class="m-0 fw-bold">Tu Empleo</h4>
              <small class="text-muted">Comprobante de pago</small>
            </div>
            <span class="badge-status-modal ${
              ok
                ? 'badge-success'
                : tx.status === 'PENDING'
                ? 'badge-pending'
                : 'badge-fail'
            } ms-auto">
              ${
                ok
                  ? 'APROBADO'
                  : tx.status === 'PENDING'
                  ? 'PENDIENTE'
                  : 'RECHAZADO'
              }
            </span>
          </div>
  
          <h6>Detalle de la compra</h6>
          <ul class="kv">
            <li><b>Orden de compra</b> <span>${tx.orderId}</span></li>
            <li><b>Fecha</b> <span>${fecha}</span></li>
            <li><b>Tipo de pago</b> <span>${tipoPago(data.payment_type_code)}</span></li>
            <li><b>Cuotas</b> <span>${data.installments_number || 0}</span></li>
            <li><b>Tarjeta</b> <span>${data.card_detail?.card_number ? '**** ' + data.card_detail.card_number : '-'}</span></li>
            <li><b>VCI</b> <span>${data.vci || '-'}</span></li>
            <li><b>Código autorización</b> <span>${data.authorization_code || '-'}</span></li>
          </ul>
  
          <h6 class="mt-3">Avisos adquiridos</h6>
          ${itemsTable}
  
          <h6 class="mt-4">Resumen</h6>
          <table class="w-100">
            <tbody>
              <tr><td>Subtotal</td><td class="text-end">$${Math.round(tx.amount / 1.19).toLocaleString('es-CL')}</td></tr>
              <tr><td>IVA (19%)</td><td class="text-end">$${Math.round(tx.amount - tx.amount / 1.19).toLocaleString('es-CL')}</td></tr>
              <tr><td><b>Total</b></td><td class="text-end fw-bold">$${Number(tx.amount).toLocaleString('es-CL')}</td></tr>
            </tbody>
          </table>
        `;
      } catch (err) {
        console.error('❌ Error obteniendo detalle:', err);
        body.innerHTML = `<div class="alert alert-danger">No se pudo cargar el detalle de la transacción.</div>`;
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
      return `${tipos[code] || 'Desconocido'} (${code || '-'})`;
    }
  
    // 🚀 CARGA INICIAL
    obtenerTransacciones();
  });
  