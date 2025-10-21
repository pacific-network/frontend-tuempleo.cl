function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');

  toastBody.textContent = message;

  if (type === 'success') {
    toastTitle.textContent = '✅ Éxito';
    toastEl.classList.remove('bg-danger', 'bg-warning');
    toastEl.classList.add('bg-success');
  } else if (type === 'error') {
    toastTitle.textContent = '❌ Error';
    toastEl.classList.remove('bg-success', 'bg-warning');
    toastEl.classList.add('bg-danger');
  } else {
    toastTitle.textContent = '⚠️ Aviso';
    toastEl.classList.remove('bg-success', 'bg-danger');
    toastEl.classList.add('bg-warning');
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function getUserIdFromToken() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (e) {
    console.error('Error al decodificar el token:', e);
    return null;
  }
}

async function actualizarEmpresa() {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('No estás autenticado', 'error');
    return;
  }

  const nombre_fantasia = document.getElementById('nombre_fantasia')?.value.trim() || '';
  const telefono = document.getElementById('telefono_empresa')?.value.trim() || '';
  const descripcion = document.getElementById('descripcion_empresa')?.value.trim() || '';
  const pais = document.getElementById('empresa_pais')?.value || '';
  const web_factuacion = document.getElementById('web_facturacion')?.value.trim() || '';
  const region = document.getElementById('empresa_region')?.value.trim() || '';
  const comuna = document.getElementById('empresa_comuna')?.value.trim() || '';
  const direccion = document.getElementById('empresa_direccion')?.value.trim() || '';
  const actividad = document.getElementById('actividad_empresa')?.value.trim() || '';

  const domicilios = direccion ? [direccion] : [];
  const actividades_economicas = actividad ? [actividad] : [];

  const payload = {
    nombre_fantasia,
    telefono,
    descripcion,
    pais,
    web_factuacion,
    region,
    comuna,
    domicilios,
    actividades_economicas
  };

  try {
    const res = await fetch(`${BASE_URL_API}/empleador/empresa`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      showToast('Error actualizando empresa: ' + errorText, 'error');
      return;
    }

    showToast('Empresa actualizada correctamente', 'success');
  } catch (error) {
    console.error('Error en fetch:', error);
    showToast('Error al conectar con el servidor', 'error');
  }
}

// 👉 Conectar botón al evento
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('actualizarEmpresaBtn');
  if (btn) {
    btn.addEventListener('click', actualizarEmpresa);
  }
});
