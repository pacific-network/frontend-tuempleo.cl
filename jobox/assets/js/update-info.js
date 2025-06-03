// Variables globales
let userId = null;
let educacionData = [];
let experienciasData = [];
let idiomasData = [];

// Listas de opciones para los selects
const LISTA_INSTITUCIONES = [
    "Pontificia Universidad Católica de Chile", "Universidad de Chile", "Universidad de Santiago de Chile", 
    "Universidad Bernardo O'Higgins", "Universidad de Concepción", "Universidad de La Frontera", 
    "Universidad de Los Andes", "Universidad Técnica Federico Santa María", "Universidad Adolfo Ibáñez", 
    "Universidad Diego Portales", "Universidad de los Andes", "Universidad Andrés Bello", 
    "Universidad Católica del Norte", "Universidad Católica de Temuco", "Universidad de Las Américas", 
    "Universidad Autónoma de Chile", "Universidad Mayor", "Universidad SEK", "Universidad Alberto Hurtado", 
    "Universidad Central de Chile", "Universidad de Valparaíso", "Universidad de Antofagasta", 
    "Universidad de La Serena", "Universidad de Talca", "Universidad del Bío-Bío", "Universidad Austral de Chile", 
    "Universidad de Magallanes", "Universidad Tecnológica Metropolitana", "Universidad de Playa Ancha", 
    "Universidad Finis Terrae", "Universidad Católica Silva Henríquez", "Universidad San Sebastián", 
    "Universidad de O'Higgins", "Universidad de Aysén", "IP Chile", "IP Arcos", "IP Carlos Casanueva", 
    "IP Guillermo Subercaseaux", "IP Valparaíso", "IP AIEP", "IP CIISA", "IP DUOC UC", "IP Escuela de Comercio", 
    "IP INACAP", "IP Los Lagos", "IP Mayor", "IP Santo Tomás", "IP Virginia O'Higgins", "CFT CEDUC UCN", 
    "CFT CRUZ ROJA", "CFT ENAC", "CFT MAULE", "CFT SAN AGUSTÍN", "CFT UCE", "CFT UBERLÂNDIA", "CFT INACAP", 
    "CFT LAPRIDA", "CFT VIRTUAL", "CFT ESTADAL", "CFT PROANDES", "CFT TEKNOS", "CFT VALLE GRANDE",
    "UNEFA (Venezuela)", "Universidad de Barcelona (España)", "UNAM (México)", "Otra"
];

const LISTA_AREAS_CARGO = [
    "Abastecimiento y Logistica", "Administración, Contabilidad y Finanzas", "Aduana y Comercio Exterior",
    "Atención al Cliente, Call Center y Telemarketing", "Comercial, Ventas y Negocios",
    "Comunicación, Relaciones Institucionales y Públicas", "Departamento Técnico", "Diseño",
    "Educación, Docencia e Investigación", "Enfermería", "Gastronomía y Turismo", "Gerencia y Dirección General",
    "Ingeniería Civil y Construcción", "Ingenierías", "Legales", "Marketing y Publicidad",
    "Minería, Petróleo y Gas", "Navierio, Marítimo, Porutuario", "Oficios y Otros", "Producción y Manufactura",
    "RRHH y Capacitación", "Salud, Medicina y Farmacia", "Secretaria y Recepción", "Seguros",
    "Sociología / Trabajo Social", "Tecnologías, Sistemas y Telecomunicaciones"
];

