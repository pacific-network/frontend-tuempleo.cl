// core/proceso_seleccion/utils/toast.js

export function showToast(message, type = "success") {
    // Crear contenedor si no existe
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.position = "fixed";
        container.style.bottom = "25px";
        container.style.right = "25px";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        document.body.appendChild(container);
    }

    // Crear toast individual
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.textContent = message;

    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.color = "white";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.minWidth = "200px";
    toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "all 0.35s ease";

    toast.style.background = type === "success" ? "#2ecc71" : "#e74c3c";

    container.appendChild(toast);

    // Animación entrada
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    // Eliminación automática
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}
