document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("phoneModal");
    const openBtn = document.getElementById("toggle-call-form");
    const closeBtn = document.getElementById("closeModal");
    const phoneForm = document.getElementById("phoneForm");
    const phoneInput = document.getElementById("phoneInput");
  
    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    // Cerrar al hacer clic fuera del modal
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  
    phoneForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const phone = phoneInput.value.trim();
      if (!phone.match(/^9\d{8}$/)) {
        alert("Por favor, ingresa un número válido (formato: 9 1234 5678)");
        return;
      }
      alert(`Gracias, te contactaremos pronto al +56 ${phone}`);
      phoneForm.reset();
      modal.style.display = "none";
    });
  });
  