// Función para hacer login
async function login(credentials) {
    try {
      const response = await fetch("http://172.25.100.201:3000/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Login exitoso:", data);
      return data;
    } catch (error) {
      console.error("Error en login:", error.message);
      throw error;
    }
  }
  
  // Función para hacer registro
  async function register() {
    const nombre_completo = document.getElementById("nombre_completo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const agree = document.getElementById("agree").checked;  // Asegúrate de que este checkbox esté en el HTML
  
    if (!agree) {
      alert("Debes aceptar los Términos de Servicio.");
      return;
    }
  
    const userData = { nombre_completo, email, password };
  
    try {
      const response = await fetch("http://localhost:3000/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Registro exitoso:", data);
      return data;
    } catch (error) {
      console.error("Error en registro:", error.message);
      alert(`Error al registrarse: ${error.message}`);
      throw error;
    }
  }
  
  // Evento de envío de formulario para registro
  document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevenir comportamiento por defecto del formulario
  
    register(); // Llamar a la función de registro
  });
  