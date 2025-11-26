//assest/js/modules/utils/fetch-interceptor.js
const originalFetch = window.fetch;

// Cache global opcional
const globalCache = new Map();

window.fetch = async function (url, options = {}) {

    const method = (options.method || "GET").toUpperCase();

    console.log("📡 Fetch interceptado:", method, url);

    // Usar caché solo para GET
    const cacheKey = `${url}-${JSON.stringify(options || {})}`;
    if (method === "GET" && globalCache.has(cacheKey)) {
        console.log("⚡ Respuesta desde caché:", url);
        return globalCache.get(cacheKey).clone(); 
    }

    try {
        const response = await originalFetch(url, options);

        console.log("📥 Respuesta:", response.status, url);

        // guardar en caché solo GET
        if (method === "GET") {
            globalCache.set(cacheKey, response.clone());
        } else {
            // invalidación tipo React Query
            globalCache.clear();
            console.log("🗑️ Caché invalidado automáticamente");
        }

        return response;

    } catch (error) {
        console.error("❌ Error interceptado:", error);
        throw error;
    }
};
