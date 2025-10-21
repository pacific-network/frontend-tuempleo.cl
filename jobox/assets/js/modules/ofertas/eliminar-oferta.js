// src/assets/js/modules/ofertas/eliminar-oferta.js

export function activarBotonesEliminar() {
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const ofertaId = button.getAttribute('data-id');
      if (!ofertaId) return;

      // Reemplazo de confirm()
      const { isConfirmed } = await Swal.fire({
        icon: 'question',
        title: '¿Eliminar oferta?',
        text: 'Esta acción no se puede deshacer.',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        allowOutsideClick: false
      });
      if (!isConfirmed) return;

      try {
        const token = localStorage.getItem('token');

        // (Opcional) pequeño loading
        Swal.fire({
          title: 'Eliminando…',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading()
        });

        const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        Swal.close();

        if (res.ok) {
          // Reemplazo de alert() éxito
          await Swal.fire({
            icon: 'success',
            title: '¡Oferta eliminada!',
            text: 'La oferta fue eliminada correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
          location.reload(); // recarga tabla
        } else {
          const errText = await res.text().catch(() => 'Error al eliminar la oferta.');
          // Reemplazo de alert() error
          await Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: errText || 'Error al eliminar la oferta.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
        }
      } catch (err) {
        console.error('Error eliminando oferta:', err);
        Swal.close();
        // Reemplazo de alert() error de red
        await Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo eliminar la oferta.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  });
}
