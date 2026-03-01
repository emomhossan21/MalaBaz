import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const supabaseUrl = 'https://uiihcsatdyjrqtninqwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaWhjc2F0ZHlqcnF0bmlucXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzE2NTIsImV4cCI6MjA4Nzc0NzY1Mn0.D7T8PlK6235S6kin2-_DMepBLDaxIirczrMAp_ERSC0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data function
async function seedData() {
  const { count: adminCount } = await supabase.from('admins').select('*', { count: 'exact', head: true });
  if (adminCount === 0) {
    await supabase.from('admins').insert([
      { email: 'abdullah@malabez.com', password: '0504', name: 'Emon Hossan Miazi' },
      { email: 'azim@malabez.com', password: 'azim@123', name: 'Azim Uddin' }
    ]);
  }

  const { count: configCount } = await supabase.from('site_config').select('*', { count: 'exact', head: true });
  if (configCount === 0) {
    await supabase.from('site_config').insert([
      { key: 'brand_story_image', value: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=800' },
      { key: 'aesthetic_refinement_image', value: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=1920' },
      { key: 'hero_image', value: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920' }
    ]);
  }

  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  if (categoryCount === 0) {
    await supabase.from('categories').insert([
      { name: 'Panjabi' }, { name: 'Saree' }, { name: 'Clothing' },
      { name: 'Shoes' }, { name: 'Bags' }, { name: 'Watches' }
    ]);
  }

  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  if (productCount === 0) {
    await supabase.from('products').insert([
      { name: "Premium Royal Silk Panjabi", description: "Hand-embroidered silk panjabi, perfect for Eid and weddings.", price: 4500, category: "Panjabi", image: "https://images.unsplash.com/photo-1597983073492-bc24159b4c03?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Cotton Comfort Panjabi", description: "Breathable high-quality cotton panjabi for daily comfort.", price: 1850, category: "Panjabi", image: "https://images.unsplash.com/photo-1621335829175-95f437384d7c?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Jamdani Heritage Saree", description: "Authentic hand-woven Dhakai Jamdani saree.", price: 8500, category: "Saree", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Silk Katan Saree", description: "Rich silk katan saree with gorgeous par and anchal.", price: 12000, category: "Saree", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Formal Executive Shirt", description: "Slim-fit formal shirt for the modern professional.", price: 1450, category: "Clothing", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Urban Denim Jacket", description: "Premium denim jacket for a stylish winter look.", price: 2800, category: "Clothing", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Genuine Leather Loafers", description: "Handcrafted leather loafers for ultimate style and comfort.", price: 3500, category: "Shoes", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Casual Urban Sneakers", description: "Trendy sneakers for everyday urban lifestyle.", price: 2200, category: "Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Traditional Festive Potli", description: "Gold-embroidered potli bag for festive occasions.", price: 1200, category: "Bags", image: "https://images.unsplash.com/photo-1614179662397-885f9a6ee23b?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Executive Leather Laptop Bag", description: "Sleek and professional leather bag for work.", price: 4800, category: "Bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Classic Silver Timepiece", description: "Elegant silver watch with a minimalist design.", price: 5500, category: "Watches", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800", stock: 10 },
      { name: "Modern Smart Fitness Watch", description: "Advanced health tracking and notifications.", price: 3800, category: "Watches", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800", stock: 10 }
    ]);
  }
}

seedData().catch(console.error);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

  // API Routes
  app.get("/api/products", async (req, res) => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/categories", async (req, res) => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    const { data, error } = await supabase.from('users').insert([{ email, password, name }]).select().single();
    if (error) return res.status(400).json({ error: "User already exists" });
    res.json(data);
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
    if (data) {
      res.json(data);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { userId, items, total, shippingAddress, city, zipCode, paymentMethod, transactionId, paymentPhone } = req.body;
    
    const { data: order, error: orderError } = await supabase.from('orders').insert([{
      user_id: userId, total, shipping_address: shippingAddress, city, zip_code: zipCode,
      payment_method: paymentMethod, transaction_id: transactionId, payment_phone: paymentPhone
    }]).select().single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) return res.status(500).json({ error: itemsError.message });

    res.json({ success: true, orderId: order.id });
  });

  app.get("/api/users/:id/orders", async (req, res) => {
    const { id } = req.params;
    const { data: orders, error } = await supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { data: items } = await supabase.from('order_items').select('*, products(name, image)').eq('order_id', order.id);
      return { ...order, items: items?.map(item => ({ ...item, name: item.products?.name, image: item.products?.image })) };
    }));

    res.json(ordersWithItems);
  });

  app.post("/api/admin/upload", (req, res) => {
    const { image, fileName } = req.body;
    if (!image || !fileName) return res.status(400).json({ error: "Missing image data or file name" });

    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const safeFileName = `${Date.now()}-${fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
      const filePath = path.join(uploadsDir, safeFileName);
      
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${safeFileName}`;
      res.json({ url: publicUrl });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save image" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: admin, error } = await supabase.from('admins').select('*').eq('email', email).eq('password', password).single();
    if (admin) {
      res.json({ success: true, token: "admin-token-123", admin });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.get("/api/admin/profile/:id/stats", async (req, res) => {
    const { id } = req.params;
    const { data: admin } = await supabase.from('admins').select('name').eq('id', id).single();
    if (!admin) return res.status(404).json({error: "Admin not found"});
    
    const { data: orders } = await supabase.from('orders').select('status').eq('updated_by', admin.name);
    const counts: Record<string, number> = {};
    orders?.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    const result = Object.entries(counts).map(([status, count]) => ({ status, count }));
    res.json(result);
  });

  app.get("/api/admin/profile/:id/history", async (req, res) => {
    const { id } = req.params;
    const { data: admin } = await supabase.from('admins').select('email, name').eq('id', id).single();
    if (!admin) return res.status(404).json({error: "Admin not found"});
    
    let query = supabase.from('orders').select('*, users(name)').neq('status', 'pending').order('created_at', { ascending: false });
    if (admin.email !== 'abdullah@malabez.com') {
      query = query.eq('updated_by', admin.name);
    }
    
    const { data: history, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    
    res.json(history.map(h => ({ ...h, user_name: h.users?.name })));
  });

  app.put("/api/admin/profile/:id", async (req, res) => {
    const { id } = req.params;
    const { password, profile_photo } = req.body;
    
    const updates: any = {};
    if (password) updates.password = password;
    if (profile_photo) updates.profile_photo = profile_photo;
    
    const { data: admin, error } = await supabase.from('admins').update(updates).eq('id', id).select('id, email, name, profile_photo').single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, admin });
  });

  app.get("/api/admin/admins", async (req, res) => {
    const { data, error } = await supabase.from('admins').select('id, email, name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/admin/admins", async (req, res) => {
    const { email, password, name } = req.body;
    const { data, error } = await supabase.from('admins').insert([{ email, password, name }]).select().single();
    if (error) return res.status(500).json({ error: "Email already exists or invalid data" });
    res.json(data);
  });

  app.delete("/api/admin/admins/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/config", async (req, res) => {
    const { data, error } = await supabase.from('site_config').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const configMap = data.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(configMap);
  });

  app.post("/api/admin/config", async (req, res) => {
    const { key, value } = req.body;
    const { error } = await supabase.from('site_config').upsert([{ key, value }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/admin/products", async (req, res) => {
    const { name, description, price, category, image, stock } = req.body;
    const { data, error } = await supabase.from('products').insert([{ name, description, price, category, image, stock: stock || 10 }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: data.id });
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image, stock } = req.body;
    const { error } = await supabase.from('products').update({ name, description, price, category, image, stock }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/admin/categories", async (req, res) => {
    const { name } = req.body;
    const { data, error } = await supabase.from('categories').insert([{ name }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const { data, error } = await supabase.from('orders').select('*, users(name)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((o: any) => ({ ...o, user_name: o.users?.name })));
  });

  app.get("/api/admin/orders/:id/items", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('order_items').select('*, products(name)').eq('order_id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((i: any) => ({ ...i, product_name: i.products?.name })));
  });

  app.put("/api/admin/orders/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, adminName } = req.body;
    const { error } = await supabase.from('orders').update({ status, updated_by: adminName }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    const { error } = await supabase.from('subscribers').insert([{ email }]);
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Email already subscribed' });
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  });

  app.get("/api/admin/subscribers", async (req, res) => {
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/support/tickets/:userId", async (req, res) => {
    const { data, error } = await supabase.from('support_tickets').select('*').eq('user_id', req.params.userId).order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/support/tickets", async (req, res) => {
    const { user_id, subject, message, image_url } = req.body;
    const { data: ticket, error: ticketError } = await supabase.from('support_tickets').insert([{ user_id, subject }]).select().single();
    if (ticketError) return res.status(500).json({ error: ticketError.message });
    
    const { error: msgError } = await supabase.from('support_messages').insert([{
      ticket_id: ticket.id, sender_type: 'user', sender_id: user_id, message, image_url
    }]);
    if (msgError) return res.status(500).json({ error: msgError.message });
    
    res.json({ success: true, ticket_id: ticket.id });
  });

  app.get("/api/support/tickets/:ticketId/messages", async (req, res) => {
    const { data, error } = await supabase.from('support_messages').select('*').eq('ticket_id', req.params.ticketId).order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/support/tickets/:ticketId/messages", async (req, res) => {
    const { sender_type, sender_id, message, image_url } = req.body;
    const ticketId = req.params.ticketId;
    
    const { error: msgError } = await supabase.from('support_messages').insert([{
      ticket_id: ticketId, sender_type, sender_id, message, image_url
    }]);
    if (msgError) return res.status(500).json({ error: msgError.message });
    
    await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId);
    res.json({ success: true });
  });

  app.get("/api/admin/support/tickets", async (req, res) => {
    const { data, error } = await supabase.from('support_tickets').select('*, users(name, email)').order('updated_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((t: any) => ({ ...t, user_name: t.users?.name, user_email: t.users?.email })));
  });

  app.put("/api/admin/support/tickets/:id/status", async (req, res) => {
    const { status } = req.body;
    const { error } = await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      const validOrders = orders?.filter(o => o.status !== 'cancelled') || [];
      const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      const { data: recentOrders } = await supabase.from('orders').select('*, users(name)').order('created_at', { ascending: false }).limit(5);
      
      const { data: orderItems } = await supabase.from('order_items').select('*, products(category)');
      const salesByCategory: Record<string, number> = {};
      orderItems?.forEach((item: any) => {
         const cat = item.products?.category || 'Unknown';
         salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.quantity * item.price);
      });
      const salesByCategoryArray = Object.entries(salesByCategory).map(([category, value]) => ({ category, value }));

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentValidOrders = orders?.filter(o => new Date(o.created_at) > sevenDaysAgo) || [];
      const salesOverTimeMap: Record<string, number> = {};
      recentValidOrders.forEach(o => {
         const date = new Date(o.created_at).toISOString().split('T')[0];
         salesOverTimeMap[date] = (salesOverTimeMap[date] || 0) + o.total;
      });
      const salesOverTime = Object.entries(salesOverTimeMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        stats: {
          revenue: totalRevenue,
          orders: orders?.length || 0,
          products: totalProducts || 0,
          users: totalUsers || 0
        },
        recentOrders: recentOrders?.map((o: any) => ({ ...o, user_name: o.users?.name })) || [],
        salesByCategory: salesByCategoryArray,
        salesOverTime
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

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
