import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database("malabez_bd_v4.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    stock INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    city TEXT,
    zip_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);

// Seed data if empty
const configCount = db.prepare("SELECT COUNT(*) as count FROM site_config").get() as { count: number };
if (configCount.count === 0) {
  const insertConfig = db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)");
  insertConfig.run("brand_story_image", "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=800");
  insertConfig.run("aesthetic_refinement_image", "https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=1920");
  insertConfig.run("hero_image", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920");
}

const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name) VALUES (?)");
  ["Panjabi", "Saree", "Clothing", "Shoes", "Bags", "Watches"].forEach(cat => {
    insertCategory.run(cat);
  });
}

const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)");
  
  // Panjabi
  insert.run("Premium Royal Silk Panjabi", "Hand-embroidered silk panjabi, perfect for Eid and weddings.", 4500, "Panjabi", "https://images.unsplash.com/photo-1597983073492-bc24159b4c03?auto=format&fit=crop&q=80&w=800");
  insert.run("Cotton Comfort Panjabi", "Breathable high-quality cotton panjabi for daily comfort.", 1850, "Panjabi", "https://images.unsplash.com/photo-1621335829175-95f437384d7c?auto=format&fit=crop&q=80&w=800");
  
  // Saree
  insert.run("Jamdani Heritage Saree", "Authentic hand-woven Dhakai Jamdani saree.", 8500, "Saree", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800");
  insert.run("Silk Katan Saree", "Rich silk katan saree with gorgeous par and anchal.", 12000, "Saree", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800");
  
  // Clothing
  insert.run("Formal Executive Shirt", "Slim-fit formal shirt for the modern professional.", 1450, "Clothing", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800");
  insert.run("Urban Denim Jacket", "Premium denim jacket for a stylish winter look.", 2800, "Clothing", "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=800");
  
  // Shoes
  insert.run("Genuine Leather Loafers", "Handcrafted leather loafers for ultimate style and comfort.", 3500, "Shoes", "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800");
  insert.run("Casual Urban Sneakers", "Trendy sneakers for everyday urban lifestyle.", 2200, "Shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800");
  
  // Bags
  insert.run("Traditional Festive Potli", "Gold-embroidered potli bag for festive occasions.", 1200, "Bags", "https://images.unsplash.com/photo-1614179662397-885f9a6ee23b?auto=format&fit=crop&q=80&w=800");
  insert.run("Executive Leather Laptop Bag", "Sleek and professional leather bag for work.", 4800, "Bags", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800");
  
  // Watches
  insert.run("Classic Silver Timepiece", "Elegant silver watch with a minimalist design.", 5500, "Watches", "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800");
  insert.run("Modern Smart Fitness Watch", "Advanced health tracking and notifications.", 3800, "Watches", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      res.json({ id: info.lastInsertRowid, email, name });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { userId, items, total, shippingAddress, city, zipCode } = req.body;
    const transaction = db.transaction(() => {
      const orderInfo = db.prepare("INSERT INTO orders (user_id, total, shipping_address, city, zip_code) VALUES (?, ?, ?, ?, ?)").run(userId, total, shippingAddress, city, zipCode);
      const orderId = orderInfo.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.price);
      }
      return orderId;
    });
    const orderId = transaction();
    res.json({ success: true, orderId });
  });

  app.post("/api/admin/upload", (req, res) => {
    const { image, fileName } = req.body;
    if (!image || !fileName) {
      return res.status(400).json({ error: "Missing image data or file name" });
    }

    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const safeFileName = `${Date.now()}-${fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
      const filePath = path.join(uploadsDir, safeFileName);
      
      fs.writeFileSync(filePath, buffer);
      
      const publicUrl = `/uploads/${safeFileName}`;
      console.log("File uploaded:", publicUrl);
      res.json({ url: publicUrl });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to save image" });
    }
  });

  // Admin Routes
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    console.log("Admin login attempt");
    if (password === "admin123") {
      res.json({ success: true, token: "admin-token-123" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.get("/api/config", (req, res) => {
    const config = db.prepare("SELECT * FROM site_config").all();
    const configMap = config.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(configMap);
  });

  app.post("/api/admin/config", (req, res) => {
    const { key, value } = req.body;
    console.log(`Updating config: ${key} = ${value}`);
    db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)").run(key, value);
    res.json({ success: true });
  });

  app.post("/api/admin/products", (req, res) => {
    const { name, description, price, category, image, stock } = req.body;
    console.log("Adding product:", { name, price, category });
    try {
      const info = db.prepare("INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)").run(name, description, price, category, image, stock || 10);
      res.json({ id: Number(info.lastInsertRowid) });
    } catch (err: any) {
      console.error("Error adding product:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image, stock } = req.body;
    console.log("Updating product:", id);
    try {
      db.prepare("UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?").run(name, description, price, category, image, stock, id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    const { id } = req.params;
    console.log("Deleting product:", id);
    try {
      const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
      console.log("Delete result:", info);
      res.json({ success: true, changes: info.changes });
    } catch (err: any) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Category Admin Routes
  app.post("/api/admin/categories", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
      res.json({ id: Number(info.lastInsertRowid), name });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/categories/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM categories WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/analytics", (req, res) => {
    try {
      const totalRevenue = db.prepare("SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'").get() as { total: number };
      const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
      const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
      const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
      
      const recentOrders = db.prepare(`
        SELECT o.*, u.name as user_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 5
      `).all();

      const salesByCategory = db.prepare(`
        SELECT p.category, SUM(oi.quantity * oi.price) as value
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.category
      `).all();

      const salesOverTime = db.prepare(`
        SELECT strftime('%Y-%m-%d', created_at) as date, SUM(total) as amount
        FROM orders
        WHERE created_at > date('now', '-7 days')
        GROUP BY date
        ORDER BY date ASC
      `).all();

      res.json({
        stats: {
          revenue: totalRevenue?.total || 0,
          orders: totalOrders?.count || 0,
          products: totalProducts?.count || 0,
          users: totalUsers?.count || 0
        },
        recentOrders,
        salesByCategory,
        salesOverTime
      });
    } catch (err: any) {
      console.error("Analytics error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
