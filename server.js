const express = require("express");
const path = require("path");
const fs = require("fs");
const { log } = require("console");
const app = express();

app.use(express.json());

//Jsons
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
    // Si el usuario es un rider, buscar su riderId correspondiente
    if (user.role === 'rider') {
      const riders = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "riders.json"), "utf-8"));
      const rider = riders[0]; // Por ahora solo hay un rider
      res.send({ role: user.role, userId: user.userId, riderId: rider.riderId });
    } else {
      res.send({ role: user.role, userId: user.userId });
    }
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

// Añadir un nuevo producto
app.post("/stores/:storeId/products", (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, price, description, image } = req.body;

    // Validar campos requeridos
    if (!name || !price || !description || !image) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
    
    // Crear nuevo producto
    const newProduct = {
      productId: products.length + 1,
      name,
      price: Number(price),
      description,
      image,
      storeId: Number(storeId)
    };

    // Agregar nuevo producto al arreglo
    products.push(newProduct);

    // Guardar productos actualizados en el archivo
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      message: "Error al crear el producto",
      error: error.message 
    });
  }
});

// Obtener todas las órdenes disponibles (no asignadas a ningún rider)
// Obtener información de un rider específico
app.get("/riders/:riderId", (req, res) => {
  try {
    const { riderId } = req.params;
    const riders = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "riders.json"), "utf-8"));
    
    const rider = riders.find(r => r.riderId == riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider no encontrado" });
    }
    
    res.json(rider);
  } catch (error) {
    console.error('Error al obtener información del rider:', error);
    res.status(500).json({ message: "Error al obtener información del rider" });
  }
});

// Obtener todas las órdenes
app.get("/orders", (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ message: "Error al obtener las órdenes" });
  }
});

app.get("/orders/available", (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
    const riders = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "riders.json"), "utf-8"));
    
    // Obtener los IDs de órdenes ya asignadas
    const assignedOrderIds = new Set();
    riders.forEach(rider => {
      rider.orders?.forEach(order => {
        assignedOrderIds.add(order.orderId);
      });
    });
    
    // Filtrar órdenes no asignadas
    const availableOrders = orders.filter(order => !assignedOrderIds.has(order.orderId));
    
    res.json(availableOrders);
  } catch (error) {
    console.error('Error al obtener órdenes disponibles:', error);
    res.status(500).json({ message: "Error al obtener las órdenes" });
  }
});

// Aceptar una orden
app.post("/riders/:riderId/accept-order/:orderId", (req, res) => {
  try {
    const { riderId, orderId } = req.params;
    
    // Leer archivos
    const riders = JSON.parse(fs.readFileSync(path.join(__dirname, "db", "riders.json"), "utf-8"));
    const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
    
    // Verificar que la orden existe
    const order = orders.find(o => o.orderId == orderId);
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    
    // Verificar que el rider existe
    const rider = riders.find(r => r.riderId == riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider no encontrado" });
    }
    
    // Verificar que la orden no está ya asignada
    const isOrderAssigned = riders.some(r => 
      r.orders?.some(o => o.orderId == orderId)
    );
    
    if (isOrderAssigned) {
      return res.status(400).json({ message: "La orden ya está asignada" });
    }
    
    // Añadir la orden al rider
    if (!rider.orders) {
      rider.orders = [];
    }
    rider.orders.push({
      orderId: Number(orderId),
      acceptedAt: new Date().toISOString()
    });
    
    // Guardar cambios
    fs.writeFileSync(path.join(__dirname, "db", "riders.json"), JSON.stringify(riders, null, 2));
    
    res.json({ message: "Orden aceptada exitosamente" });
  } catch (error) {
    console.error('Error al aceptar orden:', error);
    res.status(500).json({ message: "Error al aceptar la orden" });
  }
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
