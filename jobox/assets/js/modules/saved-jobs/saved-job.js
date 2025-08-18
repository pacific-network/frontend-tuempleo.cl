// ===== Guardar Trabajo: mismo estilo que "Ya Estás Postulado" =====
document.addEventListener('DOMContentLoaded', initGuardarTrabajo);

function getOfertaIdFromUrl() {
  if (typeof getIdOfertaFromURL === 'function') return getIdOfertaFromURL();
  return new URLSearchParams(location.search).get('id');
}

function setGuardarDisabled(btn) {
  // Toma el estilo actual del botón de postular (que ya luce como "Ya Estás Postulado")
  const postBtn = document.getElementById('btn-postular');

  // Clases base: si existe el de postular, copia sus clases; si no, usa un fallback primario
  const baseClasses = postBtn ? postBtn.className : 'theme-btn theme-btn1';
  btn.className = baseClasses;

  // Marca disabled e inerte (mismo comportamiento)
  btn.classList.add('disabled');
  btn.setAttribute('aria-disabled', 'true');
  btn.href = '#';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.65';
  btn.style.cursor = 'not-allowed';

  // Texto/ícono
  btn.innerHTML = '<span class="fe-bookmark"></span> Guardado';

  // Remueve listeners para que quede inerte
  const clone = btn.cloneNode(true);  // clona con el mismo id
  btn.replaceWith(clone);
}

function setGuardarEnabled(btn) {
  btn.className = 'theme-btn theme-btn2';
  btn.removeAttribute('aria-disabled');
  btn.style.pointerEvents = 'auto';
  btn.style.opacity = '1';
  btn.style.cursor = 'pointer';
  btn.innerHTML = '<span class="fe-bookmark"></span> Guardar Trabajo';
}

async function initGuardarTrabajo() {
  const btn = document.getElementById('btn-guardar');
  if (!btn) return;

  const token = localStorage.getItem('token');
  const ofertaId = getOfertaIdFromUrl();
  if (!ofertaId) return;

  // Sin sesión → aviso y no guarda
  if (!token) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
    
      if (typeof mostrarPopup === 'function') {
        mostrarPopup(
          { titulo: 'Sesión requerida', texto: 'Inicia sesión para guardar trabajos.' },
          'error'
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sesión requerida',
          text: 'Inicia sesión para guardar trabajos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false
        });
      }
    });
    return;
  }


  // 1) Estado inicial
  try {
    const r = await fetch(`${BASE_URL_API}/guardados/status?oferta_id=${encodeURIComponent(ofertaId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (r.ok) {
      const { saved } = await r.json();
      if (saved) {
        setGuardarDisabled(btn);
        return; // ya está guardado
      }
    }
  } catch (e) {
    console.error('status guardado:', e);
  }

  // 2) Habilitado y con handler para guardar
  setGuardarEnabled(btn);

  const handler = async (e) => {
    e.preventDefault();
    if (btn.dataset.loading === '1') return;
    btn.dataset.loading = '1';

    try {
      const res = await fetch(`${BASE_URL_API}/guardados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oferta_id: Number(ofertaId) })
      });
      if (!res.ok) throw new Error('POST /guardados falló');

      setGuardarDisabled(btn);
      if (typeof mostrarPopup === 'function') {
        mostrarPopup({ titulo: 'Guardado', texto: 'Oferta añadida a tus guardados.' }, 'success');
      }
    } catch (err) {
      console.error('guardar trabajo:', err);
      if (typeof mostrarPopup === 'function') {
        mostrarPopup({ titulo: 'Error', texto: 'No se pudo guardar esta oferta.' }, 'error');
      }
    } finally {
      delete btn.dataset.loading;
    }
  };

  btn.addEventListener('click', handler);
}
