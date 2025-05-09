const actividadesEmpresa = [
    "", "AFJP", "Administración", "Agro-Industrial", "Agropecuaria", "Alimenticia", "Arquitectura", "Artesanal",
    "Automotriz", "Aerea", "Banco / Financiera", "Biotecnología", "Call Center", "Comercio", "Comercio Exterior",
    "Comunicaciones", "Construcción", "Consultora de RRHH", "Consultoría", "Consumo Masivo", "Correo", "Defensa",
    "Diseño", "Editorial", "Educación", "Energía", "Entretenimiento", "Farmacéutica", "Ferroviaria", "Financiera",
    "Forestal", "Ganadería", "Gastronomía", "Gobierno", "Higiene y Perfumeria", "Holding", "Hotelería", "Imprenta",
    "Industrial", "Imprenta e Interpretación", "Informática/Tecnologías", "Información e investigación", "Inmobiliaria",
    "Internet", "Juridica", "Laboratorio", "Manufactura", "Medio Ambiente", "Medios", "Metalmecánica",
    "Minería/Petróleo/Gas", "ONGs", "Optica", "Otras", "Papelera", "Pesca", "Petroquímica", "Plástico",
    "Publicidad/Marketing", "Química", "Retail", "Salud", "Sector Publico", "Seguridad", "Seguro", "Servicios",
    "Siderurgia", "Supermercados/Hipermercados", "Tabacalera", "Telecomunicaciones", "Textil", "Transportadora",
    "Transporte", "Turismo"
];

document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("actividad_empresa_select");

    if (select) {
        select.innerHTML = '';
        actividadesEmpresa.forEach((actividad, index) => {
            const option = document.createElement("option");
            option.value = actividad;
            option.textContent = actividad || "Seleccione una actividad";
            select.appendChild(option);
        });
    }
});
