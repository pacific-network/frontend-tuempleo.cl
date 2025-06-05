document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró el token de autenticación. Por favor, inicie sesión.');
        window.location.href = 'login.html';
        return;
    }

    const rutInput = document.getElementById('rut');
    if (rutInput) {
        rutInput.addEventListener('blur', function() {
            this.value = formatRUT(this.value);
        });
    }

    // Decodificar token para obtener userId
    let userId, userEmail;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
        userEmail = payload.email;

        const emailfield = document.getElementById('correo');
        if (emailfield) {
            emailfield.value = userEmail;
            emailfield.disabled = true; // Deshabilitar campo de correo
        }
    } catch (e) {
        console.error('Error al decodificar el token:', e);
        alert('Error al obtener la información del usuario. Por favor, inicie sesión nuevamente.');
        window.location.href = 'login.html';
        return;
    }

    // Configurar formulario
    const form = document.getElementById('postulanteForm');
    setupRequiredFields();
    setupDynamicFields();

    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const formData = prepareFormData();
            const response = await crearPostulanteYCV(userId, formData, token);

            // Improved response handling
            if (response && response.postulante && response.curriculum) {
                alert('Datos guardados correctamente!');
                window.location.href = 'login.html';
            } else {
                throw new Error('Respuesta inesperada del servidor');
            }
        } catch (error) {
            console.error('Error:', error);
            let errorMessage = 'Error al enviar los datos';

            if (error instanceof TypeError && error.message.includes('.json is not a function')) {
                errorMessage += ': El servidor devolvió una respuesta no válida';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }

            alert(errorMessage);
        }
    });

    // Configurar campos obligatorios
    function setupRequiredFields() {
        // Lista de IDs de campos obligatorios
        const requiredFields = [
            'rut', 'nombre', 'apellido', 'correo', 'numero_telefono',
            'genero', 'fecha_nacimiento', 'estado_civil', 'region',
            'comuna', 'nacionalidad', 'descripcion_bio',
            'categoria_empleo', 'salario_esperado', 'modalidad'
        ];

        requiredFields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.required = true;
                const label = input.closest('.form-group')?.querySelector('label');
                if (label && !label.classList.contains('required-field')) {
                    label.classList.add('required-field');
                }

                if (!input.nextElementSibling?.classList.contains('invalid-feedback')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'Este campo es obligatorio';
                    input.insertAdjacentElement('afterend', errorDiv);
                }

                input.addEventListener('blur', function() {
                    validateField(this);
                });
            }
        });

        // Configurar campos de educación como obligatorios
        document.querySelectorAll('.formacion-entry [required]').forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });

        // Remover required de campos opcionales
        document.querySelectorAll('.exp-entry input, .exp-entry select, .exp-entry textarea').forEach(input => {
            input.required = false;
        });

        document.querySelectorAll('.idioma-entry input, .idioma-entry select').forEach(input => {
            input.required = false;
        });

        document.getElementById('linkedin_url').required = false;
    }

    // Configurar campos dinámicos
    function setupDynamicFields() {
        document.getElementById('addFormacionBtn').addEventListener('click', addFormacion);
        document.getElementById('addExpBtn').addEventListener('click', addExperiencia);
        document.getElementById('addIdiomaBtn').addEventListener('click', addIdioma);
    }
});

// Función para validar campo individual
function validateField(field) {
    const isValid = !field.required || (field.value && field.value.trim() !== '');
    field.classList.toggle('is-invalid', !isValid);
    return isValid;
}

// Función para validar formulario completo
function validateForm() {
    let isValid = true;
    let firstInvalidField = null;

    // Validar campos requeridos estáticos
    document.querySelectorAll('[required]').forEach(field => {
        if (!validateField(field)) {
            if (isValid) {
                firstInvalidField = field;
            }
            isValid = false;
        }
    });

    // Validar al menos un registro de educación completo
    const formacionEntries = document.querySelectorAll('.formacion-entry');
    if (formacionEntries.length === 0) {
        alert('Debe agregar al menos un registro de educación.');
        isValid = false;
    } else {
        // Validar que al menos un registro de educación esté completo
        let hasValidEducation = false;
        formacionEntries.forEach(entry => {
            let entryIsValid = true;
            entry.querySelectorAll('[required]').forEach(field => {
                if (!validateField(field)) {
                    if (isValid) {
                        firstInvalidField = firstInvalidField || field;
                    }
                    entryIsValid = false;
                    isValid = false;
                }
            });
            
            if (entryIsValid) {
                hasValidEducation = true;
            }
        });

        if (!hasValidEducation) {
            alert('Debe completar al menos un registro de educación.');
            isValid = false;
        }
    }

    if (!isValid && firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.focus();
    }

    return isValid;
}

