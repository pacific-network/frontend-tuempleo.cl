import { getUserIdFromToken } from '../utils/decode-jwt.js';

const userId = getUserIdFromToken();

if (!userId) {
  console.error('Token no válido');
} else {
  try {
    const empleadorRes = await fetch(`http://localhost:3000/v1/empleador/basic-info/${userId}`);
    const { empleador_id } = await empleadorRes.json();

    const ofertasRes = await fetch(`http://localhost:3000/v1/ofertas/empleador/${empleador_id}?page=1&take=10&order=DESC`);
    const { data: ofertas } = await ofertasRes.json();

    const tbody = document.getElementById('ofertas-body');
    tbody.innerHTML = ''; // limpia el contenido anterior

    ofertas.forEach(oferta => {
      const row = document.createElement('tr');
      const fecha = new Date(oferta.fecha_cierre).toLocaleDateString('es-CL', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      row.innerHTML = `
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
          <a href="employer-candidate.html" class="btn btn-outline-primary btn-sm rounded-pill d-inline-flex align-items-center position-relative px-2 py-1">
            <i class="far fa-users me-1 fs-6"></i>
            <span class="fs-6">Postulantes</span>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style="font-size: 0.6em; padding: 0.25em 0.4em;">
              0
              <span class="visually-hidden">postulantes</span>
            </span>
            <i class="far fa-chevron-right ms-1 fs-6"></i>
          </a>
        </td>
        <td>${fecha}</td>
        <td><span class="badge ${oferta.es_activa ? 'badge-success' : 'badge-secondary'}">${oferta.es_activa ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <a href="employer-view-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-eye"></i></a>
          <a href="employer-edit-job.html?id=${oferta.id}" class="btn btn-outline-secondary btn-sm"><i class="far fa-pen"></i></a>
          <a href="#" class="btn btn-outline-danger btn-sm btn-delete" data-id="${oferta.id}"><i class="far fa-trash-can"></i></a>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    console.error('Error cargando ofertas:', error);
  }
}