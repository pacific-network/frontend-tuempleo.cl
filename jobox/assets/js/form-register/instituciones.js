// jobox/assets/js/instituciones.js

const opcionesInstituciones = [
    { value: "-- Selecciona una institución --", text: "-- Selecciona una institución --", group: "" },
    { value: "Otra", text: "Otra", group: "🌍 Otras" },
    
    // Universidades
    { value: "Pontificia Universidad Católica de Chile", text: "Pontificia Universidad Católica de Chile", group: "🏛️ Universidades" },
    { value: "Universidad de Chile", text: "Universidad de Chile", group: "🏛️ Universidades" },
    { value: "Universidad de Santiago de Chile", text: "Universidad de Santiago de Chile", group: "🏛️ Universidades" },
    { value: "Universidad Bernardo O'Higgins", text: "Universidad Bernardo O'Higgins", group: "🏛️ Universidades" },
    { value: "Universidad de Concepción", text: "Universidad de Concepción", group: "🏛️ Universidades" },
    { value: "Universidad de La Frontera", text: "Universidad de La Frontera", group: "🏛️ Universidades" },
    { value: "Universidad de Los Andes", text: "Universidad de Los Andes", group: "🏛️ Universidades" },
    { value: "Universidad Técnica Federico Santa María", text: "Universidad Técnica Federico Santa María", group: "🏛️ Universidades" },
    { value: "Universidad Adolfo Ibáñez", text: "Universidad Adolfo Ibáñez", group: "🏛️ Universidades" },
    { value: "Universidad Diego Portales", text: "Universidad Diego Portales", group: "🏛️ Universidades" },
    { value: "Universidad de los Andes", text: "Universidad de los Andes", group: "🏛️ Universidades" },
    { value: "Universidad Andrés Bello", text: "Universidad Andrés Bello", group: "🏛️ Universidades" },
    { value: "Universidad Católica del Norte", text: "Universidad Católica del Norte", group: "🏛️ Universidades" },
    { value: "Universidad Católica de Temuco", text: "Universidad Católica de Temuco", group: "🏛️ Universidades" },
    { value: "Universidad de Las Américas", text: "Universidad de Las Américas", group: "🏛️ Universidades" },
    { value: "Universidad Autónoma de Chile", text: "Universidad Autónoma de Chile", group: "🏛️ Universidades" },
    { value: "Universidad Mayor", text: "Universidad Mayor", group: "🏛️ Universidades" },
    { value: "Universidad SEK", text: "Universidad SEK", group: "🏛️ Universidades" },
    { value: "Universidad Santo Tomás ", text: "Universidad Santo Tomás", group: "🏛️ Universidades" },
    { value: "Universidad Alberto Hurtado", text: "Universidad Alberto Hurtado", group: "🏛️ Universidades" },
    { value: "Universidad Central de Chile", text: "Universidad Central de Chile", group: "🏛️ Universidades" },
    { value: "Universidad de Valparaíso", text: "Universidad de Valparaíso", group: "🏛️ Universidades" },
    { value: "Universidad de Antofagasta", text: "Universidad de Antofagasta", group: "🏛️ Universidades" },
    { value: "Universidad de La Serena", text: "Universidad de La Serena", group: "🏛️ Universidades" },
    { value: "Universidad de Talca", text: "Universidad de Talca", group: "🏛️ Universidades" },
    { value: "Universidad del Bío-Bío", text: "Universidad del Bío-Bío", group: "🏛️ Universidades" },
    { value: "Universidad Austral de Chile", text: "Universidad Austral de Chile", group: "🏛️ Universidades" },
    { value: "Universidad de Magallanes", text: "Universidad de Magallanes", group: "🏛️ Universidades" },
    { value: "Universidad Tecnológica Metropolitana", text: "Universidad Tecnológica Metropolitana", group: "🏛️ Universidades" },
    { value: "Universidad de Playa Ancha", text: "Universidad de Playa Ancha", group: "🏛️ Universidades" },
    { value: "Universidad Finis Terrae", text: "Universidad Finis Terrae", group: "🏛️ Universidades" },
    { value: "Universidad Católica Silva Henríquez", text: "Universidad Católica Silva Henríquez", group: "🏛️ Universidades" },
    { value: "Universidad San Sebastián", text: "Universidad San Sebastián", group: "🏛️ Universidades" },
    { value: "Universidad de O'Higgins", text: "Universidad de O'Higgins", group: "🏛️ Universidades" },
    { value: "Universidad de Aysén", text: "Universidad de Aysén", group: "🏛️ Universidades" },
    
    // Institutos Profesionales
    { value: "IP Chile", text: "IP Chile", group: "🎓 Institutos Profesionales" },
    { value: "IP Arcos", text: "IP Arcos", group: "🎓 Institutos Profesionales" },
    { value: "IP Carlos Casanueva", text: "IP Carlos Casanueva", group: "🎓 Institutos Profesionales" },
    { value: "IP Guillermo Subercaseaux", text: "IP Guillermo Subercaseaux", group: "🎓 Institutos Profesionales" },
    { value: "IP Valparaíso", text: "IP Valparaíso", group: "🎓 Institutos Profesionales" },
    { value: "IP AIEP", text: "IP AIEP", group: "🎓 Institutos Profesionales" },
    { value: "IP CIISA", text: "IP CIISA", group: "🎓 Institutos Profesionales" },
    { value: "IP DUOC UC", text: "IP DUOC UC", group: "🎓 Institutos Profesionales" },
    { value: "IP Escuela de Comercio", text: "IP Escuela de Comercio", group: "🎓 Institutos Profesionales" },
    { value: "IP INACAP", text: "IP INACAP", group: "🎓 Institutos Profesionales" },
    { value: "IP Los Lagos", text: "IP Los Lagos", group: "🎓 Institutos Profesionales" },
    { value: "IP Mayor", text: "IP Mayor", group: "🎓 Institutos Profesionales" },
    { value: "IP Santo Tomás", text: "IP Santo Tomás", group: "🎓 Institutos Profesionales" },
    { value: "IP Virginia O'Higgins", text: "IP Virginia O'Higgins", group: "🎓 Institutos Profesionales" },
    
    // Centros de Formación Técnica
    { value: "CFT CEDUC UCN", text: "CFT CEDUC UCN", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT CRUZ ROJA", text: "CFT CRUZ ROJA", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT ENAC", text: "CFT ENAC", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT MAULE", text: "CFT MAULE", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT SAN AGUSTÍN", text: "CFT SAN AGUSTÍN", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT UCE", text: "CFT UCE", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT UBERLÂNDIA", text: "CFT UBERLÂNDIA", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT INACAP", text: "CFT INACAP", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT LAPRIDA", text: "CFT LAPRIDA", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT VIRTUAL", text: "CFT VIRTUAL", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT ESTADAL", text: "CFT ESTADAL", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT PROANDES", text: "CFT PROANDES", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT TEKNOS", text: "CFT TEKNOS", group: "🔧 Centros de Formación Técnica" },
    { value: "CFT VALLE GRANDE", text: "CFT VALLE GRANDE", group: "🔧 Centros de Formación Técnica" },
    
    // Instituciones Extranjeras
    { value: "UNEFA (Venezuela)", text: "UNEFA (Venezuela)", group: "🌍 Internacionales en Chile" },
    { value: "Universidad de Barcelona (España)", text: "Universidad de Barcelona (España)", group: "🌍 Internacionales en Chile" },
    { value: "UNAM (México)", text: "UNAM (México)", group: "🌍 Internacionales en Chile" }
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