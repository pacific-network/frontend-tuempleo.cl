const regionesDeChile = [
  { numero: 1, nombre: "Región de Arica y Parinacota" },
  { numero: 2, nombre: "Región de Tarapacá" },
  { numero: 3, nombre: "Región de Antofagasta" },
  { numero: 4, nombre: "Región de Atacama" },
  { numero: 5, nombre: "Región de Coquimbo" },
  { numero: 6, nombre: "Región de Valparaíso" },
  { numero: 7, nombre: "Región Metropolitana de Santiago" },
  { numero: 8, nombre: "Región del Libertador General Bernardo O’Higgins" },
  { numero: 9, nombre: "Región del Maule" },
  { numero: 10, nombre: "Región de Ñuble" },
  { numero: 11, nombre: "Región del Biobío" },
  { numero: 12, nombre: "Región de La Araucanía" },
  { numero: 13, nombre: "Región de Los Ríos" },
  { numero: 14, nombre: "Región de Los Lagos" },
  { numero: 15, nombre: "Región de Aysén del General Carlos Ibáñez del Campo" },
  { numero: 16, nombre: "Región de Magallanes y de la Antártica Chilena" }
];

// Ejemplo de uso:
regionesDeChile.forEach(region => {
  console.log(`${region.numero}: ${region.nombre}`);
});
