document.addEventListener('DOMContentLoaded', async () => {
    const idOferta = getIdOfertaFromURL();
    if (!idOferta) {
        await Swal.fire({
            icon: 'error',
            title: 'No se encontró la oferta',
            text: 'No se encontró la oferta',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    try {
        const response = await fetch(`${BASE_URL_API}/ofertas/${idOferta}`);
        if (!response.ok) throw new Error('Error al cargar la oferta');
        
        const oferta = await response.json();
        const data = JSON.parse(oferta.data);
        
        // Mostrar información básica de la oferta
        document.title = `${oferta.titulo} - ${oferta.empresa.nombre_fantasia}`;
        document.querySelector('h4.mb-4').textContent = oferta.titulo || '';

        const infoEmpresa = document.querySelector('.job-single-employer-info');
        if (infoEmpresa) {
          const nombreEl = infoEmpresa.querySelector('h5 a');
          const giroEl = infoEmpresa.querySelector('p');
          if (nombreEl) nombreEl.textContent = oferta.empresa?.nombre_fantasia || '';
          if (giroEl) {
            const act = oferta.empresa?.data?.actividades_economicas?.[0];
            if (act && act.trim() !== '') giroEl.textContent = act;
            else giroEl.remove();
          }
        }

        // Fechas
        if (oferta.fecha_publicacion)
          document.querySelector('.fecha-publicacion').textContent = formatFecha(oferta.fecha_publicacion);
        else
          document.querySelector('.fecha-publicacion').closest('li')?.remove();

        if (oferta.fecha_cierre)
          document.querySelector('.fecha-cierre').textContent = formatFecha(oferta.fecha_cierre);
        else
          document.querySelector('.fecha-cierre').closest('li')?.remove();

        // Área
        if (data.area_trabajo && data.area_trabajo.trim() !== '')
          document.querySelector('.area-trabajo').textContent = data.area_trabajo;
        else
          document.querySelector('.area-trabajo').closest('li')?.remove();

        // Experiencia
        if (data.anios_experiencia)
          document.querySelector('.experiencia').textContent = `${data.anios_experiencia} años`;
        else
          document.querySelector('.experiencia').closest('li')?.remove();

        // Ubicación
        if (oferta.empleador?.data?.region && oferta.empleador.data.region.trim() !== '')
          document.querySelector('.ubicacion').textContent = oferta.empleador.data.region;
        else
          document.querySelector('.ubicacion').closest('li')?.remove();

        // Educación
        if (data.educacion_requerida)
          document.querySelector('.educacion').textContent = formatEducacion(data.educacion_requerida);
        else
          document.querySelector('.educacion').closest('li')?.remove();

        // Tipo de contrato
        if (data.tipo_contrato)
          document.querySelector('.tipo-contrato').textContent = formatTextoBonito(data.tipo_contrato);
        else
          document.querySelector('.tipo-contrato').closest('li')?.remove();

        // Modalidad
        if (data.modalidad)
          document.querySelector('.modalidad').textContent = formatModalidad(data.modalidad);
        else
          document.querySelector('.modalidad').closest('li')?.remove();

        // Renta
        if (data.renta_salarial?.desde && data.renta_salarial?.hasta) {
          document.querySelector('.renta').textContent =
            `$${formatNum(data.renta_salarial.desde)} - $${formatNum(data.renta_salarial.hasta)}`;
        } else if (data.renta_salarial?.desde || data.renta_salarial?.hasta) {
          const soloUno = data.renta_salarial.desde
            ? `$${formatNum(data.renta_salarial.desde)}`
            : `$${formatNum(data.renta_salarial.hasta)}`;
          document.querySelector('.renta').textContent = soloUno;
        } else {
          document.querySelector('.renta').closest('li')?.remove();
        }

        // Descripción
        if (data.descripcion_puesto && data.descripcion_puesto.trim() !== '')
          document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto;
        else
          document.querySelector('.descripcion-puesto').closest('section, div, li')?.remove();

        // Listas (solo si tienen contenido real)
        renderLista(data.responsabilidades?.filter(t => !!t?.trim()), '.responsabilidades-list');
        renderLista(data.requisitos_minimos?.filter(t => !!t?.trim()), '.requisitos-list');
        renderLista(data.beneficios?.filter(t => !!t?.trim()), '.beneficios-list');
        renderLista(data.herramientas_basicas?.filter(t => !!t?.trim()), '.herramientas-list');
        renderLista(data.preguntas_personalizadas?.filter(t => !!t?.trim()), '.preguntas-list');
        
        const alerta = document.getElementById('alerta-preguntas');
        const preguntas = data.preguntas_personalizadas;

        if (Array.isArray(preguntas) && preguntas.length > 0) {
            alerta?.classList.remove('d-none');
            document.body.dataset.tienePreguntas = '1';
        } else {
            alerta?.classList.add('d-none');
            document.body.dataset.tienePreguntas = '0';
        }
        // Ocultar o modificar elementos relacionados con postulación
        const btnPostular = document.getElementById('btn-postular');
        if (btnPostular) {
            btnPostular.innerHTML = `<span class="fe-log-in"></span> Iniciar sesión para postular`;
            btnPostular.classList.add('btn', 'btn-primary');
            btnPostular.href = 'login.html'; // Redirigir a página de login
            btnPostular.addEventListener('click', async (e) => {
                if (btnPostular.href.includes('login')) return;
                e.preventDefault();
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sesión requerida',
                    text: 'Por favor inicia sesión para postular a esta oferta',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3085d6'
                });
            });
        }
        
    } catch (error) {
        console.error('Error cargando la oferta:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error al cargar los detalles',
            text: 'Error al cargar los detalles de la oferta',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
        });
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
