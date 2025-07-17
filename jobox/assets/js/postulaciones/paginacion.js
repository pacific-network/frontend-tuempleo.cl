const ITEMS_POR_PAGINA = 10;
let paginaActual = 1;
let empleos = []; // ← esto lo llenas con fetch como lo hacías antes

function renderEmpleosPagina(pagina) {
  const container = document.getElementById('ofertas-container');
  container.innerHTML = '';
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const empleosPagina = empleos.slice(inicio, fin);

  empleosPagina.forEach(oferta => {
    const empresa = oferta.empresa?.nombre_fantasia || "Empresa";
    const data = JSON.parse(oferta.data);
    const modalidad = {
      1: "Full Time",
      2: "Part Time",
      3: "Remoto",
      4: "Freelancer",
      5: "Temporal"
    }[parseInt(data.modalidad)] || "N/D";
    const region = {
      1: "Región de Arica y Parinacota",
      2: "Región de Tarapacá",
      3: "Región de Antofagasta",
      4: "Región de Atacama",
      5: "Región de Coquimbo",
      6: "Región de Valparaíso",
      7: "Región Metropolitana de Santiago",
      8: "Región del Libertador General Bernardo O’Higgins",
      9: "Región del Maule",
      10: "Región de Ñuble",
      11: "Región del Biobío",
      12: "Región de La Araucanía",
      13: "Región de Los Ríos",
      14: "Región de Los Lagos",
      15: "Región de Aysén del General Carlos Ibáñez del Campo",
      16: "Región de Magallanes y de la Antártica Chilena"
    }[parseInt(data.region)] || "Región no especificada";

    let sueldoDesde = Number(data.renta_salarial?.desde);
    let sueldoHasta = Number(data.renta_salarial?.hasta);
    if (isNaN(sueldoDesde)) sueldoDesde = 1;
    if (isNaN(sueldoHasta)) sueldoHasta = 1;
    const sueldoTexto = `${sueldoDesde.toLocaleString('es-CL')} - ${sueldoHasta.toLocaleString('es-CL')}`;
    const habilidades = (data.herramientas_basicas || []).map(h => `<a><span>${h}</span></a>`).join(' ');

    container.innerHTML += `
      <div class="col-lg-12">
        <div class="job-item" onclick="window.location.href='job-single-2-si.html?id=${oferta.id}'" style="cursor:pointer;">
          <div class="job-img">
            <img src="assets/img/job/01.jpg" alt="">
          </div>
          <div class="job-content">
            <div class="job-top">
              <div class="job-title">
                <h5>${oferta.titulo}</h5>
                <span class="job-employer"><i class="far fa-building"></i> ${empresa}</span>
              </div>
            </div>
            <ul class="job-info-list">
              <li><i class="fe-briefcase"></i> ${data.area_trabajo}</li>
              <li><i class="fe-check-circle"></i> ${modalidad}</li>
              <li><i class="fe-clock"></i> Hace ${Math.floor(Math.random() * 5 + 1)} días</li>
              <li><i class="fas fa-timer"></i> Exp: ${new Date(oferta.fecha_cierre).toLocaleDateString('es-CL')}</li>
              <li><i class="fe-dollar-sign"></i> Salario: ${sueldoTexto}</li>
              <li><i class="fe-map-pin"></i> ${region}</li>
            </ul>
            <div class="job-skill">${habilidades}</div>
          </div>
        </div>
      </div>
    `;
  });

  actualizarPaginacion(pagina);
}

function actualizarPaginacion(pagina) {
  const totalPaginas = Math.ceil(empleos.length / ITEMS_POR_PAGINA);
  const paginacion = document.querySelector('.pagination');
  paginacion.innerHTML = '';

  // Botón Anterior
  paginacion.innerHTML += `
    <li class="page-item ${pagina === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${pagina - 1})">
        <i class="far fa-angle-double-left"></i>
      </a>
    </li>
  `;

  for (let i = 1; i <= totalPaginas; i++) {
    paginacion.innerHTML += `
      <li class="page-item ${i === pagina ? 'active' : ''}">
        <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
      </li>
    `;
  }

  // Botón Siguiente
  paginacion.innerHTML += `
    <li class="page-item ${pagina === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${pagina + 1})">
        <i class="far fa-angle-double-right"></i>
      </a>
    </li>
  `;

  document.querySelector('.pagination-showing p').textContent =
    `Mostrando ${Math.min((pagina - 1) * ITEMS_POR_PAGINA + 1, empleos.length)} - ${Math.min(pagina * ITEMS_POR_PAGINA, empleos.length)} de ${empleos.length} empleos`;
}

function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(empleos.length / ITEMS_POR_PAGINA);
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
  paginaActual = nuevaPagina;
  renderEmpleosPagina(paginaActual);
}

// Simulamos fetch con un delay (reemplaza esto por tu fetch real)
(async () => {
  try {
    const resp = await fetch(`${BASE_URL_API}/ofertas`);
    const data = await resp.json();
    empleos = data.filter(e => e.es_activa); // puedes agregar más filtros si quieres
    renderEmpleosPagina(1);
  } catch (e) {
    console.error("Error al cargar empleos:", e);
  }
})();