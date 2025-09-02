// candidate-add-info.js — usa /auth/me y fallback a sub del JWT (sin borrar token)
document.addEventListener('DOMContentLoaded', async function () {
  // ---------- Config ----------
  const API = window.BASE_URL_API; // ej: http://localhost:3000/v1

  // ---------- Helpers JWT ----------
  const b64urlDecode = (b64url) => {
    try {
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(b64)));
    } catch { return null; }
  };
  const parseJwt = (token) => {
    try { return JSON.parse(b64urlDecode(token.split('.')[1])); } catch { return null; }
  };
  const isExpired = (payload) => {
    const now = Math.floor(Date.now() / 1000);
    return !!payload?.exp && payload.exp < now;
  };

  // ---------- UX helpers ----------
  const showAuthErrorAndExit = (title, text, { removeToken = false } = {}) => {
    try { if (removeToken) localStorage.removeItem('token'); } catch {}
    Swal.fire({
      title, text, icon: 'warning',
      confirmButtonText: 'Ir a iniciar sesión',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false
    }).then(() => { window.location.href = 'login.html'; });
  };

  const safeFetchJson = async (url, opts) => {
    const res = await fetch(url, opts);
    let bodyText = '';
    try { bodyText = await res.text(); } catch {}
    let data = null;
    try { data = bodyText ? JSON.parse(bodyText) : null; } catch {}
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = data || bodyText;
      throw err;
    }
    return data;
  };

  // ---------- Verificar autenticación ----------
  const token = localStorage.getItem('token');
  if (!token) {
    return showAuthErrorAndExit('Sesión requerida', 'No se encontraron datos de autenticación. Por favor, inicia sesión.', { removeToken: false });
  }
  const payload = parseJwt(token);
  if (!payload || isExpired(payload)) {
    return showAuthErrorAndExit('Sesión inválida', 'Tu sesión es inválida o expiró. Inicia sesión nuevamente.', { removeToken: true });
  }

  // ---------- Resolver /auth/me (id y datos) con fallback a sub ----------
  async function getMeWithFallback() {
    let me = {};
    let id = null;
    try {
      me = await safeFetchJson(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      id = me?.id || me?.user?.id || me?.data?.id || null;
      if (!id) throw new Error('Respuesta /auth/me sin id');
      return { me, id, source: 'me' };
    } catch (e) {
      console.warn('[candidate] /auth/me fallo:', e.message);
      // NO eliminamos token. Usamos sub del JWT para continuar.
      const sub = Number(payload?.sub);
      if (Number.isFinite(sub)) {
        console.warn('[candidate] usando JWT.sub como userId:', sub);
        return { me: {}, id: sub, source: 'sub' };
      }
      // Si ni /me ni sub sirven, recién ahí enviamos al login
      showAuthErrorAndExit('Sesión inválida', 'No pudimos identificar tu usuario. Inicia sesión nuevamente.', { removeToken: true });
      return null;
    }
  }

  const meResp = await getMeWithFallback();
  if (!meResp) return;
  const realUserId = meResp.id;
  const me = meResp.me || {};

  // ---------- Prefill de email/nombre/apellido ----------
  const emailfield = document.getElementById('correo');
  if (emailfield) {
    const meEmail = (me.email || '').trim().toLowerCase();
    const oauthEmail = (localStorage.getItem('oauth_email') || '').trim().toLowerCase();
    emailfield.value = meEmail || oauthEmail || '';
    emailfield.disabled = true;
  }

  const nombreEl = document.getElementById('nombre');
  const apellidoEl = document.getElementById('apellido');

  const meNombre = (me.nombres || '').trim();
  const meApellido = (me.apellidos || '').trim();

  const fallbackFull = (localStorage.getItem('oauth_name_full') || '').trim();
  if (!meNombre && !meApellido && fallbackFull) {
    const i = fallbackFull.lastIndexOf(' ');
    if (i > 0) {
      if (nombreEl && !nombreEl.value)  nombreEl.value  = fallbackFull.slice(0, i);
      if (apellidoEl && !apellidoEl.value) apellidoEl.value = fallbackFull.slice(i + 1);
    } else {
      if (nombreEl && !nombreEl.value) nombreEl.value = fallbackFull;
    }
  } else {
    if (nombreEl && !nombreEl.value && meNombre)   nombreEl.value = meNombre;
    if (apellidoEl && !apellidoEl.value && meApellido) apellidoEl.value = meApellido;
  }

  // ---------- RUT formateo ----------
  const rutInput = document.getElementById('rut');
  if (rutInput) {
    rutInput.addEventListener('blur', function () { this.value = formatRUT(this.value); });
  }

  // ---------- Configurar formulario ----------
  const form = document.getElementById('postulanteForm');
  setupRequiredFields();
  setupDynamicFields();

  // Actualiza nombres en /auth/me si existe; si 401/404, sigue igual.
  async function actualizarNombreEnUsuario(nombres, apellidos) {
    try {
      await safeFetchJson(`${API}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nombres, apellidos })
      });
    } catch (e) {
      console.warn('[candidate] PATCH /auth/me no crítico:', e.message);
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = prepareFormData();
      await actualizarNombreEnUsuario(formData.nombre, formData.apellido);

      // --- Asegurar que tenemos un userId numérico válido ---
      const uid = Number(realUserId);
      if (!Number.isFinite(uid) || uid <= 0) {
        throw new Error('No pudimos determinar tu usuario (id inválido). Vuelve a iniciar sesión.');
      }

      const response = await crearPostulanteYCV(uid, formData, token);

      if (response && response.postulante && response.curriculum) {
        await Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Te has registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false
        });
        window.location.href = 'candidate-dashboard.html';
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Error al enviar los datos';
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('usuario no encontrado') || msg.includes('id inválido')) {
        errorMessage = 'Tu sesión no es válida. Cierra sesión e inicia nuevamente con Google/LinkedIn.';
      } else if (msg.includes('rut')) {
        errorMessage = 'El RUT ingresado ya está asociado a otro usuario.';
      }
      Swal.fire({ title: 'Error', text: errorMessage, icon: 'error', confirmButtonText: 'Aceptar' });
    }
  });

  // ---------- Reglas de required ----------
  function setupRequiredFields() {
    const requiredFields = [
      'rut','nombre','apellido','correo','numero_telefono',
      'genero','fecha_nacimiento','estado_civil','region',
      'comuna','nacionalidad','descripcion_bio',
      'categoria_empleo','salario_esperado','modalidad'
    ];

    requiredFields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        input.required = true;
        const label = input.closest('.form-group')?.querySelector('label');
        if (label && !label.classList.contains('required-field')) label.classList.add('required-field');

        if (!input.nextElementSibling?.classList.contains('invalid-feedback')) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'invalid-feedback';
          errorDiv.textContent = 'Este campo es obligatorio';
          input.insertAdjacentElement('afterend', errorDiv);
        }
        input.addEventListener('blur', function () { validateField(this); });
      }
    });

    document.querySelectorAll('.formacion-entry [required]').forEach(input => {
      input.addEventListener('blur', function () { validateField(this); });
    });

    document.querySelectorAll('.exp-entry input, .exp-entry select, .exp-entry textarea').forEach(i => { i.required = false; });
    document.querySelectorAll('.idioma-entry input, .idioma-entry select').forEach(i => { i.required = false; });
    const li = document.getElementById('linkedin_url'); if (li) li.required = false;
  }

  function setupDynamicFields() {
    document.getElementById('addFormacionBtn')?.addEventListener('click', addFormacion);
    document.getElementById('addExpBtn')?.addEventListener('click', addExperiencia);
    document.getElementById('addIdiomaBtn')?.addEventListener('click', addIdioma);
  }
});

// ---------- Validaciones ----------
function validateField(field) {
  const isValid = !field.required || (field.value && field.value.trim() !== '');
  field.classList.toggle('is-invalid', !isValid);
  return isValid;
}
function validateForm() {
  let isValid = true, firstInvalidField = null;
  document.querySelectorAll('[required]').forEach(field => {
    if (!validateField(field)) { if (isValid) firstInvalidField = field; isValid = false; }
  });

  const formacionEntries = document.querySelectorAll('.formacion-entry');
  if (formacionEntries.length === 0) {
    Swal.fire({ title: 'Educación requerida', text: 'Debes agregar al menos un registro de educación.', icon: 'warning', confirmButtonText: 'Aceptar' });
    isValid = false;
  } else {
    let hasValidEducation = false;
    formacionEntries.forEach(entry => {
      let entryIsValid = true;
      entry.querySelectorAll('[required]').forEach(field => {
        if (!validateField(field)) { if (isValid && !firstInvalidField) firstInvalidField = field; entryIsValid = false; isValid = false; }
      });
      if (entryIsValid) hasValidEducation = true;
    });
    if (!hasValidEducation) {
      Swal.fire({ title: 'Educación incompleta', text: 'Debes completar al menos un registro de educación.', icon: 'warning', confirmButtonText: 'Aceptar' });
      isValid = false;
    }
  }

  if (!isValid && firstInvalidField) {
    Swal.fire({ title: 'Campos incompletos', text: 'Revisa los campos marcados en rojo.', icon: 'warning', confirmButtonText: 'Ir al primer error' })
      .then(() => { firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstInvalidField.focus(); });
  }
  return isValid;
}

// ---------- Helpers RUT ----------
function formatRUT(rut) {
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1), dv = rut.slice(-1);
  if (!validateDV(cuerpo, dv)) {
    Swal.fire({ title: 'RUT inválido', text: 'Revisa el dígito verificador.', icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#3085d6', allowOutsideClick: false });
    return '';
  }
  let formatted = '', i = cuerpo.length;
  while (i > 3) { formatted = '.' + cuerpo.slice(i - 3, i) + formatted; i -= 3; }
  formatted = cuerpo.slice(0, i) + formatted;
  return `${formatted}-${dv}`;
}
function cleanRUT(rut) {
  if (!rut) return '';
  let clean = rut.toString().replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return '';
  const cuerpo = clean.slice(0, -1), dv = clean.slice(-1);
  return `${cuerpo}-${dv}`;
}
function validateDV(cuerpo, dv) {
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsp = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString();
  return dv.toUpperCase() === dvEsp;
}
function validateRUTFormat(rut) { return /^[0-9]+-[0-9kK]{1}$/.test(rut); }

// ---------- Preparar payload ----------
function prepareFormData() {
  const nombreVal   = document.getElementById('nombre').value;
  const apellidoVal = document.getElementById('apellido').value;

  const datosPersonales = {
    telefono: document.getElementById('codigo_pais').value + document.getElementById('numero_telefono').value,
    genero: document.getElementById('genero').value,
    fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
    estado_civil: document.getElementById('estado_civil').value,
    region: document.getElementById('region').value,
    comuna: document.getElementById('comuna').value,
    nacionalidad: document.getElementById('nacionalidad').value,
    descripcion_bio: document.getElementById('descripcion_bio').value,
    nombre: nombreVal,
    apellido: apellidoVal,
  };

  const educacion = Array.from(document.querySelectorAll('.formacion-entry'))
    .filter(entry => Array.from(entry.querySelectorAll('[required]')).every(f => f.value && f.value.trim() !== ''))
    .map(entry => ({
      titulo: entry.querySelector('[name="titulo[]"]').value,
      institucion: entry.querySelector('[name="institucion[]"]').value,
      grado: entry.querySelector('[name="tipo_estudio[]"]').value,
      estado: entry.querySelector('[name="estado_estudio[]"]').value,
      anio_inicio: entry.querySelector('[name="anio_inicio[]"]').value,
      anio_finalizacion: entry.querySelector('[name="estado_estudio[]"]').value === 'En Curso'
        ? null
        : entry.querySelector('[name="anio_finalizacion[]"]')?.value
    }));

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

  const idiomas = Array.from(document.querySelectorAll('.idioma-entry'))
    .filter(entry => entry.querySelector('[name="idioma[]"]').value)
    .map(entry => ({
      idioma: entry.querySelector('[name="idioma[]"]').value,
      nivel_escrito: entry.querySelector('[name="nivel_escrito[]"]').value,
      nivel_oral: entry.querySelector('[name="nivel_oral[]"]').value
    }));

  const redesSociales = [
    { id: 'facebook_url',  nombre: 'Facebook'  },
    { id: 'twitter_url',   nombre: 'Twitter'   },
    { id: 'linkedin_url',  nombre: 'LinkedIn'  },
    { id: 'instagram_url', nombre: 'Instagram' }
  ].map(s => {
    const url = document.getElementById(s.id)?.value;
    return url ? { red_social: s.nombre, url } : null;
  }).filter(Boolean);

  const herramientasInput = document.getElementById('herramientas')?.value || '';
  const herramientas = herramientasInput ? herramientasInput.split(' - ') : [];

  return {
    rut: cleanRUT(document.getElementById('rut').value),
    nombre: nombreVal,
    apellido: apellidoVal,
    email: document.getElementById('correo').value,
    data: {
      nombre: nombreVal,
      apellido: apellidoVal,
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

// ---------- Transformar a CV ----------
function transformarDatosParaCV(dataPostulante) {
  const datosPersonales = dataPostulante.datos_personales || {};
  const experiencias = dataPostulante.experiencias || [];
  const idiomas = dataPostulante.idiomas || [];
  const preferencias = dataPostulante.preferencias || {};
  const redes_sociales = dataPostulante.redes_sociales || [];

  const experienciaCV = experiencias.map(exp => ({
    titulo: exp.cargo || '',
    grado: exp.nivel_experiencia || '',
    institucion: exp.empresa || '',
    ano: exp.anno_inicio && exp.anno_termino ? `${exp.anno_inicio}-${exp.anno_termino}` : '',
    descripcion: exp.descripcion || ''
  }));

  const educacionCV = (dataPostulante.educacion || []).map(edu => ({
    titulo: edu.titulo || '',
    grado: edu.grado || '',
    institucion: edu.institucion || '',
    ano: '',
    descripcion: ''
  }));

  const idiomasCV = idiomas.map(idioma => idioma.idioma || '');

  const enlacesSocialesCV = {};
  redes_sociales.forEach(red => {
    const key = (red.red_social || '').toLowerCase();
    enlacesSocialesCV[key] = red.url || '';
  });

  return {
    data: {
      habilidades_clave: [],
      preferencias_laborales: {
        categoria_empleo: preferencias.categoria_empleo || '',
        tipo_empleo: preferencias.modalidad || '',
        nivel_empleo: '',
        salario_actual: '',
        salario_esperado: preferencias.salario_esperado || '',
        edad: '',
        experiencia: experiencias.length,
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
    cv_file: ''
  };
}

// ---------- Envíos al servidor ----------
async function crearPostulanteYCV(realUserId, dataPostulante, token) {
  const rut = dataPostulante.rut;

  // 1) Crear postulante
  const postulanteResponse = await fetch(`${window.BASE_URL_API}/postulante/${realUserId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dataPostulante),
  });

  if (!postulanteResponse.ok) {
    let body = null; try { body = await postulanteResponse.json(); } catch {}
    const msg = body?.message || `Error ${postulanteResponse.status}: ${postulanteResponse.statusText}`;
    throw new Error(msg);
  }

  const postulanteData = await postulanteResponse.json();

  // 2) Crear CV
  const dataParaCV = transformarDatosParaCV(dataPostulante.data);
  const cvResponse = await fetch(`${window.BASE_URL_API}/curriculum/${rut}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dataParaCV),
  });

  if (!cvResponse.ok) {
    let body = null; try { body = await cvResponse.json(); } catch {}
    const msg = body?.message || `Error ${cvResponse.status}: ${cvResponse.statusText}`;
    throw new Error(msg);
  }

  const cvData = await cvResponse.json();
  return { postulante: postulanteData, curriculum: cvData };
}

// ---------- Campos dinámicos ----------
function addFormacion() {
  const original = document.querySelector('.formacion-entry');
  if (!original) return;
  const n = original.cloneNode(true);
  resetDynamicEntry(n);
  n.querySelector('.anio-finalizacion-group')?.style && (n.querySelector('.anio-finalizacion-group').style.display = 'none');
  n.querySelector('[name="estado_estudio[]"]')?.addEventListener('change', function () { toggleAnioFinalizacion(this); });
  document.getElementById('formacion-container')?.appendChild(n);
}
function addExperiencia() {
  const original = document.querySelector('.exp-entry');
  if (!original) return;
  const n = original.cloneNode(true);
  resetDynamicEntry(n);
  n.querySelectorAll('input, select, textarea').forEach(i => { i.required = false; });
  document.getElementById('experiencia-container')?.appendChild(n);
}
function addIdioma() {
  const original = document.querySelector('.idioma-entry');
  if (!original) return;
  const n = original.cloneNode(true);
  resetDynamicEntry(n);
  n.querySelectorAll('input, select').forEach(i => { i.required = false; });
  document.getElementById('idiomas-container')?.appendChild(n);
}
function resetDynamicEntry(entry) {
  entry.querySelectorAll('input, select, textarea').forEach(i => {
    if (i.type !== 'button') { i.value = ''; i.classList.remove('is-invalid'); }
  });
}
function removeFormacion(button) {
  const entries = document.querySelectorAll('.formacion-entry');
  if (entries.length > 1) button.closest('.formacion-entry').remove();
  else Swal.fire({ title: 'Acción no permitida', text: 'Debes mantener al menos un registro de formación.', icon: 'info', confirmButtonText: 'Aceptar' });
}
function removeExperience(button) {
  const entries = document.querySelectorAll('.exp-entry');
  if (entries.length > 1) button.closest('.exp-entry').remove();
  else Swal.fire({ title: 'Acción no permitida', text: 'Debes mantener al menos un registro de experiencia.', icon: 'info', confirmButtonText: 'Aceptar' });
}
function removeIdioma(button) {
  const entries = document.querySelectorAll('.idioma-entry');
  if (entries.length > 1) button.closest('.idioma-entry').remove();
  else Swal.fire({ title: 'Acción no permitida', text: 'Debes mantener al menos un registro de idioma.', icon: 'info', confirmButtonText: 'Aceptar' });
}
function toggleAnioFinalizacion(select) {
  const entry = select.closest('.formacion-entry');
  const anioGroup = entry.querySelector('.anio-finalizacion-group');
  const anioInput = anioGroup?.querySelector('input');
  if (!anioGroup || !anioInput) return;
  if (select.value === 'En Curso') {
    anioGroup.style.display = 'none';
    anioInput.removeAttribute('required');
    anioInput.classList.remove('is-invalid');
  } else {
    anioGroup.style.display = 'block';
    anioInput.setAttribute('required', 'required');
    const label = anioGroup.querySelector('label');
    if (label && !label.classList.contains('required-field')) label.classList.add('required-field');
  }
}
