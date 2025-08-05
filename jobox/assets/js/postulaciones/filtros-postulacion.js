const REGIONES_CHILE = {
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
};

const MODALIDADES = {
  1: "Full Time",
  2: "Part Time",
  3: "Remoto",
  4: "Freelancer",
  5: "Temporal"
};

function parseDataString(dataStr) {
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    console.error('Error al parsear data:', e);
    return {};
  }
}

function calcularSimilitud(base, comparada) {
  let score = 0;

  if (base.area_trabajo === comparada.area_trabajo) score += 5;
  if (base.region === comparada.region) score += 3;
  if (base.modalidad === comparada.modalidad) score += 2;

  const baseTools = new Set(base.herramientas_basicas || []);
  const compTools = new Set(comparada.herramientas_basicas || []);
  baseTools.forEach(t => {
    if (compTools.has(t)) score += 1;
  });

  return score;
}

function renderTrabajosRelacionados(ofertasRelacionadas) {
  const contenedor = document.querySelector('.related-job .row');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  ofertasRelacionadas.forEach(oferta => {
    const data = parseDataString(oferta.data);
    const empresa = oferta.empresa?.nombre_fantasia || "Empresa";
    const regionNombre = REGIONES_CHILE[parseInt(data.region)] || "Región no especificada";
    const modalidadNombre = MODALIDADES[parseInt(data.modalidad)] || "Modalidad desconocida";

    // Salario con validación NaN
    let sueldoDesde = Number(data.renta_salarial?.desde);
    let sueldoHasta = Number(data.renta_salarial?.hasta);
    if (isNaN(sueldoDesde)) sueldoDesde = 1;
    if (isNaN(sueldoHasta)) sueldoHasta = 1;
    const sueldoTexto = `${sueldoDesde.toLocaleString('es-CL')} - ${sueldoHasta.toLocaleString('es-CL')}`;

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
                <span class="job-employer"><i class="far fa-building"></i> ${empresa}</span>
              </div>
            </div>
            <ul class="job-info-list">
              <li><i class="fe-briefcase"></i> ${data.area_trabajo || 'N/D'}</li>
              <li><i class="fe-check-circle"></i> ${modalidadNombre}</li>
              <li><i class="fe-clock"></i> Hace ${Math.floor(Math.random() * 5 + 1)} días</li>
              <li><i class="fal fa-clock-rotate-left"></i> Exp: ${new Date(oferta.fecha_cierre).toLocaleDateString('es-CL')}</li>
              <li><i class="fe-dollar-sign"></i> Salario: ${sueldoTexto}</li>
              <li><i class="fe-map-pin"></i> ${regionNombre}</li>
            </ul>
            <div class="job-skill">
              ${(data.herramientas_basicas || []).map(h => `<a><span>${h}</span></a>`).join(' ')}
            </div>
          </div>
        </div>
      </div>`;

    contenedor.insertAdjacentHTML('beforeend', html);
  });
}

(async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const ofertaActualResp = await fetch(`${BASE_URL_API}/ofertas/${id}`);
    const ofertaActual = await ofertaActualResp.json();
    const dataActual = parseDataString(ofertaActual.data);

    const todasResp = await fetch(`${BASE_URL_API}/ofertas`);
    const todasJson = await todasResp.json();
    const todas = Array.isArray(todasJson) ? todasJson : todasJson.data || [];

    const relacionadas = todas
      .filter(o => o.id != id && o.es_activa)
      .map(o => ({
        ...o,
        similitud: calcularSimilitud(dataActual, parseDataString(o.data))
      }))
      .filter(o => o.similitud >= 5)
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, 3);

    renderTrabajosRelacionados(relacionadas);

  } catch (err) {
    console.error('Error cargando trabajos relacionados:', err);
  }
})();
