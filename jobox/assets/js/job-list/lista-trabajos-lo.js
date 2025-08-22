document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`${BASE_URL_API}/ofertas`);
    const result = await response.json();

    const ofertas = result.data || [];

    const contenedor = document.getElementById('ofertas-container');
    contenedor.innerHTML = '';

    if (ofertas.length === 0) {
      contenedor.innerHTML = `<p class="text-center">No hay ofertas disponibles por el momento.</p>`;
      return;
    }

    ofertas.forEach(oferta => {
      const data = JSON.parse(oferta.data || '{}');
      const herramientas = (data.herramientas_basicas || [])
        .map(h => `<a><span>${h}</span></a>`)
        .join('');

      const html = `
        <div class="col-lg-12">
          <div class="job-item" onclick="window.location.href='job-single-2.html?id=${oferta.id}'" style="cursor:pointer;">
            <div class="job-img">
              <img src="assets/img/job/01.jpg" alt="">
            </div>
            <div class="job-content">
              <div class="job-top">
                <div class="job-title">
                  <h5>${oferta.titulo}</h5>
                  <span class="job-employer">
                    <i class="far fa-building"></i> ${oferta.empresa?.nombre_fantasia || 'Empresa no disponible'}
                  </span>
                </div>
              </div>
              <ul class="job-info-list">
                <li><i class="fe-briefcase"></i> ${data.area_trabajo || 'Área no especificada'}</li>
                <li><i class="fe-check-circle"></i> ${formatModalidad(data.modalidad)}</li>
                <li><i class="fe-clock"></i> ${diasDesde(oferta.fecha_publicacion)}</li>
                <li><i class="fas fa-timer"></i> Exp: ${formatFecha(oferta.fecha_cierre)}</li>
                <li><i class="fe-dollar-sign"></i> Salario: ${formatRango(data.renta_salarial)}</li>
                <li><i class="fe-map-pin"></i> ${oferta.empleador?.data?.region || 'Región no disponible'}</li>
              </ul>
              <div class="job-skill">${herramientas}</div>
            </div>
          </div>
        </div>
      `;

      contenedor.insertAdjacentHTML('beforeend', html);
    });
  } catch (error) {
    console.error('❌ Error al cargar ofertas:', error);
    const contenedor = document.getElementById('ofertas-container');
    contenedor.innerHTML = `<p class="text-danger text-center">No se pudieron cargar las ofertas. Intenta más tarde.</p>`;
  }
});

// Helpers
function formatModalidad(val) {
  const mapa = {
    '1': 'Full Time',
    '2': 'Part Time',
    '3': 'Remoto',
    '4': 'Freelance',
    '5': 'Híbrido'
  };
  return mapa[val] || 'No especificado';
}
function formatFecha(fechaStr) {
  if (!fechaStr) return 'Sin fecha';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-CL');
}
function formatRango(renta) {
  if (!renta?.desde || !renta?.hasta) return 'No disponible';
  return `$${parseInt(renta.desde).toLocaleString('es-CL')} - $${parseInt(renta.hasta).toLocaleString('es-CL')}`;
}
function diasDesde(fechaStr) {
  if (!fechaStr) return 'Fecha desconocida';
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
  return dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`;
}
