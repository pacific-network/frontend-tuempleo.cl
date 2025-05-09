const areasCargo = [
    "", "Abastecimiento y Logistica", "Administración, Contabilidad y Finanzas", "Aduana y Comercio Exterior",
    "Atención al Cliente, Call Center y Telemarketing", "Comercial, Ventas y Negocios",
    "Comunicación, Relaciones Institucionales y Públicas", "Departamento Técnico", "Diseño",
    "Educación, Docencia e Investigación", "Enfermería", "Gastronomía y Turismo", "Gerencia y Dirección General",
    "Ingeniería Civil y Construcción", "Ingenierías", "Legales", "Marketing y Publicidad",
    "Minería, Petróleo y Gas", "Navierio, Marítimo, Porutuario", "Oficios y Otros", "Producción y Manufactura",
    "RRHH  y Capacitación", "Salud, Medicina y Farmacia", "Secretaria y Recepción", "Seguros",
    "Sociología / Trabajo Social", "Tecnologías, Sistemas y Telecomunicaciones"
];

document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("area_cargo_select");

    if (areaSelect) {
        areaSelect.innerHTML = '';

        areasCargo.forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area || "Seleccione un área";
            areaSelect.appendChild(option);
        });
    }
});