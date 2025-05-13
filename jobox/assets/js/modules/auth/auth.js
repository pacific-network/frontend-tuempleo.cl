import api from "../../api_backend.js";

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post("api/v1/auth/register", credentials);
      console.log("Login exitoso:", response);
      return response;
    } catch (error) {
      console.error("Error en login:", error.message);
      throw error;
    }
  }

  async register() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const agree = document.getElementById("agree").checked;

    if (!agree) {
      alert("Debes aceptar los Términos de Servicio.");
      return;
    }

    const userData = { fullName, email, password };

    try {
      const response = await api.post("api/v1/auth/register", userData);
      console.log("Registro exitoso:", response);
      return response;
    } catch (error) {
      console.error("Error en registro:", error.message);
      alert(`Error al registrarse: ${error.message}`);
      throw error;
    }
  }

}

const authService = new AuthService();
export default authService;