function formatRUT(rut) {
    // Limpiar RUT
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length < 2) return rut;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    // Validar dígito verificador
    if (!validateDV(cuerpo, dv)) {
        alert('RUT inválido');
        return '';
    }

    // Formatear
    let formatted = '';
    let i = cuerpo.length;
    while (i > 3) {
        formatted = '.' + cuerpo.slice(i - 3, i) + formatted;
        i -= 3;
    }
    formatted = cuerpo.slice(0, i) + formatted;

    return `${formatted}-${dv}`;
}

// Función para limpiar el RUT (asegurar formato correcto)
function cleanRUT(rut) {
    if (!rut) return '';
    // Eliminar todos los caracteres no numéricos excepto K/k
    let clean = rut.toString().replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 2) return '';
    // Separar cuerpo y dígito verificador
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    // Reconstruir en formato xxxxxxxx-x
    return `${cuerpo}-${dv}`;
}

function validateDV(cuerpo, dv) {
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    let dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString();

    return dv.toUpperCase() === dvEsperado;
}

function validateRUTFormat(rut) {
    return /^[0-9]+-[0-9kK]{1}$/.test(rut);
}

// Preparar datos del formulario para envío
function prepareFormData() {
    // Datos personales obligatorios
    const datosPersonales = {
        telefono: document.getElementById('codigo_pais').value + document.getElementById('numero_telefono').value,
        genero: document.getElementById('genero').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        estado_civil: document.getElementById('estado_civil').value,
        region: document.getElementById('region').value,
        comuna: document.getElementById('comuna').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        descripcion_bio: document.getElementById('descripcion_bio').value
    };

    // Educación (obligatoria, al menos un registro completo)
    const educacion = Array.from(document.querySelectorAll('.formacion-entry'))
        .filter(entry => {
            // Solo incluir registros completos
            return Array.from(entry.querySelectorAll('[required]')).every(field => 
                field.value && field.value.trim() !== ''
            );
        })
        .map(entry => ({
            titulo: entry.querySelector('[name="titulo[]"]').value,
            institucion: entry.querySelector('[name="institucion[]"]').value,
            grado: entry.querySelector('[name="tipo_estudio[]"]').value,
            estado: entry.querySelector('[name="estado_estudio[]"]').value,
            anio_inicio: entry.querySelector('[name="anio_inicio[]"]').value,
            anio_finalizacion: entry.querySelector('[name="estado_estudio[]"]').value === 'En Curso' ? 
                null : entry.querySelector('[name="anio_finalizacion[]"]')?.value
        }));

    // Experiencia (opcional, solo registros con empresa)
    const experiencias = Array.from(document.querySelectorAll('.exp-entry'))
        .filter(entry => entry.querySelector('[name="empresa[]"]').value)
        .map(entry => ({
            empresa: entry.querySelector('[name="empresa[]"]').value,
            cargo: entry.querySelector('[name="cargo[]"]').value,
            actividad_empresa: entry.querySelector('[name="actividad_empresa[]"]').value,
            nivel_experiencia: entry.querySelector('[name="nivel_experiencia[]"]').value,
            area_cargo: entry.querySelector('[name="area_cargo[]"]').value,
            anno_inicio: entry.querySelector('[name="anno_inicio[]"]').value,
            anno_termino: entry.querySelector('[name="anno_termino[]"]').value,
            descripcion: entry.querySelector('[name="descripcion_cargo[]"]').value
        }));

    // Idiomas (opcional, solo registros con idioma)
    const idiomas = Array.from(document.querySelectorAll('.idioma-entry'))
        .filter(entry => entry.querySelector('[name="idioma[]"]').value)
        .map(entry => ({
            idioma: entry.querySelector('[name="idioma[]"]').value,
            nivel_escrito: entry.querySelector('[name="nivel_escrito[]"]').value,
            nivel_oral: entry.querySelector('[name="nivel_oral[]"]').value
        }));

    // Redes sociales (opcional)
    const redesSociales = [
        { id: 'facebook_url', nombre: 'Facebook' },
        { id: 'twitter_url', nombre: 'Twitter' },
        { id: 'linkedin_url', nombre: 'LinkedIn' },
        { id: 'instagram_url', nombre: 'Instagram' }
    ].map(social => {
        const url = document.getElementById(social.id).value;
        return url ? { red_social: social.nombre, url } : null;
    }).filter(Boolean);

    // Herramientas (opcional)
    const herramientasInput = document.getElementById('herramientas').value;
    const herramientas = herramientasInput ? herramientasInput.split(' - ') : [];

    return {
        rut: cleanRUT(document.getElementById('rut').value),
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('correo').value,
        data: {
            datos_personales: datosPersonales,
            educacion,
            experiencias,
            idiomas,
            preferencias: {
                categoria_empleo: document.getElementById('categoria_empleo').value,
                salario_esperado: document.getElementById('salario_esperado').value,
                modalidad: document.getElementById('modalidad').value
            },
            redes_sociales: redesSociales,
            herramientas
        }
    };
}

