document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const ofertaId = params.get('id');
  
    if (!ofertaId) {
      console.error('ID de oferta no encontrado en la URL');
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL_API}/ofertas/${ofertaId}`);
      if (!res.ok) throw new Error('Error al obtener los datos');
  
      const oferta = await res.json();
      const data = JSON.parse(oferta.data);
  
      // Título
      document.querySelector('h4.mb-4').textContent = data.titulo || 'Sin título';
  
      // Fechas
      document.querySelector('p.fecha-publicacion').textContent =
        new Date(oferta.fecha_publicacion).toLocaleDateString('es-CL');
      document.querySelector('p.fecha-cierre').textContent =
        new Date(oferta.fecha_cierre).toLocaleDateString('es-CL');
  
      // Otros campos
      document.querySelector('p.area-trabajo').textContent = data.area_trabajo || 'No especificado';
      document.querySelector('p.experiencia').textContent = data.anios_experiencia + ' Años' || 'No especificado';
      document.querySelector('p.region').textContent = oferta.empleador?.data?.region || 'No disponible';
      document.querySelector('p.educacion').textContent = data.educacion_requerida || 'No especificado';
      document.querySelector('p.contrato').textContent = data.tipo_contrato || 'No especificado';
      document.querySelector('p.modalidad').textContent = data.modalidad || 'No especificado';
  
      // Renta
      const renta = data.renta_salarial;
      document.querySelector('p.renta').textContent =
        renta?.desde && renta?.hasta
          ? `$${renta.desde} - $${renta.hasta}`
          : renta?.de_acuerdo_al_mercado
          ? 'De acuerdo al mercado'
          : 'No informado';
  
      // Descripciones
      document.querySelector('.descripcion-puesto').textContent = data.descripcion_puesto || 'Sin descripción';
      renderLista('.responsabilidades-list', data.responsabilidades);
      renderLista('.requisitos-list', data.requisitos_minimos);
      renderLista('.beneficios-list', data.beneficios);
  
    } catch (error) {
      console.error('Error al cargar la oferta:', error);
    }
  });
  
  // Renderiza listas dinámicas
  function renderLista(selector, items = []) {
    const ul = document.querySelector(selector);
    if (!ul) return;
  
    ul.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.textContent = item;
      ul.appendChild(li);
    });
  }
  