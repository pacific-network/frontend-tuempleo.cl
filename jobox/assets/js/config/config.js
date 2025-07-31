if (typeof window.isDev === 'undefined') {
  window.isDev =
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost';

  window.BASE_URL_API = window.isDev
    ? 'http://localhost:3000/v1'
    : 'https://tuempleo.cl/api/v1';

  console.log('✅ config.js cargado, BASE_URL_API =', window.BASE_URL_API);
}
