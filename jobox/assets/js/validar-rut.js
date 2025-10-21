document.querySelector('form').addEventListener('submit', function (e) {
            const rutInput = document.getElementById('rutInput');
            const razonInput = document.getElementById('razon_social');
            const categoria = document.getElementById('categoria');

            let valid = true;

            if (!rutInput.checkValidity()) {
                rutInput.classList.add('is-invalid');
                valid = false;
            } else {
                rutInput.classList.remove('is-invalid');
            }

            if (!razonInput.checkValidity()) {
                razonInput.classList.add('is-invalid');
                valid = false;
            } else {
                razonInput.classList.remove('is-invalid');
            }

            if (!categoria.checkValidity()) {
                categoria.classList.add('is-invalid');
                valid = false;
            } else {
                categoria.classList.remove('is-invalid');
            }

            if (!valid) {
                e.preventDefault();
            }
        });