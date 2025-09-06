function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";
  
  cart.forEach((cartItem) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${cartItem.name}</h3>
      <p>Cantidad: ${cartItem.quantity}</p>
      <p>Precio: $${cartItem.price}</p>
      <p>Total: $${cartItem.price * cartItem.quantity}</p>
      <button class="remove-from-cart">Eliminar</button>
    `;
    cartList.appendChild(div);
    
    const button = div.querySelector(".remove-from-cart");
    button.addEventListener("click", () => {
      let updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
      updatedCart = updatedCart.filter(item => item.id !== cartItem.id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      loadCart();
    });
  });
}

loadCart();

const button = document.getElementById("checkout");
button.addEventListener("click", () => {
  window.location.href = "/user/order.html";
});