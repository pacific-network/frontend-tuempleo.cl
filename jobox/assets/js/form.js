// form-unificado.js
document.addEventListener('DOMContentLoaded', function() {
  // 1. Códigos de país
  async function cargarCodigosDePais() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();

      const select = document.getElementById('codigo_pais');
      select.innerHTML = '';

      const paises = data
        .filter(p => p.region === 'Americas' && p.idd && p.idd.root)
        .map(p => {
          const root = p.idd.root || '';
          const suffixes = p.idd.suffixes || [''];
          return suffixes.map(suffix => ({
            nombre: p.name.common,
            codigo: root + suffix,
            bandera: p.flag,
            iso2: p.cca2
          }));
        })
        .flat();

      paises.sort((a, b) => a.nombre.localeCompare(b.nombre));

      for (const pais of paises) {
        const option = document.createElement('option');
        option.value = pais.codigo;
        option.textContent = `${pais.bandera} ${pais.codigo} (${pais.nombre})`;

        if (pais.nombre === 'Chile') {
          option.selected = true;
        }

        select.appendChild(option);
      }
    } catch (error) {
      console.error('Error al cargar países:', error);
      const select = document.getElementById('codigo_pais');
      select.innerHTML = '<option disabled>Error al cargar países</option>';
    }
  }

  // 2. Actividades de empresa
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

  function cargarActividadesEmpresa() {
    const actividadSelects = document.querySelectorAll("select[name^='experiencia'][name$='[actividad_empresa]']");

    if (actividadSelects.length > 0) {
        actividadSelects.forEach(actividadSelect => {
            // Limpia las opciones existentes excepto la primera
            while (actividadSelect.options.length > 1) {
            actividadSelect.remove(1);
            }
    
            // Agrega las opciones del array
            actividadesEmpresa.forEach(actividad => {
            if (actividad) { // Saltamos el primer elemento vacío
                const option = document.createElement("option");
                option.value = actividad;
                option.textContent = actividad;
                actividadSelect.appendChild(option);
            }
            });
        });
    }
  }

  // 3. Áreas de cargo
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

  function cargarAreasCargo() {
    const areaSelects = document.querySelectorAll('select[name^="experiencia"][name$="[area_cargo]"]');
    
    if (areaSelects.length > 0) {
        areaSelects.forEach(areaSelect => {
            // Limpia las opciones existentes excepto la primera
            while (areaSelect.options.length > 1) {
                areaSelect.remove(1);
            }

            // Agrega las opciones del array
            areasCargo.forEach(area => {
                if (area) { // Saltamos el primer elemento vacío
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    areaSelect.appendChild(option);
                }
            });
        });
    }
  }

  // 4. Carreras
  const opcionesCarreras = [
    { value: "", text: "-- Selecciona una carrera --" },
    { value: "administracion_publica", text: "Administración Pública" },
    { value: "administracion_turistica", text: "Administración Turística" },
    { value: "agroindustria", text: "Agroindustria" },
    { value: "agronomia", text: "Agronomía" },
    { value: "alimentos", text: "Ingeniería en Alimentos" },
    { value: "analisis_sistemas", text: "Análisis de Sistemas" },
    { value: "animacion_digital", text: "Animación Digital" },
    { value: "antropologia", text: "Antropología" },
    { value: "arquitectura", text: "Arquitectura" },
    { value: "arquitectura_paisaje", text: "Arquitectura del Paisaje" },
    { value: "arte", text: "Arte" },
    { value: "arte_escenico", text: "Arte Escénico" },
    { value: "astronomia", text: "Astronomía" },
    { value: "audiovisual", text: "Artes Audiovisuales" },
    { value: "automatizacion", text: "Automatización Industrial" },
    { value: "bibliotecologia", text: "Bibliotecología" },
    { value: "biofisica", text: "Biofísica" },
    { value: "bioinformatica", text: "Bioinformática" },
    { value: "biologia", text: "Biología" },
    { value: "biologia_marina", text: "Biología Marina" },
    { value: "biomedica", text: "Ingeniería Biomédica" },
    { value: "bioprocesos", text: "Ingeniería en Bioprocesos" },
    { value: "biotecnologia", text: "Biotecnología" },
    { value: "calidad", text: "Ingeniería en Calidad" },
    { value: "cartografia", text: "Cartografía" },
    { value: "ciencia_datos", text: "Ciencia de Datos" },
    { value: "ciencia_politica", text: "Ciencia Política" },
    { value: "cine", text: "Cine" },
    { value: "cirugia_dental", text: "Cirugía Dental" },
    { value: "climatologia", text: "Climatología" },
    { value: "coaching", text: "Coaching" },
    { value: "comercio_exterior", text: "Comercio Exterior" },
    { value: "composicion", text: "Composición Musical" },
    { value: "comunicacion_audiovisual", text: "Comunicación Audiovisual" },
    { value: "comunicacion_organizacional", text: "Comunicación Organizacional" },
    { value: "construccion", text: "Ingeniería en Construcción" },
    { value: "contabilidad", text: "Contabilidad" },
    { value: "cosmetologia", text: "Cosmetología" },
    { value: "criminologia", text: "Criminología" },
    { value: "danza", text: "Danza" },
    { value: "defensa_cibernetica", text: "Defensa Cibernética" },
    { value: "derecho", text: "Derecho" },
    { value: "derecho_internacional", text: "Derecho Internacional" },
    { value: "design", text: "Diseño" },
    { value: "design_grafico", text: "Diseño Gráfico" },
    { value: "design_interiores", text: "Diseño de Interiores" },
    { value: "design_moda", text: "Diseño de Moda" },
    { value: "desarrollo_software", text: "Desarrollo de Software" },
    { value: "desarrollo_web", text: "Desarrollo Web" },
    { value: "diplomacia", text: "Diplomacia" },
    { value: "direccion_artistica", text: "Dirección Artística" },
    { value: "ecologia", text: "Ecología" },
    { value: "economia", text: "Economía" },
    { value: "economia_ambiental", text: "Economía Ambiental" },
    { value: "edicion", text: "Edición" },
    { value: "educacion_basica", text: "Educación Básica" },
    { value: "educacion_diferencial", text: "Educación Diferencial" },
    { value: "educacion_fisica", text: "Educación Física" },
    { value: "educacion_parvularia", text: "Educación Parvularia" },
    { value: "efectos_visuales", text: "Efectos Visuales" },
    { value: "energias_renovables", text: "Energías Renovables" },
    { value: "enfermeria", text: "Enfermería" },
    { value: "enologia", text: "Enología" },
    { value: "estadistica", text: "Estadística" },
    { value: "estetica", text: "Estética" },
    { value: "estudios_internacionales", text: "Estudios Internacionales" },
    { value: "farmacia", text: "Farmacia" },
    { value: "filosofia", text: "Filosofía" },
    { value: "finanzas", text: "Finanzas" },
    { value: "fisica", text: "Física" },
    { value: "fisica_medica", text: "Física Médica" },
    { value: "fisioterapia", text: "Fisioterapia" },
    { value: "fonoaudiologia", text: "Fonoaudiología" },
    { value: "fotografia", text: "Fotografía" },
    { value: "gastronomia", text: "Gastronomía" },
    { value: "genetica", text: "Genética" },
    { value: "geofisica", text: "Geofísica" },
    { value: "geografia", text: "Geografía" },
    { value: "geologia", text: "Geología" },
    { value: "gerontologia", text: "Gerontología" },
    { value: "gestion_calidad", text: "Gestión de Calidad" },
    { value: "gestion_cultural", text: "Gestión Cultural" },
    { value: "gestion_deportiva", text: "Gestión Deportiva" },
    { value: "gestion_empresarial", text: "Gestión Empresarial" },
    { value: "gestion_medioambiente", text: "Gestión Medioambiental" },
    { value: "gestion_proyectos", text: "Gestión de Proyectos" },
    { value: "gestion_publica", text: "Gestión Pública" },
    { value: "gestion_turistica", text: "Gestión Turística" },
    { value: "historia", text: "Historia" },
    { value: "historia_arte", text: "Historia del Arte" },
    { value: "hoteleria", text: "Hotelería" },
    { value: "icivil", text: "Ingeniería Civil" },
    { value: "icivil_ambiental", text: "Ingeniería Civil Ambiental" },
    { value: "icivil_biomedica", text: "Ingeniería Civil Biomédica" },
    { value: "icivil_computacion", text: "Ingeniería Civil en Computación" },
    { value: "icivil_electrica", text: "Ingeniería Civil Eléctrica" },
    { value: "icivil_electronica", text: "Ingeniería Civil Electrónica" },
    { value: "icivil_geologica", text: "Ingeniería Civil Geológica" },
    { value: "icivil_industrial", text: "Ingeniería Civil Industrial" },
    { value: "icivil_informatica", text: "Ingeniería Civil Informática" },
    { value: "icivil_mecanica", text: "Ingeniería Civil Mecánica" },
    { value: "icivil_minas", text: "Ingeniería Civil en Minas" },
    { value: "icivil_quimica", text: "Ingeniería Civil Química" },
    { value: "icivil_telecom", text: "Ingeniería Civil en Telecomunicaciones" },
    { value: "ilustracion", text: "Ilustración" },
    { value: "impuestos", text: "Ingeniería en Impuestos" },
    { value: "industria_alimentaria", text: "Industria Alimentaria" },
    { value: "inge_acustica", text: "Ingeniería Acústica" },
    { value: "inge_agronoma", text: "Ingeniería Agrónoma" },
    { value: "inge_agronomica", text: "Ingeniería Agronómica" },
    { value: "inge_ambiental", text: "Ingeniería Ambiental" },
    { value: "inge_aeronautica", text: "Ingeniería Aeronáutica" },
    { value: "inge_biomedica", text: "Ingeniería Biomédica" },
    { value: "inge_comercial", text: "Ingeniería Comercial" },
    { value: "inge_construccion", text: "Ingeniería en Construcción" },
    { value: "inge_ejecucion", text: "Ingeniería de Ejecución" },
    { value: "inge_electrica", text: "Ingeniería Eléctrica" },
    { value: "inge_electronica", text: "Ingeniería Electrónica" },
    { value: "inge_industrial", text: "Ingeniería Industrial" },
    { value: "inge_informatica", text: "Ingeniería en Informática" },
    { value: "inge_materiales", text: "Ingeniería en Materiales" },
    { value: "inge_mecanica", text: "Ingeniería Mecánica" },
    { value: "inge_mecatronica", text: "Ingeniería Mecatrónica" },
    { value: "inge_minas", text: "Ingeniería en Minas" },
    { value: "inge_pesquera", text: "Ingeniería Pesquera" },
    { value: "inge_petrolera", text: "Ingeniería Petrolera" },
    { value: "inge_prevencion", text: "Ingeniería en Prevención de Riesgos" },
    { value: "inge_quimica", text: "Ingeniería Química" },
    { value: "inge_sistemas", text: "Ingeniería de Sistemas" },
    { value: "inge_telecomunicaciones", text: "Ingeniería en Telecomunicaciones" },
    { value: "ingenieria_maritima", text: "Ingeniería Marítima" },
    { value: "ingenieria_transporte", text: "Ingeniería en Transporte" },
    { value: "inteligencia_artificial", text: "Inteligencia Artificial" },
    { value: "interpretacion", text: "Interpretación" },
    { value: "interpretacion_musical", text: "Interpretación Musical" },
    { value: "joyeria", text: "Joyería" },
    { value: "kinesiologia", text: "Kinesiología" },
    { value: "letras", text: "Letras" },
    { value: "logistica", text: "Logística" },
    { value: "marketing", text: "Marketing" },
    { value: "matematicas", text: "Matemáticas" },
    { value: "mecanica", text: "Mecánica" },
    { value: "mecatronica", text: "Mecatrónica" },
    { value: "medicina", text: "Medicina" },
    { value: "medicina_veterinaria", text: "Medicina Veterinaria" },
    { value: "meteorologia", text: "Meteorología" },
    { value: "microbiologia", text: "Microbiología" },
    { value: "mineria", text: "Ingeniería en Minería" },
    { value: "museologia", text: "Museología" },
    { value: "musica", text: "Música" },
    { value: "nanotecnologia", text: "Nanotecnología" },
    { value: "negocios_internacionales", text: "Negocios Internacionales" },
    { value: "neuromarketing", text: "Neuromarketing" },
    { value: "nutricion", text: "Nutrición y Dietética" },
    { value: "oceanografia", text: "Oceanografía" },
    { value: "odontologia", text: "Odontología" },
    { value: "oftalmologia", text: "Oftalmología" },
    { value: "optometria", text: "Optometría" },
    { value: "ortopedia", text: "Ortopedia" },
    { value: "paleontologia", text: "Paleontología" },
    { value: "patrimonio_cultural", text: "Patrimonio Cultural" },
    { value: "pedagogia", text: "Pedagogía" },
    { value: "periodismo", text: "Periodismo" },
    { value: "pilotaje", text: "Pilotaje" },
    { value: "podologia", text: "Podología" },
    { value: "produccion_audiovisual", text: "Producción Audiovisual" },
    { value: "produccion_musical", text: "Producción Musical" },
    { value: "psicologia", text: "Psicología" },
    { value: "psicopedagogia", text: "Psicopedagogía" },
    { value: "publicidad", text: "Publicidad" },
    { value: "quimica", text: "Química" },
    { value: "quimica_farmacia", text: "Química y Farmacia" },
    { value: "radiologia", text: "Radiología" },
    { value: "realizacion_cine", text: "Realización Cinematográfica" },
    { value: "recursos_humanos", text: "Recursos Humanos" },
    { value: "recursos_naturales", text: "Recursos Naturales" },
    { value: "relaciones_internacionales", text: "Relaciones Internacionales" },
    { value: "relaciones_publicas", text: "Relaciones Públicas" },
    { value: "robotica", text: "Robótica" },
    { value: "seguridad_cibernetica", text: "Seguridad Cibernética" },
    { value: "seguridad_ocupacional", text: "Seguridad Ocupacional" },
    { value: "sociologia", text: "Sociología" },
    { value: "sonido", text: "Ingeniería en Sonido" },
    { value: "teatro", text: "Teatro" },
    { value: "tecnologia_medica", text: "Tecnología Médica" },
    { value: "tecnologia_musical", text: "Tecnología Musical" },
    { value: "tecnico_agricola", text: "Técnico Agrícola" },
    { value: "tecnico_administracion", text: "Técnico en Administración" },
    { value: "tecnico_construccion", text: "Técnico en Construcción" },
    { value: "tecnico_dental", text: "Técnico Dental" },
    { value: "tecnico_electricidad", text: "Técnico en Electricidad" },
    { value: "tecnico_enfermeria", text: "Técnico en Enfermería" },
    { value: "tecnico_farmacia", text: "Técnico en Farmacia" },
    { value: "tecnico_gastronomia", text: "Técnico en Gastronomía" },
    { value: "tecnico_informatica", text: "Técnico en Informática" },
    { value: "tecnico_laboratorio", text: "Técnico en Laboratorio Clínico" },
    { value: "tecnico_mecanica", text: "Técnico en Mecánica Automotriz" },
    { value: "tecnico_mineria", text: "Técnico en Minería" },
    { value: "tecnico_odontologia", text: "Técnico en Odontología" },
    { value: "tecnico_programacion", text: "Técnico en Programación" },
    { value: "tecnico_radiologia", text: "Técnico en Radiología" },
    { value: "tecnico_redes", text: "Técnico en Redes" },
    { value: "tecnico_turismo", text: "Técnico en Turismo" },
    { value: "tecnico_veterinaria", text: "Técnico en Veterinaria" },
    { value: "telecomunicaciones", text: "Telecomunicaciones" },
    { value: "terapia_ocupacional", text: "Terapia Ocupacional" },
    { value: "topografia", text: "Topografía" },
    { value: "trabajo_social", text: "Trabajo Social" },
    { value: "traduccion", text: "Traducción" },
    { value: "traduccion_interpretacion", text: "Traducción e Interpretación" },
    { value: "turismo", text: "Turismo" },
    { value: "urbanismo", text: "Urbanismo" },
    { value: "viticultura", text: "Viticultura" },
    { value: "zoologia", text: "Zoología" },
    { value: "otra", text: "Otra" }
  ];

  function cargarCarreras() {
    const carreraSelect = document.querySelectorAll('select[name^="formaion"][name$="[todas_carreras_chile]"]');

    if (carreraSelect.length > 0) {
      carreraSelect.forEach(select => {
        // Limpia las opciones existentes excepto la primera
        while (select.options.length > 1) {
          select.remove(1);
        }

        // Agrega las opciones del array
        opcionesCarreras.forEach(opcion => {
          const option = document.createElement("option");
          option.value = opcion.value;
          option.textContent = opcion.text;
          select.appendChild(option);
        });
      });
    }
  }

  // 5. Instituciones
  const opcionesInstituciones = [
    { value: "", text: "-- Selecciona una institución --", group: "" },
    // ... (todas las instituciones del listado original)
    { value: "otra", text: "Otra", group: "🌍 Otras" }
  ];

  function cargarInstituciones() {
    const select = document.getElementById("instituciones_chile");

    if (select) {
      const grupos = {};
      opcionesInstituciones.forEach(({ value, text, group }) => {
        if (!grupos[group]) {
          grupos[group] = [];
        }
        grupos[group].push({ value, text });
      });

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

  // 6. Regiones y comunas
  function cargarRegionesComunas() {
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');
    
    const regionesComunas = {
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
          "comunas": ["Algarrobo", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla de Pascua", "Juan Fernández", "La Cruz", "La Ligua", "Limache", "Los Andes", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Providencia", "Puchuncaví", "Putaendo", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña del Mar", "Zapallar", "Cabildo", "Calera", "Llaillay"].sort()
        },
        {
          "region": "Región del Libertador Gral. Bernardo O'Higgins",
          "comunas": ["Chépica", "Chimbarongo", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Las Cabras", "Litueche", "Lolol", "Machalí", "Malloa", "Marchihue", "Mostazal", "Nancagua", "Navidad", "Olivar", "Palmilla", "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta de Tilcoco", "Rancagua", "Rengo", "Requínoa", "San Fernando", "San Vicente", "Santa Cruz"].sort()
        },
        {
          "region": "Región del Maule",
          "comunas": ["Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"].sort()
        },
        {
          "region": "Región de Ñuble",
          "comunas": ["Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"].sort()
        },
        {
          "region": "Región del Biobío",
          "comunas": ["Alto Biobío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", "Contulmo", "Coronel", "Curanilahue", "Florida", "Hualpén", "Hualqui", "Laja", "Lebu", "Los Álamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", "Quilaco", "Quilleco", "San Pedro de la Paz", "San Rosendo", "Santa Bárbara", "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"].sort()
        },
        {
          "region": "Región de la Araucanía",
          "comunas": ["Angol", "Carahue", "Cholchol", "Collipulli", "Cunco", "Curacautín", "Curarrehue", "Ercilla", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Lonquimay", "Los Sauces", "Lumaco", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Purén", "Pucón", "Renaico", "Saavedra", "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", "Vilcún", "Villarrica"].sort()
        },
        {
          "region": "Región de Los Ríos",
          "comunas": ["Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno", "Valdivia"].sort()
        },
        {
          "region": "Región de Los Lagos",
          "comunas": ["Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", "Curaco de Vélez", "Dalcahue", "Fresia", "Frutillar", "Futaleufú", "Hualaihué", "Llanquihue", "Los Muermos", "Maullín", "Osorno", "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", "Quemchi", "Quinchao", "Río Negro", "San Juan de la Costa", "San Pablo"].sort()
        },
        {
          "region": "Región Aisén del Gral. Carlos Ibáñez del Campo",
          "comunas": ["Aisén", "Chile Chico", "Cisnes", "Coihaique", "Cochrane", "Guaitecas", "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"].sort()
        },
        {
          "region": "Región de Magallanes y de la Antártica Chilena",
          "comunas": ["Antártica", "Cabo de Hornos (Ex Navarino)", "Laguna Blanca", "Natales", "Porvenir", "Primavera", "Punta Arenas", "Río Verde", "San Gregorio", "Timaukel", "Torres del Paine"].sort()
        },
        {
          "region": "Región Metropolitana de Santiago",
          "comunas": ["Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Tiltil", "Vitacura"].sort()
        }
      ]
    };

    regionesComunas.regiones.forEach(region => {
      const option = document.createElement('option');
      option.value = region.region;
      option.textContent = region.region;
      regionSelect.appendChild(option);
    });

    regionSelect.addEventListener('change', () => {
      const selectedRegion = regionSelect.value;
      const regionData = regionesComunas.regiones.find(r => r.region === selectedRegion);

      comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
      comunaSelect.disabled = true;

      if (regionData?.comunas?.length) {
        regionData.comunas.forEach(comuna => {
          const option = document.createElement('option');
          option.value = comuna;
          option.textContent = comuna;
          comunaSelect.appendChild(option);
        });
        comunaSelect.disabled = false;
      }
    });

    comunaSelect.disabled = true;
  }

  // 7. Funcionalidad de experiencia laboral
  function handleActualmente(selectElement) {
    const wrapper = selectElement.closest('.d-flex');
    const yearSelect = wrapper.querySelector('select[name="anio_termino"]');

    if (selectElement.value === '13' || selectElement.value === 'Actualmente') {
      yearSelect.disabled = true;
      yearSelect.value = 'Actualmente';
    } else {
      yearSelect.disabled = false;
      if (yearSelect.value === 'Actualmente') {
        yearSelect.value = '';
      }
    }
  }

  function removeExperience(button) {
    const entry = button.closest('.exp-entry');
    const total = document.querySelectorAll('.exp-entry').length;

    if (total > 1) {
      entry.remove();
    } else {
      alert("Debe mantener al menos una experiencia");
    }
  }

  function addExperience() {
    const container = document.getElementById('experiencia-container');
    const lastEntry = container.querySelector('.exp-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    newEntry.querySelectorAll('input, textarea').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(select => {
      select.value = '';
      select.disabled = false;
    });

    newEntry.querySelectorAll('select[name="mes_termino"]').forEach(select => {
      select.addEventListener('change', function() {
        handleActualmente(this);
      });
    });

    const removeBtn = newEntry.querySelector('.remove-exp-btn');
    removeBtn.addEventListener('click', function() {
      removeExperience(this);
    });

    container.appendChild(newEntry);
    newEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 8. Funcionalidad de formación académica
  function toggleAnioFinalizacion(selectElement) {
    const anioGroup = selectElement.closest('.formacion-entry').querySelector('.anio-finalizacion-group');
    if (selectElement.value === 'graduado' || selectElement.value === 'abandonado') {
      anioGroup.style.display = 'block';
    } else {
      anioGroup.style.display = 'none';
      const input = anioGroup.querySelector('input');
      if (input) input.value = '';
    }
  }

  function removeFormacion(button) {
    const entryToRemove = button.closest('.formacion-entry');
    if (document.querySelectorAll('.formacion-entry').length > 1) {
      entryToRemove.remove();
    } else {
      alert("Debe mantener al menos un registro de formación");
    }
  }

  function addFormacion() {
    const container = document.getElementById('formacion-container');
    const lastEntry = container.querySelector('.formacion-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    newEntry.querySelectorAll('input').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(el => {
      el.value = '';
      if (el.name === 'estado_estudio[]') {
        const anioGroup = newEntry.querySelector('.anio-finalizacion-group');
        if (anioGroup) anioGroup.style.display = 'none';
      }
    });

    container.appendChild(newEntry);
    newEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    assignEvents(newEntry);
  }

  function assignEvents(scope = document) {
    scope.querySelectorAll('.remove-formacion-btn').forEach(button => {
      button.onclick = () => removeFormacion(button);
    });

    scope.querySelectorAll('[name="estado_estudio[]"]').forEach(select => {
      select.onchange = () => toggleAnioFinalizacion(select);
    });
  }

  // 9. Funcionalidad de idiomas
  function addIdiomaBlock() {
    const container = document.getElementById('idiomas-container');
    const lastEntry = container.querySelector('.idioma-entry:last-child');
    const newEntry = lastEntry.cloneNode(true);

    newEntry.querySelectorAll('input').forEach(el => el.value = '');
    newEntry.querySelectorAll('select').forEach(el => el.value = '');

    container.appendChild(newEntry);

    const removeBtn = newEntry.querySelector('.remove-idioma-btn');
    removeBtn.addEventListener('click', function() {
      removeIdioma(this);
    });

    newEntry.scrollIntoView({ behavior: 'smooth' });
  }

  function removeIdioma(button) {
    const container = document.getElementById('idiomas-container');
    const entries = container.querySelectorAll('.idioma-entry');
    if (entries.length > 1) {
      button.closest('.idioma-entry').remove();
    } else {
      alert("Debe mantener al menos un idioma");
    }
  }

  // Inicialización de todos los componentes
  function init() {
    // Cargar datos
    cargarCodigosDePais();
    cargarActividadesEmpresa();
    cargarAreasCargo();
    cargarCarreras();
    cargarInstituciones();
    cargarRegionesComunas();

    // Configurar eventos de experiencia
    document.getElementById('addExpBtn')?.addEventListener('click', addExperience);
    document.querySelectorAll('.remove-exp-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        removeExperience(this);
      });
    });
    document.querySelectorAll('select[name="mes_termino"]').forEach(select => {
      select.addEventListener('change', function() {
        handleActualmente(this);
      });
    });

    // Configurar eventos de formación
    document.getElementById('addFormacionBtn')?.addEventListener('click', addFormacion);
    assignEvents();

    // Configurar eventos de idiomas
    const addIdiomaBtn = document.getElementById('addIdiomaBtn');
    if (addIdiomaBtn) {
      addIdiomaBtn.addEventListener('click', addIdiomaBlock);
    }
    document.querySelector('.remove-idioma-btn')?.addEventListener('click', function() {
      removeIdioma(this);
    });
  }

  // Ejecutar inicialización
  init();
});