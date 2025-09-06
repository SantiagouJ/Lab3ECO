async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");

  const response = await fetch(`/stores/${storeId}/products`);
  const products = await response.json();
  console.log(products);
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  products.forEach((product) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>$${product.price}</p>
      <img src="${product.image}" alt="${product.name}">
      <button id="add-to-cart">Agregar al carrito</button>
    `;
    productList.appendChild(div);

    const button = div.querySelector("#add-to-cart");
    button.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartItem = {
        id: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        storeId: product.storeId
      };
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.location.href = '/user/cart.html';
    });
  });
}

loadProducts();