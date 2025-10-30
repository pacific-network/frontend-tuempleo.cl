document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // 🔹 Función para decodificar JWT sin librerías externas
  function decodeToken(token) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  // 🔹 Validar token
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Debe iniciar sesión para continuar",
      confirmButtonText: "Ir al inicio",
      confirmButtonColor: "#3C65F5"
    }).then(() => {
      window.location.href = "../index.html";
    });
    return;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    Swal.fire({
      icon: "error",
      title: "Token inválido",
      text: "Debe iniciar sesión nuevamente.",
      confirmButtonText: "Ir al inicio",
      confirmButtonColor: "#3C65F5"
    }).then(() => {
      localStorage.removeItem("token");
      window.location.href = "../index.html";
    });
    return;
  }

  // 🔹 Verificar si está expirado
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp < now) {
    Swal.fire({
      icon: "info",
      title: "El tiempo de inicio de sesión expiró",
      confirmButtonText: "Volver a iniciar sesión",
      confirmButtonColor: "#3C65F5"
    }).then(() => {
      localStorage.removeItem("token");
      window.location.href = "../index.html";
    });
    return;
  }

  // Si todo está bien, continúa con la página
  console.log("✅ Token válido y sesión activa.");
});