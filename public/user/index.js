import { checkRole } from "../utils.js";

checkRole("user");

//Mostrar tienda
async function loadStores() {
  const response = await fetch("/stores");
  const stores = await response.json();

  console.log(stores);

  const storeList = document.getElementById("store-list");
  storeList.innerHTML = " ";

  stores.forEach((store) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <h3>${store.name}</h3>
        <p>${store.description}</p>
        <button onclick="window.location.href = '/user/product.html?storeId=${store.storeId}'">Ver productos</button>
      `;
    storeList.appendChild(div);
  });
}

loadStores();

const backButton = document.querySelector("#back");
backButton.addEventListener("click", () => {
  window.location.href = "/user/cart.html";
});