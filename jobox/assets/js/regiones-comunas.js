// jobox/assets/js/regiones-comunas.js

const regionesComunas = [
    { value: "", text: "-- Selecciona una región --", group: "" },
    
    { 
        value: "arica_parinacota", 
        text: "Arica y Parinacota", 
        group: "🌵 Norte Grande",
        comunas: [
            { value: "arica", text: "Arica" },
            { value: "camarones", text: "Camarones" },
            { value: "putre", text: "Putre" },
            { value: "general_lagos", text: "General Lagos" }
        ]
    },
    { 
        value: "tarapaca", 
        text: "Tarapacá", 
        group: "🌵 Norte Grande",
        comunas: [
            { value: "iquique", text: "Iquique" },
            { value: "alto_hospicio", text: "Alto Hospicio" },
            { value: "pozo_almonte", text: "Pozo Almonte" },
            { value: "camina", text: "Camiña" },
            { value: "colchane", text: "Colchane" },
            { value: "huara", text: "Huara" },
            { value: "pica", text: "Pica" }
        ]
    },
    { 
        value: "antofagasta", 
        text: "Antofagasta", 
        group: "🌵 Norte Grande",
        comunas: [
            { value: "antofagasta", text: "Antofagasta" },
            { value: "mejillones", text: "Mejillones" },
            { value: "sierra_gorda", text: "Sierra Gorda" },
            { value: "taltal", text: "Taltal" },
            { value: "calama", text: "Calama" },
            { value: "ollague", text: "Ollagüe" },
            { value: "san_pedro_atacama", text: "San Pedro de Atacama" },
            { value: "tocopilla", text: "Tocopilla" },
            { value: "maria_elena", text: "María Elena" }
        ]
    },
    { 
        value: "atacama", 
        text: "Atacama", 
        group: "🏜️ Norte Chico",
        comunas: [
            { value: "copiapo", text: "Copiapó" },
            { value: "caldera", text: "Caldera" },
            { value: "tierra_amarilla", text: "Tierra Amarilla" },
            { value: "chanaral", text: "Chañaral" },
            { value: "diego_almagro", text: "Diego de Almagro" },
            { value: "vallenar", text: "Vallenar" },
            { value: "alto_del_carmen", text: "Alto del Carmen" },
            { value: "freirina", text: "Freirina" },
            { value: "huasco", text: "Huasco" }
        ]
    },
    { 
        value: "coquimbo", 
        text: "Coquimbo", 
        group: "🏜️ Norte Chico",
        comunas: [
            { value: "la_serena", text: "La Serena" },
            { value: "coquimbo", text: "Coquimbo" },
            { value: "andacollo", text: "Andacollo" },
            { value: "la_higuera", text: "La Higuera" },
            { value: "paiguano", text: "Paiguano" },
            { value: "vicuna", text: "Vicuña" },
            { value: "illapel", text: "Illapel" },
            { value: "canela", text: "Canela" },
            { value: "los_vilos", text: "Los Vilos" },
            { value: "salamanca", text: "Salamanca" },
            { value: "ovalle", text: "Ovalle" },
            { value: "combarbala", text: "Combarbalá" },
            { value: "monte_patria", text: "Monte Patria" },
            { value: "punitaqui", text: "Punitaqui" },
            { value: "rio_hurtado", text: "Río Hurtado" }
        ]
    },
    { 
        value: "valparaiso", 
        text: "Valparaíso", 
        group: "🌊 Zona Central",
        comunas: [
            { value: "valparaiso", text: "Valparaíso" },
            { value: "casablanca", text: "Casablanca" },
            { value: "concon", text: "Concón" },
            { value: "juan_fernandez", text: "Juan Fernández" },
            { value: "puchuncavi", text: "Puchuncaví" },
            { value: "quintero", text: "Quintero" },
            { value: "vina_del_mar", text: "Viña del Mar" },
            { value: "isla_pascua", text: "Isla de Pascua" },
            { value: "los_andes", text: "Los Andes" },
            { value: "calle_larga", text: "Calle Larga" },
            { value: "rinconada", text: "Rinconada" },
            { value: "san_esteban", text: "San Esteban" },
            { value: "la_ligua", text: "La Ligua" },
            { value: "cabildo", text: "Cabildo" },
            { value: "papudo", text: "Papudo" },
            { value: "petorca", text: "Petorca" },
            { value: "zapallar", text: "Zapallar" },
            { value: "quillota", text: "Quillota" },
            { value: "calera", text: "Calera" },
            { value: "hijuelas", text: "Hijuelas" },
            { value: "la_cruz", text: "La Cruz" },
            { value: "nogales", text: "Nogales" },
            { value: "san_antonio", text: "San Antonio" },
            { value: "algarrobo", text: "Algarrobo" },
            { value: "cartagena", text: "Cartagena" },
            { value: "el_quisco", text: "El Quisco" },
            { value: "el_tabo", text: "El Tabo" },
            { value: "santo_domingo", text: "Santo Domingo" },
            { value: "san_felipe", text: "San Felipe" },
            { value: "catemu", text: "Catemu" },
            { value: "llaillay", text: "Llaillay" },
            { value: "panquehue", text: "Panquehue" },
            { value: "putaendo", text: "Putaendo" },
            { value: "santa_maria", text: "Santa María" },
            { value: "quilpue", text: "Quilpué" },
            { value: "limache", text: "Limache" },
            { value: "olmue", text: "Olmué" },
            { value: "villa_alemana", text: "Villa Alemana" }
        ]
    },
    { 
        value: "ohiggins", 
        text: "Libertador General Bernardo O'Higgins", 
        group: "🌄 Zona Central",
        comunas: [
            { value: "rancagua", text: "Rancagua" },
            { value: "codegua", text: "Codegua" },
            { value: "coinco", text: "Coinco" },
            { value: "coltauco", text: "Coltauco" },
            { value: "donihue", text: "Doñihue" },
            { value: "graneros", text: "Graneros" },
            { value: "las_cabras", text: "Las Cabras" },
            { value: "machali", text: "Machalí" },
            { value: "malloa", text: "Malloa" },
            { value: "mostazal", text: "Mostazal" },
            { value: "olivar", text: "Olivar" },
            { value: "peumo", text: "Peumo" },
            { value: "pichidegua", text: "Pichidegua" },
            { value: "quinta_tilcoco", text: "Quinta de Tilcoco" },
            { value: "rengo", text: "Rengo" },
            { value: "requinoa", text: "Requínoa" },
            { value: "san_vicente", text: "San Vicente" },
            { value: "pichilemu", text: "Pichilemu" },
            { value: "la_estrella", text: "La Estrella" },
            { value: "litueche", text: "Litueche" },
            { value: "marchihue", text: "Marchihue" },
            { value: "navidad", text: "Navidad" },
            { value: "paredones", text: "Paredones" },
            { value: "san_fernando", text: "San Fernando" },
            { value: "chepica", text: "Chépica" },
            { value: "chimbarongo", text: "Chimbarongo" },
            { value: "lolol", text: "Lolol" },
            { value: "nancagua", text: "Nancagua" },
            { value: "palmilla", text: "Palmilla" },
            { value: "peralillo", text: "Peralillo" },
            { value: "placilla", text: "Placilla" },
            { value: "pumanque", text: "Pumanque" },
            { value: "santa_cruz", text: "Santa Cruz" }
        ]
    },
    { 
        value: "maule", 
        text: "Maule", 
        group: "🌄 Zona Central",
        comunas: [
            { value: "talca", text: "Talca" },
            { value: "constitucion", text: "Constitución" },
            { value: "curepto", text: "Curepto" },
            { value: "empedrado", text: "Empedrado" },
            { value: "maule", text: "Maule" },
            { value: "pelarco", text: "Pelarco" },
            { value: "pencahue", text: "Pencahue" },
            { value: "rio_claro", text: "Río Claro" },
            { value: "san_clemente", text: "San Clemente" },
            { value: "san_rafael", text: "San Rafael" },
            { value: "cauquenes", text: "Cauquenes" },
            { value: "chanco", text: "Chanco" },
            { value: "pelluhue", text: "Pelluhue" },
            { value: "curico", text: "Curicó" },
            { value: "hualane", text: "Hualañé" },
            { value: "licanten", text: "Licantén" },
            { value: "molina", text: "Molina" },
            { value: "rauco", text: "Rauco" },
            { value: "romeral", text: "Romeral" },
            { value: "sagrada_familia", text: "Sagrada Familia" },
            { value: "teno", text: "Teno" },
            { value: "vichuquen", text: "Vichuquén" },
            { value: "linares", text: "Linares" },
            { value: "colbun", text: "Colbún" },
            { value: "longavi", text: "Longaví" },
            { value: "parral", text: "Parral" },
            { value: "retiro", text: "Retiro" },
            { value: "san_javier", text: "San Javier" },
            { value: "villa_alegre", text: "Villa Alegre" },
            { value: "yerbas_buenas", text: "Yerbas Buenas" }
        ]
    },
    { 
        value: "nuble", 
        text: "Ñuble", 
        group: "🌄 Zona Central",
        comunas: [
            { value: "cobquecura", text: "Cobquecura" },
            { value: "coelemu", text: "Coelemu" },
            { value: "ninhue", text: "Ninhue" },
            { value: "portezuelo", text: "Portezuelo" },
            { value: "quirihue", text: "Quirihue" },
            { value: "ranquil", text: "Ránquil" },
            { value: "treguaco", text: "Treguaco" },
            { value: "bulnes", text: "Bulnes" },
            { value: "chillan_viejo", text: "Chillán Viejo" },
            { value: "chillan", text: "Chillán" },
            { value: "el_carmen", text: "El Carmen" },
            { value: "pemuco", text: "Pemuco" },
            { value: "pinto", text: "Pinto" },
            { value: "quillon", text: "Quillón" },
            { value: "san_ignacio", text: "San Ignacio" },
            { value: "yungay", text: "Yungay" },
            { value: "coihueco", text: "Coihueco" },
            { value: "niquen", text: "Ñiquén" },
            { value: "san_carlos", text: "San Carlos" },
            { value: "san_fabian", text: "San Fabián" },
            { value: "san_nicolas", text: "San Nicolás" }
        ]
    },
    { 
        value: "biobio", 
        text: "Biobío", 
        group: "🌲 Zona Sur",
        comunas: [
            { value: "concepcion", text: "Concepción" },
            { value: "coronel", text: "Coronel" },
            { value: "chiguayante", text: "Chiguayante" },
            { value: "florida", text: "Florida" },
            { value: "hualqui", text: "Hualqui" },
            { value: "lota", text: "Lota" },
            { value: "penco", text: "Penco" },
            { value: "san_pedro_paz", text: "San Pedro de la Paz" },
            { value: "santa_juana", text: "Santa Juana" },
            { value: "talcahuano", text: "Talcahuano" },
            { value: "tome", text: "Tomé" },
            { value: "hualpen", text: "Hualpén" },
            { value: "lebu", text: "Lebu" },
            { value: "arauco", text: "Arauco" },
            { value: "canete", text: "Cañete" },
            { value: "contulmo", text: "Contulmo" },
            { value: "curanilahue", text: "Curanilahue" },
            { value: "los_alamos", text: "Los Álamos" },
            { value: "tirua", text: "Tirúa" },
            { value: "los_angeles", text: "Los Ángeles" },
            { value: "antuco", text: "Antuco" },
            { value: "cabrero", text: "Cabrero" },
            { value: "laja", text: "Laja" },
            { value: "mulchen", text: "Mulchén" },
            { value: "nacimiento", text: "Nacimiento" },
            { value: "negrete", text: "Negrete" },
            { value: "quilaco", text: "Quilaco" },
            { value: "quilleco", text: "Quilleco" },
            { value: "san_rosendo", text: "San Rosendo" },
            { value: "santa_barbara", text: "Santa Bárbara" },
            { value: "tucapel", text: "Tucapel" },
            { value: "yumbel", text: "Yumbel" },
            { value: "alto_biobio", text: "Alto Biobío" }
        ]
    },
    { 
        value: "araucania", 
        text: "La Araucanía", 
        group: "🌲 Zona Sur",
        comunas: [
            { value: "temuco", text: "Temuco" },
            { value: "carahue", text: "Carahue" },
            { value: "cunco", text: "Cunco" },
            { value: "curarrehue", text: "Curarrehue" },
            { value: "freire", text: "Freire" },
            { value: "galvarino", text: "Galvarino" },
            { value: "gorbea", text: "Gorbea" },
            { value: "lautaro", text: "Lautaro" },
            { value: "loncoche", text: "Loncoche" },
            { value: "melipeuco", text: "Melipeuco" },
            { value: "nueva_imperial", text: "Nueva Imperial" },
            { value: "padre_las_casas", text: "Padre las Casas" },
            { value: "perquenco", text: "Perquenco" },
            { value: "pitrufquen", text: "Pitrufquén" },
            { value: "pucon", text: "Pucón" },
            { value: "saavedra", text: "Saavedra" },
            { value: "teodoro_schmidt", text: "Teodoro Schmidt" },
            { value: "tolten", text: "Toltén" },
            { value: "vilcun", text: "Vilcún" },
            { value: "villarrica", text: "Villarrica" },
            { value: "cholchol", text: "Cholchol" },
            { value: "angol", text: "Angol" },
            { value: "collipulli", text: "Collipulli" },
            { value: "curacautin", text: "Curacautín" },
            { value: "ercilla", text: "Ercilla" },
            { value: "lonquimay", text: "Lonquimay" },
            { value: "los_sauces", text: "Los Sauces" },
            { value: "lumaco", text: "Lumaco" },
            { value: "puren", text: "Purén" },
            { value: "renaico", text: "Renaico" },
            { value: "traiguen", text: "Traiguén" },
            { value: "victoria", text: "Victoria" }
        ]
    },
    { 
        value: "rios", 
        text: "Los Ríos", 
        group: "🌲 Zona Sur",
        comunas: [
            { value: "valdivia", text: "Valdivia" },
            { value: "corral", text: "Corral" },
            { value: "lanco", text: "Lanco" },
            { value: "los_lagos", text: "Los Lagos" },
            { value: "mafil", text: "Máfil" },
            { value: "mariquina", text: "Mariquina" },
            { value: "paillaco", text: "Paillaco" },
            { value: "panguipulli", text: "Panguipulli" },
            { value: "la_union", text: "La Unión" },
            { value: "futrono", text: "Futrono" },
            { value: "lago_ranco", text: "Lago Ranco" },
            { value: "rio_bueno", text: "Río Bueno" }
        ]
    },
    { 
        value: "lagos", 
        text: "Los Lagos", 
        group: "🏔️ Zona Austral",
        comunas: [
            { value: "puerto_montt", text: "Puerto Montt" },
            { value: "calbuco", text: "Calbuco" },
            { value: "cochamo", text: "Cochamó" },
            { value: "fresia", text: "Fresia" },
            { value: "frutillar", text: "Frutillar" },
            { value: "los_muermos", text: "Los Muermos" },
            { value: "llanquihue", text: "Llanquihue" },
            { value: "maullin", text: "Maullín" },
            { value: "puerto_varas", text: "Puerto Varas" },
            { value: "castro", text: "Castro" },
            { value: "ancud", text: "Ancud" },
            { value: "chonchi", text: "Chonchi" },
            { value: "curaco_velez", text: "Curaco de Vélez" },
            { value: "dalcahue", text: "Dalcahue" },
            { value: "puqueldon", text: "Puqueldón" },
            { value: "queilen", text: "Queilén" },
            { value: "quellon", text: "Quellón" },
            { value: "quemchi", text: "Quemchi" },
            { value: "quinchao", text: "Quinchao" },
            { value: "osorno", text: "Osorno" },
            { value: "puerto_octay", text: "Puerto Octay" },
            { value: "purranque", text: "Purranque" },
            { value: "puyehue", text: "Puyehue" },
            { value: "rio_negro", text: "Río Negro" },
            { value: "san_juan_costa", text: "San Juan de la Costa" },
            { value: "san_pablo", text: "San Pablo" },
            { value: "chaiten", text: "Chaitén" },
            { value: "futaleufu", text: "Futaleufú" },
            { value: "hualaihue", text: "Hualaihué" },
            { value: "palena", text: "Palena" }
        ]
    },
    { 
        value: "aysen", 
        text: "Aysén del General Carlos Ibáñez del Campo", 
        group: "🏔️ Zona Austral",
        comunas: [
            { value: "coihaique", text: "Coihaique" },
            { value: "lago_verde", text: "Lago Verde" },
            { value: "aisen", text: "Aisén" },
            { value: "cisnes", text: "Cisnes" },
            { value: "guaitecas", text: "Guaitecas" },
            { value: "cochrane", text: "Cochrane" },
            { value: "ohiggins", text: "O'Higgins" },
            { value: "tortel", text: "Tortel" },
            { value: "chile_chico", text: "Chile Chico" },
            { value: "rio_ibanez", text: "Río Ibáñez" }
        ]
    },
    { 
        value: "magallanes", 
        text: "Magallanes y la Antártica Chilena", 
        group: "🏔️ Zona Austral",
        comunas: [
            { value: "punta_arenas", text: "Punta Arenas" },
            { value: "laguna_blanca", text: "Laguna Blanca" },
            { value: "rio_verde", text: "Río Verde" },
            { value: "san_gregorio", text: "San Gregorio" },
            { value: "cabo_hornos", text: "Cabo de Hornos" },
            { value: "antartica", text: "Antártica" },
            { value: "porvenir", text: "Porvenir" },
            { value: "primavera", text: "Primavera" },
            { value: "timaukel", text: "Timaukel" },
            { value: "natales", text: "Natales" },
            { value: "torres_paine", text: "Torres del Paine" }
        ]
    },
    { 
        value: "metropolitana", 
        text: "Región Metropolitana de Santiago", 
        group: "🏙️ Región Central",
        comunas: [
            { value: "cerrillos", text: "Cerrillos" },
            { value: "cerro_navia", text: "Cerro Navia" },
            { value: "conchali", text: "Conchalí" },
            { value: "el_bosque", text: "El Bosque" },
            { value: "estacion_central", text: "Estación Central" },
            { value: "huechuraba", text: "Huechuraba" },
            { value: "independencia", text: "Independencia" },
            { value: "la_cisterna", text: "La Cisterna" },
            { value: "la_florida", text: "La Florida" },
            { value: "la_granja", text: "La Granja" },
            { value: "la_pintana", text: "La Pintana" },
            { value: "la_reina", text: "La Reina" },
            { value: "las_condes", text: "Las Condes" },
            { value: "lo_barnechea", text: "Lo Barnechea" },
            { value: "lo_espejo", text: "Lo Espejo" },
            { value: "lo_prado", text: "Lo Prado" },
            { value: "macul", text: "Macul" },
            { value: "maipu", text: "Maipú" },
            { value: "nunoa", text: "Ñuñoa" },
            { value: "pedro_aguirre_cerda", text: "Pedro Aguirre Cerda" },
            { value: "penalolen", text: "Peñalolén" },
            { value: "providencia", text: "Providencia" },
            { value: "pudahuel", text: "Pudahuel" },
            { value: "quilicura", text: "Quilicura" },
            { value: "quinta_normal", text: "Quinta Normal" },
            { value: "recoleta", text: "Recoleta" },
            { value: "renca", text: "Renca" },
            { value: "santiago", text: "Santiago" },
            { value: "san_joaquin", text: "San Joaquín" },
            { value: "san_miguel", text: "San Miguel" },
            { value: "san_ramon", text: "San Ramón" },
            { value: "vitacura", text: "Vitacura" },
            { value: "puente_alto", text: "Puente Alto" },
            { value: "pirque", text: "Pirque" },
            { value: "san_jose_maipo", text: "San José de Maipo" },
            { value: "colina", text: "Colina" },
            { value: "lampa", text: "Lampa" },
            { value: "tiltil", text: "Tiltil" },
            { value: "san_bernardo", text: "San Bernardo" },
            { value: "buin", text: "Buin" },
            { value: "calera_tango", text: "Calera de Tango" },
            { value: "paine", text: "Paine" },
            { value: "melipilla", text: "Melipilla" },
            { value: "alhue", text: "Alhué" },
            { value: "curacavi", text: "Curacaví" },
            { value: "maria_pinto", text: "María Pinto" },
            { value: "san_pedro", text: "San Pedro" },
            { value: "talagante", text: "Talagante" },
            { value: "el_monte", text: "El Monte" },
            { value: "isla_maipo", text: "Isla de Maipo" },
            { value: "padre_hurtado", text: "Padre Hurtado" },
            { value: "penaflor", text: "Peñaflor" }
        ]
    }
];

