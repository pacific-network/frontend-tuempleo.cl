document.addEventListener('DOMContentLoaded', function() {
    // Función para cargar el archivo HTML en un contenedor
    function loadHTML(url, containerId) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                // Coloca el contenido del archivo HTML dentro del contenedor
                document.getElementById(containerId).innerHTML = xhr.responseText;
            } else {
                console.error("Error al cargar el archivo: " + xhr.statusText);
            }
        };
        xhr.onerror = function() {
            console.error("Error al intentar cargar el archivo.");
        };
        xhr.send();
    }

    // Cargar el header y el footer
    loadHTML('header.html', 'header-placeholder');
    loadHTML('footer.html', 'footer-placeholder');
});
