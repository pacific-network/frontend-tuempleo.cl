// // ===============================================================
// // 📁 src/assets/js/modules/utils/dashboard-tabs.js
// // ===============================================================
// document.addEventListener("DOMContentLoaded", () => {
//   const tabs = document.querySelectorAll("#visitasTabs .nav-link");
//   const tabContents = document.querySelectorAll(".tab-pane");

//   if (!tabs.length) return;

//   tabs.forEach((tab) => {
//     tab.addEventListener("click", (e) => {
//       e.preventDefault();

//       // 🔹 Desactivar todos los tabs
//       tabs.forEach((t) => t.classList.remove("active"));

//       // 🔹 Ocultar todos los contenidos
//       tabContents.forEach((content) => {
//         content.classList.add("d-none");
//         content.classList.remove("active");
//       });

//       // 🔹 Activar el tab clickeado
//       tab.classList.add("active");

//       // 🔹 Mostrar contenido correspondiente
//       const tabId = tab.getAttribute("data-tab");
//       const target = document.getElementById(`tab-${tabId}`);
//       if (target) {
//         target.classList.remove("d-none");
//         target.classList.add("active");
//       }

//       // 🔹 Evento personalizado — permite que otros scripts reaccionen
//       const event = new CustomEvent("tabChanged", { detail: { tabId } });
//       document.dispatchEvent(event);
//     });
//   });

//   // ✅ Activar primer tab por defecto (si no hay ninguno activo)
//   const activeTab = document.querySelector("#visitasTabs .nav-link.active");
//   if (activeTab) {
//     const defaultTabId = activeTab.getAttribute("data-tab");
//     const target = document.getElementById(`tab-${defaultTabId}`);
//     if (target) {
//       target.classList.remove("d-none");
//       target.classList.add("active");
//     }
//   }
// });
// ===============================================================
// 📁 src/assets/js/modules/utils/dashboard-tabs.js
// ===============================================================
document.addEventListener("DOMContentLoaded", () => {
  // ===============================================================
  // 🔹 TABS PRINCIPALES DEL DASHBOARD
  // ===============================================================
  const tabs = document.querySelectorAll("#visitasTabs .nav-link");
  const tabContents = document.querySelectorAll(".tab-pane");

  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();

        // Desactivar todos los tabs
        tabs.forEach((t) => t.classList.remove("active"));

        // Ocultar todos los contenidos
        tabContents.forEach((content) => {
          content.classList.add("d-none");
          content.classList.remove("active");
        });

        // Activar el tab clickeado
        tab.classList.add("active");

        // Mostrar contenido correspondiente
        const tabId = tab.getAttribute("data-tab");
        const target = document.getElementById(`tab-${tabId}`);
        if (target) {
          target.classList.remove("d-none");
          target.classList.add("active");
        }

        // Evento personalizado (otros scripts pueden escucharlo)
        const event = new CustomEvent("tabChanged", { detail: { tabId } });
        document.dispatchEvent(event);
      });
    });

    // Activar primer tab por defecto
    const activeTab = document.querySelector("#visitasTabs .nav-link.active");
    if (activeTab) {
      const defaultTabId = activeTab.getAttribute("data-tab");
      const target = document.getElementById(`tab-${defaultTabId}`);
      if (target) {
        target.classList.remove("d-none");
        target.classList.add("active");
      }
    }
  }

  // ===============================================================
  // 🔸 SUB-TABS INTERNOS (por ejemplo: dentro de "Notificaciones")
  // ===============================================================
  const subTabs = document.querySelectorAll("#subNotifTabs .nav-link");
  const subContents = document.querySelectorAll(".subtab-content");

  if (subTabs.length) {
    subTabs.forEach((tab) => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();

        // Desactivar todos los sub-tabs
        subTabs.forEach((t) => t.classList.remove("active"));

        // Ocultar todos los contenidos
        subContents.forEach((c) => c.classList.add("d-none"));

        // Activar el clickeado
        this.classList.add("active");

        // Mostrar contenido correspondiente
        const id = this.dataset.subtab;
        const target = document.getElementById(`subtab-${id}`);
        if (target) target.classList.remove("d-none");
      });
    });

    // Activar primer sub-tab por defecto
    const activeSub = document.querySelector("#subNotifTabs .nav-link.active");
    if (activeSub) {
      const id = activeSub.dataset.subtab;
      const target = document.getElementById(`subtab-${id}`);
      if (target) target.classList.remove("d-none");
    }
  }
});