const LISTA_TITULOS = [
    "Administración Pública", "Administración Turística", "Agroindustria", "Agronomía", "Ingeniería en Alimentos", 
    "Análisis de Sistemas", "Animación Digital", "Antropología", "Arquitectura", "Arquitectura del Paisaje", "Arte", 
    "Arte Escénico", "Astronomía", "Artes Audiovisuales", "Automatización Industrial", "Bibliotecología", 
    "Biofísica", "Bioinformática", "Biología", "Biología Marina", "Ingeniería Biomédica", "Ingeniería en Bioprocesos", 
    "Biotecnología", "Ingeniería en Calidad", "Cartografía", "Ciencia de Datos", "Ciencia Política", "Cine", 
    "Cirugía Dental", "Climatología", "Coaching", "Comercio Exterior", "Composición Musical", "Comunicación Audiovisual", 
    "Comunicación Organizacional", "Ingeniería en Construcción", "Contabilidad", "Cosmetología", "Criminología", 
    "Danza", "Defensa Cibernética", "Derecho", "Derecho Internacional", "Diseño", "Diseño Gráfico", 
    "Diseño de Interiores", "Diseño de Moda", "Desarrollo de Software", "Desarrollo Web", "Diplomacia", 
    "Dirección Artística", "Ecología", "Economía", "Economía Ambiental", "Edición", "Educación Básica", 
    "Educación Diferencial", "Educación Física", "Educación Parvularia", "Efectos Visuales", "Energías Renovables", 
    "Enfermería", "Enología", "Estadística", "Estética", "Estudios Internacionales", "Farmacia", "Filosofía", 
    "Finanzas", "Física", "Física Médica", "Fisioterapia", "Fonoaudiología", "Fotografía", "Gastronomía", 
    "Genética", "Geofísica", "Geografía", "Geología", "Gerontología", "Gestión de Calidad", "Gestión Cultural", 
    "Gestión Deportiva", "Gestión Empresarial", "Gestión Medioambiental", "Gestión de Proyectos", "Gestión Pública", 
    "Gestión Turística", "Historia", "Historia del Arte", "Hotelería", "Ingeniería Civil", "Ingeniería Civil Ambiental", 
    "Ingeniería Civil Biomédica", "Ingeniería Civil en Computación", "Ingeniería Civil Eléctrica", 
    "Ingeniería Civil Electrónica", "Ingeniería Civil Geológica", "Ingeniería Civil Industrial", 
    "Ingeniería Civil Informática", "Ingeniería Civil Mecánica", "Ingeniería Civil en Minas", 
    "Ingeniería Civil Química", "Ingeniería Civil en Telecomunicaciones", "Ilustración", "Ingeniería en Impuestos", 
    "Industria Alimentaria", "Ingeniería Acústica", "Ingeniería Agrónoma", "Ingeniería Agronómica", 
    "Ingeniería Ambiental", "Ingeniería Aeronáutica", "Ingeniería Biomédica", "Ingeniería Comercial", 
    "Ingeniería en Construcción", "Ingeniería de Ejecución", "Ingeniería Eléctrica", "Ingeniería Electrónica", 
    "Ingeniería Industrial", "Ingeniería en Informática", "Ingeniería en Materiales", "Ingeniería Mecánica", 
    "Ingeniería Mecatrónica", "Ingeniería en Minas", "Ingeniería Pesquera", "Ingeniería Petrolera", 
    "Ingeniería en Prevención de Riesgos", "Ingeniería Química", "Ingeniería de Sistemas", 
    "Ingeniería en Telecomunicaciones", "Ingeniería Marítima", "Ingeniería en Transporte", "Inteligencia Artificial", 
    "Interpretación", "Interpretación Musical", "Joyería", "Kinesiología", "Letras", "Logística", "Marketing", 
    "Matemáticas", "Mecánica", "Mecatrónica", "Medicina", "Medicina Veterinaria", "Meteorología", "Microbiología", 
    "Ingeniería en Minería", "Museología", "Música", "Nanotecnología", "Negocios Internacionales", "Neuromarketing", 
    "Nutrición y Dietética", "Oceanografía", "Odontología", "Oftalmología", "Optometría", "Ortopedia", "Paleontología", 
    "Patrimonio Cultural", "Pedagogía", "Periodismo", "Pilotaje", "Podología", "Producción Audiovisual", 
    "Producción Musical", "Psicología", "Psicopedagogía", "Publicidad", "Química", "Química y Farmacia", 
    "Radiología", "Realización Cinematográfica", "Recursos Humanos", "Recursos Naturales", "Relaciones Internacionales", 
    "Relaciones Públicas", "Robótica", "Seguridad Cibernética", "Seguridad Ocupacional", "Sociología", 
    "Ingeniería en Sonido", "Teatro", "Tecnología Médica", "Tecnología Musical", "Técnico Agrícola", 
    "Técnico en Administración", "Técnico en Construcción", "Técnico Dental", "Técnico en Electricidad", 
    "Técnico en Enfermería", "Técnico en Farmacia", "Técnico en Gastronomía", "Técnico en Informática", 
    "Técnico en Laboratorio Clínico", "Técnico en Mecánica Automotriz", "Técnico en Minería", "Técnico en Odontología", 
    "Técnico en Programación", "Técnico en Radiología", "Técnico en Redes", "Técnico en Turismo", 
    "Técnico en Veterinaria", "Telecomunicaciones", "Terapia Ocupacional", "Topografía", "Trabajo Social", 
    "Traducción", "Traducción e Interpretación", "Turismo", "Urbanismo", "Viticultura", "Zoología", "Otra"
];

