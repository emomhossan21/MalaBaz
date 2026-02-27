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
    payment_method TEXT,
    transaction_id TEXT,
    payment_phone TEXT,
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

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    profile_photo TEXT
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER,
    sender_type TEXT NOT NULL,
    sender_id INTEGER,
    message TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES support_tickets(id)
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.prepare("ALTER TABLE admins ADD COLUMN profile_photo TEXT").run();
} catch (e) {
  // Column might already exist
}

try {
  db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT").run();
  db.prepare("ALTER TABLE orders ADD COLUMN transaction_id TEXT").run();
  db.prepare("ALTER TABLE orders ADD COLUMN payment_phone TEXT").run();
} catch (e) {
  // Columns might already exist
}

try {
  db.prepare("ALTER TABLE orders ADD COLUMN updated_by TEXT").run();
} catch (e) {
  // Column might already exist
}

// Seed admins if empty
const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number };
if (adminCount.count === 0) {
  const insertAdmin = db.prepare("INSERT INTO admins (email, password, name) VALUES (?, ?, ?)");
  insertAdmin.run("abdullah@malabaz.com", "0504", "Emon Hossan Miazi");
  insertAdmin.run("azim@malabaz.com", "azim@123", "Azim Uddin");
}

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
    const { userId, items, total, shippingAddress, city, zipCode, paymentMethod, transactionId, paymentPhone } = req.body;
    const transaction = db.transaction(() => {
      const orderInfo = db.prepare("INSERT INTO orders (user_id, total, shipping_address, city, zip_code, payment_method, transaction_id, payment_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(userId, total, shippingAddress, city, zipCode, paymentMethod, transactionId, paymentPhone);
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

  app.get("/api/users/:id/orders", (req, res) => {
    const { id } = req.params;
    try {
      const orders = db.prepare(`
        SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
      `).all(id);
      
      const ordersWithItems = orders.map((order: any) => {
        const items = db.prepare(`
          SELECT oi.*, p.name, p.image 
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `).all(order.id);
        return { ...order, items };
      });
      
      res.json(ordersWithItems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
    const { email, password } = req.body;
    console.log("Admin login attempt:", email);
    
    const admin = db.prepare("SELECT * FROM admins WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (admin) {
      res.json({ success: true, token: "admin-token-123", admin: { id: admin.id, name: admin.name, email: admin.email, profile_photo: admin.profile_photo } });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.get("/api/admin/profile/:id/stats", (req, res) => {
    const { id } = req.params;
    try {
      const admin = db.prepare("SELECT name FROM admins WHERE id = ?").get(id) as any;
      if (!admin) return res.status(404).json({error: "Admin not found"});
      
      const stats = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        WHERE updated_by = ? 
        GROUP BY status
      `).all(admin.name);
      
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/profile/:id/history", (req, res) => {
    const { id } = req.params;
    try {
      const admin = db.prepare("SELECT email, name FROM admins WHERE id = ?").get(id) as any;
      if (!admin) return res.status(404).json({error: "Admin not found"});
      
      let history;
      if (admin.email === 'abdullah@malabaz.com') {
        history = db.prepare(`
          SELECT o.*, u.name as user_name 
          FROM orders o 
          LEFT JOIN users u ON o.user_id = u.id 
          WHERE o.status != 'pending'
          ORDER BY o.created_at DESC
        `).all();
      } else {
        history = db.prepare(`
          SELECT o.*, u.name as user_name 
          FROM orders o 
          LEFT JOIN users u ON o.user_id = u.id 
          WHERE o.status != 'pending' AND o.updated_by = ?
          ORDER BY o.created_at DESC
        `).all(admin.name);
      }
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/profile/:id", (req, res) => {
    const { id } = req.params;
    const { password, profile_photo } = req.body;
    
    try {
      if (password && profile_photo) {
        db.prepare("UPDATE admins SET password = ?, profile_photo = ? WHERE id = ?").run(password, profile_photo, id);
      } else if (password) {
        db.prepare("UPDATE admins SET password = ? WHERE id = ?").run(password, id);
      } else if (profile_photo) {
        db.prepare("UPDATE admins SET profile_photo = ? WHERE id = ?").run(profile_photo, id);
      }
      
      const updatedAdmin = db.prepare("SELECT id, email, name, profile_photo FROM admins WHERE id = ?").get(id) as any;
      res.json({ success: true, admin: updatedAdmin });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/admins", (req, res) => {
    try {
      const admins = db.prepare("SELECT id, email, name FROM admins").all();
      res.json(admins);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/admins", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare("INSERT INTO admins (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      res.json({ id: Number(info.lastInsertRowid), email, name });
    } catch (err: any) {
      res.status(500).json({ error: "Email already exists or invalid data" });
    }
  });

  app.delete("/api/admin/admins/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM admins WHERE id = ?").run(Number(id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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
      db.prepare("UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?").run(name, description, price, category, image, stock, Number(id));
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
      const productId = Number(id);
      
      // Delete related order items first to avoid orphaned records
      db.prepare("DELETE FROM order_items WHERE product_id = ?").run(productId);
      
      const info = db.prepare("DELETE FROM products WHERE id = ?").run(productId);
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
      db.prepare("DELETE FROM categories WHERE id = ?").run(Number(id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/orders", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, u.name as user_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `).all();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/orders/:id/items", (req, res) => {
    const { id } = req.params;
    try {
      const items = db.prepare(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(id);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, adminName } = req.body;
    try {
      db.prepare("UPDATE orders SET status = ?, updated_by = ? WHERE id = ?").run(status, adminName, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Support Routes
  app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    try {
      db.prepare("INSERT INTO subscribers (email) VALUES (?)").run(email);
      res.json({ success: true });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already subscribed' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  app.get("/api/admin/subscribers", (req, res) => {
    try {
      const subscribers = db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC").all();
      res.json(subscribers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/support/tickets/:userId", (req, res) => {
    try {
      const tickets = db.prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC").all(req.params.userId);
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/tickets", (req, res) => {
    const { user_id, subject, message, image_url } = req.body;
    try {
      const info = db.prepare("INSERT INTO support_tickets (user_id, subject) VALUES (?, ?)").run(user_id, subject);
      const ticketId = info.lastInsertRowid;
      db.prepare("INSERT INTO support_messages (ticket_id, sender_type, sender_id, message, image_url) VALUES (?, 'user', ?, ?, ?)").run(ticketId, user_id, message, image_url);
      res.json({ success: true, ticket_id: ticketId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/support/tickets/:ticketId/messages", (req, res) => {
    try {
      const messages = db.prepare("SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC").all(req.params.ticketId);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/support/tickets/:ticketId/messages", (req, res) => {
    const { sender_type, sender_id, message, image_url } = req.body;
    const ticketId = req.params.ticketId;
    try {
      db.prepare("INSERT INTO support_messages (ticket_id, sender_type, sender_id, message, image_url) VALUES (?, ?, ?, ?, ?)").run(ticketId, sender_type, sender_id, message, image_url);
      db.prepare("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(ticketId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/support/tickets", (req, res) => {
    try {
      const tickets = db.prepare(`
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM support_tickets t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.updated_at DESC
      `).all();
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/admin/support/tickets/:id/status", (req, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
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
