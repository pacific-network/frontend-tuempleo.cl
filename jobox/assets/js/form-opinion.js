// assets/js/form-opinion.js
document.addEventListener("DOMContentLoaded", function () {
  const $ = (sel) => document.querySelector(sel);

  const formTipo = $("#seleccionTipoForm");
  const formTrabajador = $("#formTrabajador");
  const formNoTrabajador = $("#formNoTrabajador");

  const qs = new URLSearchParams(location.search);
  const jobId = qs.get("id") || null;
  let rut = qs.get("rut") || sessionStorage.getItem("selectedEmployerRut") || null;

  const BASE = typeof BASE_URL_API !== "undefined" ? BASE_URL_API : "http://localhost:3000";

  async function j(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  async function getOferta(id) {
    const urls = [
      `${BASE}/v1/ofertas/${encodeURIComponent(id)}`,
      `${BASE}/ofertas/${encodeURIComponent(id)}`
    ];
    for (const u of urls) { try { return await j(u); } catch {} }
    return null;
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

      form.querySelectorAll(".star-rating").forEach((container) => {
        const key = container.getAttribute("data-name");
        const val = Number(container.getAttribute("data-selected"));
        if (!val) incompleto = true; else data[key] = val;
      });

      if (incompleto || Object.keys(data).length < 3) {
        Swal.fire({ icon: "info", title: "Faltan estrellas", text: "Completa todas las calificaciones." });
        return;
      }

      const payload = { type, data };
      const comentario = form.querySelector("textarea")?.value.trim();
      if (comentario) payload.comentario = comentario;

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(`${BASE}/v1/empresas/${encodeURIComponent(rut)}/reviews`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try { const err = await res.json(); if (err?.message) msg = err.message; } catch {}
          throw new Error(msg);
        }

        Swal.fire({ icon: "success", title: "¡Gracias!", text: "Tu opinión fue enviada de forma anónima." });

        // reset UI
        form.reset();
        form.querySelectorAll(".star-rating").forEach((c) => {
          c.removeAttribute("data-selected");
          highlight(c, 0);
        });

        if (jobId) setTimeout(() => {
          location.href = `job-single-2-si.html?id=${encodeURIComponent(jobId)}`;
        }, 1200);
      } catch (err) {
        Swal.fire({ icon: "error", title: "No se pudo enviar", text: err.message || "Error desconocido" });
      }
    });
  });
});
