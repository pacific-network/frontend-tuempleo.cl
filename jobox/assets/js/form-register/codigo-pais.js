const paisesDataLocales = [
  {
    name: { common: "Argentina" },
    idd: { root: "+54", suffixes: [""] },
    flag: "🇦🇷",
    cca2: "AR",
    region: "Americas"
  },
  {
    name: { common: "Chile" },
    idd: { root: "+56", suffixes: [""] },
    flag: "🇨🇱",
    cca2: "CL",
    region: "Americas"
  },
  {
    name: { common: "México" },
    idd: { root: "+52", suffixes: [""] },
    flag: "🇲🇽",
    cca2: "MX",
    region: "Americas"
  },
  {
    name: { common: "Brasil" },
    idd: { root: "+55", suffixes: [""] },
    flag: "🇧🇷",
    cca2: "BR",
    region: "Americas"
  },
  {
    name: { common: "Colombia" },
    idd: { root: "+57", suffixes: [""] },
    flag: "🇨🇴",
    cca2: "CO",
    region: "Americas"
  },
  {
    name: { common: "Perú" },
    idd: { root: "+51", suffixes: [""] },
    flag: "🇵🇪",
    cca2: "PE",
    region: "Americas"
  },
  {
    name: { common: "Uruguay" },
    idd: { root: "+598", suffixes: [""] },
    flag: "🇺🇾",
    cca2: "UY",
    region: "Americas"
  },
  {
    name: { common: "Paraguay" },
    idd: { root: "+595", suffixes: [""] },
    flag: "🇵🇾",
    cca2: "PY",
    region: "Americas"
  },
  {
    name: { common: "Venezuela" },
    idd: { root: "+58", suffixes: [""] },
    flag: "🇻🇪",
    cca2: "VE",
    region: "Americas"
  },
  {
    name: { common: "Estados Unidos" },
    idd: { root: "+1", suffixes: [""] },
    flag: "🇺🇸",
    cca2: "US",
    region: "Americas"
  },
  {
    name: { common: "Canadá" },
    idd: { root: "+1", suffixes: [""] },
    flag: "🇨🇦",
    cca2: "CA",
    region: "Americas"
  },
  {
    name: { common: "Cuba" },
    idd: { root: "+53", suffixes: [""] },
    flag: "🇨🇺",
    cca2: "CU",
    region: "Americas"
  },
  {
    name: { common: "Ecuador" },
    idd: { root: "+593", suffixes: [""] },
    flag: "🇪🇨",
    cca2: "EC",
    region: "Americas"
  },
  {
    name: { common: "Guatemala" },
    idd: { root: "+502", suffixes: [""] },
    flag: "🇬🇹",
    cca2: "GT",
    region: "Americas"
  },
  {
    name: { common: "Honduras" },
    idd: { root: "+504", suffixes: [""] },
    flag: "🇭🇳",
    cca2: "HN",
    region: "Americas"
  },
  {
    name: { common: "Panamá" },
    idd: { root: "+507", suffixes: [""] },
    flag: "🇵🇦",
    cca2: "PA",
    region: "Americas"
  },
  {
    name: { common: "Bolivia" },
    idd: { root: "+591", suffixes: [""] },
    flag: "🇧🇴",
    cca2: "BO",
    region: "Americas"
  },
  {
    name: { common: "Costa Rica" },
    idd: { root: "+506", suffixes: [""] },
    flag: "🇨🇷",
    cca2: "CR",
    region: "Americas"
  },
  {
    name: { common: "Nicaragua" },
    idd: { root: "+505", suffixes: [""] },
    flag: "🇳🇮",
    cca2: "NI",
    region: "Americas"
  },
  {
    name: { common: "El Salvador" },
    idd: { root: "+503", suffixes: [""] },
    flag: "🇸🇻",
    cca2: "SV",
    region: "Americas"
  }
];

async function cargarCodigosDePais() {
  try {
    // Simular fetch con datos locales
    const data = paisesDataLocales;

    const select = document.getElementById('codigo_pais');
    select.innerHTML = ''; // limpiar "Cargando..."

    const paises = data
      .filter(p => p.region === 'Americas' && p.idd && p.idd.root)
      .flatMap(p => {
        const root = p.idd.root || '';
        const suffixes = p.idd.suffixes || [''];
        return suffixes.map(suffix => ({
          nombre: p.name.common,
          codigo: root + suffix,
          bandera: p.flag,
          iso2: p.cca2
        }));
      });

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

document.addEventListener('DOMContentLoaded', cargarCodigosDePais);