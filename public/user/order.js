import { getUser } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  // Obtener items del carrito desde localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderList = document.getElementById('order-list');

  // Mostrar items del carrito en la lista de orden
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.innerHTML = `
      <p>${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price * item.quantity}</p>
    `;
    orderList.appendChild(itemElement);
  });

  // Manejar el envío del formulario
  const paymentForm = document.getElementById('payment-form');
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const paymentMethod = document.getElementById('payment-method').value;
    if (!paymentMethod) {
      alert('Por favor seleccione un método de pago');
      return;
    }

    try {
      const orderData = {
        userId: user.userId,
        items: cart,
        paymentMethod: paymentMethod,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
      console.log('Sending order:', orderData);
      
      const response = await fetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          items: cart,
          paymentMethod: paymentMethod,
          total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      });

      if (response.ok) {
        // Limpiar carrito después de una orden exitosa
        localStorage.removeItem('cart');
        alert('¡Pedido realizado con éxito!');
        window.location.href = './index.html';
      } else {
        throw new Error('Error al procesar el pedido');
      }
    } catch (error) {
      alert('Error al procesar el pedido: ' + error.message);
    }
  });
});
