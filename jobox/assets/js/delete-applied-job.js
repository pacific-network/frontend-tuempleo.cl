document.addEventListener('DOMContentLoaded', function() {
          const deleteModal = new bootstrap.Modal('#confirmDeleteModal');
          let rowToDelete = null;
        
          // Configurar botones de eliminar
          document.querySelectorAll('.btn-outline-danger').forEach(btn => {
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              rowToDelete = this.closest('tr');
              deleteModal.show();
            });
          });
      
          // Confirmar eliminación
          document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
            deleteModal.hide();
            rowToDelete?.remove();
          });
        });