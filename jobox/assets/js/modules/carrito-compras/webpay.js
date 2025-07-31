export async function crearTransaccionWebpay({ amount, orderId, sessionId }) {
    const response = await fetch(`${BASE_URL_API}/webpay/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, orderId, sessionId }),
    });
  
    if (!response.ok) {
      throw new Error("Error al crear la transacción Webpay");
    }
    
    return response.json();
  }