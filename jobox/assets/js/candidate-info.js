document.addEventListener('DOMContentLoaded', function() {
        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No se encontró token en localStorage');
            window.location.href = 'login.html'; // Redirigir al login si no hay token
            return;
        }
        
        // Decodificar el token para obtener el userId (sub)
        let userId;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.sub;
        } catch (e) {
            console.error('Error al decodificar el token:', e);
            return;
        }
        
        if (!userId) {
            console.error('No se pudo obtener el userId del token');
            return;
        }
        
        // URL del endpoint
        const apiUrl = `http://172.25.100.201:3000/v1/postulante/${userId}`;
        
        // Función para formatear fecha
        function formatDate(dateString) {
            if (!dateString) return 'No especificado';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        }
        
        // Función para calcular edad
        function calculateAge(birthDate) {
            if (!birthDate) return 'No especificado';
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            
            return age;
        }
        
        // Función para formatear salario
        function formatSalary(salary) {
            if (!salary) return 'No especificado';
            const numericValue = String(salary).replace(/[^0-9]/g, '');
            const amoun = Number(numericValue);

            if (isNaN(amoun)) {
                return 'No especificado';
            }

            return '$' + amoun.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        }
        
        // Función para cargar los datos del perfil
        async function loadProfileData() {
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                updateProfileUI(data);
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                // Mostrar mensaje de error al usuario
                alert('Error al cargar los datos del perfil. Por favor intenta nuevamente.');
            }
        }
        
        // Función para actualizar la UI con los datos del perfil
        function updateProfileUI(profileData) {
            // Datos del usuario
            const usuario = profileData.usuario;
            const datosPersonales = profileData.data.datos_personales;
            const preferencias = profileData.data.preferencias;
            
            // Actualizar sidebar
            document.getElementById('profile-name').textContent = `${usuario.nombres} ${usuario.apellidos}`;
            document.getElementById('profile-title').textContent = preferencias?.categoria_empleo || 'No especificado';
            
            // Actualizar información básica
            document.getElementById('full-name').textContent = `${usuario.nombres} ${usuario.apellidos}`;
            document.getElementById('rut').textContent = usuario.rut || 'No especificado';
            document.getElementById('email').textContent = usuario.email || 'No especificado';
            document.getElementById('birth-date').textContent = formatDate(datosPersonales?.fecha_nacimiento);
            document.getElementById('age').textContent = datosPersonales?.fecha_nacimiento ? 
                `${calculateAge(datosPersonales.fecha_nacimiento)} años` : 'No especificado';
            
            document.getElementById('gender').textContent = datosPersonales?.genero || 'No especificado';
            document.getElementById('marital-status').textContent = datosPersonales?.estado_civil || 'No especificado';
            document.getElementById('job-category').textContent = preferencias?.categoria_empleo || 'No especificado';
            document.getElementById('expected-salary').textContent = preferencias?.salario_esperado ? 
                formatSalary(preferencias.salario_esperado) : 'No especificado';
            document.getElementById('work-modality').textContent = preferencias?.modalidad || 'No especificado';
            
            // Actualizar educación
            updateEducationSection(profileData.data.educacion || []);
            
            // Actualizar experiencias
            updateExperienceSection(profileData.data.experiencias || []);
            
            // Actualizar idiomas
            updateLanguagesSection(profileData.data.idiomas || []);
            
            // Actualizar descripción
            document.getElementById('bio-description').textContent = datosPersonales?.descripcion_bio || 'No hay descripción disponible';
            
            // Actualizar información de contacto
            document.getElementById('nationality').textContent = datosPersonales?.nacionalidad || 'No especificado';
            document.getElementById('region').textContent = datosPersonales?.region || 'No especificado';
            document.getElementById('commune').textContent = datosPersonales?.comuna || 'No especificado';
            document.getElementById('phone').textContent = datosPersonales?.telefono || 'No especificado';
            
            // Actualizar redes sociales
            updateSocialMediaSection(profileData.data.redes_sociales || []);
        }
        
        // Función para actualizar la sección de educación
        // Función para actualizar la sección de educación (2 columnas con línea de separación)
        function updateEducationSection(educationData) {
            const container = document.getElementById('education-container');
            container.innerHTML = '';

            if (!educationData || educationData.length === 0) {
                container.innerHTML = '<div class="col-12"><p>No hay información de educación disponible</p></div>';
                return;
            }

            // Restauramos la clase original del contenedor
            container.className = 'row g-6';

            // Dividimos los datos en pares para las 2 columnas
            for (let i = 0; i < educationData.length; i += 2) {
                const rowGroup = document.createElement('div');
                rowGroup.className = 'w-100'; // Ocupa todo el ancho

                const row = document.createElement('div');
                row.className = 'row g-6';

                // Primera columna
                if (educationData[i]) {
                    const col1 = document.createElement('div');
                    col1.className = 'col-lg-6';
                    col1.innerHTML = `
                        <div class="profile-info-list">
                            <ul>
                                <li>Titulo: <span>${educationData[i].titulo || 'No especificado'}</span></li>
                                <li>Institución: <span>${educationData[i].institucion || 'No especificado'}</span></li>
                                <li>Tipo Estudio: <span>${educationData[i].grado || 'No especificado'}</span></li>
                                <li>Estado: <span>${educationData[i].estado || 'No especificado'}${educationData[i].anio_finalizacion ? ' - ' + educationData[i].anio_finalizacion : ''}</span></li>
                            </ul>
                        </div>
                    `;
                    row.appendChild(col1);
                }

                // Segunda columna
                if (educationData[i + 1]) {
                    const col2 = document.createElement('div');
                    col2.className = 'col-lg-6';
                    col2.innerHTML = `
                        <div class="profile-info-list">
                            <ul>
                                <li>Titulo: <span>${educationData[i + 1].titulo || 'No especificado'}</span></li>
                                <li>Institución: <span>${educationData[i + 1].institucion || 'No especificado'}</span></li>
                                <li>Tipo Estudio: <span>${educationData[i + 1].grado || 'No especificado'}</span></li>
                                <li>Estado: <span>${educationData[i + 1].estado || 'No especificado'}${educationData[i + 1].anio_finalizacion ? ' - ' + educationData[i + 1].anio_finalizacion : ''}</span></li>
                            </ul>
                        </div>
                    `;
                    row.appendChild(col2);
                }

                rowGroup.appendChild(row);

                // Añadir línea de separación después de cada par (excepto el último)
                if (i + 2 < educationData.length) {
                    const separator = document.createElement('hr');
                    separator.style.opacity = '1';
                    separator.style.border = '0';
                    separator.style.borderTop = '1px solid #ddd';
                    separator.style.margin = '20px 0';
                    rowGroup.appendChild(separator);
                }

                container.appendChild(rowGroup);
            }
        }
        
        // Función para actualizar la sección de experiencias
        function updateExperienceSection(experiences) {
            const container = document.getElementById('experiences-container');
            container.innerHTML = '';
            
            if (experiences.length === 0) {
                container.innerHTML = '<div class="col-12"><p>No hay información de experiencias disponibles</p></div>';
                return;
            }
            
            experiences.forEach((exp, index) => {
                const expElement = document.createElement('div');
                expElement.className = 'row g-12';
                expElement.innerHTML = `
                    <div class="col-lg-12">
                        <div class="profile-info-list">
                            <ul>
                                <li>Empresa: <span>${exp.empresa || 'No especificado'}</span></li>
                                <li>Cargo: <span>${exp.cargo || 'No especificado'}</span></li>
                                <li>Actividad Empresa: <span>${exp.actividad_empresa || 'No especificado'}</span></li>
                                <li>Nivel Experiencia: <span>${exp.nivel_experiencia || 'No especificado'}</span></li>
                                <li>Área del Cargo: <span>${exp.area_cargo || 'No especificado'}</span></li>
                                <li>Mes - Año Inicio: <span>${exp.anno_inicio || 'No especificado'}</span></li>
                                <li>Mes - Año Término: <span>${exp.anno_termino || 'Actualmente'}</span></li>
                                <li>Descrición Cargo: <span>${exp.descripcion || 'No hay descripción disponible'}</span></li>
                            </ul>
                        </div>
                    </div>
                `;
                
                container.appendChild(expElement);
                
                // Agregar separador si no es el último elemento
                if (index < experiences.length - 1) {
                    const separator = document.createElement('hr');
                    separator.style.opacity = '1';
                    separator.style.border = '0';
                    separator.style.borderTop = '1px solid #000';
                    separator.style.margin = '20px 0';
                    container.appendChild(separator);
                }
            });
        }
        
        // Función para actualizar la sección de idiomas
        function updateLanguagesSection(languages) {
            const container = document.getElementById('languages-container');
            container.innerHTML = '';
            
            if (languages.length === 0) {
                container.innerHTML = '<div class="col-12"><p>No hay información de idiomas disponibles</p></div>';
                return;
            }
            
            languages.forEach(lang => {
                const langCol = document.createElement('div');
                langCol.className = 'col-lg-3';
                langCol.innerHTML = `
                    <div class="language-box">
                        <h5>${lang.idioma || 'Idioma'}</h5>
                        <ul>
                            <li><strong>Escrito:</strong> ${lang.nivel_escrito || 'No especificado'}</li>
                            <li><strong>Oral:</strong> ${lang.nivel_oral || 'No especificado'}</li>
                        </ul>
                    </div>
                `;
                container.appendChild(langCol);
            });
        }
        
        // Función para actualizar la sección de redes sociales
        function updateSocialMediaSection(socialMedia) {
            const container = document.getElementById('social-media-container');
            container.innerHTML = '';
            
            if (socialMedia.length === 0) {
                container.innerHTML = '<p>No hay redes sociales disponibles</p>';
                return;
            }
            
            // Mapeo de redes sociales a iconos
            const socialIcons = {
                'LinkedIn': 'fab fa-linkedin-in',
                'GitHub': 'fab fa-github',
                'Twitter': 'fab fa-twitter',
                'Facebook': 'fab fa-facebook-f',
                'Instagram': 'fab fa-instagram',
                'Pinterest': 'fab fa-pinterest',
                'WhatsApp': 'fab fa-whatsapp'
            };
            
            socialMedia.forEach(social => {
                const iconClass = socialIcons[social.red_social] || 'fas fa-share-alt';
                const socialLink = document.createElement('a');
                socialLink.href = social.url || '#';
                socialLink.target = '_blank';
                socialLink.rel = 'noopener noreferrer';
                socialLink.innerHTML = `<i class="${iconClass}"></i>`;
                container.appendChild(socialLink);
            });
        }
        
        // Cargar los datos del perfil cuando la página esté lista
        loadProfileData();
    });