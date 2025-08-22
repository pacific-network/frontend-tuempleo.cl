document.addEventListener('DOMContentLoaded', async () => {
  const idOferta = getIdFromURL();
  if (!idOferta) return;

  try {
    const resp = await fetch(`${BASE_URL_API}/ofertas/${encodeURIComponent(idOferta)}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const oferta = await resp.json();

    const rutEmpresa = oferta?.empresa?.rut;
    if (!rutEmpresa) return;

    // Tus anclas con ID en la versión pública
    const logoLink   = document.getElementById('link-logo-empresa');
    const nombreLink = document.getElementById('link-nombre-empresa');

    const go = (e) => {
      e.preventDefault();
      // Guardar datos en esta pestaña
      sessionStorage.setItem('selectedEmployerRut', rutEmpresa);
      sessionStorage.setItem('fromJobId', idOferta);
      // Pasar jobId en URL para robustez
      window.location.href = `candidate-employer-view.html?jobId=${encodeURIComponent(idOferta)}`;
    };

    if (logoLink)   logoLink.addEventListener('click', go);
    if (nombreLink) nombreLink.addEventListener('click', go);

    // Fallbacks si JS no corre
    const employerUrl = `candidate-employer-view.html?jobId=${encodeURIComponent(idOferta)}`;
    if (logoLink)   logoLink.setAttribute('href', employerUrl);
    if (nombreLink) nombreLink.setAttribute('href', employerUrl);

  } catch (error) {
    console.error('Error obteniendo oferta:', error);
  }
});

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}