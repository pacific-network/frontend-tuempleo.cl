function getIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

const idUsuario = getIdFromUrl();

if (!idUsuario) {
  console.error('❌ ID de usuario no proporcionado en la URL');
} else {
  fetch(`${BASE_URL_API}/postulante/${idUsuario}`)
    .then(res => res.json())
    .then(postulante => {
      if (!postulante || !postulante.usuario) {
        console.warn('⚠️ No se encontró el postulante');
        return;
        console.log(idUsuario);
      }

      const usuario = postulante.usuario;
      const data = postulante.data || {};
      const personales = data.datos_personales || {};
      const experiencias = data.experiencias || [];
      const educacion = personales.educacion || [];
      const idiomas = data.idiomas || [];
      const preferencias = data.preferencias || {};

      // 🧠 Datos
      const nombre = `${usuario.nombres} ${usuario.apellidos}`;
      const correo = usuario.email || 'No disponible';
      const telefono = personales.telefono || 'No disponible';
      const estadoCivil = personales.estado_civil || 'No informado';
      const salario = preferencias.salario_esperado
        ? `$${Number(preferencias.salario_esperado).toLocaleString('es-CL')}`
        : 'No informado';
      const categoria = preferencias.categoria_empleo || 'No especificada';
      const descripcionBio = personales.descripcion_bio || '';
      const edad = calcularEdad(personales.fecha_nacimiento);

      // ✏️ Rellenar campos en el DOM

      // Nombre y categoría
      document.querySelector('.job-single-employer-info h5').textContent = nombre;
      document.querySelector('.job-single-employer-info p').textContent = categoria;

      // Lista con correo, teléfono, estado civil, edad, salario, categoría
      const listaItems = document.querySelectorAll('.job-single-list > ul > li');

      if (listaItems.length >= 6) {
        listaItems[0].querySelector('p').textContent = correo;
        listaItems[1].querySelector('p').textContent = telefono;
        listaItems[2].querySelector('p').textContent = estadoCivil;
        listaItems[3].querySelector('p').textContent = `${edad} Años`;
        listaItems[4].querySelector('p').textContent = salario;
        listaItems[5].querySelector('p').textContent = categoria;
      } else {
        console.warn('La estructura HTML ha cambiado o faltan elementos en la lista de datos personales');
      }

      // 📄 Biografía
      document.querySelector('.profile-bio p').textContent = descripcionBio;

      // 🈂️ Idiomas
      const idiomaLi = document.querySelector('.job-single-list > ul > li:last-child');
      if (idiomaLi) {
        idiomaLi.innerHTML = '<h6>Idiomas</h6>';
        idiomas.forEach(i => {
          idiomaLi.innerHTML += `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <p style="margin: 0;">${i.idioma} <span style="font-size: 0.9em;">→</span></p>
              <div style="display: flex; flex-direction: column; margin: 0;">
                <span><strong>Escrito:</strong> ${i.nivel_escrito}</span>
                <span><strong>Oral:</strong> ${i.nivel_oral}</span>
              </div>
            </div>
          `;
        });
      } else {
        console.warn('No se encontró el contenedor para idiomas');
      }

      // 🎓 Educación
      const eduContainer = document.querySelector('.profile-education .row');
      if (eduContainer) {
        eduContainer.innerHTML = '';
        educacion.forEach((e, index) => {
          eduContainer.innerHTML += `
            <div class="col-lg-6" style="position: relative;">
              <div class="profile-info-list">
                <ul>
                  <li>Título: <span>${e.titulo}</span></li>
                  <li>Institución: <span>${e.institucion}</span></li>
                  <li>Tipo Estudio: <span>${e.grado}</span></li>
                  <li>Estado: <span>${e.estado}</span></li>
                </ul>
              </div>
              ${
                index % 2 === 0
                  ? '<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 1px; background-color: #ccc;"></div>'
                  : ''
              }
            </div>
          `;
        });
      } else {
        console.warn('No se encontró el contenedor para educación');
      }

      // 💼 Experiencias
      const expContainer = document.querySelectorAll('.user-profile-card')[3];
      if (expContainer) {
        expContainer.innerHTML = '<h4 class="user-profile-card-title">Experiencias</h4>';
        experiencias.forEach(exp => {
          expContainer.innerHTML += `
            <div class="row g-12">
              <div class="col-lg-12">
                <div class="profile-info-list">
                  <ul>
                    <li>Empresa: <span>${exp.empresa}</span></li>
                    <li>Cargo: <span>${exp.cargo}</span></li>
                    <li>Nivel Experiencia: <span>${exp.nivel_experiencia}</span></li>
                    <li>Mes - Año Inicio: <span>${exp.anno_inicio}</span></li>
                    <li>Mes - Año Término: <span>${exp.anno_termino || 'Actualmente'}</span></li>
                    <li>Descripción Cargo: <span>${exp.descripcion}</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <hr style="opacity: 1; border: 0; border-top: 1px solid #000; margin: 20px 0;">
          `;
        });
      } else {
        console.warn('No se encontró el contenedor para experiencias');
      }
    })
    .catch(err => {
      console.error('❌ Error al cargar el perfil del postulante:', err);
    });
}

// 🔧 Función auxiliar para calcular edad
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'No disponible';
  const birthDate = new Date(fechaNacimiento);
  const today = new Date();
  let edad = today.getFullYear() - birthDate.getFullYear();
  const mes = today.getMonth() - birthDate.getMonth();
  if (mes < 0 || (mes === 0 && today.getDate() < birthDate.getDate())) {
    edad--;
  }
  return edad;
}
