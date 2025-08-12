document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('businessForm'); // Asegúrate que este sea el ID real
        if (!form) return;

        form.addEventListener('submit', function () {
          const calle = document.getElementById('direccion_texto').value.trim();
          const numero = document.getElementById('numero_texto').value.trim();
          const campoDireccion = document.getElementById('direccion');

          if (campoDireccion) {
            campoDireccion.value = `${calle} ${numero}`.trim();
          }
        });
      });