// assets/js/form-opinion.js
document.addEventListener("DOMContentLoaded", function () {
  const $ = (sel) => document.querySelector(sel);

  const formTipo = $("#seleccionTipoForm");
  const formTrabajador = $("#formTrabajador");
  const formNoTrabajador = $("#formNoTrabajador");

  const qs = new URLSearchParams(location.search);
  const jobId = qs.get("id") || null;
  let rut = qs.get("rut") || sessionStorage.getItem("selectedEmployerRut") || null;

  // ✅ Usar SOLO la BASE_URL_API definida en main.js
  if (typeof BASE_URL_API === "undefined" || !BASE_URL_API) {
    console.error("[form-opinion] BASE_URL_API no está definida en main.js");
    return;
  }
  const BASE = BASE_URL_API.replace(/\/$/, "");
  const api = (p) => `${BASE}${p}`;

  async function j(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  async function getOferta(id) {
    // ✅ Un único endpoint basado en BASE_URL_API
    return j(api(`/ofertas/${encodeURIComponent(id)}`));
  }

  // Si no vino rut, intenta resolverlo por id oferta
  (async function ensureRut() {
    if (!rut && jobId) {
      const oferta = await getOferta(jobId);
      rut = oferta?.empresa?.rut || oferta?.empleador?.rut || oferta?.rutEmpresa || null;
      if (rut) sessionStorage.setItem("selectedEmployerRut", rut);
    }
    if (!rut) {
      Swal.fire({
        icon: "warning",
        title: "Empresa no resuelta",
        text: 'No se pudo identificar la empresa. Abre esta página desde el detalle de una oferta (con ?id=<oferta>) o pasa "rut" en la URL.',
      });
    }
  })();

  // Toggle tipo
  formTipo.addEventListener("change", () => {
    const tipo = formTipo.tipoUsuario.value;
    formTrabajador.style.display = tipo === "trabajo" ? "block" : "none";
    formNoTrabajador.style.display = tipo === "noTrabajo" ? "block" : "none";
  });

  // UI estrellas
  document.querySelectorAll(".star-rating").forEach((container) => {
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      star.className = "fa fa-star";
      star.dataset.value = i;

      star.addEventListener("mouseover", () => highlight(container, i));
      star.addEventListener("mouseout", () => reset(container));
      star.addEventListener("click", () => {
        container.setAttribute("data-selected", i);
        highlight(container, i);
      });

      container.appendChild(star);
    }
  });
  function highlight(container, val) {
    container.querySelectorAll(".fa-star").forEach((s, i) => {
      s.classList.toggle("checked", i < val);
    });
  }
  function reset(container) {
    const selected = Number(container.getAttribute("data-selected") || 0);
    highlight(container, selected);
  }

  // Mostrar/ocultar "motivo_extra" al elegir "otro"
  [formTrabajador, formNoTrabajador].forEach((form) => {
    form.addEventListener('change', (e) => {
      if (e.target?.name === 'motivo') {
        const scope = e.target.getAttribute('data-scope'); // 'trabajo' | 'postulacion'
        const box = form.querySelector(`[data-extra="${scope}"]`);
        if (!box) return;
        if (e.target.value === 'otro') {
          box.classList.remove('d-none');
        } else {
          box.classList.add('d-none');
          const i = box.querySelector('input'); if (i) i.value = '';
        }
      }
    });
  });

  // Envío (por RUT siempre)
  [formTrabajador, formNoTrabajador].forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!rut) {
        Swal.fire({
          icon: "warning",
          title: "Empresa no resuelta",
          text: 'No se pudo identificar la empresa. Abre esta página desde el detalle de una oferta (con ?id=<oferta>) o pasa "rut" en la URL.',
        });
        return;
      }

      const type = form === formTrabajador ? "trabajo" : "postulacion";
      const data = {};
      let incompleto = false;

      // estrellas (3 claves obligatorias)
      form.querySelectorAll(".star-rating").forEach((container) => {
        const key = container.getAttribute("data-name");
        const val = Number(container.getAttribute("data-selected"));
        if (!val) incompleto = true; else data[key] = val;
      });
      if (incompleto || Object.keys(data).length < 3) {
        Swal.fire({ icon: "info", title: "Faltan estrellas", text: "Completa todas las calificaciones." });
        return;
      }

      // motivo
      const selectMotivo = form.querySelector('select[name="motivo"]');
      const motivo = selectMotivo?.value || "";
      if (!motivo) {
        Swal.fire({ icon: "info", title: "Selecciona un motivo", text: "El motivo es obligatorio." });
        return;
      }
      const extraBox = form.querySelector(`[data-extra="${type}"]`);
      const extraInput = extraBox?.querySelector('input');
      const motivo_extra = (motivo === 'otro' && extraInput) ? extraInput.value.trim() : undefined;

      // comentario
      const comentario = form.querySelector("textarea")?.value.trim();

      const payload = { type, data, motivo };
      if (motivo === 'otro' && motivo_extra) payload.motivo_extra = motivo_extra;
      if (comentario) payload.comentario = comentario;

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        // ✅ Sin “/v1” automático. Si tu BASE_URL_API ya lo trae, perfecto.
        const res = await fetch(api(`/empresas/${encodeURIComponent(rut)}/reviews`), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try { const err = await res.json(); if (err?.message) msg = err.message; } catch {}
          throw new Error(msg);
        }

        Swal.fire({ icon: "success", title: "¡Gracias!", text: "Tu opinión fue enviada." });

        // reset UI
        form.reset();
        form.querySelectorAll(".star-rating").forEach((c) => {
          c.removeAttribute("data-selected");
          c.querySelectorAll(".fa-star").forEach(s => s.classList.remove('checked'));
        });
        const extra = form.querySelector(`[data-extra="${type}"]`);
        if (extra) { extra.classList.add('d-none'); const i = extra.querySelector('input'); if (i) i.value = ''; }

        if (jobId) setTimeout(() => {
          location.href = `job-single-2-si.html?id=${encodeURIComponent(jobId)}`;
        }, 1200);
      } catch (err) {
        Swal.fire({ icon: "error", title: "No se pudo enviar", text: err.message || "Error desconocido" });
      }
    });
  });
});