// Función para cargar regiones en un select
function cargarRegiones(selectId) {
    const select = document.getElementById(selectId);
    
    if (select) {
        // Limpiar select primero
        select.innerHTML = '';
        
        // Agrupar las opciones por su categoría
        const grupos = {};
        regionesComunas.forEach(({ value, text, group }) => {
            if (!grupos[group]) {
                grupos[group] = [];
            }
            grupos[group].push({ value, text });
        });

        // Crear los optgroup y las opciones
        for (const [groupName, opciones] of Object.entries(grupos)) {
            if (groupName) {
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
}

function cargarComunas(regionValue, selectId) {
    const selectComunas = document.getElementById(selectId);
    
    if (selectComunas) {
        // Limpiar select de comunas
        selectComunas.innerHTML = '';
        
        // Agregar opción por defecto
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Selecciona una comuna --";
        selectComunas.appendChild(defaultOption);
        
        // Habilitar el select
        selectComunas.disabled = false;
        
        // Encontrar la región seleccionada
        const region = regionesComunas.find(r => r.value === regionValue);
        
        if (region && region.comunas) {
            region.comunas.forEach(comuna => {
                const option = document.createElement("option");
                option.value = comuna.value;
                option.textContent = comuna.text;
                selectComunas.appendChild(option);
            });
        }
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    // Cargar regiones al iniciar
    cargarRegiones("select_regiones");
    
    // Manejar cambio de región
    const selectRegiones = document.getElementById("select_regiones");
    if (selectRegiones) {
        selectRegiones.addEventListener("change", function() {
            if (this.value) {
                cargarComunas(this.value, "select_comunas");
            } else {
                const selectComunas = document.getElementById("select_comunas");
                selectComunas.innerHTML = '<option value="">Primero seleccione una región</option>';
                selectComunas.disabled = true;
            }
        });
    }
});