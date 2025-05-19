class ApiService {
    constructor() {
      this.baseUrl = "http://localhost:3000/"; // URL base del backend
    }
  
    async request(endpoint, method = "GET", data = null) {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      };
  
      // Solo incluir el body si hay datos
      if (data) {
        options.body = JSON.stringify(data);
      }
  
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`API ${method} request to ${endpoint} failed:`, error.message);
        throw error;
      }
    }
  
    get(endpoint) {
      return this.request(endpoint, "GET");
    }
  
    post(endpoint, data) {
      return this.request(endpoint, "POST", data);
    }
  
    patch(endpoint, data) {
      return this.request(endpoint, "PATCH", data);
    }
  
    delete(endpoint) {
      return this.request(endpoint, "DELETE");
    }
  }
  
  const api = new ApiService();
  export default api;
  