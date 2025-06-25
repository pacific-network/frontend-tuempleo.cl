//src/assets/js/modules/ofertas/eliminar-oferta.js

export function activarBotonesEliminar() {
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const ofertaId = button.getAttribute('data-id');
      const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta oferta?');
      if (!confirmDelete) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          alert('Oferta eliminada correctamente');
          location.reload(); // recarga tabla
        } else {
          const errText = await res.text();
          alert(`Error al eliminar: ${errText}`);
        }
      } catch (err) {
        console.error('Error eliminando oferta:', err);
        alert('No se pudo eliminar la oferta.');
      }
    });
  });
}