// Función para transformar datos del postulante al formato esperado por curriculum
function transformarDatosParaCV(dataPostulante) {
  // Extraemos los datos desde la estructura de postulante
  const datosPersonales = dataPostulante.datos_personales || {};
  const experiencias = dataPostulante.experiencias || [];
  const idiomas = dataPostulante.idiomas || [];
  const preferencias = dataPostulante.preferencias || {};
  const redes_sociales = dataPostulante.redes_sociales || [];

  // Formatear experiencias para CV
  const experienciaCV = experiencias.map(exp => ({
    titulo: exp.cargo || '',
    grado: exp.nivel_experiencia || '',
    institucion: exp.empresa || '',
    ano: exp.anno_inicio && exp.anno_termino ? `${exp.anno_inicio}-${exp.anno_termino}` : '',
    descripcion: exp.descripcion || ''
  }));

  // Formatear educación para CV
  const educacionCV = (datosPersonales.educacion || []).map(edu => ({
    titulo: edu.titulo || '',
    grado: edu.grado || '',
    institucion: edu.institucion || '',
    ano: "", // No viene año en la data postulante, puedes adaptar si tienes info
    descripcion: "" // Tampoco hay descripción, puedes agregar si existe
  }));

  // Formatear idiomas para CV
  const idiomasCV = idiomas.map(idioma => idioma.idioma || '');

  // Formatear enlaces sociales para CV
  const enlacesSocialesCV = {};
  redes_sociales.forEach(red => {
    const key = red.red_social.toLowerCase();
    enlacesSocialesCV[key] = red.url || '';
  });

  // Construir el objeto final para el CV
  return {
    data: {
      habilidades_clave: [], // No viene en postulante, dejar vacío o agregar si tienes
      preferencias_laborales: {
        categoria_empleo: preferencias.categoria_empleo || '',
        tipo_empleo: preferencias.modalidad || '', // asumí modalidad como tipo empleo
        nivel_empleo: '', // no está en postulante, dejar vacío
        salario_actual: '', // no está, dejar vacío
        salario_esperado: preferencias.salario_esperado || '',
        edad: "", // No viene edad, podrías calcular con fecha nacimiento si quieres
        experiencia: experiencias.length, // cantidad de experiencias
        genero: datosPersonales.genero || '',
        idiomas: idiomasCV,
        fecha_nacimiento: datosPersonales.fecha_nacimiento || '',
        estado_civil: datosPersonales.estado_civil || '',
        descripcion: datosPersonales.descripcion_bio || ''
      },
      educacion: educacionCV,
      experiencia: experienciaCV,
      enlaces_sociales: enlacesSocialesCV
    },
    cv_file: "" // Si tienes ruta o archivo CV, agregar aquí, sino dejar vacío
  };
}

