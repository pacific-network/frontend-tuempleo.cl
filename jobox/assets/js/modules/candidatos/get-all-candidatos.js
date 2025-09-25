document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL_API = window.BASE_URL_API; 
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.warn("No hay token. Redirigiendo al login...");
      window.location.href = "../login.html";
      return;
    }
  
    const candidatosContainer = document.getElementById("candidatos-container");
    const paginacion = document.getElementById("paginacion");
  
    const tabs = document.querySelectorAll("#visitasTabs .nav-link");
    const panes = document.querySelectorAll(".tab-pane");
  
    // Navegación de pestañas (igual que antes)
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
  
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
  
        const tabId = tab.getAttribute("data-tab");
  
        panes.forEach(pane => {
          if (pane.id === `tab-${tabId}`) {
            pane.classList.remove("d-none");
            pane.classList.add("active");
          } else {
            pane.classList.add("d-none");
            pane.classList.remove("active");
          }
        });
  
        if (tabId === "hoy") {
          fetchPostulantes(1);
        }
      });
    });
  
    // Función para traer postulantes paginados
    async function fetchPostulantes(page = 1) {
      try {
        const response = await fetch(`${BASE_URL_API}/postulante?page=${page}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
  
        if (!response.ok) throw new Error("Error al obtener postulantes");
  
        const result = await response.json();
  
        renderPostulantes(result.data);
        renderPaginacion(result.meta);
      } catch (error) {
        console.error("❌ Error al obtener postulantes:", error);
        candidatosContainer.innerHTML = `<div class="alert alert-danger">No se pudieron cargar los postulantes.</div>`;
      }
    }
  
    // Renderizar postulantes
    function renderPostulantes(postulantes) {
      if (!postulantes || postulantes.length === 0) {
        candidatosContainer.innerHTML = "<p>No hay candidatos disponibles.</p>";
        return;
      }
    
      candidatosContainer.innerHTML = postulantes.map(p => `
        <div class="user-profile-card">
          <div class="user-profile-card-title">${p.usuario.nombres} ${p.usuario.apellidos}</div>
          <ul class="profile-info-list">
            <li>Email: <span>${p.usuario.email}</span></li>
            <li>Región: <span>${p.data.datos_personales.region}</span></li>
            <li>Salario esperado: <span>$${p.data.preferencias.salario_esperado}</span></li>
          </ul>
          <div class="user-profile-card-header-right mt-2">
            <a href="${p.data.redes_sociales[0]?.url || '#'}" target="_blank" class="btn btn-sm btn-outline-primary">LinkedIn</a>
          </div>
        </div>
      `).join("");
    }
    
  
    // Renderizar paginación
    function renderPaginacion(meta) {
      paginacion.innerHTML = "";
  
      for (let i = 1; i <= meta.pageCount; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        if (i === meta.page) li.classList.add("active");
  
        const a = document.createElement("a");
        a.classList.add("page-link");
        a.href = "#";
        a.textContent = i;
  
        a.addEventListener("click", (e) => {
          e.preventDefault();
          fetchPostulantes(i);
        });
  
        li.appendChild(a);
        paginacion.appendChild(li);
      }
    }
  
    // Al cargar la página, carga la pestaña "hoy" si está activa inicialmente
    const activeTab = document.querySelector("#visitasTabs .nav-link.active");
    if (activeTab?.getAttribute("data-tab") === "hoy") {
      fetchPostulantes(1);
    }
  });
  