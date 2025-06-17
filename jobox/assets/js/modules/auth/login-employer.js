document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageEl = document.getElementById('message');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
  
    // Mostrar / ocultar contraseña
    togglePasswordBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.innerHTML = '<i class="far fa-eye-slash"></i>';
      } else {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = '<i class="far fa-eye"></i>';
      }
    });
  
    // Función para decodificar JWT
    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      } catch (err) {
        console.error('Error decodificando el token:', err);
        return null;
      }
    }
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      messageEl.textContent = '';
  
      const email = loginForm.querySelector('#email').value.trim();
      const password = loginForm.querySelector('#password').value.trim();
  
      if (!email || !password) {
        messageEl.textContent = 'Por favor, completa ambos campos.';
        return;
      }
  
      try {
        const res = await fetch('http://172.25.100.201:3000/v1/auth/login-empleador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
  
        if (res.status === 401) {
          messageEl.textContent = 'Usuario no existe o contraseña incorrecta.';
          return;
        }
  
        if (!res.ok) {
          const errorText = await res.text();
          messageEl.textContent = `Error en login: ${errorText}`;
          return;
        }
  
        const data = await res.json();
  
        if (!data.token) {
          messageEl.textContent = 'No se recibió un token válido.';
          return;
        }
  
        localStorage.setItem('token', data.token);
  
        const payload = parseJwt(data.token);
        if (!payload || !payload.sub) {
          messageEl.textContent = 'Token inválido.';
          return;
        }
  
        const userId = payload.sub;
  
        const userCheck = await fetch(`http://172.25.100.201:3000/v1/empleador/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (!userCheck.ok) {
          const errText = await userCheck.text();
          messageEl.textContent = `Error verificando usuario: ${errText}`;
          return;
        }
  
        let employerData = null;

const contentLength = userCheck.headers.get("content-length");
if (contentLength && parseInt(contentLength) > 0) {
  employerData = await userCheck.json();
}

if (!employerData || employerData.employer?.empresaId === 0) {
  window.location.href = 'employer-form-register.html';
} else {
  window.location.href = 'employer-dashboard.html';
}
  
      } catch (error) {
        console.error('Error en login:', error);
        messageEl.textContent = 'No se pudo conectar con el servidor.';
      }
    });
})
  