'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rooqmdajofzxhqpmdhrs.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Sb_publishable_NOkG9kvA45hMhgBjQs2pgQ_KOrsWeWA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Product {
  id: number
  title: string
  description: string
  price: number
  stock: number
  image_url: string
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'shop' | 'seller' | 'analytics'>('shop')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  // New Product Form State (For Sellers)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    fetchProducts()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false })
    if (error) {
      console.error('Error fetching products:', error.message)
    } else if (data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else {
        alert('Check your email for confirmation or login directly!')
        setAuthMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
      else setAuthMode(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      setAuthMode('login')
      return
    }
    setUploading(true)
    setUploadMsg('')

    const { error } = await supabase.from('products').insert([
      {
        title,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'
      }
    ])

    setUploading(false)
    if (error) {
      setUploadMsg(`Error: ${error.message}`)
    } else {
      setUploadMsg('🎉 Product listed successfully to database!')
      setTitle('')
      setDescription('')
      setPrice('')
      setStock('')
      setImageUrl('')
      fetchProducts()
      setActiveTab('shop')
    }
  }

  const addToCart = (product: Product) => {
    setCart([...cart, product])
    setIsCartOpen(true)
  }

  const removeFromCart = (index: number) => {
    const updated = [...cart]
    updated.splice(index, 1)
    setCart(updated)
  }

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0)

  const handleCheckout = () => {
    setCheckoutSuccess(true)
    setCart([])
    setTimeout(() => setCheckoutSuccess(false), 4000)
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatKsh = (amount: number) => {
    return `KSh ${Number(amount).toLocaleString()}`
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-orange-500/30">
            T
          </div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">TerraMarket</h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden sm:flex gap-4 text-sm font-medium items-center">
            <button 
              onClick={() => setActiveTab('shop')}
              className={`transition-colors ${activeTab === 'shop' ? 'text-orange-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Catalog
            </button>
            <button 
              onClick={() => setActiveTab('seller')}
              className={`transition-colors ${activeTab === 'seller' ? 'text-orange-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Add Product (Seller)
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`transition-colors ${activeTab === 'analytics' ? 'text-orange-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Value Model
            </button>
          </nav>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 hidden md:inline">{session.user.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs px-3 py-1.5 rounded-full font-medium transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthMode('login')}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-full font-semibold transition shadow-sm"
            >
              Login / Register
            </button>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 py-2 rounded-full text-xs font-semibold transition"
          >
            <span>Cart</span>
            <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
              {cart.length}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation */}
      <div className="flex sm:hidden justify-around border-b border-neutral-100 py-2 bg-neutral-50 text-xs font-medium">
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'text-orange-600 font-bold' : 'text-neutral-600'}>Catalog</button>
        <button onClick={() => setActiveTab('seller')} className={activeTab === 'seller' ? 'text-orange-600 font-bold' : 'text-neutral-600'}>Add Product</button>
        <button onClick={() => setActiveTab('analytics')} className={activeTab === 'analytics' ? 'text-orange-600 font-bold' : 'text-neutral-600'}>Value Model</button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {activeTab === 'shop' && (
          <>
            {/* Hero Section */}
            <section className="mb-12 text-center max-w-2xl mx-auto">
              <span className="inline-block bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-orange-200/60">
                Sustainable Goods • Consciously Sourced in Kenya
              </span>
              <h2 className="text-4xl font-light tracking-tight mb-3 text-neutral-900">
                Crafted for impact, <span className="font-semibold text-orange-600">curated for you.</span>
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                A minimalist marketplace connecting independent eco-artisans with conscious consumers.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <input 
                  type="text"
                  placeholder="Search sustainable products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-sm"
                />
              </div>
            </section>

            {/* Notification Banner */}
            {checkoutSuccess && (
              <div className="mb-8 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-center text-sm font-medium animate-fadeIn">
                🎉 Order placed successfully! Thank you for supporting sustainable artisans.
              </div>
            )}

            {/* Catalog Grid */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-neutral-900">Explore Catalog</h3>
                <span className="text-xs text-neutral-400">{filteredProducts.length} items available</span>
              </div>

              {loading ? (
                <div className="text-center py-24 text-neutral-400 text-sm">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Loading catalog from Supabase...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl">
                  <p className="text-neutral-500 text-sm mb-1">No products found matching your search.</p>
                  <p className="text-neutral-400 text-xs mb-4">Be the first artisan to add a product using the "Add Product (Seller)" tab!</p>
                  <button 
                    onClick={() => setActiveTab('seller')}
                    className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Add Product Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="group bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition duration-300">
                      <div>
                        <div className="relative overflow-hidden rounded-xl mb-4 bg-neutral-100 aspect-square">
                          <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-semibold text-neutral-700">
                            Stock: {product.stock}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm text-neutral-900 mb-1 group-hover:text-orange-600 transition">{product.title}</h4>
                        <p className="text-neutral-500 text-xs mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-base text-neutral-900">{formatKsh(product.price)}</span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-full bg-neutral-900 hover:bg-orange-600 text-white text-xs py-2.5 rounded-xl font-semibold transition shadow-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'seller' && (
          <section className="max-w-xl mx-auto py-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-light mb-2">Seller Product Portal</h2>
              <p className="text-neutral-500 text-xs mb-6">
                List a new eco-friendly product. It will be immediately recorded into your Supabase database and displayed on the live catalog.
              </p>

              {!session && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs">
                  ⚠️ You need to be logged in to add products to the database. <button onClick={() => setAuthMode('login')} className="underline font-bold">Login here</button>
                </div>
              )}

              {uploadMsg && (
                <div className="mb-6 p-4 bg-neutral-100 text-neutral-900 rounded-xl text-xs font-semibold text-center">
                  {uploadMsg}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Handwoven Sisal Basket"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Describe materials, origin, and craftsmanship..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Price (KSh)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="2500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      required
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-orange-500/20"
                >
                  {uploading ? 'Publishing to Database...' : 'Publish Product to Catalog'}
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-light mb-4">Value Creation & Business Model</h2>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
              TerraMarket operates on a dual-sided marketplace model connecting independent Kenyan eco-artisans with conscious consumers.
            </p>

            <div className="grid gap-6">
              <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50">
                <h3 className="font-semibold text-base mb-2 text-orange-600">1. Revenue Generation (Commission Structure)</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  TerraMarket charges a transparent <strong>8% platform commission</strong> on transactions processed securely via Supabase and integrated payment systems in KSh.
                </p>
              </div>

              <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50">
                <h3 className="font-semibold text-base mb-2 text-orange-600">2. Artisan Value Proposition</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Eco-artisans gain an instant digital storefront with zero setup fees, automated inventory tracking, and direct sales management through the seller portal.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutr
