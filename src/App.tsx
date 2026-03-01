import React, { useState, useEffect } from 'react';
import { ShoppingCart, User as UserIcon, LogIn, LogOut, X, Plus, Minus, CheckCircle, Package, Search, ArrowRight, ArrowLeft, Star, Moon, Sun, Settings, Trash2, Edit2, PlusCircle, Save, Upload, BarChart2, Shield, MessageSquare, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, User, CartItem } from './types';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import OrdersManager from './components/OrdersManager';
import AdminsManager from './components/AdminsManager';
import AdminProfile from './components/AdminProfile';
import ShippingPolicy from './components/ShippingPolicy';
import FAQ from './components/FAQ';
import ContactUs from './components/ContactUs';
import UserSupport from './components/UserSupport';
import AdminSupport from './components/AdminSupport';
import AboutUs from './components/AboutUs';
import SubscribersManager from './components/SubscribersManager';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [shippingDetails, setShippingDetails] = useState({ address: '', city: 'Dhaka', zipCode: '' });
  const [paymentDetails, setPaymentDetails] = useState({ method: 'cod', transactionId: '', phone: '', codPaymentMethod: 'bkash' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUser, setAdminUser] = useState<{id: number, name: string, email: string, profile_photo?: string} | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribeStatus('success');
        setSubscribeEmail('');
        setSubscribeMessage('Successfully subscribed!');
        setTimeout(() => setSubscribeStatus('idle'), 3000);
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Subscription failed');
        setTimeout(() => setSubscribeStatus('idle'), 3000);
      }
    } catch (err) {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  const [config, setConfig] = useState<Record<string, string>>({
    brand_story_image: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80&w=800',
    aesthetic_refinement_image: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=1920',
    hero_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920'
  });
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showOrdersManager, setShowOrdersManager] = useState(false);
  const [showAdminsManager, setShowAdminsManager] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showAdminSupport, setShowAdminSupport] = useState(false);
  const [showSubscribersManager, setShowSubscribersManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [activePage, setActivePage] = useState<'home' | 'shipping' | 'faq' | 'contact' | 'support' | 'about'>('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Expected array of products, got:", data);
          setProducts([]);
        }
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setProducts([]);
      });
    
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig(data);
        } else {
          console.error("Error fetching config:", data);
        }
      })
      .catch(err => {
        console.error("Error fetching config:", err);
      });

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Expected array of categories, got:", data);
          setCategories([]);
        }
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  useEffect(() => {
    if (isProfileOpen && user) {
      fetch(`/api/users/${user.id}/orders`)
        .then(res => res.json())
        .then(setUserOrders)
        .catch(console.error);
    }
  }, [isProfileOpen, user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setIsAuthOpen(false);
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setAuthError(data.error || 'Incorrect email or password. Please try again.');
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError('Network error during authentication. Please check your connection.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    if (res.ok) {
      const data = await res.json();
      setIsAdminAuthenticated(true);
      setAdminUser(data.admin);
      setAdminEmail('');
      setAdminPassword('');
    } else {
      setAdminAuthError('Incorrect admin email or password. Please try again.');
    }
  };

  const [tempConfig, setTempConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const [isSavingConfig, setIsSavingConfig] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');

  const addCategory = async () => {
    if (!newCategoryName) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure? This will not delete products in this category.')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string, isProduct: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(targetKey);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name })
        });
        const data = await res.json();
        if (res.ok) {
          if (isProduct && editingProduct) {
            setEditingProduct({ ...editingProduct, image: data.url });
          } else {
            setTempConfig(prev => ({ ...prev, [targetKey]: data.url }));
            // Auto-save for config images
            await updateConfig(targetKey, data.url);
          }
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        alert('Upload error');
      } finally {
        setIsUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateConfig = async (key: string, value: string) => {
    if (!value) return;
    setIsSavingConfig(key);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setConfig(prev => ({ ...prev, [key]: value }));
        alert('Config updated successfully!');
      } else {
        alert('Failed to update config');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSavingConfig(null);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    console.log("Client: Saving product", editingProduct);
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const url = editingProduct.id ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      
      if (res.ok) {
        console.log("Client: Product saved successfully");
        const updatedProducts = await fetch('/api/products').then(r => r.json());
        setProducts(updatedProducts);
        setEditingProduct(null);
        alert(editingProduct.id ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        const error = await res.json();
        console.error("Client: Error saving product", error);
        alert('Error saving product: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Client: Network error saving product", err);
      alert('Failed to save product. Please check your connection.');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    console.log("Client: Deleting product", id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        console.log("Client: Product deleted successfully");
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product deleted successfully!');
      } else {
        console.error("Client: Error deleting product");
        alert('Error deleting product');
      }
    } catch (err) {
      console.error("Client: Network error deleting product", err);
      alert('Failed to delete product.');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    setCheckoutStep('shipping');
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = shippingDetails.city === 'Dhaka' ? 60 : 120;
    const finalTotal = total + deliveryCharge;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        items: cart, 
        total: finalTotal,
        shippingAddress: shippingDetails.address,
        city: shippingDetails.city,
        zipCode: shippingDetails.zipCode,
        paymentMethod: paymentDetails.method === 'cod' ? `cod_${paymentDetails.codPaymentMethod}` : paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        paymentPhone: paymentDetails.phone
      })
    });
    if (res.ok) {
      setCheckoutStep('success');
      setCart([]);
      setShippingDetails({ address: '', city: 'Dhaka', zipCode: '' });
      setPaymentDetails({ method: 'cod', transactionId: '', phone: '', codPaymentMethod: 'bkash' });
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = shippingDetails.city === 'Dhaka' ? 60 : 120;
  const finalTotal = cartTotal + deliveryCharge;

  const scrollToProducts = () => {
    const element = document.getElementById('products-grid');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-slate-900 dark:text-slate-100 selection:bg-[#b8860b]/20 dark:selection:bg-[#b8860b]/30 selection:text-[#b8860b] dark:selection:text-[#b8860b] transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex flex-col leading-none cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <h1 className="text-3xl font-serif font-black tracking-tighter">
                <span className="text-[#b8860b]">Mala</span>
                <span className="text-[#1a2a44] dark:text-slate-100">Bez</span>
              </h1>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#1a2a44]/60 dark:text-slate-400 ml-0.5 mt-0.5">CLOTHING</span>
            </motion.div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
              <button onClick={() => setActivePage('home')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</button>
              <button onClick={() => setActivePage('home')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Collections</button>
              <button onClick={() => setActivePage('contact')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-600 dark:text-slate-400"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl px-4 py-2 gap-2 border border-slate-200/50 dark:border-slate-700/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#b8860b]/20 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 dark:text-slate-100 dark:placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsProfileOpen(true)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                    <UserIcon size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                  <button onClick={() => setUser(null)} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-2xl transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                >
                  <LogIn size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              )}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors group"
              >
                <ShoppingCart size={22} className="text-slate-600 dark:text-slate-400 group-hover:text-[#b8860b] transition-colors" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-[#b8860b] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900"
                    >
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {activePage !== 'home' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => setActivePage('home')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#b8860b] dark:text-slate-400 dark:hover:text-[#b8860b] transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      )}

      {activePage === 'home' ? (
        <>
          {/* Hero Section */}
          <header className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">
        <img 
          src={config.hero_image} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-black/30 to-transparent" />
        
        <div className="relative z-10 max-w-4xl px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-8xl md:text-[10rem] font-serif font-black text-white tracking-tighter mb-4 drop-shadow-2xl"
          >
            MalaBez
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/90 text-lg md:text-xl mb-12 font-medium uppercase tracking-[0.6em] drop-shadow-lg"
          >
            Premium Global Fashion
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <button 
              onClick={scrollToProducts}
              className="px-16 py-5 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 transition-all active:scale-95 shadow-2xl"
            >
              Shop Now
            </button>
          </motion.div>
        </div>
      </header>

      {/* Product Grid Header */}
      <section id="products-grid" className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Products</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="p-2 text-slate-400">
              <Search size={20} />
            </div>
            {['All', ...(Array.isArray(categories) ? categories.map(c => c.name) : [])].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  cat === selectedCategory 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:hover:shadow-[#b8860b]/10 transition-all duration-500"
            >
              <div 
                className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594932224828-b4b057b69b3d?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    {product.category}
                  </span>
                  {product.stock < 5 && (
                    <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Low Stock
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#b8860b] hover:text-white dark:hover:bg-[#b8860b]"
                >
                  Quick View
                </button>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="cursor-pointer" onClick={() => setSelectedProduct(product)}>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-[#b8860b] transition-colors dark:text-white">{product.name}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{product.category}</p>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">৳{product.price.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">{product.description}</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl text-sm font-bold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 group-hover:border-slate-900 dark:group-hover:border-white"
                >
                  <Plus size={18} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl">
                <img 
                  src={config.brand_story_image} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#b8860b] rounded-full flex items-center justify-center text-white font-black text-center p-4 rotate-12 shadow-xl">
                ESTD. <br /> 2026
              </div>
            </motion.div>
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-[#b8860b] font-bold uppercase tracking-widest text-sm mb-4 block">Global Fashion</span>
                <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8 dark:text-white">Curated with <br /> Premium Quality.</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                  MalaBez is your ultimate destination for premium global fashion. From authentic imported Chinese apparel to high-end modern clothing, we bring you top-tier international trends and premium quality products that elevate your everyday wardrobe with contemporary elegance.
                </p>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white block mb-1">100%</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Original Products</span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white block mb-1">24/7</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Customer Support</span>
                  </div>
                </div>
                <button onClick={() => setActivePage('about')} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Learn More About Us
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="bg-slate-900 dark:bg-slate-900/50 rounded-[64px] p-12 md:p-24 relative overflow-hidden border border-slate-800 group shadow-2xl">
          <img 
            src={config.aesthetic_refinement_image} 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=1920';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter mb-8 leading-[0.9]">
              Join the <br /><span className="text-[#b8860b]">Inner Circle.</span>
            </h3>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-md">
              Subscribe to get early access to new drops, exclusive offers, and curated style guides.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-slate-500 outline-none focus:border-[#b8860b] focus:bg-white/10 transition-all"
              />
              <button disabled={subscribeStatus === 'loading'} type="submit" className="bg-[#b8860b] text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#d4a017] transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-[#b8860b]/20 disabled:opacity-70">
                {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
            {subscribeStatus === 'success' && <p className="text-green-400 text-sm mt-4 font-bold">{subscribeMessage}</p>}
            {subscribeStatus === 'error' && <p className="text-red-400 text-sm mt-4 font-bold">{subscribeMessage}</p>}
            <p className="text-slate-500 text-[10px] mt-8 uppercase tracking-widest font-bold opacity-50">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </section>
        </>
      ) : activePage === 'shipping' ? (
        <ShippingPolicy />
      ) : activePage === 'faq' ? (
        <FAQ />
      ) : activePage === 'contact' ? (
        <ContactUs config={config} />
      ) : activePage === 'support' ? (
        <UserSupport user={user} />
      ) : activePage === 'about' ? (
        <AboutUs />
      ) : null}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`fixed right-0 top-0 bottom-0 ${checkoutStep === 'cart' ? 'w-full max-w-md' : 'w-full'} bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col transition-all duration-300`}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold dark:text-white">
                  {checkoutStep === 'cart' ? 'Your Cart' : checkoutStep === 'shipping' ? 'Shipping Details' : checkoutStep === 'payment' ? 'Payment Method' : 'Checkout'}
                </h3>
                <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto p-6 ${checkoutStep !== 'cart' ? 'max-w-3xl mx-auto w-full' : ''}`}>
                {checkoutStep === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#b8860b]/10 dark:bg-[#b8860b]/20 text-[#b8860b] rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 dark:text-white">Order Confirmed!</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Thank you for your purchase. We've sent a confirmation email to your inbox.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : checkoutStep === 'shipping' ? (
                  <div className="h-full flex flex-col">
                    <h4 className="text-xl font-bold mb-6 dark:text-white">Shipping Details</h4>
                    <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-4 flex-1">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Full Address</label>
                        <textarea 
                          required
                          value={shippingDetails.address}
                          onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white h-24 resize-none"
                          placeholder="House, Street, Area"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">City</label>
                          <select 
                            required
                            value={shippingDetails.city}
                            onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white"
                          >
                            <option value="Dhaka">Dhaka (৳60)</option>
                            <option value="Chattogram">Chattogram (৳120)</option>
                            <option value="Gazipur">Gazipur (৳120)</option>
                            <option value="Narayanganj">Narayanganj (৳120)</option>
                            <option value="Khulna">Khulna (৳120)</option>
                            <option value="Rajshahi">Rajshahi (৳120)</option>
                            <option value="Sylhet">Sylhet (৳120)</option>
                            <option value="Barishal">Barishal (৳120)</option>
                            <option value="Rangpur">Rangpur (৳120)</option>
                            <option value="Mymensingh">Mymensingh (৳120)</option>
                            <option value="Cumilla">Cumilla (৳120)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Zip Code</label>
                          <input 
                            required
                            type="text" 
                            value={shippingDetails.zipCode}
                            onChange={e => setShippingDetails({...shippingDetails, zipCode: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white"
                            placeholder="1200"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                ) : checkoutStep === 'payment' ? (
                  <div className="h-full flex flex-col">
                    <h4 className="text-xl font-bold mb-6 dark:text-white">Select Payment Method</h4>
                    <form id="payment-form" onSubmit={submitOrder} className="space-y-4 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['cod', 'bkash', 'nagad', 'rocket'].map(method => (
                          <label key={method} className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentDetails.method === method ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            <div className="flex items-center gap-3">
                              <input type="radio" name="paymentMethod" value={method} checked={paymentDetails.method === method} onChange={() => setPaymentDetails({...paymentDetails, method: method as any})} className="w-4 h-4 text-slate-900" />
                              <span className="font-bold uppercase tracking-wider dark:text-white">
                                {method === 'cod' ? 'Cash on Delivery' : method}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {paymentDetails.method !== 'cod' ? (
                        <div className="mt-6 space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Please send ৳{finalTotal.toLocaleString()} to our {paymentDetails.method.toUpperCase()} personal number: <strong className="text-slate-900 dark:text-white text-lg block mt-1">{config[`${paymentDetails.method}_number`] || 'Number not set'}</strong>
                          </p>
                          {config.payment_instructions && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm mb-4 border border-amber-200 dark:border-amber-800/30">
                              {config.payment_instructions}
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">{paymentDetails.method.toUpperCase()} Number</label>
                            <input required type="tel" value={paymentDetails.phone} onChange={e => setPaymentDetails({...paymentDetails, phone: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white" placeholder="01XXXXXXXXX" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Transaction ID</label>
                            <input required type="text" value={paymentDetails.transactionId} onChange={e => setPaymentDetails({...paymentDetails, transactionId: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white" placeholder="TrxID" />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h5 className="font-bold dark:text-white mb-2">Delivery Charge Payment</h5>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            To confirm your Cash on Delivery order, please pay the delivery charge of <strong>৳{deliveryCharge}</strong> in advance.
                          </p>
                          
                          <div className="flex gap-4 mb-4">
                            {['bkash', 'nagad'].map(method => (
                              <label key={`cod-${method}`} className={`flex-1 p-3 border rounded-xl cursor-pointer transition-colors ${paymentDetails.codPaymentMethod === method ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                <div className="flex items-center gap-2">
                                  <input type="radio" name="codPaymentMethod" value={method} checked={paymentDetails.codPaymentMethod === method} onChange={() => setPaymentDetails({...paymentDetails, codPaymentMethod: method})} className="w-4 h-4 text-slate-900" />
                                  <span className="font-bold uppercase tracking-wider text-sm dark:text-white">{method}</span>
                                </div>
                              </label>
                            ))}
                          </div>

                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Please send the delivery charge to our {paymentDetails.codPaymentMethod.toUpperCase()} personal number: <strong className="text-slate-900 dark:text-white text-lg block mt-1">{config[`${paymentDetails.codPaymentMethod}_number`] || 'Number not set'}</strong>
                          </p>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">{paymentDetails.codPaymentMethod.toUpperCase()} Number</label>
                            <input required type="tel" value={paymentDetails.phone} onChange={e => setPaymentDetails({...paymentDetails, phone: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white" placeholder="01XXXXXXXXX" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Transaction ID</label>
                            <input required type="text" value={paymentDetails.transactionId} onChange={e => setPaymentDetails({...paymentDetails, transactionId: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white" placeholder="TrxID" />
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.image} className="w-20 h-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-800" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm dark:text-white">{item.name}</h4>
                          <p className="text-slate-500 text-xs mb-2">৳{item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white"><Minus size={14} /></button>
                              <span className="w-8 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white"><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-medium">Remove</button>
                          </div>
                        </div>
                        <div className="text-sm font-bold dark:text-white">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && checkoutStep === 'cart' && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                    <span className="font-bold dark:text-white">৳{cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
              {checkoutStep === 'shipping' && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="max-w-3xl mx-auto w-full space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="font-bold dark:text-white">৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Delivery Charge</span>
                      <span className="font-bold dark:text-white">৳{deliveryCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 mb-4">
                      <span className="text-slate-900 dark:text-white font-bold">Total to pay</span>
                      <span className="font-bold text-lg dark:text-white">৳{finalTotal.toLocaleString()}</span>
                    </div>
                    <button 
                      type="submit"
                      form="shipping-form"
                      className="w-full bg-[#b8860b] text-white py-4 rounded-xl font-bold hover:bg-[#9a700a] transition-colors"
                    >
                      Continue to Payment
                    </button>
                    <button 
                      onClick={() => setCheckoutStep('cart')}
                      className="w-full mt-3 bg-transparent text-slate-500 dark:text-slate-400 py-2 rounded-xl font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}
              {checkoutStep === 'payment' && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="max-w-3xl mx-auto w-full space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="font-bold dark:text-white">৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Delivery Charge</span>
                      <span className="font-bold dark:text-white">৳{deliveryCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 mb-4">
                      <span className="text-slate-900 dark:text-white font-bold">Total to pay</span>
                      <span className="font-bold text-lg dark:text-white">৳{finalTotal.toLocaleString()}</span>
                    </div>
                    <button 
                      type="submit"
                      form="payment-form"
                      className="w-full bg-[#b8860b] text-white py-4 rounded-xl font-bold hover:bg-[#9a700a] transition-colors"
                    >
                      Confirm Order
                    </button>
                    <button 
                      onClick={() => setCheckoutStep('shipping')}
                      className="w-full mt-3 bg-transparent text-slate-500 dark:text-slate-400 py-2 rounded-xl font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Back to Shipping
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold dark:text-white">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                  <button onClick={() => { setIsAuthOpen(false); setAuthError(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
                </div>
                
                {authError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 text-sm flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <p>{authError}</p>
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Password</label>
                    <input 
                      required
                      type="password" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white transition-colors dark:text-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button 
                    onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
                    className="font-bold text-slate-900 dark:text-white hover:underline"
                  >
                    {authMode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">My Profile</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user.name} ({user.email})</p>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1">
                <h4 className="text-lg font-bold mb-6 dark:text-white">Order History</h4>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order) => (
                      <div key={order.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Order #{order.id}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                            {order.payment_method && (
                              <div className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                                Payment: <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{order.payment_method.replace('_', ' ')}</span>
                                {order.payment_method !== 'cod' && order.transaction_id && ` (TrxID: ${order.transaction_id})`}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                            <p className="font-bold dark:text-white">৳{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-slate-200 dark:bg-slate-700" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm dark:text-white">{item.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-lg transition-colors dark:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-slate-100 dark:bg-slate-800">
                <img 
                  src={selectedProduct.image} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594932224828-b4b057b69b3d?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                <span className="text-[#b8860b] font-bold uppercase tracking-widest text-xs mb-4 block">
                  {selectedProduct.category}
                </span>
                <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-6 dark:text-white">
                  {selectedProduct.name}
                </h3>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-8">
                  ৳{selectedProduct.price.toLocaleString()}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 leading-relaxed">
                  {selectedProduct.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Plus size={20} />
                    Add to Cart
                  </button>
                  <button className="px-8 py-5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white">
                    Add to Wishlist
                  </button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#b8860b]/10 dark:bg-[#b8860b]/20 rounded-xl flex items-center justify-center text-[#b8860b]">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Availability</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">In Stock ({selectedProduct.stock})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipping</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Free Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex flex-col leading-none mb-4">
              <h1 className="text-2xl font-serif font-black tracking-tighter">
                <span className="text-[#b8860b]">Mala</span>
                <span className="text-[#1a2a44] dark:text-slate-100">Bez</span>
              </h1>
              <span className="text-[8px] font-bold tracking-[0.3em] text-[#1a2a44]/60 dark:text-slate-400 ml-0.5 mt-0.5">CLOTHING</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              Premium imported and modern wear from around the globe. Elevate your wardrobe with MalaBez.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">Shop</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Panjabi</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Saree</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Clothing</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Bags</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">Support</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
              <li><button onClick={() => setActivePage('shipping')} className="hover:text-slate-900 dark:hover:text-white">Shipping Policy</button></li>
              <li><button onClick={() => setActivePage('support')} className="hover:text-slate-900 dark:hover:text-white">Returns & Exchanges</button></li>
              <li><button onClick={() => setActivePage('contact')} className="hover:text-slate-900 dark:hover:text-white">Contact Us</button></li>
              <li><button onClick={() => setActivePage('faq')} className="hover:text-slate-900 dark:hover:text-white">FAQ</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 text-center text-slate-400 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 MalaBez Bangladesh. All Rights Reserved.</p>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="opacity-40 hover:opacity-100 transition-all cursor-pointer text-[10px] flex items-center gap-1 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm"
          >
            <Settings size={12} className="animate-spin-slow" />
            Admin Dashboard
          </button>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl h-[100dvh] md:h-[90vh] bg-white dark:bg-slate-900 md:rounded-[48px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#b8860b] rounded-2xl flex items-center justify-center text-white">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight dark:text-white">Admin Dashboard</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Secure Management Console</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdminOpen(false)}
                  className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {!isAdminAuthenticated ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <form onSubmit={handleAdminLogin} className="w-full max-w-md text-center">
                    <h4 className="text-3xl font-black mb-8 dark:text-white">Restricted Access</h4>
                    
                    {adminAuthError && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30 text-sm flex items-start gap-3 text-left">
                        <div className="shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <p>{adminAuthError}</p>
                      </div>
                    )}

                    <input 
                      type="email" 
                      placeholder="Admin Email" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 mb-4 outline-none focus:ring-2 focus:ring-[#b8860b] transition-all dark:text-white"
                    />
                    <input 
                      type="password" 
                      placeholder="Admin Password" 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 mb-4 outline-none focus:ring-2 focus:ring-[#b8860b] transition-all dark:text-white"
                    />
                    <button className="w-full bg-[#b8860b] text-white py-4 rounded-2xl font-bold hover:bg-[#9a700a] transition-all active:scale-95">
                      Authorize Access
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                  {/* Sidebar */}
                  <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible shrink-0">
                    <button 
                      onClick={() => { setShowAnalytics(false); setShowOrdersManager(false); setShowCategoryManager(false); setShowAdminsManager(false); setShowAdminProfile(false); setShowAdminSupport(false); setShowSubscribersManager(false); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold ${!showAnalytics && !showOrdersManager && !showAdminsManager && !showAdminProfile && !showAdminSupport && !showSubscribersManager ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      Management
                    </button>
                    <button 
                      onClick={() => { setShowAnalytics(false); setShowOrdersManager(true); setShowAdminsManager(false); setShowAdminProfile(false); setShowAdminSupport(false); setShowSubscribersManager(false); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showOrdersManager ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      <Package size={18} /> Orders
                    </button>
                    <button 
                      onClick={() => { setShowAnalytics(false); setShowOrdersManager(false); setShowAdminsManager(false); setShowAdminProfile(false); setShowAdminSupport(true); setShowSubscribersManager(false); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showAdminSupport ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      <MessageSquare size={18} /> Support
                    </button>
                    <button 
                      onClick={() => { setShowAnalytics(false); setShowOrdersManager(false); setShowAdminsManager(false); setShowAdminProfile(false); setShowAdminSupport(false); setShowSubscribersManager(true); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showSubscribersManager ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      <Mail size={18} /> Subscribers
                    </button>
                    <button 
                      onClick={() => { setShowAnalytics(true); setShowOrdersManager(false); setShowAdminsManager(false); setShowAdminProfile(false); setShowAdminSupport(false); setShowSubscribersManager(false); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showAnalytics ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      <BarChart2 size={18} /> Analytics
                    </button>
                    {adminUser?.email === 'abdullah@malabez.com' && (
                      <button 
                        onClick={() => { setShowAnalytics(false); setShowOrdersManager(false); setShowAdminsManager(true); setShowAdminProfile(false); setShowAdminSupport(false); setShowSubscribersManager(false); }} 
                        className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showAdminsManager ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                      >
                        <Shield size={18} /> Admins
                      </button>
                    )}
                    <button 
                      onClick={() => { setShowAnalytics(false); setShowOrdersManager(false); setShowAdminsManager(false); setShowAdminProfile(true); setShowAdminSupport(false); setShowSubscribersManager(false); }} 
                      className={`whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${showAdminProfile ? 'bg-[#b8860b] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white'}`}
                    >
                      <UserIcon size={18} /> Profile
                    </button>
                    <button onClick={() => setIsAdminAuthenticated(false)} className="whitespace-nowrap mt-auto md:w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-bold flex items-center gap-2">
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {showAnalytics ? (
                      <AnalyticsDashboard />
                    ) : showOrdersManager ? (
                      <OrdersManager adminUser={adminUser} />
                    ) : showAdminSupport ? (
                      <AdminSupport adminUser={adminUser} />
                    ) : showSubscribersManager ? (
                      <SubscribersManager />
                    ) : showAdminsManager && adminUser?.email === 'abdullah@malabez.com' ? (
                      <AdminsManager />
                    ) : showAdminProfile ? (
                      <AdminProfile adminUser={adminUser} setAdminUser={setAdminUser} />
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                          <h4 className="text-2xl md:text-3xl font-black dark:text-white">Content Management</h4>
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => setShowCategoryManager(!showCategoryManager)}
                              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                                showCategoryManager 
                                  ? 'bg-[#b8860b] text-white shadow-lg' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Settings size={20} />
                              {showCategoryManager ? 'Close Category Manager' : 'Customize Categories'}
                            </button>
                            <button 
                              onClick={() => setEditingProduct({ name: '', description: '', price: 0, category: categories[0]?.name || '', image: '', stock: 10 })}
                              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                              <PlusCircle size={20} />
                              Add New Product
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {showCategoryManager && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-12"
                            >
                              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <h5 className="text-xl font-black mb-6 dark:text-white">Manage Categories</h5>
                                <div className="flex gap-4 mb-6">
                                  <input 
                                    type="text" 
                                    placeholder="New Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                  />
                                  <button 
                                    onClick={addCategory}
                                    className="bg-[#b8860b] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors flex items-center gap-2"
                                  >
                                    <PlusCircle size={14} /> Add Category
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(categories) && categories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm dark:text-white group">
                                      {cat.name}
                                      <button onClick={() => deleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  Note: Default categories are Panjabi, Saree, Clothing, Shoes, Bags, Watches.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Site Config Section */}
                    <div className="mb-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-6">
                        <h5 className="text-xl font-black dark:text-white">Site Visuals & Contact Info</h5>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                          Update site details
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Hero Banner Image</label>
                          <div className="flex flex-col gap-2 mb-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Image URL"
                                value={tempConfig.hero_image || ''}
                                onChange={(e) => setTempConfig({ ...tempConfig, hero_image: e.target.value })}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                              />
                              <button 
                                disabled={isSavingConfig === 'hero_image'}
                                onClick={() => updateConfig('hero_image', tempConfig.hero_image)}
                                className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                              >
                                {isSavingConfig === 'hero_image' ? '...' : 'Save'}
                              </button>
                            </div>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'hero_image')}
                                className="hidden" 
                                id="upload-hero"
                              />
                              <label 
                                htmlFor="upload-hero"
                                className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:border-[#b8860b] hover:text-[#b8860b] transition-all cursor-pointer"
                              >
                                {isUploading === 'hero_image' ? 'Uploading...' : <><Upload size={14} /> Upload Image</>}
                              </label>
                            </div>
                          </div>
                          {tempConfig.hero_image && (
                            <div className="h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={tempConfig.hero_image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Brand Story Image</label>
                          <div className="flex flex-col gap-2 mb-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Image URL"
                                value={tempConfig.brand_story_image || ''}
                                onChange={(e) => setTempConfig({ ...tempConfig, brand_story_image: e.target.value })}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                              />
                              <button 
                                disabled={isSavingConfig === 'brand_story_image'}
                                onClick={() => updateConfig('brand_story_image', tempConfig.brand_story_image)}
                                className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                              >
                                {isSavingConfig === 'brand_story_image' ? '...' : 'Save'}
                              </button>
                            </div>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'brand_story_image')}
                                className="hidden" 
                                id="upload-brand"
                              />
                              <label 
                                htmlFor="upload-brand"
                                className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:border-[#b8860b] hover:text-[#b8860b] transition-all cursor-pointer"
                              >
                                {isUploading === 'brand_story_image' ? 'Uploading...' : <><Upload size={14} /> Upload Image</>}
                              </label>
                            </div>
                          </div>
                          {tempConfig.brand_story_image && (
                            <div className="h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={tempConfig.brand_story_image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Aesthetic Refinement Image</label>
                          <div className="flex flex-col gap-2 mb-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Image URL"
                                value={tempConfig.aesthetic_refinement_image || ''}
                                onChange={(e) => setTempConfig({ ...tempConfig, aesthetic_refinement_image: e.target.value })}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                              />
                              <button 
                                disabled={isSavingConfig === 'aesthetic_refinement_image'}
                                onClick={() => updateConfig('aesthetic_refinement_image', tempConfig.aesthetic_refinement_image)}
                                className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                              >
                                {isSavingConfig === 'aesthetic_refinement_image' ? '...' : 'Save'}
                              </button>
                            </div>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'aesthetic_refinement_image')}
                                className="hidden" 
                                id="upload-aesthetic"
                              />
                              <label 
                                htmlFor="upload-aesthetic"
                                className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:border-[#b8860b] hover:text-[#b8860b] transition-all cursor-pointer"
                              >
                                {isUploading === 'aesthetic_refinement_image' ? 'Uploading...' : <><Upload size={14} /> Upload Image</>}
                              </label>
                            </div>
                          </div>
                          {tempConfig.aesthetic_refinement_image && (
                            <div className="h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={tempConfig.aesthetic_refinement_image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6 mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
                        <h5 className="text-xl font-black dark:text-white">Payment Configuration</h5>
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                          Checkout Settings
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">bKash Number</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. 01700000000"
                              value={tempConfig.bkash_number || ''}
                              onChange={(e) => setTempConfig({ ...tempConfig, bkash_number: e.target.value })}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                            />
                            <button 
                              disabled={isSavingConfig === 'bkash_number'}
                              onClick={() => updateConfig('bkash_number', tempConfig.bkash_number)}
                              className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                            >
                              {isSavingConfig === 'bkash_number' ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Nagad Number</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. 01700000000"
                              value={tempConfig.nagad_number || ''}
                              onChange={(e) => setTempConfig({ ...tempConfig, nagad_number: e.target.value })}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                            />
                            <button 
                              disabled={isSavingConfig === 'nagad_number'}
                              onClick={() => updateConfig('nagad_number', tempConfig.nagad_number)}
                              className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                            >
                              {isSavingConfig === 'nagad_number' ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Rocket Number</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="e.g. 01700000000"
                              value={tempConfig.rocket_number || ''}
                              onChange={(e) => setTempConfig({ ...tempConfig, rocket_number: e.target.value })}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                            />
                            <button 
                              disabled={isSavingConfig === 'rocket_number'}
                              onClick={() => updateConfig('rocket_number', tempConfig.rocket_number)}
                              className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                            >
                              {isSavingConfig === 'rocket_number' ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Instructions (Shown at checkout)</label>
                          <div className="flex gap-2">
                            <textarea 
                              placeholder="Enter instructions for customers..."
                              value={tempConfig.payment_instructions || ''}
                              onChange={(e) => setTempConfig({ ...tempConfig, payment_instructions: e.target.value })}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white min-h-[80px]"
                            />
                            <button 
                              disabled={isSavingConfig === 'payment_instructions'}
                              onClick={() => updateConfig('payment_instructions', tempConfig.payment_instructions)}
                              className="bg-[#b8860b] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#9a700a] transition-colors disabled:opacity-50 h-fit"
                            >
                              {isSavingConfig === 'payment_instructions' ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Product</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Category</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Price</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Stock</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {Array.isArray(products) && products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                                  <span className="font-bold dark:text-white">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{p.category}</td>
                              <td className="px-6 py-4 font-bold dark:text-white">৳{p.price}</td>
                              <td className="px-6 py-4 dark:text-white">{p.stock}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingProduct(p)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#b8860b] transition-colors">
                                    <Edit2 size={18} />
                                  </button>
                                  <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl p-8"
            >
              <h4 className="text-3xl font-black mb-8 dark:text-white">{editingProduct.id ? 'Edit Product' : 'Add Product'}</h4>
              <form onSubmit={saveProduct} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Price (৳)</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</label>
                    <select 
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white"
                    >
                      {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Product Image</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        required
                        type="text" 
                        placeholder="Image URL"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white"
                      />
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'product_image', true)}
                          className="hidden" 
                          id="upload-product"
                        />
                        <label 
                          htmlFor="upload-product"
                          className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-500 hover:border-[#b8860b] hover:text-[#b8860b] transition-all cursor-pointer"
                        >
                          {isUploading === 'product_image' ? 'Uploading...' : <><Upload size={18} /> Upload Image from Computer</>}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                    <textarea 
                      required
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#b8860b] dark:text-white h-32"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-4 rounded-2xl font-bold border-2 border-slate-100 dark:border-slate-800 dark:text-white">Cancel</button>
                  <button type="submit" className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                    <Save size={20} />
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
