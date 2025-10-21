// === Obtener sub desde el token ===
function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('❌ No se encontró el token en localStorage');
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (e) {
    console.error('❌ Error al decodificar el token:', e);
    return null;
  }
}

// === Helper para setear valores en inputs ===
function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
  else console.warn(`⚠️ Campo con ID '${id}' no encontrado`);
}

// ✅ Cargar datos del empleador al DOM
document.addEventListener('DOMContentLoaded', async () => {
  const sub = getUserIdFromToken();
  const token = localStorage.getItem('token');

  if (!sub || !token) {
    console.error('❌ No se pudo obtener el sub del token');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL_API}/empleador/${sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error al obtener los datos del empleador:', res.status, errorText);
      throw new Error('Error al obtener los datos del empleador');
    }

    const empleador = await res.json();

    const empresa       = empleador?.empresa ?? {};
    const empresaData   = empresa?.data ?? {};
    const usuario       = empleador?.usuario ?? {};
    const empleadorData = empleador?.data ?? {};

    // === Empresa ===
    setFieldValue('rut_empresa', empresa.rut);
    setFieldValue('razon_social', empresa.razon_social);
    setFieldValue('nombre_fantasia', empresa.nombre_fantasia);
    setFieldValue('telefono_empresa', empresaData.telefono);
    setFieldValue('descripcion_empresa', empresaData.descripcion);
    setFieldValue('empresa_region', empresaData.region);
    setFieldValue('empresa_comuna', empresaData.comuna);
    setFieldValue(
      'empresa_direccion',
      Array.isArray(empresaData.domicilios) ? empresaData.domicilios[0] : (empresaData.domicilios ?? '')
    );
    setFieldValue('empresa_pais', empresaData.pais);
    setFieldValue(
      'actividad_empresa',
      Array.isArray(empresaData.actividades_economicas) ? empresaData.actividades_economicas[0] : (empresaData.actividades_economicas ?? '')
    );

    // web_facturacion: manejar ambas variantes
    const webFact = empresaData.web_facturacion ?? empresaData.web_factuacion ?? '';
    setFieldValue('web_facturacion', webFact);

    // === Categoría empresa ===
    (() => {
      const rawCat = empresaData?.categoria_empresa;
      const categoria = rawCat == null ? '' : String(rawCat).trim();
      const select = document.getElementById('categoria_empresa');

      if (!select) {
        console.warn('⚠️ No se encontró el select#categoria_empresa');
        return;
      }

      // Intento directo
      select.value = categoria;

      // Si no calzó, agregamos opción dinámica
      if (select.value !== categoria) {
        console.warn('⚠️ La opción no existe en el select, se agregará dinámicamente:', categoria);
        const opt = document.createElement('option');
        opt.value = categoria;
        opt.textContent =
          categoria === '1' ? 'Primera' :
          categoria === '2' ? 'Segunda' :
          `Categoría ${categoria}`;
        select.appendChild(opt);
        select.value = categoria;
      }

      // Actualizar plugins si existen
      if (typeof $ !== 'undefined') {
        if ($(select).hasClass('nice-select')) {
          $(select).val(categoria);
          $(select).niceSelect('update');
        }
        if ($(select).hasClass('selectpicker')) {
          $(select).val(categoria).selectpicker('refresh');
        }
        if ($(select).data('select2')) {
          $(select).val(categoria).trigger('change');
        }
      }

      console.log('✅ Categoría seteada a:', categoria, ' | Opciones actuales:', [...select.options].map(o => o.value));
    })();

    // Año inicio actividades
    if (empresaData.fecha_inicio_actividades) {
      const anio = new Date(empresaData.fecha_inicio_actividades).getFullYear();
      setFieldValue('empresa_inicio_actividades', Number.isNaN(anio) ? '' : anio);
    } else {
      setFieldValue('empresa_inicio_actividades', '');
    }

    // === Usuario ===
    setFieldValue('rut_empleador', usuario.rut);
    setFieldValue('nombre_usuario', usuario.nombres);
    setFieldValue('usuario_apellido', usuario.apellidos);
    setFieldValue('usuario_correo', usuario.email);

    // === Empleador extendido ===
    setFieldValue('empleador_pais', empleadorData.pais);
    setFieldValue('empleador_region', empleadorData.region);
    setFieldValue('empleador_comuna', empleadorData.comuna);
    setFieldValue('empleador_direccion', empleadorData.direccion);
    setFieldValue('usuario_telefono', empleadorData.telefono);
    setFieldValue('usuario_cargo', empleadorData.cargo);

    // === Redes sociales ===
    setFieldValue('empresa_facebook', empleadorData.facebook);
    setFieldValue('empresa_twitter', empleadorData.twitter);
    setFieldValue('empresa_linkedin', empleadorData.linkedin);
    setFieldValue('empresa_pinterest', empleadorData.pinterest);
    setFieldValue('empresa_whatsapp', empleadorData.whatsapp);

    console.log('✅ Datos cargados correctamente', empleador);
  } catch (error) {
    console.error('❌ Error al cargar datos del empleador:', error);
  }
});
