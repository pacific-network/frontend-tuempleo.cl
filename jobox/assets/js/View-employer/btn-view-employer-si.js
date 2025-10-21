document.addEventListener('DOMContentLoaded', async () => {
  const idOferta = getIdFromURL();
  if (!idOferta) return;

  try {
    // Headers con auth si estás logeado
    const headers = { 'Accept': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${BASE_URL_API}/ofertas/${encodeURIComponent(idOferta)}`, { headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const oferta = await resp.json();

    const rutEmpresa = oferta?.empresa?.rut;
    if (!rutEmpresa) return;

    // Enlaces reales del bloque empleador (no hay IDs en el HTML)
    const logoLink   = document.querySelector('.job-single-employer > a');
    const nombreLink = document.querySelector('.job-single-employer-info h5 > a');

    const go = (e) => {
      e.preventDefault();
      // Guardamos para la vista de empresa (oculto en URL)
      sessionStorage.setItem('selectedEmployerRut', rutEmpresa);
      // Guardamos para que el botón "Volver" retorne a la oferta exacta
      sessionStorage.setItem('fromJobId', idOferta);
      // 🔧 Navegamos PASANDO jobId en la URL (robusto aunque se pierda sessionStorage)
      window.location.href = `candidate-employer-view-si.html?jobId=${encodeURIComponent(idOferta)}`;
    };

    if (logoLink)   logoLink.addEventListener('click', go);
    if (nombreLink) nombreLink.addEventListener('click', go);

    // Fallbacks por si JS falla: dejamos enlaces con jobId (sin rut)
    const employerUrl = `candidate-employer-view-si.html?jobId=${encodeURIComponent(idOferta)}`;
    if (logoLink)   logoLink.setAttribute('href', employerUrl);
    if (nombreLink) nombreLink.setAttribute('href', employerUrl);

  } catch (err) {
    console.error('Error obteniendo oferta:', err);
  }
});

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}