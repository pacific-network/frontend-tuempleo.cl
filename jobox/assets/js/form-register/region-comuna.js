// region-comuna-local.js
document.addEventListener('DOMContentLoaded', function() {
  const regionSelect = document.getElementById('region');
  const comunaSelect = document.getElementById('comuna');
  
  // Datos de regiones y comunas (comunas ordenadas alfabéticamente)
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

  // Llenar el select de regiones
  regionesComunas.regiones.forEach(region => {
    const option = document.createElement('option');
    option.value = region.region;
    option.textContent = region.region;
    regionSelect.appendChild(option);
  });

  // Manejar el cambio de región
  regionSelect.addEventListener('change', () => {
    const selectedRegion = regionSelect.value;
    const regionData = regionesComunas.regiones.find(r => r.region === selectedRegion);

    // Resetear el select de comunas
    comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
    comunaSelect.disabled = true;

    // Si se encontró la región y tiene comunas, llenar el select
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

  // Inicializar el select de comunas como deshabilitado
  comunaSelect.disabled = true;
});