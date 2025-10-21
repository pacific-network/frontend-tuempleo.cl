// gestion-oferta.js
import { getUserIdFromToken } from '../utils/decode-jwt.js';

function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');

  toastBody.textContent = message;

  toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning');
  if (type === 'success') {
    toastTitle.textContent = '✅ Éxito';
    toastEl.classList.add('bg-success');
  } else if (type === 'error') {
    toastTitle.textContent = '❌ Error';
    toastEl.classList.add('bg-danger');
  } else {
    toastTitle.textContent = '⚠️ Aviso';
    toastEl.classList.add('bg-warning');
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
/**
 * Intenta extraer el total real de postulantes desde respuestas comunes:
 * - Array puro                          => uso length
 * - { data: Array }                     => data.length
 * - { total: number }                   => total
 * - { meta: { totalItems | total } }    => meta.totalItems || meta.total
 */
function extractPostulantesCount(json) {
  try {
    if (Array.isArray(json)) return json.length;
    if (json && typeof json === 'object') {
      if (typeof json.total === 'number') return json.total;
      if (json.meta && typeof json.meta === 'object') {
        if (typeof json.meta.totalItems === 'number') return json.meta.totalItems;
        if (typeof json.meta.total === 'number') return json.meta.total;
      }
      if (Array.isArray(json.data)) return json.data.length;
    }
  } catch (_) {}
  return 0;
}

/**
 * Obtiene el conteo de postulantes para una oferta dada.
 * Nota: NO uses length del arreglo paginado; prioriza 'total' o 'meta.totalItems'.
 */
async function getPostulantesCount(ofertaId) {
  // Si tu backend soporta un endpoint de conteo directo, cámbialo aquí:
  // const res = await fetch(`${BASE_URL_API}/postulaciones/oferta/${ofertaId}/count`);
  // const { count } = await res.json(); return Number(count) || 0;

  const res = await fetch(`${BASE_URL_API}/postulaciones/oferta/${ofertaId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return extractPostulantesCount(json);
}

// ───────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────
(async () => {
  const token = localStorage.getItem('token');
  const userId = getUserIdFromToken();

  if (!userId) {
    console.error('❌ Token no válido o no contiene userId');
    showToast('Token no válido', 'error');
    return;
  }

  try {
    // 1) Empleador
    const empleadorRes = await fetch(`${BASE_URL_API}/empleador/basic-info/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!empleadorRes.ok) {
      const error = await empleadorRes.text();
      console.error('❌ Error al obtener empleador:', error);
      showToast('Error al cargar empleador.', 'error');
      return;
    }
    const { empleador_id } = await empleadorRes.json();

    // 2) Ofertas
    const ofertasRes = await fetch(`${BASE_URL_API}/ofertas/empleador/${empleador_id}?page=1&take=10&order=DESC`);
    if (!ofertasRes.ok) {
      const error = await ofertasRes.text();
      console.error('❌ Error al obtener ofertas:', error);
      showToast('Error al cargar las ofertas.', 'error');
      return;
    }
    const { data: ofertas } = await ofertasRes.json();

    const tbody = document.getElementById('ofertas-body');
    tbody.innerHTML = '';

    // 3) Pintar tabla con conteo correcto (paralelizando para velocidad)
    const filas = await Promise.all(
      ofertas.map(async (oferta) => {
        const fecha = new Date(oferta.fecha_cierre).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        let totalPostulantes = 0;
        try {
          totalPostulantes = await getPostulantesCount(oferta.id);
        } catch (err) {
          console.warn(`❗ No se pudo obtener postulantes para oferta ${oferta.id}:`, err);
        }

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
            <a href="employer-candidate.html?id=${oferta.id}" class="btn btn-outline-primary btn-sm rounded-pill d-inline-flex align-items-center position-relative px-2 py-1">
              <i class="far fa-users me-1 fs-6"></i>
              <span class="fs-6">Postulantes</span>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style="font-size: 1em; padding: 0.25em 0.4em;">
                ${totalPostulantes}
                <span class="visually-hidden">postulantes</span>
              </span>
              <i class="far fa-chevron-right ms-1 fs-6"></i>
            </a>
          </td>
          <td>${fecha}</td>
          <td>
            <span class="badge ${oferta.es_activa ? 'badge-success' : 'badge-secondary'}">
              ${oferta.es_activa ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <a href="employer-view-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-eye"></i></a>
            <a href="employer-edit-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-pen"></i></a>
            <a href="#" class="btn btn-outline-danger btn-sm btn-delete" data-id="${oferta.id}"><i class="far fa-trash-can"></i></a>
          </td>
        `;
        return tr;
      })
    );

    filas.forEach((tr) => tbody.appendChild(tr));

    activarBotonesEliminar(token);
  } catch (error) {
    console.error('❌ Error cargando ofertas:', error);
    showToast('Error al cargar las ofertas', 'error');
  }
})();

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

  confirmBtn.addEventListener('click', async () => {
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
  });
}
