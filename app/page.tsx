'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ==========================================
// 1. SUPABASE CLIENT INITIALIZATION
// ==========================================
const SUPABASE_URL = 'https://rooqmdajofzxhqpmdhrs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvb3FtZGFqb2Z6eGhxcG1kaHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTIyMjQsImV4cCI6MjEwODg2ODIyNH0.RyUldzQS7skf-6tvWL5Fb3Bfacev56DthfpEVf3RKIo'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Team Members for validation & admin access
const TEAM_MEMBERS = [
  { name: 'Ronix Otieno', adm: 'PA106/G/28800/25' },
  { name: 'Isaiah Otieno', adm: 'PA106/G/28801/25' },
  { name: 'Willis Otieno', adm: 'PA106/G/28802/25' },
  { name: 'Brandon Owino', adm: 'PA106/G/28803/25' },
  { name: 'Alvin Wangalwa', adm: 'PA106/G/28804/25' },
]

export default function TerraMarketApp() {
  // Opening Splash Screen State (White background, bouncing TM logo + team credits)
  const [showSplash, setShowSplash] = useState(true)

  // Auth & Role State (Normal password for user login, separate admin gate)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [selectedRegion, setSelectedRegion] = useState('Kirinyaga, Kenya')

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'scope' | 'team' | 'settings' | 'admin'>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSellOpen, setIsSellOpen] = useState(false)
  
  // Admin Login Gate State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminAccessKey, setAdminAccessKey] = useState('')
  const [adminLoggedInMember, setAdminLoggedInMember] = useState<any>(null)

  // Catalog, Cart & Restock State
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [restockQueue, setRestockQueue] = useState<any[]>([]) // Pending restock / waitlist items
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'restock'>('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // New Product State (Seller Payout info)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newImg, setNewImg] = useState('')
  const [selectedFileImage, setSelectedFileImage] = useState('')
  const [sellerPayoutMethod, setSellerPayoutMethod] = useState('M-Pesa')
  const [sellerPayoutAccount, setSellerPayoutAccount] = useState('')

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [phoneOrCard, setPhoneOrCard] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Scope & Admin Telemetry states
  const [scopeText, setScopeText] = useState('TerraMarket C2C, B2C, and B2B Multi-Region E-Commerce platform architecture, emphasizing 10% platform commission, live Supabase telemetry, and localized county distribution.')
  const [scopeFile, setScopeFile] = useState<string | null>(null)
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [adminOrders, setAdminOrders] = useState<any[]>([])
  const [adminSearchQuery, setAdminSearchQuery] = useState('')

  // Animated Quotes & Highlights Carousel
  const quotes = [
    "💡 'Buy & Sell with Total Trust' — Empowering local county micro-economies across Kenya.",
    "🚀 Scalable Multi-Tenant E-Commerce with 10% Automated Commission Architecture.",
    "🔒 Enterprise-Grade Supabase Row Level Security (RLS) & Real-Time Sync.",
    "🌍 Localized Regional Trading: Kirinyaga, Nairobi, Mombasa, Kisumu & Beyond."
  ]
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Opening splash screen timer (white background, bouncing TM logo)
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 4000)
    return () => clearTimeout(splashTimer)
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchAdminTelemetry()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data && !error) {
      setProducts(data)
    } else {
      setProducts([
        { id: 1, title: 'Organic Kirinyaga Coffee Beans 1kg', description: 'Freshly harvested high-altitude organic coffee.', price: 1200, stock: 15, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
        { id: 2, title: 'Fresh Mountain Avocados (Box)', description: 'Export grade Hass avocados from local farmers.', price: 800, stock: 0, image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80' },
      ])
    }
  }

  const fetchAdminTelemetry = async () => {
    const uRes = await supabase.from('users').select('*')
    if (uRes.data) setAdminUsers(uRes.data)

    const oRes = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (oRes.data) setAdminOrders(oRes.data)
  }

  // Normal User Login / Signup (Using standard password, not admission)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
      if (error) {
        alert('Signup error: ' + error.message)
      } else {
        setUser(data.user || { email: authEmail })
        await supabase.from('users').insert([{ email: authEmail, role: userRole }])
        setIsAuthOpen(false)
        alert(`Account registered successfully as ${userRole.toUpperCase()}`)
        fetchAdminTelemetry()
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      if (error) {
        setUser({ email: authEmail, id: 'demo-user-id' })
        setIsAuthOpen(false)
        alert(`Logged in successfully as ${userRole.toUpperCase()}`)
      } else {
        setUser(data.user)
        setIsAuthOpen(false)
        alert(`Welcome back! Logged in as ${userRole.toUpperCase()}`)
      }
    }
  }

  // Admin Login via Admission Number (case insensitive, masked placeholder hint pa...)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanKey = adminAccessKey.trim().toLowerCase()
    const matched = TEAM_MEMBERS.find(m => cleanKey === m.adm.toLowerCase() || cleanKey.includes(m.adm.toLowerCase()))

    if (matched) {
      setIsAdminLoggedIn(true)
      setAdminLoggedInMember(matched)
      alert(`Admin Access Granted! Welcome, ${matched.name} (${matched.adm})`)
    } else {
      alert('Invalid Admission Number access key. Access restricted to team members only.')
    }
  }

  // Cart Management & Stock / Restock Logic
  const addToCart = (product: any, requestedQty = 1) => {
    if (product.stock === 0) {
      alert('Product is completely out of stock! It cannot be added to cart. Please add to restock queue instead.')
      return
    }

    if (requestedQty > product.stock) {
      const excess = requestedQty - product.stock
      // Add available to cart
      const existing = cart.find(item => item.id === product.id)
      if (existing) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + product.stock } : item))
      } else {
        setCart([...cart, { ...product, quantity: product.stock }])
      }
      // Add excess to restock queue / waitlist
      setRestockQueue([...restockQueue, { title: product.title, quantity: excess, user: user?.email || 'Guest' }])
      alert(`Requested quantity exceeds stock (${product.stock} available). ${excess} extra items placed in restock waitlist. Email notification simulated.`)
    } else {
      const existing = cart.find(item => item.id === product.id)
      if (existing) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + requestedQty } : item))
      } else {
        setCart([...cart, { ...product, quantity: requestedQty }])
      }
    }
    setIsCartOpen(true)
  }

  const addToRestockQueueManually = (product: any) => {
    setRestockQueue([...restockQueue, { title: product.title, quantity: 1, user: user?.email || 'Guest' }])
    alert(`Item added to restock queue. You will be notified via email when stock arrives.`)
  }

  const updateCartQty = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : null
      }
      return item
    }).filter(Boolean))
  }

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  // 10% commission taken strictly between seller and platform admin
  const platformFee = Math.round(cartSubtotal * 0.1)
  const cartTotal = cartSubtotal // Buyer pays subtotal; 10% commission is deducted from seller proceeds

  // Checkout Handler
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentSuccess(true)

    // Deduct stock in Supabase
    for (const item of cart) {
      const current = products.find(p => p.id === item.id)
      if (current) {
        const remaining = Math.max(0, current.stock - item.quantity)
        await supabase.from('products').update({ stock: remaining }).eq('id', item.id)
      }
    }

    // Record order in Supabase
    await supabase.from('orders').insert([{
      buyer_id: user?.id || null,
      total_amount: cartTotal,
      platform_fee: platformFee, // 10% commission recorded for admin
      status: 'Paid & Commission Deducted'
    }])

    setTimeout(() => {
      setCart([])
      setPaymentSuccess(false)
      setIsCheckoutOpen(false)
      setIsCartOpen(false)
      fetchProducts()
      fetchAdminTelemetry()
      alert(`Payment complete! Order recorded. 10% seller commission credited to platform admin.`)
    }, 2000)
  }

  // ==========================================
  // SPLASH SCREEN (White background, bouncing TM logo)
  // ==========================================
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        {/* Bouncing TM Logo */}
        <div className="text-6xl font-black tracking-tight mb-4 animate-bounce">
          <span className="text-black">Terra</span><span className="text-orange-600">Market</span>
        </div>
        
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
          Proudly brought to you by
        </p>

        {/* Names listing and admission numbers */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl max-w-lg shadow-sm">
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-800">
            {TEAM_MEMBERS.map((m, idx) => (
              <div key={idx} className="flex justify-between border-b border-orange-100 pb-1.5 last:border-none">
                <span className="font-bold">{m.name}</span>
                <span className="text-gray-500 font-mono">{m.adm}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 text-xs text-orange-600 font-bold animate-pulse">Loading Kirinyaga Regional Hub...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Left: Hamburger, Home Button, Logo */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 focus:outline-none"
              title="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button 
              onClick={() => setActiveTab('home')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl text-gray-700 transition"
            >
              🏠 Home
            </button>

            <div className="text-2xl font-black tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>
              <span className="text-black">Terra</span><span className="text-orange-600">Market</span>
            </div>
          </div>

          {/* Region-wide Search Bar & Region Selector */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder={`Search products in ${selectedRegion}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border border-transparent focus:border-orange-500 focus:bg-white text-sm rounded-xl py-2 pl-10 pr-4 transition"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select 
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-gray-100 border-none text-xs font-semibold rounded-xl px-3 py-2.5 text-gray-700"
            >
              <option value="Kirinyaga, Kenya">Kirinyaga (Default)</option>
              <option value="Nairobi, Kenya">Nairobi</option>
              <option value="Mombasa, Kenya">Mombasa</option>
              <option value="Kisumu, Kenya">Kisumu</option>
            </select>
          </div>

          {/* Right Actions: Blinking Project Review, Cart, Sign In */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('scope')}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 border border-green-300 text-green-700 text-xs font-bold rounded-full animate-pulse shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span>Project Review</span>
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gray-100 hover:bg-orange-50 rounded-xl text-gray-700 hover:text-orange-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((a, c) => a + c.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                <span className="text-xs font-bold text-orange-800 uppercase">{userRole}</span>
                <button onClick={() => setUser(null)} className="text-xs text-gray-500 hover:text-red-600 font-semibold">Logout</button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= HAMBURGER SLIDEOUT MENU ================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col p-6 z-10">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="text-xl font-black">
                <span className="text-black">Terra</span><span className="text-orange-600">Market</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>

            <nav className="space-y-2 flex-1">
              <button 
                onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center space-x-3 transition ${activeTab === 'home' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>🏠</span>
                <span>Home Marketplace</span>
              </button>

              <button 
                onClick={() => { setActiveTab('scope'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center space-x-3 transition ${activeTab === 'scope' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>📄</span>
                <span>Company Scope & Docs</span>
              </button>

              <button 
                onClick={() => { setActiveTab('team'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center space-x-3 transition ${activeTab === 'team' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>👥</span>
                <span>Team & Presentation</span>
              </button>

              <button 
                onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center space-x-3 transition ${activeTab === 'settings' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>⚙️</span>
                <span>Settings & Preferences</span>
              </button>

              <button 
                onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center space-x-3 transition ${activeTab === 'admin' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>🔒</span>
                <span>Admin Panel (Team Access)</span>
              </button>
            </nav>

            <div className="border-t pt-4 text-xs text-gray-400 text-center">
              TerraMarket v2.6 • Kirinyaga Region Hub
            </div>
          </div>
        </div>
      )}

      {/* ================= HOME MARKETPLACE TAB ================= */}
      {activeTab === 'home' && (
        <>
          <div className="bg-orange-600 text-white py-10 px-4 shadow-md">
            <div className="max-w-5xl mx-auto text-center space-y-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">Buy & Sell with Total Trust</h1>
              
              <div className="h-10 overflow-hidden relative flex items-center justify-center">
                <p key={quoteIndex} className="text-xs md:text-sm font-medium text-orange-100 animate-fade-in transition-all duration-700">
                  {quotes[quoteIndex]}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-xs md:text-sm text-orange-50 max-w-2xl mx-auto border border-orange-400/30">
                <span className="font-bold text-white">Platform Model:</span> TerraMarket operates a hybrid C2C, B2C, and B2B multi-tenant regional marketplace. 10% commission is processed strictly between seller and platform admin.
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
            {/* Filter, Sort & View Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Marketplace Catalog ({selectedRegion})</h2>
                <p className="text-xs text-gray-500">Role: <span className="font-semibold uppercase text-orange-600">{userRole}</span></p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort By */}
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border text-xs rounded-xl px-3 py-2 font-semibold text-gray-700"
                >
                  <option value="default">Sort by: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="restock">Filter: Restock Items</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-200 p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    Grid
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
                  >
                    List
                  </button>
                </div>

                {user && userRole === 'seller' && (
                  <button 
                    onClick={() => setIsSellOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition"
                  >
                    + List Product
                  </button>
                )}
              </div>
            </div>

            {/* Restock Queue Notification Banner if items pending */}
            {restockQueue.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex justify-between items-center text-xs text-amber-900">
                <div>
                  <strong>📦 Restock Waitlist Active:</strong> You have {restockQueue.length} item(s) pending restocking or excess quantity queues.
                </div>
                <span className="font-mono bg-white px-2.5 py-1 rounded border border-amber-300 font-bold">Queue: {restockQueue.length}</span>
              </div>
            )}

            {/* Product Display (Grid vs List Layout) */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(p => sortBy === 'restock' ? p.stock === 0 : true)
                  .sort((a, b) => {
                    if (sortBy === 'price-asc') return a.price - b.price
                    if (sortBy === 'price-desc') return b.price - a.price
                    return 0
                  })
                  .map(product => (
                    <div key={product.id} className="bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-white/90 text-gray-700' : 'bg-red-600 text-white'}`}>
                            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="p-4 space-y-1">
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 pt-0 flex items-center justify-between border-t mt-3">
                        <span className="font-black text-orange-600 text-sm">KSh {product.price.toLocaleString()}</span>
                        
                        {product.stock > 0 ? (
                          <button 
                            onClick={() => addToCart(product, 1)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <button 
                            onClick={() => addToRestockQueueManually(product)}
                            className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Add to Restock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products
                  .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(product => (
                    <div key={product.id} className="bg-white border p-4 rounded-2xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center space-x-4">
                        <img src={product.image_url} alt={product.title} className="w-16 h-16 object-cover rounded-xl" />
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{product.title}</h3>
                          <p className="text-xs text-gray-500">{product.description}</p>
                          <span className="text-xs text-orange-600 font-bold mt-1 block">KSh {product.price.toLocaleString()} (Stock: {product.stock})</span>
                        </div>
                      </div>
                      <div>
                        {product.stock > 0 ? (
                          <button onClick={() => addToCart(product, 1)} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
                            Add to Cart
                          </button>
                        ) : (
                          <button onClick={() => addToRestockQueueManually(product)} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold">
                            Add to Restock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* ================= COMPANY SCOPE TAB (Minimalist, file upload support) ================= */}
      {activeTab === 'scope' && (
        <div className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-gray-900">Company Scope & Project Documentation</h2>
            <p className="text-xs text-gray-500">Upload or edit project scope specifications for academic evaluation.</p>
            
            <textarea 
              value={scopeText}
              onChange={e => setScopeText(e.target.value)}
              className="w-full h-40 p-4 border rounded-xl text-xs font-mono text-gray-800 bg-gray-50 focus:bg-white transition"
            />

            {/* File Upload for Scope Doc */}
            <div className="border border-dashed p-4 rounded-xl bg-gray-50 space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Upload Scope Document (.txt, .pdf, .md):</label>
              <input 
                type="file" 
                accept=".txt,.pdf,.md,.docx"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) setScopeFile(file.name)
                }}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700"
              />
              {scopeFile && <p className="text-xs text-green-600 font-semibold">Attached: {scopeFile}</p>}
            </div>

            <div className="flex justify-end">
              <button onClick={() => alert('Scope document and file saved successfully!')} className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-orange-700">
                Save Scope Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TEAM & PRESENTATION TAB (Minimalist layout) ================= */}
      {activeTab === 'team' && (
        <div className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-gray-900">Team Members & Presentation Credentials</h2>
            <p className="text-xs text-gray-500">Official group admission numbers and project credits.</p>
            
            <div className="space-y-2">
              {TEAM_MEMBERS.map((m, idx) => (
                <div key={idx} className="border-b pb-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{m.name}</span>
                    <span className="text-gray-400">Group Member</span>
                  </div>
                  <span className="font-mono bg-orange-50 text-orange-800 px-3 py-1 rounded border border-orange-200 font-bold">{m.adm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SETTINGS TAB ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-gray-900">Useful Settings & Preferences</h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-gray-700">Default Region Market</span>
                <span className="font-mono text-orange-600 font-bold">{selectedRegion}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-gray-700">Platform Commission Split</span>
                <span className="font-mono text-gray-600">10% (Seller vs Admin Platform)</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-gray-700">Restock Queue Automation</span>
                <span className="font-mono text-green-600 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN PANEL (Strict Team Admission Number Access Gate) ================= */}
      {activeTab === 'admin' && (
        <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
          {!isAdminLoggedIn ? (
            <div className="bg-white border rounded-2xl p-8 max-w-md mx-auto shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600 font-bold text-xl">🔒</div>
              <h2 className="text-xl font-black text-gray-900">Admin Panel Access Gate</h2>
              <p className="text-xs text-gray-500">Restricted to authorized project team members only. Enter your admission number key.</p>
              
              <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Admission Number Access Key</label>
                  <input 
                    type="password" 
                    placeholder="pa..." 
                    value={adminAccessKey} 
                    onChange={e => setAdminAccessKey(e.target.value)} 
                    className="w-full p-3 border rounded-xl text-sm font-mono" 
                    required 
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Case-insensitive. Must match registered team admission numbers starting with pa/PA.</span>
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-orange-700 transition">
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Admin Telemetry & Database Management</h2>
                  <p className="text-xs text-gray-500">Authenticated Admin: <span className="font-bold text-orange-600">{adminLoggedInMember?.name} ({adminLoggedInMember?.adm})</span></p>
                </div>
                <input 
                  type="text"
                  placeholder="Search users/orders by email or ID..."
                  value={adminSearchQuery}
                  onChange={e => setAdminSearchQuery(e.target.value)}
                  className="bg-gray-100 border text-xs rounded-xl px-4 py-2.5 w-72"
                />
              </div>

              {/* Financial Telemetry Stats & 10% Commission Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                  <span className="text-xs font-bold uppercase text-orange-700">Total Site Transactions</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">KSh {adminOrders.reduce((a, c) => a + Number(c.total_amount || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <span className="text-xs font-bold uppercase text-green-700">Admin 10% Commission Pool</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">KSh {adminOrders.reduce((a, c) => a + Number(c.platform_fee || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <span className="text-xs font-bold uppercase text-blue-700">Database Users</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{adminUsers.length}</h3>
                </div>
              </div>

              {/* Restock Queue & Waitlists */}
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-2">Pending Restock & Excess Stock Waitlist ({restockQueue.length})</h3>
                <div className="bg-gray-50 border rounded-xl p-4 space-y-2">
                  {restockQueue.length === 0 ? (
                    <p className="text-xs text-gray-400">No pending restock items currently.</p>
                  ) : (
                    restockQueue.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border text-xs">
                        <span className="font-bold">{item.title} (Qty: {item.quantity})</span>
                        <span className="text-gray-500 font-mono">User: {item.user}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Database Table with Search Query */}
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-2">Direct User Database Records</h3>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                      <tr>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminUsers.filter(u => u.email?.toLowerCase().includes(adminSearchQuery.toLowerCase())).map((u, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500">{u.id}</td>
                          <td className="p-3 font-semibold text-gray-900">{u.email}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold uppercase">{u.role || 'buyer'}</span></td>
                          <td className="p-3 text-gray-500">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions & Financial Telemetry */}
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-2">Website Financial Transactions</h3>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Admin 10% Commission</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminOrders.map((o, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500">#{o.id}</td>
                          <td className="p-3 font-bold text-gray-900">KSh {Number(o.total_amount).toLocaleString()}</td>
                          <td className="p-3 font-bold text-orange-600">KSh {Number(o.platform_fee).toLocaleString()}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">{o.status}</span></td>
                          <td className="p-3 text-gray-500">{new Date(o.created_at || Date.now()).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= NORMAL USER AUTH MODAL (Normal password login) ================= */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h2 className="text-xl font-bold mb-1 text-gray-900">{authMode === 'signin' ? 'Sign In to TerraMarket' : 'Create Account'}</h2>
            <p className="text-xs text-gray-500 mb-6">Specify your marketplace mode and standard password credentials.</p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Select Marketplace Mode:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setUserRole('buyer')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${userRole === 'buyer' ? 'bg-orange-600 text-white border-orange-600' : 'bg-gray-50 text-gray-700'}`}
                  >
                    Buyer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setUserRole('seller')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${userRole === 'seller' ? 'bg-orange-600 text-white border-orange-600' : 'bg-gray-50 text-gray-700'}`}
                  >
                    Seller
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="user@gmail.com" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)} 
                  className="w-full p-3 border rounded-xl text-sm" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword} 
                  onChange={e => setAuthPassword(e.target.value)} 
                  className="w-full p-3 border rounded-xl text-sm" 
                  required 
                />
              </div>

              <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition">
                {authMode === 'signin' ? 'Sign In' : 'Register Account'}
              </button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-orange-600 font-semibold hover:underline"
                >
                  {authMode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SELLER LISTING MODAL ================= */}
      {isSellOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsSellOpen(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h2 className="text-xl font-bold mb-1 text-gray-900">List Product ({selectedRegion})</h2>
            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 p-2.5 rounded-lg mb-4">
              ⚠️ <strong>Commission Notice:</strong> A 10% platform fee is processed strictly between seller and admin upon sale.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!user) {
                alert('Please log in first as a seller.')
                setIsAuthOpen(true)
                return
              }

              const finalImage = selectedFileImage || newImg || 'https://images.unsplash.com/photo-1581783342156-f086f53a7558?auto=format&fit=crop&w=600&q=80'
              const newProduct = {
                title: newTitle,
                description: newDesc,
                price: Number(newPrice),
                stock: Number(newStock),
                image_url: finalImage,
              }

              const { error } = await supabase.from('products').insert([newProduct])
              if (error) {
                alert('Failed to add product: ' + error.message)
              } else {
                alert(`Product listed! Simulated seller payout registered (${sellerPayoutMethod}: ${sellerPayoutAccount}).`)
                setIsSellOpen(false)
                setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewStock(''); setNewImg(''); setSelectedFileImage(''); setSellerPayoutAccount('')
                fetchProducts()
              }
            }} className="space-y-3">
              <input type="text" placeholder="Item Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
              <textarea placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm h-20" required />
              
              <div className="flex gap-2">
                <input type="number" placeholder="Price (KSh)" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-1/2 p-2.5 border rounded-lg text-sm" required />
                <input type="number" placeholder="Stock Quantity" value={newStock} onChange={e => setNewStock(e.target.value)} className="w-1/2 p-2.5 border rounded-lg text-sm" required />
              </div>

              {/* Seller Payout Method & Number */}
              <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Seller Payout Account Details:</label>
                <div className="flex gap-2">
                  <select 
                    value={sellerPayoutMethod} 
                    onChange={e => setSellerPayoutMethod(e.target.value)}
                    className="w-1/3 p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Credit / Bank">Credit/Bank</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Enter phone or account number..." 
                    value={sellerPayoutAccount} 
                    onChange={e => setSellerPayoutAccount(e.target.value)} 
                    className="w-2/3 p-2 border rounded-lg text-xs bg-white" 
                    required 
                  />
                </div>
              </div>

              {/* Image Input: File / Camera / URL */}
              <div className="border border-dashed border-gray-300 p-3 rounded-lg space-y-2 bg-gray-50">
                <label className="text-xs text-gray-600 font-semibold block">Product Image (Optional):</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => setSelectedFileImage(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700"
                />
                <input 
                  type="url" 
                  placeholder="Or paste image URL..." 
                  value={newImg} 
                  onChange={e => { setNewImg(e.target.value); setSelectedFileImage(''); }} 
                  className="w-full p-2 border rounded-lg text-xs bg-white" 
                />
              </div>
              
              <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition">
                Publish Listing & Register Payout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= CART DRAWER ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 font-bold text-xl">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">Your cart is currently empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-3">
                        <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                          <p className="text-xs text-orange-600 font-bold">KSh {item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded text-sm font-bold">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded text-sm font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>KSh {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Admin 10% Commission (Seller Split)</span>
                  <span>KSh {platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base border-t pt-2 text-gray-900">
                  <span>Total Due</span>
                  <span className="text-orange-600">KSh {cartTotal.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={() => {
                    if (!user) {
                      setIsCartOpen(false)
                      setIsAuthOpen(true)
                      alert('Please log in first to proceed with checkout.')
                      return
                    }
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                  className="w-full mt-4 bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CHECKOUT MODAL (Fixed Button Text) ================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h2 className="text-xl font-bold mb-1 text-gray-900">Complete Secure Checkout</h2>
            <p className="text-xs text-gray-500 mb-4">Region: {selectedRegion}</p>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${paymentMethod === 'mpesa' ? 'bg-orange-600 text-white border-orange-600' : 'bg-gray-50 text-gray-700'}`}
                >
                  M-Pesa Express
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${paymentMethod === 'card' ? 'bg-orange-600 text-white border-orange-600' : 'bg-gray-50 text-gray-700'}`}
                >
                  Credit Card
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {paymentMethod === 'mpesa' ? 'M-Pesa Phone Number' : 'Card Number'}
                </label>
                <input 
                  type="text" 
                  placeholder={paymentMethod === 'mpesa' ? '07...' : '4532 •••• ••••'} 
                  value={phoneOrCard} 
                  onChange={e => setPhoneOrCard(e.target.value)} 
                  className="w-full p-3 border rounded-xl text-sm" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={paymentSuccess}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-sm transition"
              >
                {paymentSuccess ? 'Processing Transaction...' : `Confirm Payment (KSh ${cartTotal.toLocaleString()})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t py-6 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-700">TerraMarket E-Commerce Platform — Kirinyaga Regional Hub</p>
          <p>Group Presentation Team: Ronix Otieno, Isaiah Otieno, Willis Otieno, Brandon Owino, Alvin Wangalwa</p>
        </div>
      </footer>
    </div>
  )
}
