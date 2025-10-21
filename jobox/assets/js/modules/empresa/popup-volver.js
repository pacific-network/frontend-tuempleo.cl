document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Evita que se vaya de inmediato

            Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Quieres cancelar el registro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, continuar',
                confirmButtonColor: '#e74c3c', // Rojo más suave
                cancelButtonColor: '#3498db', // Azul suave
                buttonsStyling: true,
                customClass: {
                    confirmButton: 'swal2-confirm btn-confirm-custom',
                    cancelButton: 'swal2-cancel btn-cancel-custom'
                },
                reverseButtons: true,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    window.location.href = 'login-employer.html';
                }
            });
        });
    }
});