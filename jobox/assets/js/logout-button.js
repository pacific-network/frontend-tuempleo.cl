
  document.addEventListener('DOMContentLoaded', function () {
    // Protección del dashboard: redirige si no hay token
    const token = localStorage.getItem('token');
    if (!token) {
      location.replace('./index.html'); // redirige sin dejar volver atrás
    }

    // Mostrar modal al hacer click en "Cerrar sesión"
    document.getElementById('logoutButton').addEventListener('click', function (e) {
      e.preventDefault();
      const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
      modal.show();
    });

    // Confirmar logout
    document.getElementById('confirmLogout').addEventListener('click', function () {
      localStorage.removeItem('token');
      location.replace('../index.html'); // redirección sin historial
    });
  });
