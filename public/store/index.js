import { checkRole } from "../utils.js";

checkRole("store");

// Fetch stores data
async function loadStores() {
  const response = await fetch("/stores");
  const stores = await response.json();

  console.log(stores);

  const storeList = document.getElementById("store-list");
  storeList.innerHTML = "";

  stores.forEach((store) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <h3>${store.name}</h3>
        <p>${store.description}</p>
        <button onclick="verProductos(${store.storeId})">Ver productos</button>
      `;
    storeList.appendChild(div);
  });
}

loadStores();
