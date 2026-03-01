import express from "express";
import { createClient } from '@supabase/supabase-js';
import path from "path";
import fs from "fs";

const supabaseUrl = 'https://uiihcsatdyjrqtninqwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaWhjc2F0ZHlqcnF0bmlucXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzE2NTIsImV4cCI6MjA4Nzc0NzY1Mn0.D7T8PlK6235S6kin2-_DMepBLDaxIirczrMAp_ERSC0';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
// Vercel already parses the body, so we only need express.json() for local development
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.urlencoded({ limit: '50mb', extended: true })(req, res, next);
});

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

  const orderItems = items.map((item) => ({
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
    // Return the base64 image directly to be saved in the database
    // This avoids Vercel's ephemeral /tmp storage issues
    res.json({ url: image });
  } catch (err) {
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.get("/api/image/:filename", (req, res) => {
  const { filename } = req.params;
  const tmpPath = path.join('/tmp', filename);
  const publicPath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  if (fs.existsSync(tmpPath)) {
    res.sendFile(tmpPath);
  } else if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.status(404).send("Not found");
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
  const counts = {};
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
  if (admin.email !== 'abdullah@malabaz.com') {
    query = query.eq('updated_by', admin.name);
  }
  
  const { data: history, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  
  res.json(history.map(h => ({ ...h, user_name: h.users?.name })));
});

app.put("/api/admin/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { password, profile_photo } = req.body;
  
  const updates = {};
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
  const configMap = data.reduce((acc, curr) => {
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
  res.json(data.map((o) => ({ ...o, user_name: o.users?.name })));
});

app.get("/api/admin/orders/:id/items", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('order_items').select('*, products(name)').eq('order_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map((i) => ({ ...i, product_name: i.products?.name })));
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
  res.json(data.map((t) => ({ ...t, user_name: t.users?.name, user_email: t.users?.email })));
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
    const salesByCategory = {};
    orderItems?.forEach((item) => {
       const cat = item.products?.category || 'Unknown';
       salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.quantity * item.price);
    });
    const salesByCategoryArray = Object.entries(salesByCategory).map(([category, value]) => ({ category, value }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentValidOrders = orders?.filter(o => new Date(o.created_at) > sevenDaysAgo) || [];
    const salesOverTimeMap = {};
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
      recentOrders: recentOrders?.map((o) => ({ ...o, user_name: o.users?.name })) || [],
      salesByCategory: salesByCategoryArray,
      salesOverTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default app;