const LISTA_ACTIVIDADES_EMPRESA = [
    "AFJP", "Administración", "Agro-Industrial", "Agropecuaria", "Alimenticia", "Arquitectura", "Artesanal",
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

const REGIONES_COMUNAS = {
    "regiones": [
        {
            "region": "Región de Arica y Parinacota",
            "comunas": ["Arica", "Camarones", "General Lagos", "Putre"].sort()
        },
        {
            "region": "Región de Tarapacá",
            "comunas": ["Alto Hospicio", "Camiña", "Colchane", "Huara", "Iquique", "Pica", "Pozo Almonte"].sort()
        },
        {
            "region": "Región de Antofagasta",
            "comunas": ["Antofagasta", "Calama", "María Elena", "Mejillones", "Ollagüe", "San Pedro de Atacama", "Sierra Gorda", "Taltal", "Tocopilla"].sort()
        },
        {
            "region": "Región de Atacama",
            "comunas": ["Alto del Carmen", "Caldera", "Chañaral", "Copiapó", "Diego de Almagro", "Freirina", "Huasco", "Tierra Amarilla", "Vallenar"].sort()
        },
        {
            "region": "Región de Coquimbo",
            "comunas": ["Andacollo", "Canela", "Combarbalá", "Coquimbo", "Illapel", "La Higuera", "La Serena", "Los Vilos", "Monte Patria", "Ovalle", "Paiguano", "Punitaqui", "Río Hurtado", "Salamanca", "Vicuña"].sort()
        },
        {
            "region": "Región de Valparaíso",
            "comunas": ["Algarrobo", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla de Pascua", 
                "Juan Fernández", "La Cruz", "La Ligua", "Limache", "Los Andes", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Providencia", 
                "Puchuncaví", "Putaendo", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", 
                "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña del Mar", "Zapallar"].sort() 
        },
        {
            "region": "Región del Libertador Gral. Bernardo O'Higgins",
            "comunas": ["Chépica", "Chimbarongo", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Las Cabras", 
                "Litueche", "Lolol", "Machalí", "Malloa", "Marchihue", "Mostazal", "Nancagua", "Navidad", "Olivar", "Palmilla", 
                "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta de Tilcoco", 
                "Rancagua", "Rengo", "Requínoa", "San Fernando", "San Vicente", "Santa Cruz"].sort()
        },
        {
            "region": "Región del Maule",
            "comunas": ["Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", 
                "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", 
                "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", 
                "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"].sort()
        },
        {
            "region": "Región de Ñuble",
            "comunas": ["Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", 
                "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", 
                "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"].sort()
        },
        {
            "region": "Región del Biobío",
            "comunas": ["Alto Biobío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", 
                "Contulmo", "Coronel", "Curanilahue", "Florida", "Hualpén", "Hualqui", "Laja", "Lebu", 
                "Los Álamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", 
                "Quilaco", "Quilleco", "San Pedro de la Paz", "San Rosendo", "Santa Bárbara", 
                "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"].sort()
        },
        {
            "region": "Región de la Araucanía",
            "comunas": ["Angol", "Carahue", "Cholchol", "Collipulli", "Cunco", "Curacautín", "Curarrehue", 
                "Ercilla", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Lonquimay", 
                "Los Sauces", "Lumaco", "Melipeuco", "Nueva Imperial", "Padre las Casas", 
                "Perquenco", "Pitrufquén", "Purén", "Pucón", "Renaico", "Saavedra", 
                "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", 
                "Vilcún", "Villarrica"].sort()
        },
        {
            "region": "Región de Los Ríos",
            "comunas": ["Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", 
                "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno", "Valdivia"].sort()
        },
        {
            "region": "Región de Los Lagos",
            "comunas": ["Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", 
                "Curaco de Vélez", "Dalcahue", "Fresia", "Frutillar", "Futaleufú", 
                "Hualaihué", "Llanquihue", "Los Muermos", "Maullín", "Osorno", 
                "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", 
                "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", 
                "Quemchi", "Quinchao", "Río Negro", "San Juan de la Costa", "San Pablo"].sort()
        },
        {
            "region": "Región de Aysén del General Carlos Ibáñez del Campo",
            "comunas": ["Aysén", "Chile Chico", "Cisnes", "Coihaique", "Guaitecas", 
                "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"].sort()
        },
        {
            "region": "Región de Magallanes y de la Antártica Chilena",
            "comunas": ["Antártica", "Cabo de Hornos", "Laguna Blanca", "Natales", 
                "Porvenir", "Primavera", "Punta Arenas", "Río Verde", "San Gregorio", 
                "Timaukel", "Torres del Paine"].sort()
        },
        {
            "region": "Región Metropolitana de Santiago",
            "comunas": ["Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", 
                "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", 
                "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo", 
                "La Cisterna", "La Florida", "La Granja", "La Pintana", 
                "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", 
                "Lo Prado", "Macul", "Maipú", "María Pinto", 
                "Melipilla", "Ñuñoa", "Padre Hurtado", "Pedro Aguirre Cerda",
                "Peñalolén", "Pirque", "Providencia", "Pudahuel",
                "Puente Alto", "Quilicura", "Quinta Normal",
                "Recoleta", "Renca", "San Bernardo",
                "San Joaquín", "San José de Maipo",
                "San Miguel", "San Ramón",
                "Santiago Centro (Comuna)", 
                "Vitacura"].sort()
        }
    ]    
};

function inicializarSelectsRegionComuna(regionSeleccionada = null, comunaSeleccionada = null) {
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    
    // Llenar región
    regionSelect.innerHTML = '<option value="">Seleccione una región</option>';
    REGIONES_COMUNAS.regiones.forEach(region => {
        const option = new Option(region.region, region.region);
        regionSelect.add(option);
    });

    // Establecer región seleccionada si existe
    if (regionSeleccionada) {
        const opcionRegion = [...regionSelect.options].find(
            opt => opt.text === regionSeleccionada || opt.value === regionSeleccionada
        );
        
        if (opcionRegion) {
            regionSelect.value = opcionRegion.value;
            
            // Cargar comunas para la región seleccionada
            const regionData = REGIONES_COMUNAS.regiones.find(r => r.region === regionSelect.value);
            comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
            
            if (regionData?.comunas?.length) {
                regionData.comunas.forEach(comuna => {
                    const option = new Option(comuna, comuna);
                    comunaSelect.add(option);
                });
                comunaSelect.disabled = false;
                
                // Establecer comuna seleccionada si existe
                if (comunaSeleccionada) {
                    const opcionComuna = [...comunaSelect.options].find(
                        opt => opt.text === comunaSeleccionada || opt.value === comunaSeleccionada
                    );
                    if (opcionComuna) {
                        comunaSelect.value = opcionComuna.value;
                    }
                }
            }
        }
    } else {
        comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunaSelect.disabled = true;
    }
    
    // Actualizar NiceSelect si está disponible
    if (typeof $.fn.niceSelect !== 'undefined') {
        $(regionSelect).niceSelect('update');
        $(comunaSelect).niceSelect('update');
    }

    // Manejar cambio de región
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        const regionData = REGIONES_COMUNAS.regiones.find(r => r.region === selectedRegion);
        
        comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunaSelect.disabled = true;

        if (regionData?.comunas?.length) {
            regionData.comunas.forEach(comuna => {
                const option = new Option(comuna, comuna);
                comunaSelect.add(option);
            });
            comunaSelect.disabled = false;
        }

        if (typeof $.fn.niceSelect !== 'undefined') {
            $(comunaSelect).niceSelect('update');
        }
    });
}

