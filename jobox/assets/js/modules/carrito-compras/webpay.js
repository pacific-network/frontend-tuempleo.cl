document.addEventListener('DOMContentLoaded', function () {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartTotalEl = document.getElementById('cartTotal');

  checkoutBtn.addEventListener('click', async function () {
    const total = parseInt(cartTotalEl.textContent);

    if (!total || total <= 0) {
      alert('El carrito está vacío o el monto no es válido.');
      return;
    }

    try {
      // Consumimos el endpoint de backend para iniciar Webpay
      const response = await fetch('http://localhost:3000/v1/webpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          // puedes agregar más campos si el backend lo requiere, como userId, ordenId, etc.
        }),
      });

      const data = await response.json();

      if (response.ok && data.url && data.token) {
        // Redireccionamos al formulario de Webpay con el token
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;

        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert('Error al iniciar el proceso de pago.');
        console.error('Respuesta inesperada:', data);
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      alert('Ocurrió un error al procesar el pago.');
    }
  });
});
