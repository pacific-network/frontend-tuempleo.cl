document.addEventListener('DOMContentLoaded', () => {
      const textarea = document.getElementById('descripcion_empresa');
      const contador = document.getElementById('contadorDescripcion');
    
      textarea.addEventListener('input', () => {
        const largo = textarea.value.length;
        contador.textContent = `${largo} / 500 caracteres`;
      });
    });