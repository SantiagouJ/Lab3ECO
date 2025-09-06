const express = require("express");
const path = require("path");
const fs = require("fs");
const { log } = require("console");
const app = express();

app.use(express.json());

//Json
const usersFile = path.join(__dirname, "db", "users.json");
const storesFile = path.join(__dirname, "db", "stores.json");
const productsFile = path.join(__dirname, "db", "products.json"); 
const ordersFile = path.join(__dirname, "db", "orders.json");

//Metodos http
//Verificacion del login POST
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    res.send({ role: user.role, userId: user.userId });
  } else {
    res.status(401);
    res.send({ message: "Credenciales inválidas" });
  }
});

app.get("/stores", (req, res) => {
  const stores = JSON.parse(fs.readFileSync(storesFile, "utf-8"));
  res.json(stores);
});

// Leer una tienda por ID
app.get("/stores/:storeId", (req, res) => {
  const { storeId } = req.params;
  const stores = JSON.parse(fs.readFileSync(storesFile, "utf-8"));
  const store = stores.find((s) => s.storeId == storeId);

  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  res.json(store);
});

// Productos de una tienda
app.get("/stores/:storeId/products", (req, res) => {
  const { storeId } = req.params;
  const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
  const storeProducts = products.filter((p) => p.storeId == storeId);

  res.json(storeProducts);
});

app.post("/orders", (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const { userId, items, paymentMethod, total } = req.body;

    // Validar campos requeridos
    if (!userId || !items || !items.length || !paymentMethod || total === undefined) {
      console.log('Validation failed:', { 
        hasUserId: !!userId, 
        hasItems: !!items, 
        itemsLength: items?.length, 
        hasPaymentMethod: !!paymentMethod, 
        hasTotal: total !== undefined 
      });
      return res.status(400).json({ 
        message: "Faltan datos requeridos",
        received: req.body
      });
    }

    // Validar que los items tengan los campos requeridos
    for (const item of items) {
      if (!item.id || !item.quantity || !item.storeId) {
        return res.status(400).json({ 
          message: "Datos de productos incompletos",
          item: item
        });
      }
    }

    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
    
    // Crear nueva orden
    const newOrder = {
      orderId: orders.length + 1,
      userId: userId,
      storeId: items[0].storeId,
      total: total,
      paymentMethod: paymentMethod,
      products: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    // Agregar nueva orden al arreglo de órdenes
    orders.push(newOrder);

    // Guardar órdenes actualizadas en el archivo
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: "Error al crear la orden",
      error: error.message 
    });
  }
});

//Rutas
app.use(express.static(path.join(__dirname, "public")));
app.use("/user", express.static(path.join(__dirname, "user")));
app.use("/rider", express.static(path.join(__dirname, "rider")));
app.use("/store", express.static(path.join(__dirname, "store")));

//Por si no hay
app.use((req, res) => {
  res.status(404).send("No se encontRó la ruta");
});

//Puerto
app.listen(5000, () => {
  console.log("server running at: http://localhost:5000/");
});
