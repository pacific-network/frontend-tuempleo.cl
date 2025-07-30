const planes = [
    {
        id: 1,
        nombre: "Publicación Gratis",
        precio: 0,
        descripcion: "Ideal para pequeñas empresas.",
        caracteristicas: [
            "Hasta 2 publicaciones",
            "Duración: 7 días",
            "Soporte básico"
        ],
        popular: false
    },
    {
        id: 2,
        nombre: "Publicación Básica",
        precio: 15000,
        descripcion: "Ideal para pequeñas empresas.",
        caracteristicas: [
            "Hasta 2 publicaciones",
            "Duración: 7 días",
            "Soporte básico"
        ],
        popular: false
    },
    {
        id: 3,
        nombre: "Plan Estándar",
        precio: 40000,
        descripcion: "Para empresas medianas.",
        caracteristicas: [
            "Hasta 5 publicaciones",
            "Duración: 30 días",
            "Soporte prioritario",
            "Reportes básicos"
        ],
        popular: true
    },
    {
        id: 4,
        nombre: "Plan Premium",
        precio: 90000,
        descripcion: "Para alto volumen de contratación.",
        caracteristicas: [
            "Publicaciones ilimitadas",
            "Duración: 60 días",
            "Soporte 24/7",
            "Consultoría avanzada"
        ],
        popular: false
    }
];

let carrito = [];

const planGrid = document.getElementById("planGrid");
const cartSummary = document.getElementById("cartSummary");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const emptyCartMsg = document.getElementById("emptyCartMsg");

function renderPlanes() {
    planGrid.innerHTML = planes.map(plan => `
      <div class="pricing-item ${plan.popular ? 'active' : ''}">
        ${plan.popular ? `<div class="pricing-popular">Más popular</div>` : ''}
        <div class="pricing-content">
          <h4>${plan.nombre}</h4>
          <div class="pricing-amount">$${plan.precio.toLocaleString('es-CL')} <span>CLP</span></div>
          <p>${plan.descripcion}</p>
        </div>
        <div class="pricing-feature">
          <ul>
            ${plan.caracteristicas.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
        ${plan.id !== 1 ? `<button class="theme-btn" data-id="${plan.id}">Agregar al carrito</button>` : ''}
      </div>
    `).join('');
}
function renderCarrito() {
    if (carrito.length === 0) {
        cartSummary.style.display = "none";
        emptyCartMsg.style.display = "block";
    } else {
        cartSummary.style.display = "flex";
        emptyCartMsg.style.display = "none";
        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        cartTotal.textContent = total.toLocaleString('es-CL');
    }
}

function agregarAlCarrito(id) {
    const plan = planes.find(p => p.id === id);
    if (!plan || plan.id === 1) return;


    const existente = carrito.find(p => p.id === id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...plan, cantidad: 1 });
    }
    alert(`"${plan.nombre}" agregado al carrito.`);
    renderCarrito();
}

planGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("theme-btn")) {
        const id = parseInt(e.target.dataset.id);
        agregarAlCarrito(id);
    }
});

checkoutBtn.addEventListener("click", () => {
    alert("Iniciando proceso de pago...");
    carrito = [];
    renderCarrito();
});

renderPlanes();
renderCarrito();