// Enviar datos al servidor
async function crearPostulanteYCV(userId, dataPostulante, token) {
    const rut = dataPostulante.rut;

    try {
        // 1) Crear postulante
        const postulanteResponse = await fetch(`http://172.25.100.201:3000/v1/postulante/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataPostulante),
        });

        if (!postulanteResponse.ok) {
            let errorData;
            try {
                errorData = await postulanteResponse.json();
            } catch (e) {
                throw new Error(`Error ${postulanteResponse.status}: ${postulanteResponse.statusText}`);
            }
            throw new Error(errorData.message || 'Error al crear postulante');
        }

        const postulanteData = await postulanteResponse.json();

        // 2) Transformar data para CV
        const dataParaCV = transformarDatosParaCV(dataPostulante.data);

        // 3) Crear CV
        const cvResponse = await fetch(`http://172.25.100.201:3000/v1/curriculum/${rut}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataParaCV),
        });

        if (!cvResponse.ok) {
            let errorData;
            try {
                errorData = await cvResponse.json();
            } catch (e) {
                throw new Error(`Error ${cvResponse.status}: ${cvResponse.statusText}`);
            }
            throw new Error(errorData.message || 'Error al crear CV');
        }

        const cvData = await cvResponse.json();

        return {
            postulante: postulanteData,
            curriculum: cvData
        };
    } catch (error) {
        console.error('Error en crearPostulanteYCV:', error);
        throw error; // Re-throw the error for the calling function to handle
    }
}


// Funciones para campos dinámicos
function addFormacion() {
    const newEntry = document.querySelector('.formacion-entry').cloneNode(true);
    resetDynamicEntry(newEntry);
    newEntry.querySelector('.anio-finalizacion-group').style.display = 'none';
    newEntry.querySelector('[name="estado_estudio[]"]').addEventListener('change', function() {
        toggleAnioFinalizacion(this);
    });
    document.getElementById('formacion-container').appendChild(newEntry);
}

function addExperiencia() {
    const newEntry = document.querySelector('.exp-entry').cloneNode(true);
    resetDynamicEntry(newEntry);
    
    // Quitar required de los campos de experiencia
    newEntry.querySelectorAll('input, select, textarea').forEach(input => {
        input.required = false;
    });
    
    document.getElementById('experiencia-container').appendChild(newEntry);
}

function addIdioma() {
    const newEntry = document.querySelector('.idioma-entry').cloneNode(true);
    resetDynamicEntry(newEntry);
    
    // Quitar required de los campos de idiomas
    newEntry.querySelectorAll('input, select').forEach(input => {
        input.required = false;
    });
    
    document.getElementById('idiomas-container').appendChild(newEntry);
}

function resetDynamicEntry(entry) {
    entry.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type !== 'button') {
            input.value = '';
            input.classList.remove('is-invalid');
        }
    });
}

function removeFormacion(button) {
    const entries = document.querySelectorAll('.formacion-entry');
    if (entries.length > 1) {
        button.closest('.formacion-entry').remove();
    } else {
        alert('Debe mantener al menos un registro de formación.');
    }
}

function removeExperience(button) {
    const entries = document.querySelectorAll('.exp-entry');
    if (entries.length > 1) {
        button.closest('.exp-entry').remove();
    } else {
        alert('Debe mantener al menos un registro de experiencia.');
    }
}

function removeIdioma(button) {
    const entries = document.querySelectorAll('.idioma-entry');
    if (entries.length > 1) {
        button.closest('.idioma-entry').remove();
    } else {
        alert('Debe mantener al menos un registro de idioma.');
    }
}

function toggleAnioFinalizacion(select) {
    const entry = select.closest('.formacion-entry');
    const anioGroup = entry.querySelector('.anio-finalizacion-group');
    const anioInput = anioGroup.querySelector('input');
    
    if (select.value === 'En Curso') {
        anioGroup.style.display = 'none';
        anioInput.removeAttribute('required');
        anioInput.classList.remove('is-invalid');
    } else {
        anioGroup.style.display = 'block';
        anioInput.setAttribute('required', 'required');
        const label = anioGroup.querySelector('label');
        if (label && !label.classList.contains('required-field')) {
            label.classList.add('required-field');
        }
    }
}