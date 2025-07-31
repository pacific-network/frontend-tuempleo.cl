document.addEventListener('DOMContentLoaded', async () => {
    const idOferta = getIdOfertaFromURL();
    if (!idOferta) return alert('No se encontró la oferta');

    try {
        // Obtener oferta
        const response = await fetch(`${BASE_URL_API}/ofertas/${idOferta}`);
        const oferta = await response.json();
        const data = JSON.parse(oferta.data);
        const preguntas = data.preguntas_personalizadas;

        // Renderizar preguntas personalizadas
        if (Array.isArray(preguntas) && preguntas.length > 0) {
            const form = document.getElementById('formulario-preguntas');
            preguntas.forEach(pregunta => {
                const div = document.createElement('div');
                div.classList.add('mb-3');
                div.innerHTML = `
                    <label class="form-label fw-semibold">${pregunta}</label>
                    <input type="text" class="form-control pregunta-input" data-pregunta="${pregunta}" placeholder="Escribe tu respuesta aquí" required>
                `;
                form.appendChild(div);
            });
            document.body.dataset.tienePreguntas = '1';
        }

        // Datos oferta en DOM
        document.title = `${oferta.titulo} - ${oferta.empresa.nombre_fantasia}`;
        document.querySelector('h4.mb-4').textContent = oferta.titulo;
        document.querySelector('.job-single-employer-info h5 a').textContent = oferta.empresa.nombre_fantasia;
        document.querySelector('.job-single-employer-info p').textContent = oferta.empresa.data.actividades_economicas[0] || 'Sin datos';

        document.querySelector('.fecha-publicacion').textContent = formatFecha(oferta.fecha_publicacion);
        document.querySelector('.fecha-cierre').textContent = formatFecha(oferta.fecha_cierre);
        document.querySelector('.area-trabajo').textContent = data.area_trabajo || 'No especificado';
        document.querySelector('.experiencia').textContent = (data.anios_experiencia || '0') + ' años';
        document.querySelector('.ubicacion').textContent = oferta.empleador?.data?.region || 'Sin datos';
        document.querySelector('.educacion').textContent = formatEducacion(data.educacion_requerida);
        document.querySelector('.tipo-contrato').textContent = data.tipo_contrato ? formatTextoBonito(data.tipo_contrato) : 'No definido';
        document.querySelector('.modalidad').textContent = formatModalidad(data.modalidad);
        document.querySelector('.renta').textContent = data.renta_salarial?.desde && data.renta_salarial?.hasta ? `$${formatNum(data.renta_salarial.desde)} - $${formatNum(data.renta_salarial.hasta)}` : 'De acuerdo al mercado';
        document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto || '';
        renderLista(data.responsabilidades, '.responsabilidades-list');
        renderLista(data.requisitos_minimos, '.requisitos-list');
        renderLista(data.beneficios, '.beneficios-list');
        renderLista(data.herramientas_basicas, '.herramientas-list');
        renderLista(data.preguntas_personalizadas, '.preguntas-list');

        // Obtener token y usuario
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = JSON.parse(atob(token.split('.')[1]));
        const usuarioId = decoded.sub;

        // Cambié aquí: endpoint para obtener postulaciones del usuario
        try {
            const postulacionesRes = await fetch(`${BASE_URL_API}/postulaciones/postulante`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!postulacionesRes.ok) throw new Error('Error al obtener postulaciones');
            const postulaciones = await postulacionesRes.json();

            // Verificar si ya postuló a esta oferta (por id)
            const yaPostulado = postulaciones.some(postulacion => postulacion.oferta?.id === parseInt(idOferta));
            const btnPostular = document.getElementById('btn-postular');

            if (yaPostulado) {
                btnPostular.innerHTML = `<span class="fe-check-circle"></span> Ya estás postulado`;
                btnPostular.classList.remove('btn-primary');
                btnPostular.classList.add('btn-secondary', 'disabled');
                btnPostular.href = '#';
                btnPostular.setAttribute('aria-disabled', 'true');
                btnPostular.style.pointerEvents = 'none';
                btnPostular.style.opacity = '0.65';
                btnPostular.style.cursor = 'not-allowed';
            } else {
                btnPostular.innerHTML = `<span class="fe-briefcase"></span> Postular`;
                btnPostular.classList.add('btn', 'btn-primary');
                btnPostular.classList.remove('btn-secondary', 'disabled');
                btnPostular.href = '#';
                btnPostular.setAttribute('aria-disabled', 'false');
                btnPostular.style.pointerEvents = 'auto';
                btnPostular.style.opacity = '1';
                btnPostular.style.cursor = 'pointer';
                btnPostular.addEventListener('click', handlePostularClick);
            }

        } catch (error) {
<<<<<<< HEAD
            console.error('Error verificando postulación:', error);
=======
        console.error('Error verificando postulación:', error);
        } if (Array.isArray(preguntas) && preguntas.length > 0) {
            const form = document.getElementById('formulario-preguntas');
            preguntas.forEach(pregunta => {
                const div = document.createElement('div');
                div.classList.add('mb-3');
                div.innerHTML = `
                    <label class="form-label fw-semibold">${pregunta}</label>
                    <input type="text" class="form-control pregunta-input" data-pregunta="${pregunta}" placeholder="Escribe tu respuesta aquí" required>
                `;
                form.appendChild(div);
            });

            const alerta = document.getElementById('alerta-preguntas');
            if (alerta) alerta.classList.remove('d-none');

            document.body.dataset.tienePreguntas = '1';
        } else {
            const alerta = document.getElementById('alerta-preguntas');
            if (alerta) alerta.classList.add('d-none');

            document.body.dataset.tienePreguntas = '0';
>>>>>>> dev
        }

    } catch (error) {
        console.error('Error cargando la oferta:', error);
    }
});

