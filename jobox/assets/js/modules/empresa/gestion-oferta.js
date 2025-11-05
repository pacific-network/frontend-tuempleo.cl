// ====== gestion-oferta.js (con paginación real) ======
import { getUserIdFromToken } from '../utils/decode-jwt.js';

/* ───── Toast genérico ───── */
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');

  toastBody.textContent = message;
  toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning');
  toastTitle.textContent =
    type === 'success' ? '✅ Éxito' :
    type === 'error' ? '❌ Error' :
    '⚠️ Aviso';
  toastEl.classList.add(type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-warning');

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/* ───── Helpers ───── */
function extractPostulantesCount(json) {
  try {
    if (Array.isArray(json)) return json.length;
    if (json && typeof json === 'object') {
      if (typeof json.total === 'number') return json.total;
      if (json.meta && typeof json.meta === 'object') {
        return json.meta.totalItems || json.meta.total || 0;
      }
      if (Array.isArray(json.data)) return json.data.length;
    }
  } catch (_) {}
  return 0;
}

async function getPostulantesCount(ofertaId) {
  const res = await fetch(`${BASE_URL_API}/postulaciones/oferta/${ofertaId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractPostulantesCount(json);
}

/* ───── Variables globales ───── */
let currentPage = 1;
const itemsPerPage = 7;
let totalPages = 1;
let empleador_id = null;

/* ───── Render tabla ───── */
async function renderOfertas(page = 1) {
  const token = localStorage.getItem('token');
  const tbody = document.getElementById('ofertas-body');
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Cargando ofertas...</td></tr>`;

  try {
    const res = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}?page=${page}&take=${itemsPerPage}&order=DESC`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const json = await res.json();

    const ofertas = json.data || json;
    const meta = json.meta || {};
    totalPages = Math.ceil((meta.totalItems || ofertas.length) / itemsPerPage) || 1;

    if (!ofertas.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No tienes ofertas publicadas.</td></tr>`;
      document.querySelector('.pagination').innerHTML = '';
      return;
    }

    const filas = await Promise.all(
      ofertas.map(async (oferta) => {
        let totalPostulantes = 0;
        try {
          totalPostulantes = await getPostulantesCount(oferta.id);
        } catch (err) {
          console.warn(`No se pudo obtener postulantes para ${oferta.id}:`, err);
        }

        const fecha = new Date(oferta.fecha_cierre).toLocaleDateString('es-CL', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="profile-job-info">
              <div class="profile-job-content">
                <h6><a href="#">${oferta.titulo}</a></h6>
                <ul class="profile-job-list">
                  <li><i class="far fa-location-dot"></i> ${oferta.empleador?.data?.region || 'Sin región'}</li>
                </ul>
              </div>
            </div>
          </td>
          <td>
            <a href="employer-candidate.html?id=${oferta.id}" class="btn btn-outline-primary btn-sm rounded-pill position-relative px-2 py-1">
              <i class="far fa-users me-1 fs-6"></i>
              <span>Postulantes</span>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style="font-size: 1em;">
                ${totalPostulantes}
              </span>
            </a>
          </td>
          <td>${fecha}</td>
          <td>
            <span class="badge ${oferta.es_activa ? 'bg-success' : 'bg-secondary'}">${oferta.es_activa ? 'Activo' : 'Inactivo'}</span>
          </td>
          <td>
            <a href="employer-view-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-eye"></i></a>
            <a href="employer-edit-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-pen"></i></a>
            <a href="#" class="btn btn-outline-danger btn-sm btn-delete" data-id="${oferta.id}"><i class="far fa-trash-can"></i></a>
          </td>`;
        return tr;
      })
    );

    tbody.innerHTML = '';
    filas.forEach((tr) => tbody.appendChild(tr));

    renderPagination();
    activarBotonesEliminar(token);

  } catch (error) {
    console.error('Error al cargar ofertas:', error);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar ofertas.</td></tr>`;
  }
}

/* ───── Paginación dinámica ───── */
function renderPagination() {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';

  pagination.innerHTML = `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">
        <i class="far fa-angle-double-left"></i>
      </a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  pagination.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">
        <i class="far fa-angle-double-right"></i>
      </a>
    </li>
  `;

  pagination.querySelectorAll('a.page-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const newPage = Number(e.target.closest('a').dataset.page);
      if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
        currentPage = newPage;
        renderOfertas(currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ───── Eliminar ofertas ───── */
function activarBotonesEliminar(token) {
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  let idOfertaAEliminar = null;
  let filaAEliminar = null;

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      idOfertaAEliminar = btn.dataset.id;
      filaAEliminar = btn.closest('tr');
      deleteModal.show();
    });
  });

  confirmBtn.onclick = async () => {
    if (!idOfertaAEliminar) return;
    try {
      const res = await fetch(`${BASE_URL_API}/ofertas/${idOfertaAEliminar}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        deleteModal.hide();
        filaAEliminar?.remove();
        showToast('Oferta eliminada correctamente', 'success');
        renderOfertas(currentPage);
      } else {
        const err = await res.text();
        showToast(`Error al eliminar: ${err}`, 'error');
      }
    } catch (err) {
      console.error('❌ Error al eliminar la oferta:', err);
      showToast('Error inesperado al eliminar.', 'error');
    } finally {
      idOfertaAEliminar = null;
      filaAEliminar = null;
    }
  };
}

/* ───── INIT ───── */
(async () => {
  const token = localStorage.getItem('token');
  const userId = getUserIdFromToken();

  if (!userId) {
    console.error('Token inválido');
    showToast('Token no válido', 'error');
    return;
  }

  try {
    const empleadorRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const empleadorData = await empleadorRes.json();
    empleador_id = empleadorData.empleador_id;

    await renderOfertas(currentPage);
  } catch (err) {
    console.error('Error cargando empleador:', err);
    showToast('Error al cargar las ofertas', 'error');
  }
})();