// Función optimizada para inicializar selects con valores
function inicializarSelectConValor(selectElement, opciones, valor, textoDefault = '-- Selecciona --') {
    // Limpiar select
    selectElement.innerHTML = '';
    
    // Agregar opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = textoDefault;
    selectElement.appendChild(defaultOption);

    // Agregar opciones ordenadas
    opciones.sort().forEach(opcion => {
        const option = document.createElement('option');
        option.value = opcion;
        option.textContent = opcion;
        selectElement.appendChild(option);
    });

    // Establecer valor si existe
    if (valor && [...selectElement.options].some(opt => opt.value === valor)) {
        selectElement.value = valor;
    }

    // Inicializar niceSelect si está disponible
    if (typeof $.fn.niceSelect !== 'undefined') {
        $(selectElement).niceSelect('update');
    }
}

// Función para decodificar el token JWT
function parseJwt(token) {
    try {
        if (!token) {
            throw new Error('No se proporcionó token');
        }
        
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Token JWT malformado');
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        
        if (!decoded.sub) {
            throw new Error('Token no contiene sub (userID)');
        }
        
        return decoded;
    } catch (e) {
        console.error('Error al decodificar token:', e);
        return null;
    }
}

// Obtener userId del token en localStorage
function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No se encontró token en localStorage');
        return null;
    }

    const decodedToken = parseJwt(token);
    if (!decodedToken) {
        console.error('Token inválido');
        return null;
    }

    return decodedToken.sub;
}

