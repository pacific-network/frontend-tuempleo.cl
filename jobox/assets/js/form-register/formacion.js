// Mostrar/ocultar año de finalización según estado del estudio
function toggleAnioFinalizacion(selectElement) {
    const anioGroup = selectElement.closest('.formacion-entry').querySelector('.anio-finalizacion-group');
    if (selectElement.value === 'graduado' || selectElement.value === 'abandonado') {
        anioGroup.style.display = 'block';
    } else {
        anioGroup.style.display = 'none';
        const input = anioGroup.querySelector('input');
        if (input) input.value = '';
    }
}

// Eliminar formación
function removeFormacion(button) {
    const entryToRemove = button.closest('.formacion-entry');
    if (document.querySelectorAll('.formacion-entry').length > 1) {
        entryToRemove.remove();
    } else {
        alert("Debe mantener al menos un registro de formación");
    }
}

// Añadir nueva formación
function addFormacion() {
    const container = document.getElementById('formacion-container');
    const lastEntry = container.querySelector('.formacion-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    // Limpiar campos de texto, selects y año de finalización
    newEntry.querySelectorAll('input').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(el => {
        el.value = '';
        if (el.name === 'estado_estudio[]') {
            const anioGroup = newEntry.querySelector('.anio-finalizacion-group');
            if (anioGroup) anioGroup.style.display = 'none';
        }
    });

    container.appendChild(newEntry);
    newEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reasignar eventos a los nuevos elementos
    assignEvents(newEntry);
}

// Asignar eventos dinámicamente (para nuevos elementos)
function assignEvents(scope = document) {
    scope.querySelectorAll('.remove-formacion-btn').forEach(button => {
        button.onclick = () => removeFormacion(button);
    });

    scope.querySelectorAll('[name="estado_estudio[]"]').forEach(select => {
        select.onchange = () => toggleAnioFinalizacion(select);
    });
}

// Inicializar después de cargar el DOM
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addFormacionBtn').addEventListener('click', addFormacion);

    // Inicializar tooltips de Bootstrap
    document.querySelectorAll('.remove-formacion-btn').forEach(button => {
        new bootstrap.Tooltip(button, {
            placement: 'top'
        });
    });

    // Inicializar eventos en los elementos actuales
    assignEvents();
});
