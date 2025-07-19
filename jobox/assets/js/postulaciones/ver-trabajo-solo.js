document.addEventListener('DOMContentLoaded', async () => {
    const idOferta = getIdOfertaFromURL();
    if (!idOferta) return alert('No se encontró la oferta');

    try {
        const response = await fetch(`https://tuempleo.cl/api/v1/ofertas/${idOferta}`);
        if (!response.ok) throw new Error('Error al cargar la oferta');
        
        const oferta = await response.json();
        const data = JSON.parse(oferta.data);
        
        // Mostrar información básica de la oferta
        document.title = `${oferta.titulo} - ${oferta.empresa.nombre_fantasia}`;
        document.querySelector('h4.mb-4').textContent = oferta.titulo;
        document.querySelector('.job-single-employer-info h5 a').textContent = oferta.empresa.nombre_fantasia;
        document.querySelector('.job-single-employer-info p').textContent = oferta.empresa.data.actividades_economicas[0] || 'Sin datos';

        // Mostrar detalles de la oferta
        document.querySelector('.fecha-publicacion').textContent = formatFecha(oferta.fecha_publicacion);
        document.querySelector('.fecha-cierre').textContent = formatFecha(oferta.fecha_cierre);
        document.querySelector('.area-trabajo').textContent = data.area_trabajo || 'No especificado';
        document.querySelector('.experiencia').textContent = (data.anios_experiencia || '0') + ' años';
        document.querySelector('.ubicacion').textContent = oferta.empleador?.data?.region || 'Sin datos';
        document.querySelector('.educacion').textContent = formatEducacion(data.educacion_requerida);
        document.querySelector('.tipo-contrato').textContent = data.tipo_contrato ? formatTextoBonito(data.tipo_contrato) : 'No definido';
        document.querySelector('.modalidad').textContent = formatModalidad(data.modalidad);
        document.querySelector('.renta').textContent = data.renta_salarial?.desde && data.renta_salarial?.hasta ? 
            `$${formatNum(data.renta_salarial.desde)} - $${formatNum(data.renta_salarial.hasta)}` : 'De acuerdo al mercado';
        document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto || '';
        
        // Renderizar listas
        renderLista(data.responsabilidades, '.responsabilidades-list');
        renderLista(data.requisitos_minimos, '.requisitos-list');
        renderLista(data.beneficios, '.beneficios-list');
        renderLista(data.herramientas_basicas, '.herramientas-list');
        renderLista(data.preguntas_personalizadas, '.preguntas-list');
        
        // Ocultar o modificar elementos relacionados con postulación
        const btnPostular = document.getElementById('btn-postular');
        if (btnPostular) {
            btnPostular.innerHTML = `<span class="fe-log-in"></span> Iniciar sesión para postular`;
            btnPostular.classList.add('btn', 'btn-primary');
            btnPostular.href = 'login.html'; // Redirigir a página de login
            btnPostular.addEventListener('click', (e) => {
                if (btnPostular.href.includes('login')) return;
                e.preventDefault();
                alert('Por favor inicia sesión para postular a esta oferta');
            });
        }
        
    } catch (error) {
        console.error('Error cargando la oferta:', error);
        alert('Error al cargar los detalles de la oferta');
    }
});

// Funciones auxiliares (igual que antes)
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