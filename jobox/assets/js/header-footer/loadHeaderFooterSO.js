window.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header-placeholder");
  const footer = document.getElementById("footer-placeholder");

  // Cargar header
  fetch("headers/header-so.html")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      if (header) {
        header.innerHTML = html;
      }
    })
    .catch(err => console.error("Error al cargar el header:", err));

  // Cargar footer
  fetch("footer.html")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      if (footer) {
        footer.innerHTML = html;
      }
    })
    .catch(err => console.error("Error al cargar el footer:", err));
});