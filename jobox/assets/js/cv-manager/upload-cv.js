document.addEventListener("DOMContentLoaded", function () {
            const uploadButton = document.getElementById("uploadBtn");
            const fileInput = document.getElementById("fileInput");
            const filePreview = document.getElementById("filePreview");
            const customFileButton = document.getElementById("customFileButton");
            const toastContainer = document.getElementById("toastContainer");

            // Abre el selector de archivo cuando se clickea el botón personalizado
            customFileButton.addEventListener("click", () => {
                fileInput.click();
            });

            // Actualiza la vista cuando se selecciona archivo
            fileInput.addEventListener("change", () => {
                const file = fileInput.files[0];
                const previewContainer = document.getElementById("previewContainer");
                const miniPreview = document.getElementById("pdfMiniPreview");
                const uploadInstructions = document.getElementById("uploadInstructions");
            
                if (file && file.type === "application/pdf") {
                    uploadButton.disabled = false;
            
                    const fileURL = URL.createObjectURL(file);
                    miniPreview.src = fileURL;
            
                    uploadInstructions.style.display = "none";     // Oculta texto inicial
                    previewContainer.style.display = "block";      // Muestra el preview
                } else {
                    uploadButton.disabled = true;
                    miniPreview.src = "";
                    previewContainer.style.display = "none";
                    uploadInstructions.style.display = "block";    // Muestra texto otra vez
                    showToast("Por favor, selecciona un archivo PDF válido.", "warning");
                }
            });


            // Función para mostrar toast
            function showToast(message, type = "success") {
                const toastId = "toast" + Date.now();
                const toastHtml = `
                    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                      <div class="d-flex">
                        <div class="toast-body">
                          ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                      </div>
                    </div>
                `;
                toastContainer.insertAdjacentHTML("beforeend", toastHtml);
                const toastElement = document.getElementById(toastId);
                const bsToast = new bootstrap.Toast(toastElement, { delay: 5000 });
                bsToast.show();

                // Remover toast del DOM cuando desaparezca
                toastElement.addEventListener("hidden.bs.toast", () => {
                    toastElement.remove();
                });
            }

            function parseJwt(token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    return JSON.parse(jsonPayload);
                } catch (e) {
                    return null;
                }
            }

            uploadButton.addEventListener("click", async function () {
                const token = localStorage.getItem("token");
                if (!token) {
                    showToast("Token no encontrado. Por favor inicia sesión.", "danger");
                    return;
                }

                const payload = parseJwt(token);
                if (!payload || !payload.sub) {
                    showToast("Token inválido, no se pudo obtener el id de usuario.", "danger");
                    return;
                }

                const userId = payload.sub;
                const file = fileInput.files[0];
                if (!file) {
                    showToast("Por favor selecciona un archivo PDF antes de subir.", "warning");
                    return;
                }

                try {
                    const response = await fetch(`${BASE_URL_API}/v1/postulante/${userId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error("Error al obtener el RUT del usuario");

                    const data = await response.json();
                    const rut = data.usuario.rut;

                    const formData = new FormData();
                    formData.append("file", file);

                    const uploadResponse = await fetch(`${BASE_URL_API}/v1/curriculum/upload/${rut}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        throw new Error(`Error al subir archivo: ${errorText}`);
                    }

                    showToast("¡CV subido correctamente!", "success");

                    // Limpiar input y deshabilitar botón para evitar doble envío
                    fileInput.value = "";
                    uploadButton.disabled = true;
                    filePreview.textContent = "";
                } catch (error) {
                    console.error(error);
                    showToast("Ocurrió un error al subir el CV: " + error.message, "danger");
                }
            });
        });