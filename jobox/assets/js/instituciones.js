// jobox/assets/js/instituciones.js

const opcionesInstituciones = [
    { value: "", text: "-- Selecciona una institución --", group: "" },
    
    // Universidades
    { value: "puc", text: "Pontificia Universidad Católica de Chile", group: "🏛️ Universidades" },
    { value: "uchile", text: "Universidad de Chile", group: "🏛️ Universidades" },
    { value: "usach", text: "Universidad de Santiago de Chile", group: "🏛️ Universidades" },
    { value: "uba", text: "Universidad Bernardo O'Higgins", group: "🏛️ Universidades" },
    { value: "udec", text: "Universidad de Concepción", group: "🏛️ Universidades" },
    { value: "ufro", text: "Universidad de La Frontera", group: "🏛️ Universidades" },
    { value: "ula", text: "Universidad de Los Andes", group: "🏛️ Universidades" },
    { value: "usm", text: "Universidad Técnica Federico Santa María", group: "🏛️ Universidades" },
    { value: "uai", text: "Universidad Adolfo Ibáñez", group: "🏛️ Universidades" },
    { value: "udp", text: "Universidad Diego Portales", group: "🏛️ Universidades" },
    { value: "uandes", text: "Universidad de los Andes", group: "🏛️ Universidades" },
    { value: "unab", text: "Universidad Andrés Bello", group: "🏛️ Universidades" },
    { value: "ucn", text: "Universidad Católica del Norte", group: "🏛️ Universidades" },
    { value: "uct", text: "Universidad Católica de Temuco", group: "🏛️ Universidades" },
    { value: "udla", text: "Universidad de Las Américas", group: "🏛️ Universidades" },
    { value: "uautonoma", text: "Universidad Autónoma de Chile", group: "🏛️ Universidades" },
    { value: "umayor", text: "Universidad Mayor", group: "🏛️ Universidades" },
    { value: "usek", text: "Universidad SEK", group: "🏛️ Universidades" },
    { value: "uahurtado", text: "Universidad Alberto Hurtado", group: "🏛️ Universidades" },
    { value: "ucentral", text: "Universidad Central de Chile", group: "🏛️ Universidades" },
    { value: "uv", text: "Universidad de Valparaíso", group: "🏛️ Universidades" },
    { value: "uantof", text: "Universidad de Antofagasta", group: "🏛️ Universidades" },
    { value: "userena", text: "Universidad de La Serena", group: "🏛️ Universidades" },
    { value: "utalca", text: "Universidad de Talca", group: "🏛️ Universidades" },
    { value: "ubio", text: "Universidad del Bío-Bío", group: "🏛️ Universidades" },
    { value: "uach", text: "Universidad Austral de Chile", group: "🏛️ Universidades" },
    { value: "umag", text: "Universidad de Magallanes", group: "🏛️ Universidades" },
    { value: "utem", text: "Universidad Tecnológica Metropolitana", group: "🏛️ Universidades" },
    { value: "uplacer", text: "Universidad de Playa Ancha", group: "🏛️ Universidades" },
    { value: "ufinis", text: "Universidad Finis Terrae", group: "🏛️ Universidades" },
    { value: "ucsh", text: "Universidad Católica Silva Henríquez", group: "🏛️ Universidades" },
    { value: "uss", text: "Universidad San Sebastián", group: "🏛️ Universidades" },
    { value: "uoh", text: "Universidad de O'Higgins", group: "🏛️ Universidades" },
    { value: "uaysen", text: "Universidad de Aysén", group: "🏛️ Universidades" },
    
    // Institutos Profesionales
    { value: "ipchile", text: "IP Chile", group: "🎓 Institutos Profesionales" },
    { value: "iparcos", text: "IP Arcos", group: "🎓 Institutos Profesionales" },
    { value: "ipcf", text: "IP Carlos Casanueva", group: "🎓 Institutos Profesionales" },
    { value: "ipg", text: "IP Guillermo Subercaseaux", group: "🎓 Institutos Profesionales" },
    { value: "ipvg", text: "IP Valparaíso", group: "🎓 Institutos Profesionales" },
    { value: "ipamerico", text: "IP AIEP", group: "🎓 Institutos Profesionales" },
    { value: "ipci", text: "IP CIISA", group: "🎓 Institutos Profesionales" },
    { value: "ipdta", text: "IP DUOC UC", group: "🎓 Institutos Profesionales" },
    { value: "ipe", text: "IP Escuela de Comercio", group: "🎓 Institutos Profesionales" },
    { value: "ipinacap", text: "IP INACAP", group: "🎓 Institutos Profesionales" },
    { value: "iploslagos", text: "IP Los Lagos", group: "🎓 Institutos Profesionales" },
    { value: "ipm", text: "IP Mayor", group: "🎓 Institutos Profesionales" },
    { value: "ipsanto", text: "IP Santo Tomás", group: "🎓 Institutos Profesionales" },
    { value: "ipvirginia", text: "IP Virginia O'Higgins", group: "🎓 Institutos Profesionales" },
    
    // Centros de Formación Técnica
    { value: "cftc", text: "CFT CEDUC UCN", group: "🔧 Centros de Formación Técnica" },
    { value: "cftcr", text: "CFT CRUZ ROJA", group: "🔧 Centros de Formación Técnica" },
    { value: "cftem", text: "CFT ENAC", group: "🔧 Centros de Formación Técnica" },
    { value: "cftma", text: "CFT MAULE", group: "🔧 Centros de Formación Técnica" },
    { value: "cftsa", text: "CFT SAN AGUSTÍN", group: "🔧 Centros de Formación Técnica" },
    { value: "cftu", text: "CFT UCE", group: "🔧 Centros de Formación Técnica" },
    { value: "cftub", text: "CFT UBERLÂNDIA", group: "🔧 Centros de Formación Técnica" },
    { value: "cftin", text: "CFT INACAP", group: "🔧 Centros de Formación Técnica" },
    { value: "cftla", text: "CFT LAPRIDA", group: "🔧 Centros de Formación Técnica" },
    { value: "cftvi", text: "CFT VIRTUAL", group: "🔧 Centros de Formación Técnica" },
    { value: "cftest", text: "CFT ESTADAL", group: "🔧 Centros de Formación Técnica" },
    { value: "cftpro", text: "CFT PROANDES", group: "🔧 Centros de Formación Técnica" },
    { value: "cftte", text: "CFT TEKNOS", group: "🔧 Centros de Formación Técnica" },
    { value: "cftval", text: "CFT VALLE GRANDE", group: "🔧 Centros de Formación Técnica" },
    
    // Instituciones Extranjeras
    { value: "unefa", text: "UNEFA (Venezuela)", group: "🌍 Internacionales en Chile" },
    { value: "uab", text: "Universidad de Barcelona (España)", group: "🌍 Internacionales en Chile" },
    { value: "unam", text: "UNAM (México)", group: "🌍 Internacionales en Chile" },
    { value: "otra", text: "Otra", group: "🌍 Otras" }
];

// Cargar dinámicamente en el select con grupos
document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("instituciones_chile");

    if (select) {
        // Agrupar las opciones por su categoría
        const grupos = {};
        opcionesInstituciones.forEach(({ value, text, group }) => {
            if (!grupos[group]) {
                grupos[group] = [];
            }
            grupos[group].push({ value, text });
        });

        // Crear los optgroup y las opciones
        for (const [groupName, opciones] of Object.entries(grupos)) {
            if (groupName) { // Saltar el primer elemento sin grupo
                const optgroup = document.createElement("optgroup");
                optgroup.label = groupName;
                
                opciones.forEach(({ value, text }) => {
                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = text;
                    optgroup.appendChild(option);
                });
                
                select.appendChild(optgroup);
            } else {
                // Opción por defecto (sin grupo)
                opciones.forEach(({ value, text }) => {
                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                });
            }
        }
    }
});