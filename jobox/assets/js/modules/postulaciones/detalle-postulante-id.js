// assets/js/modules/postulaciones/detalle-postulante-id.js
(function () {
  // ----------------- helpers -----------------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const S = (v) => (v == null ? '' : String(v));

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'No disponible';
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) edad--;
    return Number.isFinite(edad) ? edad : 'No disponible';
  }

  function toCLP(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return 'No informado';
    return `$${num.toLocaleString('es-CL')}`;
  }

  // Limpia solo las claves id/userId de la URL, conservando otros params si hubiese
  function stripIdFromUrl() {
    try {
      const params = new URLSearchParams(location.search);
      const hadId = params.has('id') || params.has('userId');
      if (!hadId) return;

      params.delete('id');
      params.delete('userId');
      const newQs = params.toString();
      const newUrl = location.pathname + (newQs ? `?${newQs}` : '') + location.hash;
      if (newUrl !== location.href) history.replaceState(null, '', newUrl);
    } catch (_) {}
  }

  // Resuelve el ID del candidato: primero sessionStorage; luego URL (y limpia)
  function resolveCandidateId() {
    const cached = sessionStorage.getItem('sel_cand_id');
    if (cached && cached !== "null" && cached !== "undefined") return cached;
  
    const params = new URLSearchParams(location.search);
  
    // 1️⃣ leer data base64
    if (params.has('data')) {
      try {
        const decoded = atob(params.get('data'));
        const obj = JSON.parse(decoded);
        const userId = obj.userId;
        const postulacionId = obj.postulacionId;
        if (userId) sessionStorage.setItem('sel_cand_id', userId);
        if (postulacionId) sessionStorage.setItem('sel_post_id', postulacionId);
        return userId;
      } catch (err) {
        console.error("Error decodificando data base64:", err);
      }
    }
  
    // 2️⃣ fallback a id/userId en URL
    const fromUrl = params.get('id') || params.get('userId');
    if (fromUrl) {
      sessionStorage.setItem('sel_cand_id', fromUrl);
      return fromUrl;
    }
  
    return undefined;
  }
  
  

  // Busca token en varias claves comunes
  const TOKEN_KEYS = [
    'auth_token_emp',
    'auth_token',
    'empleador_token',
    'access_token',
    'token',
    'jwt',
    'jwtToken'
  ];
  function getAuthToken() {
    for (const k of TOKEN_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return { token: v, key: k };
    }
    const anyKey = Object.keys(localStorage || {}).find((x) => /token/i.test(x));
    return anyKey ? { token: localStorage.getItem(anyKey), key: anyKey } : { token: null, key: null };
  }

  async function fetchPostulante(id) {
    const url = `${BASE_URL_API}/postulante/${id}`;
    const { token } = getAuthToken();

    // 1) Con Bearer si hay token
    if (token) {
      try {
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (r.ok) return r.json();
        // si no es 401/403, lanza error
        if (r.status !== 401 && r.status !== 403) {
          const t = await r.text().catch(() => '');
          throw new Error(`HTTP_${r.status} ${t}`);
        }
      } catch (_) {
        // sigue con intento por cookies
      }
    }

    // 2) Reintento con cookies (por si la sesión es cookie-based)
    const r2 = await fetch(url, { credentials: 'include' });
    if (!r2.ok) {
      const t = await r2.text().catch(() => '');
      throw new Error(`HTTP_${r2.status} ${t}`);
    }
    return r2.json();
  }

  function showInlineError(msg) {
    const cont = $('.job-single .container') || document.body;
    const warn = document.createElement('div');
    warn.className = 'alert alert-danger';
    warn.textContent = msg;
    cont.prepend(warn);
  }

  // ----------------- render -----------------
  function renderPerfil(postulante) {
    if (!postulante || !postulante.usuario) {
      console.warn('⚠️ No se encontró el postulante');
      showInlineError('No se encontró el postulante.');
      return;
    }

    const usuario = postulante.usuario;
    const data = postulante.data || {};
    const personales = data.datos_personales || {};
    const experiencias = data.experiencias || [];
    const educacion = personales.educacion || [];
    const idiomas = data.idiomas || [];
    const preferencias = data.preferencias || {};

    // base
    const nombre = `${S(usuario.nombres)} ${S(usuario.apellidos)}`.trim() || 'Sin nombre';
    const correo = usuario.email || 'No disponible';
    const telefono = personales.telefono || 'No disponible';
    const estadoCivil = personales.estado_civil || 'No informado';
    const salario = preferencias.salario_esperado ? toCLP(preferencias.salario_esperado) : 'No informado';
    const categoria = preferencias.categoria_empleo || 'No especificada';
    const descripcionBio = personales.descripcion_bio || '';
    const edad = calcularEdad(personales.fecha_nacimiento);

    // Foto (ruta por defecto relativa a /jobox/empresas/)
    const fotoUrl = data.foto_url || '../assets/img/job/01.jpg';
    const fotoEl = $('.job-single-employer img');
    if (fotoEl) fotoEl.src = fotoUrl;

    // Encabezado (nombre + categoría)
    const nombreEl = $('.job-single-employer-info h5');
    if (nombreEl) nombreEl.textContent = nombre;
    const categoriaEl = $('.job-single-employer-info p');
    if (categoriaEl) categoriaEl.textContent = categoria;

    // Lateral (lista de 8 items)
    const items = $$('.job-single-list ul > li');
    const setItem = (idx, text) => {
      const p = items[idx]?.querySelector('.job-single-list-info p');
      if (p) p.textContent = S(text);
    };
    if (items.length >= 6) {
      setItem(0, correo);
      setItem(1, telefono);
      setItem(2, estadoCivil);
      setItem(3, `${edad} Años`);
      setItem(4, salario);
      setItem(5, categoria);
    }

    // CV
    const cvLink = $('#downloadEmptyPdf');
    const cvUrl = data.cv_url || data.cv || postulante.cv_url || '';
    if (cvLink) {
      if (cvUrl) {
        cvLink.href = cvUrl;
        cvLink.target = '_blank';
        cvLink.rel = 'noopener';
        cvLink.textContent = 'Descargar CV';
      } else {
        cvLink.addEventListener('click', (e) => {
          e.preventDefault();
          alert('El candidato no ha subido su CV.');
        });
      }
    }

    // Idiomas (ítem 7)
    const idiomasContainer = items[7]?.querySelector('.job-single-list-info');
    if (idiomasContainer) {
      idiomasContainer.querySelectorAll('div').forEach((d) => d.remove());
      if (idiomas.length === 0) {
        const p = idiomasContainer.querySelector('p') || document.createElement('p');
        p.textContent = 'No informado';
        if (!idiomasContainer.contains(p)) idiomasContainer.appendChild(p);
      } else {
        idiomas.forEach((i) => {
          const div = document.createElement('div');
          div.style.display = 'flex';
          div.style.alignItems = 'flex-start';
          div.style.gap = '10px';
          div.innerHTML = `
            <p style="margin:0;">${S(i.idioma)} <span style="font-size:.9em;">→</span></p>
            <div style="display:flex;flex-direction:column;margin:0;">
              <span><strong>Escrito:</strong> ${S(i.nivel_escrito) || '—'}</span>
              <span><strong>Oral:</strong> ${S(i.nivel_oral) || '—'}</span>
            </div>`;
          idiomasContainer.appendChild(div);
        });
      }
    }

    // Bio
    const bioEl = $('.profile-bio p');
    if (bioEl) bioEl.textContent = descripcionBio;

    // Educación  (tu HTML usa: <div class="row g-6 profile-education">)
    const eduContainer = $('.profile-education');
    if (eduContainer) {
      eduContainer.innerHTML = '';
      if (educacion.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'col-lg-12';
        empty.innerHTML = '<p class="text-muted">Sin registros de educación.</p>';
        eduContainer.appendChild(empty);
      } else {
        educacion.forEach((e, index) => {
          const col = document.createElement('div');
          col.className = 'col-lg-6';
          col.style.position = 'relative';
          col.innerHTML = `
            <div class="profile-info-list">
              <ul>
                <li>Título: <span>${S(e.titulo)}</span></li>
                <li>Institución: <span>${S(e.institucion)}</span></li>
                <li>Tipo Estudio: <span>${S(e.grado)}</span></li>
                <li>Estado: <span>${S(e.estado)}</span></li>
              </ul>
            </div>
            ${index % 2 === 0 ? '<div style="position:absolute;right:0;top:0;bottom:0;width:1px;background:#ddd;"></div>' : ''}`;
          eduContainer.appendChild(col);
        });
      }
    }

    // Experiencias  (card con <h4>Experiencias</h4> + <div class="row g-12">)
    const expTitle = $$('.user-profile-card-title').find(
      (h) => h.textContent.trim().toLowerCase() === 'experiencias'
    );
    const expContainer = expTitle ? expTitle.parentElement.querySelector('.row.g-12') : null;
    if (expContainer) {
      expContainer.innerHTML = '';
      if (experiencias.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'col-lg-12';
        empty.innerHTML = '<p class="text-muted">Sin experiencias registradas.</p>';
        expContainer.appendChild(empty);
      } else {
        experiencias.forEach((exp, i) => {
          const wrap = document.createElement('div');
          wrap.className = 'col-lg-12';
          wrap.innerHTML = `
            <div class="profile-info-list">
              <ul>
                <li>Empresa: <span>${S(exp.empresa)}</span></li>
                <li>Cargo: <span>${S(exp.cargo)}</span></li>
                <li>Nivel Experiencia: <span>${S(exp.nivel_experiencia) || 'No informado'}</span></li>
                <li>Mes - Año Inicio: <span>${S(exp.anno_inicio) || 'No informado'}</span></li>
                <li>Mes - Año Término: <span>${S(exp.anno_termino) || 'Actualmente'}</span></li>
                <li>Descripción Cargo: <span>${S(exp.descripcion) || ''}</span></li>
              </ul>
            </div>
            ${i < experiencias.length - 1 ? '<hr style="opacity:1;border:0;border-top:1px solid #e5e7eb;margin:16px 0;">' : ''}`;
          expContainer.appendChild(wrap);
        });
      }
    }
  }

  // ----------------- init -----------------
  document.addEventListener('DOMContentLoaded', async () => {
    // Ajusta el botón "Volver a lista de Candidatos" para volver a la misma oferta (si se guardó)
    const backBtn = document.querySelector('a[href="employer-candidate.html"]');
    if (backBtn) {
      const returnTo = sessionStorage.getItem('return_to_offer_page') || 'employer-candidate.html';
      backBtn.setAttribute('href', returnTo);
    }

    const id = resolveCandidateId();
    if (!id) {
      console.error('❌ ID de postulante no disponible.');
      showInlineError('ID de postulante no disponible. Abra este perfil desde la lista de candidatos.');
      return;
    }

    try {
      const postulante = await fetchPostulante(id);
      renderPerfil(postulante);
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      console.error('❌ Error al cargar el perfil del postulante:', err);

      if (msg.startsWith('HTTP_401') || msg.startsWith('HTTP_403')) {
        // No redirigimos: solo mostramos aviso
        showInlineError('No autorizado para ver este perfil. Verifica tu sesión de empleador.');
        return;
      }
      showInlineError('No se pudo cargar el perfil del postulante.');
    }
  });
})();
