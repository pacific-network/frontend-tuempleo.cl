function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }
  
  const idOferta = getIdFromURL();
  
  if (!idOferta) {
    console.error('ID de oferta no proporcionado en la URL');
  } else {
    fetch(`${BASE_URL_API}/postulaciones/oferta/${idOferta}`)
    .then(res => res.json())
    .then((postulantes) => {
      if (!Array.isArray(postulantes)) {
        console.warn('⚠️ No se recibió un array de postulantes:', postulantes);
        return;
      }
  
      const container = document.getElementById('candidates-container');
      container.innerHTML = '';
  
      postulantes.forEach(post => {
        const candidato = post.postulante || {};
        const data = candidato.data || {};
        const personales = data.datos_personales || {};
  
        const nombre = candidato.nombre || 'Nombre no disponible';
        const cargo = data.experiencias?.[0]?.cargo || 'Sin cargo';
        const comuna = personales.comuna || 'Comuna no especificada';
        const salario = data.preferencias?.salario_esperado || 0;
  
        const idiomasHTML = Array.isArray(data.idiomas)
          ? data.idiomas.map(i => `<a href="#">${i.idioma}</a>`).join('')
          : '';
  
        const html = `
          <div class="col-md-6 col-lg-6">
            <div class="candidate-item">
              <div class="candidate-bio">
                <div class="candidate-img">
                  <img src="../assets/img/candidate/default.jpg" alt="thumb">
                </div>
                <div class="candidate-bio-content">
                  <h5><a>${nombre}</a></h5>
                  <span>${cargo}</span>
                </div>
              </div>
              <div class="candidate-content">
                <p><i class="far fa-location-dot"></i> ${comuna}</p>
                <div class="candidate-skill">
                  ${idiomasHTML}
                </div>
                <div class="candidate-bottom">
                  <div class="candidate-salary">
                    $ ${Number(salario).toLocaleString('es-CL')} <span>Mensual</span>
                  </div>
                  <div class="profile-btns">
                    <a href="#" class="btn btn-outline-secondary btn-sm"><i class="far fa-eye"></i></a>
                    <a href="#" class="btn btn-outline-secondary btn-sm"><i class="far fa-check"></i></a>
                    <a href="#" class="btn btn-outline-danger btn-sm delete-btn" data-candidate="${nombre}"><i class="far fa-trash-can"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
      });
    })
    .catch(err => {
      console.error('❌ Error al obtener postulantes:', err);
    });
  
  }
  