function handlePostularClick(e) {
    e.preventDefault();
    const tienePreguntas = document.body.dataset.tienePreguntas === '1';
    const modalElement = document.getElementById('modalPreguntas');

    if (tienePreguntas) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        setTimeout(() => {
            modalElement.removeAttribute('aria-hidden');
            const firstInput = modalElement.querySelector('input.pregunta-input');
            if (firstInput) firstInput.focus();
        }, 200);
    } else {
        enviarPostulacion();
    }
}

document.getElementById('btn-confirmar-postulacion').addEventListener('click', async () => {
    const form = document.getElementById('formulario-preguntas');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    await enviarPostulacion();
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPreguntas'));
    if (modal) modal.hide();
});

async function enviarPostulacion() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Token no encontrado');

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const usuarioId = decoded.sub;

    try {
        const postulanteResp = await fetch(`${BASE_URL_API}/postulante/${usuarioId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!postulanteResp.ok) throw new Error('No se pudo obtener el postulante');
        const postulanteData = await postulanteResp.json();
        const postulanteId = postulanteData.id;
        const ofertaId = getIdOfertaFromURL();
        if (!ofertaId || !postulanteId) return alert('Faltan datos para postular');

        const inputs = document.querySelectorAll('.pregunta-input');
        const preguntasRespuestas = [...inputs].map(input => ({
            pregunta: input.dataset.pregunta,
            respuesta: input.value.trim()
        }));

        const payload = {
            postulante_id: postulanteId,
            oferta_id: parseInt(ofertaId),
            data: { preguntas: preguntasRespuestas }
        };

        const res = await fetch(`${BASE_URL_API}/postulaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 409) {
            alert('Ya estás postulado a esta oferta.');
        } else if (!res.ok) {
            throw new Error('Error inesperado al postular');
        } else {
            alert('¡Postulación enviada con éxito!');
            const btnPostular = document.getElementById('btn-postular');
            btnPostular.textContent = 'Ya estás postulado';
            btnPostular.classList.add('disabled', 'btn-secondary');
            btnPostular.classList.remove('theme-btn', 'btn-primary');
            btnPostular.removeEventListener('click', handlePostularClick);
            btnPostular.href = '#';
            btnPostular.setAttribute('aria-disabled', 'true');
            btnPostular.style.pointerEvents = 'none';
            btnPostular.style.opacity = '0.65';
            btnPostular.style.cursor = 'not-allowed';
        }

    } catch (err) {
        console.error(err);
        alert('Ocurrió un error al postular. Intenta nuevamente.');
    }
}

// Funciones auxiliares
function renderLista(arr, selector) {
    const ul = document.querySelector(selector);
    if (!ul || !Array.isArray(arr)) return;
    ul.innerHTML = '';
    arr.forEach(texto => {
        const li = document.createElement('li');
        li.textContent = texto;
        li.classList.add('mb-2');
        ul.appendChild(li);
    });
}

function formatFecha(fechaStr) {
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-CL');
}

function formatNum(num) {
    return parseInt(num).toLocaleString('es-CL');
}

function formatEducacion(value) {
    const mapa = {
        superior: 'Superior - Universitario',
        media: 'Educación Media',
        basica: 'Educación Básica'
    };
    return mapa[value] || value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatTextoBonito(texto) {
    return texto.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatModalidad(val) {
    const mapa = {
        '1': 'Full Time',
        '2': 'Part Time',
        '3': 'Femoto',
        '4': 'Freelancer',
        '5': 'Temporal'
    };
    return mapa[val] || 'No especificado';
}

function getIdOfertaFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
