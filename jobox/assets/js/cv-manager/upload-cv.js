// assets/js/cv-manager/upload-cv.js
document.addEventListener("DOMContentLoaded", function () {
  const uploadButton = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const customFileButton = document.getElementById("customFileButton");
  const toastContainer = document.getElementById("toastContainer");
  const previewContainer = document.getElementById("previewContainer");
  const miniPreview = document.getElementById("pdfMiniPreview");
  const uploadInstructions = document.getElementById("uploadInstructions");
  const verBtn = document.getElementById("verPdfBtn");

  customFileButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file && file.type === "application/pdf") {
      uploadButton.disabled = false;
      const blobUrl = URL.createObjectURL(file);
      miniPreview.src = blobUrl;
      uploadInstructions.style.display = "none";
      previewContainer.style.display = "block";
      verBtn.style.display = "none"; // aún no hay URL pública
    } else {
      uploadButton.disabled = true;
      miniPreview.src = "";
      previewContainer.style.display = "none";
      uploadInstructions.style.display = "block";
      showToast("Por favor, selecciona un archivo PDF válido.", "warning");
    }
  });

  uploadButton.addEventListener("click", onUpload);

  async function onUpload() {
    const token = localStorage.getItem("token");
    if (!token) return showToast("Inicia sesión para continuar.", "danger");

    const payload = parseJwt(token);
    const userId = payload?.sub;
    if (!userId) return showToast("Token inválido.", "danger");

    const file = fileInput.files?.[0];
    if (!file) return showToast("Selecciona un PDF antes de subir.", "warning");

    try {
      // 1) obtener rut
      const res = await fetch(`${BASE_URL_API}/postulante/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo obtener el RUT del usuario");
      const data = await res.json();
      const rut = data?.usuario?.rut;
      if (!rut) throw new Error("RUT no disponible");

      // 2) subir
      const formData = new FormData();
      formData.append("file", file);
      const up = await fetch(`${BASE_URL_API}/curriculum/upload/${rut}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!up.ok) {
        let msg = "Error al subir archivo";
        try {
          const t = await up.text();
          if (t) msg = t;
        } catch {}
        throw new Error(msg);
      }

      // 3) respuesta con URL pública (siempre que uses el controller que te pasé)
      let json = {};
      try {
        json = await up.json(); // { message, cv_path, url }
      } catch {}

      const publicUrl =
        json?.url ||
        (json?.cv_path
          ? `${BASE_URL_API}${json.cv_path.replace("/var/www/html", "")}`
          : null);

      showToast("¡CV subido correctamente!", "success");

      // 4) refrescar preview con URL pública
      if (publicUrl) {
        miniPreview.src = publicUrl;
        verBtn.style.display = "inline-block";
        verBtn.onclick = () => window.open(publicUrl, "_blank");
      } else if (typeof window.reloadCvPreview === "function") {
        // Si no vino url en la respuesta, pedimos al backend que nos redirija (/view)
        await window.reloadCvPreview();
      }

      // limpiar estado
      fileInput.value = "";
      uploadButton.disabled = true;
    } catch (err) {
      console.error(err);
      showToast("Ocurrió un error al subir el CV: " + (err.message || "Error"), "danger");
    }
  }

  // utilidades
  function showToast(message, type = "success") {
    const toastId = "toast" + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`;
    toastContainer.insertAdjacentHTML("beforeend", toastHtml);
    const el = document.getElementById(toastId);
    const t = new bootstrap.Toast(el, { delay: 4500 });
    t.show();
    el.addEventListener("hidden.bs.toast", () => el.remove());
  }

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
});
