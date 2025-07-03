// Obtener el ID del usuario desde los parámetros de la URL (query string)
function getIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || urlParams.get('userId') || null;
}

const idUsuario = getIdFromUrl();

if (!idUsuario) {
  console.error('❌ ID de usuario no proporcionado en la URL');
} else {
  const token = localStorage.getItem('token');

  fetch(`${BASE_URL_API}/postulante/${idUsuario}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);
      return res.json();
    })
    .then(postulante => {
      if (!postulante || !postulante.usuario) {
        console.warn('⚠️ No se encontró el postulante');
        return;
      }

      const usuario = postulante.usuario;
      const data = postulante.data || {};
      const personales = data.datos_personales || {};
      const experiencias = data.experiencias || [];
      const educacion = personales.educacion || [];
      const idiomas = data.idiomas || [];
      const preferencias = data.preferencias || {};

      // Datos básicos
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

      // --- Rellenar Nombre y Categoría ---
      const nombreEl = document.querySelector('.job-single-employer-info h5');
      if (nombreEl) nombreEl.textContent = nombre;

      const categoriaEl = document.querySelector('.job-single-employer-info p');
      if (categoriaEl) categoriaEl.textContent = categoria;

      // --- Rellenar lista de datos personales ---
      const listaItems = document.querySelectorAll('.job-single-list ul > li');
      // Los li tienen esta estructura:
      // 0: Correo
      // 1: Teléfono
      // 2: Estado Civil
      // 3: Edad
      // 4: Expectativa Salarial
      // 5: Categoría
      // 6: Curriculum (queda estático, no se toca)
      // 7: Idiomas (lo vamos a llenar)

      if (listaItems.length >= 8) {
        const setText = (index, text) => {
          const p = listaItems[index].querySelector('.job-single-list-info p');
          if (p) p.textContent = text;
        };

        setText(0, correo);
        setText(1, telefono);
        setText(2, estadoCivil);
        setText(3, `${edad} Años`);
        setText(4, salario);
        setText(5, categoria);

        // --- Idiomas ---
        const idiomasContainer = listaItems[7].querySelector('.job-single-list-info');
        if (idiomasContainer) {
          // Limpio idiomas previos para evitar duplicados
          idiomasContainer.querySelectorAll('div').forEach(d => d.remove());

          idiomas.forEach(i => {
            const idiomaDiv = document.createElement('div');
            idiomaDiv.style.display = 'flex';
            idiomaDiv.style.alignItems = 'flex-start';
            idiomaDiv.style.gap = '10px';

            idiomaDiv.innerHTML = `
              <p style="margin: 0;">${i.idioma} <span style="font-size: 0.9em;">→</span></p>
              <div style="display: flex; flex-direction: column; margin: 0;">
                <span><strong>Escrito:</strong> ${i.nivel_escrito}</span>
                <span><strong>Oral:</strong> ${i.nivel_oral}</span>
              </div>
            `;

            idiomasContainer.appendChild(idiomaDiv);
          });
        } else {
          console.warn('No se encontró el contenedor para idiomas');
        }
      } else {
        console.warn('La estructura HTML ha cambiado o faltan elementos en la lista de datos personales');
      }

      // --- Biografía ---
      const bioEl = document.querySelector('.profile-bio p');
      if (bioEl) bioEl.textContent = descripcionBio;

      // --- Educación ---
      // El contenedor es: div.user-profile-card h4 con texto "Educación" + .profile-education > .row.g-6
      // Vamos a buscar el contenedor '.profile-education .row'
      const eduContainer = document.querySelector('.profile-education .row');
      if (eduContainer) {
        eduContainer.innerHTML = ''; // limpio contenido

        educacion.forEach((e, index) => {
          const eduDiv = document.createElement('div');
          eduDiv.className = 'col-lg-6';
          eduDiv.style.position = 'relative';

          eduDiv.innerHTML = `
            <div class="profile-info-list">
              <ul>
                <li>Título: <span>${e.titulo}</span></li>
                <li>Institución: <span>${e.institucion}</span></li>
                <li>Tipo Estudio: <span>${e.grado}</span></li>
                <li>Estado: <span>${e.estado}</span></li>
              </ul>
            </div>
            ${index % 2 === 0 ? `<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 1px; background-color: #ccc;"></div>` : ''}
          `;

          eduContainer.appendChild(eduDiv);
        });
      } else {
        console.warn('No se encontró el contenedor para educación');
      }

      // --- Experiencias ---
      // Buscamos el .user-profile-card que tiene el título "Experiencias"
      const expCards = Array.from(document.querySelectorAll('.user-profile-card'));
      const expContainer = expCards.find(card => {
        const h4 = card.querySelector('h4.user-profile-card-title');
        return h4 && h4.textContent.trim().toLowerCase() === 'experiencias';
      });

      if (expContainer) {
        expContainer.innerHTML = '<h4 class="user-profile-card-title">Experiencias</h4>';

        experiencias.forEach(exp => {
          const expHtml = `
            <div class="row g-12">
              <div class="col-lg-12">
                <div class="profile-info-list">
                  <ul>
                    <li>Empresa: <span>${exp.empresa}</span></li>
                    <li>Cargo: <span>${exp.cargo}</span></li>
                    <li>Nivel Experiencia: <span>${exp.nivel_experiencia || 'No informado'}</span></li>
                    <li>Mes - Año Inicio: <span>${exp.anno_inicio || 'No informado'}</span></li>
                    <li>Mes - Año Término: <span>${exp.anno_termino || 'Actualmente'}</span></li>
                    <li>Descripción Cargo: <span>${exp.descripcion || ''}</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <hr style="opacity: 1; border: 0; border-top: 1px solid #000; margin: 20px 0;">
          `;
          expContainer.innerHTML += expHtml;
        });
      } else {
        console.warn('No se encontró el contenedor para experiencias');
      }
    })
    .catch(err => {
      console.error('❌ Error al cargar el perfil del postulante:', err);
    });
}

// Función auxiliar para calcular la edad desde la fecha de nacimiento
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
