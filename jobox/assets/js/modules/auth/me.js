// ✅ Esta función se encarga de obtener y mostrar la información del usuario
async function fetchUserDataOnce() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    console.log('Token de autenticación:', token);

    try {
        const response = await fetch(`${BASE_URL_API}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Error al obtener los datos del usuario:', response.status, response.statusText);
            return;
        }

        const userData = await response.json();
        console.log('✅ Usuario autenticado:', userData);

        // 👉 Aquí puedes actualizar el UI
        // Ejemplo:
        document.getElementById('nombre_empleador').value = userData.nombres;
        document.getElementById('apellido_empleador').value= userData.apellidos;
    
        document.getElementById('correo_empleador').value = userData.email;

    } catch (error) {
        console.error('❌ Error al hacer la solicitud:', error);
    }
}

// ✅ Se ejecuta una sola vez cuando el DOM está listo
document.addEventListener('DOMContentLoaded', fetchUserDataOnce);
