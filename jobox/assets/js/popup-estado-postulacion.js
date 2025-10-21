// Función para mostrar el popup y ocultarlo automáticamente
function mostrarEstadoPostulacion() {
  const popup = document.getElementById('estado-postulacion');
  popup.classList.remove('d-none');
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.classList.add('d-none');
    }, 400); // Tiempo para terminar la animación
  }, 4000); // Visible 4 segundos
}
