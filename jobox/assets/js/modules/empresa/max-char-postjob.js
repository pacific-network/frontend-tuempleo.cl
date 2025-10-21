document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('descripcion');
    const contador = document.getElementById('contadorDescripcionPuesto');
    const maxLength = 500;

    textarea.addEventListener('input', function () {
        const length = textarea.value.length;
        contador.textContent = `${length} / ${maxLength} caracteres`;
    });
});