// Función para cargar los datos del postulante
async function cargarDatosPostulante() {
    console.log('Iniciando carga de datos del postulante...');
    
    if (!userId) {
        const error = 'No se pudo obtener el userId del token';
        console.error(error);
        throw new Error(error);
    }

    try {
        console.log('Realizando solicitud a la API...');
        const response = await fetch(`http://172.25.100.201:3000/v1/postulante/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('Respuesta recibida:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        await llenarFormulario(data);
        actualizarSidebar(data);
        
        return data;
    } catch (error) {
        console.error('Error en cargarDatosPostulante:', error);
        throw error;
    }
}

// Función para actualizar el sidebar
function actualizarSidebar(data) {
    if (data.usuario) {
        const nombreCompleto = `${data.usuario.nombres || ''} ${data.usuario.apellidos || ''}`.trim();
        document.getElementById('sidebar-nombre').textContent = nombreCompleto || 'Nombre no disponible';
    }
    
    if (data.data?.preferencias?.categoria_empleo) {
        document.getElementById('sidebar-profesion').textContent = data.data.preferencias.categoria_empleo;
    } else {
        document.getElementById('sidebar-profesion').textContent = 'Profesión no especificada';
    }
}

// Función para llenar el formulario con los datos obtenidos
async function llenarFormulario(data) {
    console.log('Llenando formulario con datos:', data);
    const postulante = data;
    
    // Datos personales
    if (postulante.usuario) {
        document.getElementById('nombre-completo').value = 
            `${postulante.usuario.nombres || ''} ${postulante.usuario.apellidos || ''}`.trim();
            
        if (postulante.usuario.email) {
            document.getElementById('email').value = postulante.usuario.email;
        }
    }
    
    // Teléfono
    if (postulante.data?.datos_personales?.telefono) {
        const telefono = postulante.data.datos_personales.telefono;
        document.getElementById('numero_telefono').value = telefono.substring(telefono.length - 8);
        
        const codigoPais = telefono.substring(0, telefono.length - 8);
        const selectCodigo = document.getElementById('codigo_pais');
        for (let i = 0; i < selectCodigo.options.length; i++) {
            if (selectCodigo.options[i].value === codigoPais) {
                selectCodigo.selectedIndex = i;
                break;
            }
        }
    }
    
    // Fecha de nacimiento y edad
    if (postulante.data?.datos_personales?.fecha_nacimiento) {
        const fechaNac = new Date(postulante.data.datos_personales.fecha_nacimiento);
        document.getElementById('fecha_nacimiento').value = fechaNac.toISOString().split('T')[0];
        
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        document.getElementById('edad').value = edad;
    }
    
    // Género
    if (postulante.data?.datos_personales?.genero) {
        document.getElementById('genero').value = postulante.data.datos_personales.genero;
        if (typeof $.fn.niceSelect !== 'undefined') {
            $('#genero').niceSelect('update');
        }
    }
    
    // Estado civil
    if (postulante.data?.datos_personales?.estado_civil) {
        document.getElementById('estado_civil').value = postulante.data.datos_personales.estado_civil;
        if (typeof $.fn.niceSelect !== 'undefined') {
            $('#estado_civil').niceSelect('update');
        }
    }
    
    // Descripción biográfica
    if (postulante.data?.datos_personales?.descripcion_bio) {
        document.getElementById('descripcion_bio').value = postulante.data.datos_personales.descripcion_bio;
    }
    
    // Región y comuna
    if (postulante.data?.datos_personales?.region || postulante.data?.datos_personales?.comuna) {
        inicializarSelectsRegionComuna(
            postulante.data.datos_personales.region,
            postulante.data.datos_personales.comuna
        );
    } else {
        inicializarSelectsRegionComuna();
    }
    
    // Educación
    if (postulante.data?.educacion && postulante.data.educacion.length > 0) {
        educacionData = postulante.data.educacion;
        const container = document.getElementById('educacion-container');
        container.innerHTML = '';
        
        for (const edu of postulante.data.educacion) {
            await agregarEducacion(edu);
        }
    }
    
    // Experiencias
    if (postulante.data?.experiencias && postulante.data.experiencias.length > 0) {
        experienciasData = postulante.data.experiencias;
        const container = document.getElementById('experiencias-container');
        container.innerHTML = '';

        for (const exp of postulante.data.experiencias) {
            await agregarExperiencia(exp);
        }
    }
    
    // Idiomas
    if (postulante.data?.idiomas && postulante.data.idiomas.length > 0) {
        idiomasData = postulante.data.idiomas;
        const container = document.getElementById('idiomas-container');
        container.innerHTML = '';
        
        for (const idioma of postulante.data.idiomas) {
            agregarIdioma(idioma);
        }
    }
    
    // Preferencias
    if (postulante.data?.preferencias) {
        const pref = postulante.data.preferencias;
        if (pref.modalidad) {
            document.getElementById('modalidad').value = pref.modalidad;
            if (typeof $.fn.niceSelect !== 'undefined') {
                $('#modalidad').niceSelect('update');
            }
        }
        if (pref.categoria_empleo) {
            document.getElementById('categoria_empleo').value = pref.categoria_empleo;
        }
        if (pref.salario_esperado) {
            document.getElementById('salario_esperado').value = pref.salario_esperado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
    }
    
    // Redes sociales
    if (postulante.data?.redes_sociales) {
        postulante.data.redes_sociales.forEach(red => {
            if (red.red_social === 'Facebook') {
                document.getElementById('facebook_url').value = red.url || '';
            } else if (red.red_social === 'Twitter') {
                document.getElementById('twitter_url').value = red.url || '';
            } else if (red.red_social === 'LinkedIn') {
                document.getElementById('linkedin_url').value = red.url || '';
            } else if (red.red_social === 'Instagram') {
                document.getElementById('instagram_url').value = red.url || '';
            }
        });
    }
    
    console.log('Formulario llenado correctamente');
}

async function agregarEducacion(educacionData = {}) {
    const container = document.getElementById('educacion-container');
    const nuevaEducacion = document.createElement('div');
    nuevaEducacion.className = 'educacion-entry';
    
    const mostrarAnioFinalizacion = educacionData.estado === "Finalizado" || educacionData.estado === "Abandonado";
    
    nuevaEducacion.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Título</label>
                    <select type="text" class="form-control titulo-input" placeholder="Título"></select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Institución</label>
                    <select type="text" class="form-control institucion-input" placeholder="Institución"></select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Tipo de Estudio</label>
                    <select class="form-control grado-input">
                        <option value="">-- Selecciona un tipo de estudio --</option>
                        <option value="Primario">Primario</option>
                        <option value="Secundario">Secundario</option>
                        <option value="CFT">CFT</option>
                        <option value="Tecnico">Técnico</option>
                        <option value="Superior">Superior</option>
                        <option value="Universitario">Universitario</option>
                        <option value="Postgrado">Postgrado</option>
                        <option value="Doctorado">Doctorado</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Estado</label>
                    <select class="form-control estado-input">
                        <option value="">Seleccione estado</option>
                        <option value="En Curso">En Curso</option>
                        <option value="Graduado">Graduado</option>
                        <option value="Abandonado">Abandonado</option> 
                    </select>
                </div>
            </div>
            <div class="col-md-4 anio-finalizacion-container" style="${mostrarAnioFinalizacion ? '' : 'display: none;'}">
                <div class="form-group">
                    <label>Año de Finalización</label>
                    <input type="text" class="form-control anio-input" placeholder="Año" value="${educacionData.anio_finalizacion || ''}">
                </div>
            </div>
            <div class="col-md-12 text-end mb-3">
                <button type="button" class="btn btn-danger btn-sm remove-educacion-btn">
                    <span class="far fa-trash-alt"></span> Eliminar
                </button>
            </div>
        </div>
        <hr style="opacity: 1; border: 0; border-top: 1px solid #000; margin: 20px 0;">
    `;
    
    // Establecer valores de los selects
    const gradoSelect = nuevaEducacion.querySelector('.grado-input');
    if (educacionData.grado) {
        gradoSelect.value = educacionData.grado;
        if (typeof $.fn.niceSelect !== 'undefined') {
            $(gradoSelect).niceSelect('update');
        }
    }
    
    const tituloSelect = nuevaEducacion.querySelector('.titulo-input');
    inicializarSelectConValor(tituloSelect, LISTA_TITULOS, educacionData.titulo, '-- Selecciona un título --');

    const institucionSelect = nuevaEducacion.querySelector('.institucion-input');
    inicializarSelectConValor(institucionSelect, LISTA_INSTITUCIONES, educacionData.institucion, '-- Selecciona una institución --');

    const estadoSelect = nuevaEducacion.querySelector('.estado-input');
    if (educacionData.estado) {
        estadoSelect.value = educacionData.estado;
        if (typeof $.fn.niceSelect !== 'undefined') {
            $(estadoSelect).niceSelect('update');
        }
    }
    
    // Manejar cambio de estado
    estadoSelect.addEventListener('change', function() {
        const anioFinalizacionContainer = this.closest('.row').querySelector('.anio-finalizacion-container');
        const anioInput = anioFinalizacionContainer.querySelector('.anio-input');
        
        if (this.value === "Finalizado" || this.value === "Abandonado") {
            anioFinalizacionContainer.style.display = 'block';
        } else {
            anioFinalizacionContainer.style.display = 'none';
            anioInput.value = '';
        }
    });
    
    container.appendChild(nuevaEducacion);
    
    // Manejar eliminación
    nuevaEducacion.querySelector('.remove-educacion-btn').addEventListener('click', () => {
        container.removeChild(nuevaEducacion);
    });
}

async function agregarExperiencia(experienciaData = {}) {
    const container = document.getElementById('experiencias-container');
    const nuevaExperiencia = document.createElement('div');
    nuevaExperiencia.className = 'experiencia-entry';
    nuevaExperiencia.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Empresa</label>
                    <input type="text" class="form-control empresa-input" placeholder="Empresa" value="${experienciaData.empresa || ''}">
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Cargo</label>
                    <input type="text" class="form-control cargo-input" placeholder="Cargo" value="${experienciaData.cargo || ''}">
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Actividad Empresa</label>
                    <select type="text" class="form-control actividad-input" placeholder="Actividad"></select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Área del Cargo</label>
                    <select type="text" class="form-control area-input" placeholder="Área del Cargo"></select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Nivel de Experiencia</label>
                    <select class="form-control nivel-input">
                        <option value="">-- Selecciona un nivel --</option>
                        <option value="Practicante">Practicante</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Junior">Junior</option>
                        <option value="Semi Senior">Semi Senior</option>
                        <option value="Senior">Senior</option>
                        <option value="Líder Técnico">Líder Técnico / Lead</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Año Inicio</label>
                    <input type="text" class="form-control inicio-input" placeholder="Año inicio" value="${experienciaData.anno_inicio || ''}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Año Término</label>
                    <input type="text" class="form-control termino-input" placeholder="Año término" value="${experienciaData.anno_termino || ''}">
                </div>
            </div>
            <div class="col-md-12">
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea class="form-control descripcion-input" cols="30" rows="5" placeholder="Descripción">${experienciaData.descripcion || ''}</textarea>
                </div>
            </div>
            <div class="col-md-12 text-end mb-3">
                <button type="button" class="btn btn-danger btn-sm remove-experiencia-btn">
                    <span class="far fa-trash-alt"></span> Eliminar
                </button>
            </div>
        </div>
        <hr style="opacity: 1; border: 0; border-top: 1px solid #000; margin: 20px 0;">
    `;
    
    // Establecer valores de los selects
    const nivelSelect = nuevaExperiencia.querySelector('.nivel-input');
    if (experienciaData.nivel_experiencia) {
        nivelSelect.value = experienciaData.nivel_experiencia;
        if (typeof $.fn.niceSelect !== 'undefined') {
            $(nivelSelect).niceSelect('update');
        }
    }
    
    // Inicializar selects complejos
    const actividadSelect = nuevaExperiencia.querySelector('.actividad-input');
    inicializarSelectConValor(actividadSelect, LISTA_ACTIVIDADES_EMPRESA, experienciaData.actividad_empresa, '-- Selecciona una actividad --');

    const areaSelect = nuevaExperiencia.querySelector('.area-input');
    inicializarSelectConValor(areaSelect, LISTA_AREAS_CARGO, experienciaData.area_cargo, '-- Selecciona un área --');
    
    container.appendChild(nuevaExperiencia);
    
    // Manejar eliminación
    nuevaExperiencia.querySelector('.remove-experiencia-btn').addEventListener('click', () => {
        container.removeChild(nuevaExperiencia);
    });
}

function agregarIdioma(idiomaData = {}) {
    const container = document.getElementById('idiomas-container');
    const nuevoIdioma = document.createElement('div');
    nuevoIdioma.className = 'idioma-entry';
    nuevoIdioma.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="form-group">
                    <label>Idioma</label>
                    <input type="text" class="form-control idioma-input" placeholder="Idioma" value="${idiomaData.idioma || ''}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Nivel escrito</label>
                    <select class="form-control escrito-input">
                        <option value="">Seleccione nivel</option>
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                        <option value="Experto">Experto</option>
                        <option value="Nativo">Nativo</option>
                    </select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label>Nivel oral</label>
                    <select class="form-control oral-input">
                        <option value="">Seleccione nivel</option>
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                        <option value="Experto">Experto</option>
                        <option value="Nativo">Nativo</option>
                    </select>
                </div>
            </div>
            <div class="col-md-12 text-end mb-3">
                <button type="button" class="btn btn-danger btn-sm remove-idioma-btn">
                    <span class="far fa-trash-alt"></span> Eliminar
                </button>
            </div>
        </div>
    `;
    
    // Establecer valores de los selects
    if (idiomaData.nivel_escrito) {
        nuevoIdioma.querySelector('.escrito-input').value = idiomaData.nivel_escrito;
    }
    if (idiomaData.nivel_oral) {
        nuevoIdioma.querySelector('.oral-input').value = idiomaData.nivel_oral;
    }
    
    // Actualizar nice-select si existe
    if (typeof $.fn.niceSelect !== 'undefined') {
        $(nuevoIdioma.querySelector('.escrito-input')).niceSelect('update');
        $(nuevoIdioma.querySelector('.oral-input')).niceSelect('update');
    }
    
    container.appendChild(nuevoIdioma);
    
    // Manejar eliminación
    nuevoIdioma.querySelector('.remove-idioma-btn').addEventListener('click', () => {
        container.removeChild(nuevoIdioma);
    });
}

// Función para recolectar los datos del formulario
function recolectarDatosFormulario() {
    const nombreCompleto = document.getElementById('nombre-completo').value.split(' ');
    const nombres = nombreCompleto[0] || '';
    const apellidos = nombreCompleto.slice(1).join(' ') || '';
    
    const codigoPais = document.getElementById('codigo_pais').value || '';
    const numeroTelefono = document.getElementById('numero_telefono').value || '';
    const telefonoCompleto = codigoPais + numeroTelefono;
    
    const data = {
        usuario: {
            id: userId,
            nombres: nombres,
            apellidos: apellidos,
            email: document.getElementById('email').value
        },
        data: {
            datos_personales: {
                telefono: telefonoCompleto,
                genero: document.getElementById('genero').value,
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
                estado_civil: document.getElementById('estado_civil').value,
                descripcion_bio: document.getElementById('descripcion_bio').value,
                region: document.getElementById('region').value,
                comuna: document.getElementById('comuna').value
            },
            educacion: [],
            experiencias: [],
            idiomas: [],
            preferencias: {
                modalidad: document.getElementById('modalidad').value,
                categoria_empleo: document.getElementById('categoria_empleo').value,
                salario_esperado: document.getElementById('salario_esperado').value.replace(/\./g, '')
                        },
            redes_sociales: [
                {
                    url: document.getElementById('facebook_url').value,
                    red_social: "Facebook"
                },
                {
                    url: document.getElementById('twitter_url').value,
                    red_social: "Twitter"
                },
                {
                    url: document.getElementById('linkedin_url').value,
                    red_social: "LinkedIn"
                },
                {
                    url: document.getElementById('instagram_url').value,
                    red_social: "Instagram"
                }
            ]
        }
    };
    
    // Recolectar educación
    document.querySelectorAll('.educacion-entry').forEach(entry => {
        data.data.educacion.push({
            titulo: entry.querySelector('.titulo-input')?.value || '',
            institucion: entry.querySelector('.institucion-input')?.value || '',
            grado: entry.querySelector('.grado-input')?.value || '',
            estado: entry.querySelector('.estado-input')?.value || '',
            anio_finalizacion: entry.querySelector('.anio-input')?.value || ''
        });
    });
    
    // Recolectar experiencias
    document.querySelectorAll('.experiencia-entry').forEach(entry => {
        data.data.experiencias.push({
            empresa: entry.querySelector('.empresa-input')?.value || '',
            cargo: entry.querySelector('.cargo-input')?.value || '',
            actividad_empresa: entry.querySelector('.actividad-input')?.value || '',
            area_cargo: entry.querySelector('.area-input')?.value || '',
            nivel_experiencia: entry.querySelector('.nivel-input')?.value || '',
            anno_inicio: entry.querySelector('.inicio-input')?.value || '',
            anno_termino: entry.querySelector('.termino-input')?.value || '',
            descripcion: entry.querySelector('.descripcion-input')?.value || ''
        });
    });
    
    // Recolectar idiomas
    document.querySelectorAll('.idioma-entry').forEach(entry => {
        data.data.idiomas.push({
            idioma: entry.querySelector('.idioma-input')?.value || '',
            nivel_escrito: entry.querySelector('.escrito-input')?.value || '',
            nivel_oral: entry.querySelector('.oral-input')?.value || ''
        });
    });
    
    return data;
}

// Función para actualizar los datos del postulante
async function actualizarPostulante() {
    try {
        const datosActualizados = recolectarDatosFormulario();
        console.log('Datos a enviar:', datosActualizados);
        
        const response = await fetch(`http://172.25.100.201:3000/v1/postulante/update/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datosActualizados)
        });
        
        console.log('Respuesta de actualización:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Resultado de actualización:', result);
        
        alert('Perfil actualizado correctamente');
        return result;
    } catch (error) {
        console.error('Error en actualizarPostulante:', error);
        alert('Ocurrió un error al actualizar el perfil: ' + error.message);
        throw error;
    }
}

// Funciones de confirmación
function mostrarConfirmacion() {
    document.getElementById("confirmacion-box").style.display = "block";
}

function ocultarConfirmacion() {
    document.getElementById("confirmacion-box").style.display = "none";
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando carga de datos...');
    
    // Verificar autenticación primero
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No estás autenticado. Redirigiendo a login...');
        window.location.href = '/login.html';
        return;
    }

    // Obtener userId del token
    userId = getUserIdFromToken();
    console.log('UserID obtenido:', userId);
    
    if (!userId) {
        alert('Error al obtener información del usuario. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login.html';
        return;
    }

    // Cargar datos del postulante
    cargarDatosPostulante()
        .catch(error => {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos del perfil. Por favor, recarga la página.');
        });
    
    // Configurar botones de añadir
    document.getElementById('agregar-educacion').addEventListener('click', () => {
        agregarEducacion({
            estado: "En Curso"
        });
    });
    
    document.getElementById('agregar-experiencia').addEventListener('click', () => {
        agregarExperiencia();
    });
    
    document.getElementById('agregar-idioma').addEventListener('click', () => {
        agregarIdioma();
    });
    
    // Configurar botón de actualización
    document.getElementById('btn-actualizar').addEventListener('click', mostrarConfirmacion);
    
    // Configurar botones de confirmación
    document.getElementById('btn-confirmar-actualizacion').addEventListener('click', () => {
        actualizarPostulante()
            .then(() => {
                ocultarConfirmacion();
                window.location.href = 'candidate-profile';
            })
            .catch(() => {
                ocultarConfirmacion();
            });
    });
    
    document.getElementById('btn-cancelar-actualizacion').addEventListener('click', ocultarConfirmacion);
    
    // Configurar logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });
    
    // Inicializar selects con nice-select si es necesario
    if (typeof $.fn.niceSelect !== 'undefined') {
        $('select').niceSelect();
    }
});