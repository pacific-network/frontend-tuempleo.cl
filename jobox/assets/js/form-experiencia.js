document.addEventListener('DOMContentLoaded', () => {
    const meses = [
        { value: '', label: 'Mes' },
        { value: '13', label: 'Actualmente' },
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

    const anios = ['Año', 'Actualmente'].concat(
        Array.from({ length: 41 }, (_, i) => 2025 - i)
    );

    document.querySelectorAll('.mes-select').forEach(select => {
        meses.forEach(({ value, label }) => {
            const option = new Option(label, value);
            select.add(option);
        });
    });

    document.querySelectorAll('.anio-select').forEach(select => {
        anios.forEach(anio => {
            const value = anio === 'Año' ? '' : anio;
            const option = new Option(anio, value);
            select.add(option);
        });
    });
});
