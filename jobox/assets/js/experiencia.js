function handleActualmente(selectElement) {
    const wrapper = selectElement.closest('.d-flex');
    const yearSelect = wrapper.querySelector('select[name="anio_termino"]');

    if (selectElement.value === '13' || selectElement.value === 'Actualmente') {
        yearSelect.disabled = true;
        yearSelect.value = 'Actualmente';
    } else {
        yearSelect.disabled = false;
        if (yearSelect.value === 'Actualmente') {
            yearSelect.value = '';
        }
    }
}

function removeExperience(button) {
    const entry = button.closest('.exp-entry');
    const total = document.querySelectorAll('.exp-entry').length;

    if (total > 1) {
        entry.remove();
    } else {
        alert("Debe mantener al menos una experiencia");
    }
}

function addExperience() {
    const container = document.getElementById('experiencia-container');
    const lastEntry = container.querySelector('.exp-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    // Limpiar campos
    newEntry.querySelectorAll('input, textarea').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(select => {
        select.value = '';
        select.disabled = false;
    });

    // Asignar evento a "Actualmente"
    newEntry.querySelectorAll('select[name="mes_termino"]').forEach(select => {
        select.addEventListener('change', function () {
            handleActualmente(this);
        });
    });

    // Reasignar evento al botón eliminar
    const removeBtn = newEntry.querySelector('.remove-exp-btn');
    removeBtn.addEventListener('click', function () {
        removeExperience(this);
    });

    container.appendChild(newEntry);
    newEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    // Botón agregar experiencia
    document.getElementById('addExpBtn').addEventListener('click', addExperience);

    // Eventos para botones eliminar
    document.querySelectorAll('.remove-exp-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeExperience(this);
        });
    });

    // Eventos para select "Actualmente"
    document.querySelectorAll('select[name="mes_termino"]').forEach(select => {
        select.addEventListener('change', function () {
            handleActualmente(this);
        });
    });
});
