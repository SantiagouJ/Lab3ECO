import { checkRole, getUser } from "../utils.js";

// Verificar el rol y obtener el ID del rider
checkRole("rider");
const { riderId } = getUser();

if (!riderId) {
  alert('Error: No se pudo obtener el ID del rider');
  window.location.href = '/';
}

// Función para cargar las órdenes disponibles
async function loadAvailableOrders() {
  try {
    const response = await fetch('/orders/available');
    if (!response.ok) {
      throw new Error('Error al obtener órdenes');
    }
    
    const orders = await response.json();
    const container = document.getElementById('available-orders');
    container.innerHTML = '';
    
    if (orders.length === 0) {
      container.innerHTML = '<p class="no-orders">No hay órdenes disponibles</p>';
      return;
    }
    
    orders.forEach(order => {
      const orderElement = createOrderElement(order, true);
      container.appendChild(orderElement);
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('available-orders').innerHTML = 
      '<p class="error">Error al cargar las órdenes disponibles</p>';
  }
}

// Función para cargar las órdenes aceptadas por el rider
async function loadAcceptedOrders() {
  try {
    console.log('Cargando órdenes aceptadas para el rider:', riderId);
    
    // Obtener el rider actual con sus órdenes
    const riderResponse = await fetch(`/riders/${riderId}`);
    if (!riderResponse.ok) {
      throw new Error('Error al obtener información del rider');
    }
    const rider = await riderResponse.json();
    console.log('Información del rider:', rider);
    
    // Obtener todas las órdenes para tener los detalles completos
    const ordersResponse = await fetch('/orders');
    if (!ordersResponse.ok) {
      throw new Error('Error al obtener las órdenes');
    }
    const allOrders = await ordersResponse.json();
    console.log('Todas las órdenes:', allOrders);
    
    const container = document.getElementById('accepted-orders');
    container.innerHTML = '';
    
    if (!rider.orders || rider.orders.length === 0) {
      container.innerHTML = '<p class="no-orders">No has aceptado ninguna orden aún</p>';
      return;
    }
    
    // Filtrar y mostrar solo las órdenes aceptadas por este rider
    const acceptedOrders = allOrders.filter(order => 
      rider.orders.some(riderOrder => riderOrder.orderId === order.orderId)
    );
    console.log('Órdenes aceptadas filtradas:', acceptedOrders);
    
    if (acceptedOrders.length === 0) {
      container.innerHTML = '<p class="no-orders">No se encontraron detalles de las órdenes aceptadas</p>';
      return;
    }
    
    acceptedOrders.forEach(order => {
      const orderElement = createOrderElement(order, false);
      container.appendChild(orderElement);
    });
  } catch (error) {
    console.error('Error al cargar órdenes aceptadas:', error);
    document.getElementById('accepted-orders').innerHTML = 
      '<p class="error">Error al cargar tus órdenes aceptadas: ' + error.message + '</p>';
  }
}

// Función para crear el elemento de orden usando el template
function createOrderElement(order, isAvailable) {
  const template = document.getElementById('order-template');
  const orderElement = template.content.cloneNode(true);
  
  // Llenar los datos de la orden
  orderElement.querySelector('.order-id').textContent = order.orderId;
  orderElement.querySelector('.order-total').textContent = `$${order.total}`;
  orderElement.querySelector('.store-id').textContent = order.storeId;
  orderElement.querySelector('.payment-method').textContent = 
    `Método de pago: ${order.paymentMethod}`;
  
  // Mostrar productos
  const productsList = orderElement.querySelector('.products-list');
  order.products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.textContent = `${product.quantity}x Producto #${product.productId}`;
    productsList.appendChild(productItem);
  });
  
  // Configurar botón de aceptar
  const acceptBtn = orderElement.querySelector('.accept-btn');
  if (!isAvailable) {
    acceptBtn.remove();
  } else {
    acceptBtn.addEventListener('click', async () => {
      try {
        const response = await fetch(`/riders/${riderId}/accept-order/${order.orderId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al aceptar la orden');
        }
        
        // Recargar ambas listas
        await Promise.all([loadAvailableOrders(), loadAcceptedOrders()]);
        alert('Orden aceptada exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al aceptar la orden');
      }
    });
  }
  
  return orderElement.firstElementChild;
}

// Cargar órdenes al iniciar
loadAvailableOrders();
loadAcceptedOrders();
