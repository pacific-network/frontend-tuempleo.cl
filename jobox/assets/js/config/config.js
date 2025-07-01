const isDev =
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === 'localhost';

  window.BASE_URL_API = (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://tuempleo.cl/api';

console.log('✅ config.js cargado, BASE_URL_API =', window.BASE_URL_API);
