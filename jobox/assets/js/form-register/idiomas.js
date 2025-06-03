function addIdiomaBlock() {
    const container = document.getElementById('idiomas-container');
    const lastEntry = container.querySelector('.idioma-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    // Limpiar inputs y selects dentro del nuevo bloque
    newEntry.querySelectorAll('input').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(el => el.value = '');

    // Insertar nuevo bloque al contenedor
    container.appendChild(newEntry);

    // Asignar evento al botón de eliminar dentro del nuevo bloque
    const removeBtn = newEntry.querySelector('.remove-idioma-btn');
    removeBtn.addEventListener('click', function () {
        removeIdioma(this);
    });

    // Reasignar el evento al botón de agregar (una sola vez)
    document.getElementById('addIdiomaBtn').addEventListener('click', addIdiomaBlock, { once: true });

    // Desplazamiento suave
    newEntry.scrollIntoView({ behavior: 'smooth' });
}

function removeIdioma(button) {
    const container = document.getElementById('idiomas-container');
    const entries = container.querySelectorAll('.idioma-entry');
    if (entries.length > 1) {
        button.closest('.idioma-entry').remove();
    } else {
        alert("Debe mantener al menos un idioma");
    }
}

// Inicializar eventos cuando cargue la página
document.addEventListener('DOMContentLoaded', function () {
    // Evento para botón "Agregar idioma"
    const addBtn = document.getElementById('addIdiomaBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addIdiomaBlock, { once: true });
    }

    // Evento para el primer botón "Eliminar"
    const firstRemoveBtn = document.querySelector('.remove-idioma-btn');
    if (firstRemoveBtn) {
        firstRemoveBtn.addEventListener('click', function () {
            removeIdioma(this);
        });
    }
});
