// Fija el href del botón "Volver a lista de Candidatos" a la misma oferta
document.addEventListener('DOMContentLoaded', function () {
  var back = document.querySelector('a[href="employer-candidate.html"]');
  if (!back) return;
  var returnTo = sessionStorage.getItem('return_to_offer_page') || 'employer-candidate.html';
  back.setAttribute('href', returnTo);
});