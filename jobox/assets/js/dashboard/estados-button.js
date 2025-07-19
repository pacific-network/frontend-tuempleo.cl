function toggleDisponibilidad(id) {
    const icon = document.getElementById("toggleIcon" + id);
    const texto = document.getElementById("estadoDisponibilidad" + id);
    const activo = icon.classList.contains("fa-toggle-on");

    texto.classList.add("fade-out");

    setTimeout(() => {
        if (activo) {
            icon.classList.replace("fa-toggle-on", "fa-toggle-off");
            icon.classList.add("text-secondary");
            switch (id) {
                case "1":
                    texto.innerText = "No estoy disponible actualmente";
                    break;
                case "2":
                    texto.innerText = "Necesito unos días para comenzar";
                    break;
                case "3":
                    texto.innerText = "Notificación por Mail desactivada";
                    break;
                case "4":
                    texto.innerText = "Notificación por SMS desactivada";
                    break;
            }
        } else {
            icon.classList.replace("fa-toggle-off", "fa-toggle-on");
            icon.classList.remove("text-secondary");
            switch (id) {
                case "1":
                    texto.innerText = "Escucho propuestas de empleo";
                    break;
                case "2":
                    texto.innerText = "Puedo empezar de inmediato";
                    break;
                case "3":
                    texto.innerText = "Notificación por Mail activada";
                    break;
                case "4":
                    texto.innerText = "Notificación por SMS activada";
                    break;
            }
        }
        texto.classList.remove("fade-out");
    }, 200);
}