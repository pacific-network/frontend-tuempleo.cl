document.getElementById('consultarRutBtn').addEventListener('click', async () => {
    const rut = document.getElementById('rutInput').value.trim();

    if (!rut) {
        alert("Por favor, ingrese un RUT.");
        return;
    }

    try {
        const response = await fetch(`https://rut.simpleapi.cl/${rut}`, {
            headers: {
                'Authorization': '6097-R860-6391-9981-7515', // 👈 exactamente como lo pide
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error("No se pudo obtener la información del RUT.");

        const data = await response.json();

        // Llenar campos del formulario si existen datos
        document.querySelector('input[placeholder="Ingrese la Razón Social"]').value = data.razonSocial || '';
        document.querySelector('input[name="nombre_empresa"]').value = data.nombreFantasia !== "Sin datos" ? data.nombreFantasia : '';
        document.querySelector('input[placeholder="Ingrese Correo"]').value = data.correo || '';
        document.querySelector('input[placeholder="Ingrese dirección"]').value = data.domicilios?.[0]?.direccion || '';
        document.querySelector('#comuna').innerHTML = `<option selected>${data.domicilios?.[0]?.comuna || 'Sin datos'}</option>`;
        document.querySelector('#region').innerHTML = `<option selected>${data.domicilios?.[0]?.ciudad || 'Sin datos'}</option>`;

        if (data.fechaInicioActividades) {
            const year = new Date(data.fechaInicioActividades).getFullYear();
            document.querySelector('input[placeholder="Ingrese Año"]').value = year;
        }

        if (data.giro) {
            const actividadSelect = document.getElementById('actividad_empresa_select');
            actividadSelect.innerHTML = `<option selected>${data.giro}</option>`;
        }

    } catch (error) {
        console.error(error);
        const errorElement = document.createElement('div');
        errorElement.textContent = "Error al consultar el RUT. Verifique que sea válido.";
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '5px';
        errorElement.id = 'rutError';

        const rutInputContainer = document.getElementById('rutInput').parentElement;
        const existingError = document.getElementById('rutError');
        if (existingError) {
            existingError.remove();
        }
        rutInputContainer.appendChild(errorElement);
        }
    });
