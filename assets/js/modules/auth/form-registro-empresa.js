document.getElementById('registroForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const agree = document.getElementById('agree').checked;

    if (!agree) {
        document.getElementById('mensaje').textContent = 'Debes aceptar los Términos de Servicio.';
        return;
    }

    const data = { nombre, email, password };

    try {
        const response = await fetch('/api/register-employer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('mensaje').textContent = 'Registro exitoso.';
            // Redirigir o realizar alguna acción adicional
        } else {
            const error = await response.json();
            document.getElementById('mensaje').textContent = error.message || 'Error en el registro.';
        }
    } catch (error) {
        document.getElementById('mensaje').textContent = 'Error de conexión. Intenta nuevamente.';
    }
});
