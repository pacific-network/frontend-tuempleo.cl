// Quitar puntos y dejar solo xxxxxxxx-x
    function cleanRUT(rut) {
        if (!rut) return '';
        let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (clean.length < 2) return clean;
        const cuerpo = clean.slice(0, -1);
        const dv = clean.slice(-1);
        return `${cuerpo}-${dv}`;
    }

    // Formatear con puntos y guion: xx.xxx.xxx-x
    function formatRUT(rut) {
        rut = cleanRUT(rut);
        if (!rut.includes('-')) return rut;
        let [cuerpo, dv] = rut.split('-');
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // agrega puntos cada 3 digitos
        return `${cuerpo}-${dv}`;
    }

    const rutInput = document.getElementById('rutInput');

    // Mostrar con puntos cuando carga
    rutInput.addEventListener('blur', function () {
        this.value = formatRUT(this.value);
    });

    // Mostrar limpio antes de enviar el formulario
    rutInput.form?.addEventListener('submit', function () {
        rutInput.value = cleanRUT(rutInput.value);
    });