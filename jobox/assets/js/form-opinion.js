document.addEventListener("DOMContentLoaded", function() {
            const formTipo = document.getElementById("seleccionTipoForm");
            const formTrabajador = document.getElementById("formTrabajador");
            const formNoTrabajador = document.getElementById("formNoTrabajador");

            formTipo.addEventListener("change", () => {
                const tipo = formTipo.tipoUsuario.value;
                formTrabajador.style.display = tipo === "trabajo" ? "block" : "none";
                formNoTrabajador.style.display = tipo === "noTrabajo" ? "block" : "none";
            });

            document.querySelectorAll('.star-rating').forEach(container => {
                for (let i = 1;i <= 5; i++) {
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
                const selected = container.getAttribute("data-selected") || 0;
                highlight(container, selected);
            }

            [formTrabajador, formNoTrabajador].forEach(form => {
                form.addEvenetListener("submit", function (e) {
                    e.preventDefault();

                    const data = {};
                    form.querySelectorAll(".star-rating").forEach(container => {
                        const key = container.getAttribute("data-name");
                        const val = container.getAttribute("data-selected");
                        if (!val) return alert("Por favor completa todas las estrellas");
                        data[key] = parseInt(val);
                    });

                    const comentario = form.querySelector("textarea")?.value.trim();
                    if (comentario) data.comentario = comentario;

                    console.log("Enviado:", data);
                    alert("Gracias por tu evaluación. Tu opinión es muy importante para nosotros.");

                    form.reset();
                    form.querySelectorAll(".star-rating").forEach(c => {
                        c.removeAttribute("data-selected");
                        highlight(c, 0);
                    });
                });
            });
        });