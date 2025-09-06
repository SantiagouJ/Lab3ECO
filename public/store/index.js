import { checkRole, getUser } from "../utils.js";

// Verificar el rol
checkRole("store");

// Obtener el ID de la tienda
const { userId: storeId } = getUser();

// Función para cargar los productos
async function loadProducts() {
  try {
    console.log('Cargando productos para la tienda:', storeId);
    const response = await fetch(`/stores/${storeId}/products`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const products = await response.json();
    console.log('Productos recibidos:', products);
    
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    if (products.length === 0) {
      productList.innerHTML = '<p>No hay productos disponibles</p>';
      return;
    }
    
    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product-card';
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>Precio: $${product.price}</p>
      `;
      productList.appendChild(productElement);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    const productList = document.getElementById('product-list');
    productList.innerHTML = '<p>Error al cargar los productos</p>';
  }
}

// Manejar el envío del formulario
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    price: Number(document.getElementById('price').value),
    description: document.getElementById('description').value.trim(),
    image: document.getElementById('image').value.trim()
  };

  // Validaciones básicas
  if (!formData.name || !formData.description || !formData.image || formData.price <= 0) {
    alert('Por favor, completa todos los campos correctamente');
    return;
  }

  try {
    console.log('Enviando nuevo producto:', formData);
    const response = await fetch(`/stores/${storeId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el producto');
    }

    const newProduct = await response.json();
    console.log('Producto creado:', newProduct);

    // Limpiar el formulario
    e.target.reset();
    
    // Recargar la lista de productos
    await loadProducts();
    
    alert('Producto añadido exitosamente');
  } catch (error) {
    console.error('Error al crear producto:', error);
    alert(error.message || 'Error al añadir el producto');
  }
});

// Cargar productos al iniciar
loadProducts();

