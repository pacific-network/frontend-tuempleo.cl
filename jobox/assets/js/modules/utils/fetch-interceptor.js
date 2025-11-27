// assets/js/modules/utils/fetch-interceptor.js
const originalFetch = window.fetch;

// Cache global para GET
const globalCache = new Map();

window.fetch = async function (url, options = {}) {
    options = options || {};
    const method = (options.method || "GET").toUpperCase();
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    console.log("📡 Fetch interceptado:", method, url);

    try {
        // Si es GET y ya está en caché
        if (method === "GET" && globalCache.has(cacheKey)) {
            console.log("⚡ Respuesta desde caché:", url);
            const cachedData = globalCache.get(cacheKey);
            return new Response(JSON.stringify(cachedData), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Ejecutar fetch real
        const response = await originalFetch(url, options);
        const contentType = response.headers.get("content-type") || "";

        // Clonar solo si es JSON para guardar en caché
        let data;
        if (contentType.includes("application/json")) {
            data = await response.clone().json();
        } else {
            data = await response.clone().text();
        }

        // Guardar en caché solo GET
        if (method === "GET") {
            globalCache.set(cacheKey, data);
        } else {
            // POST/PUT/DELETE → invalidar solo rutas relacionadas
            globalCache.forEach((v, k) => {
                if (k.includes(url)) globalCache.delete(k);
            });
            console.log("🗑️ Caché invalidado para:", url);
        }

        return response;
    } catch (error) {
        console.error("❌ Error interceptado:", error);
        throw error;
    }
};
