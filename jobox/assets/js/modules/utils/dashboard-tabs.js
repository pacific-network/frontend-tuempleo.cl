document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll('#visitasTabs .nav-link');
    const tabContents = document.querySelectorAll('.tab-pane');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
  
        // Quitar la clase activa de todos los tabs
        tabs.forEach(t => t.classList.remove('active'));
  
        // Ocultar todos los contenidos
        tabContents.forEach(content => {
          content.classList.add('d-none');
          content.classList.remove('active');
        });
  
        // Activar el tab clickeado
        this.classList.add('active');
  
        // Mostrar el contenido correspondiente
        const tabId = this.getAttribute('data-tab');
        const target = document.getElementById(`tab-${tabId}`);
        if (target) {
          target.classList.remove('d-none');
          target.classList.add('active');
        }
      });
    });
  });
  