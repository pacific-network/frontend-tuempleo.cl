document.addEventListener('DOMContentLoaded', () => {
  const btnAgregar = document.getElementById('agregar-pregunta');
  const contenedor = document.getElementById('preguntas-container');
  let contadorPreguntas = 0;
  const maxPreguntas = 5;

  btnAgregar.addEventListener('click', () => {
    if (contadorPreguntas >= maxPreguntas) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Solo puedes agregar hasta ${maxPreguntas} preguntas.`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const div = document.createElement('div');
    div.className = 'input-group mb-2';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = `pregunta_${contadorPreguntas + 1}`;
    input.className = 'form-control';
    input.placeholder = `Pregunta ${contadorPreguntas + 1}`;

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn btn-danger';
    btnEliminar.innerText = '✕';
    btnEliminar.onclick = () => {
      contenedor.removeChild(div);
      contadorPreguntas--;
    };

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.className = 'input-group-append';
    inputGroupAppend.appendChild(btnEliminar);

    div.appendChild(input);
    div.appendChild(inputGroupAppend);
    contenedor.appendChild(div);

    contadorPreguntas++;
  });
});
