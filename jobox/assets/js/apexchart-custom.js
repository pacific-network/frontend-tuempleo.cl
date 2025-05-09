$(function () {
    "use strict";

    // Datos del gráfico
    const chartData = [60, 50, 70, 60, 55, 50, 40, 60, 50, 70, 40, 80];

    // Calcular la suma
    const totalViews = chartData.reduce((acc, val) => acc + val, 0);

    // Actualizar el contenido del H1
    $('#views-total').text(totalViews);

    // Configuración del chart
    var options = {
        series: [{
            name: 'Views',
            data: chartData,
        }],
        colors: ['#3C65F5'],
        chart: {
            height: 380,
            type: 'area'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        },
    };

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
});
