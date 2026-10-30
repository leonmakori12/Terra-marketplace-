'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-project-ref.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key-here'
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
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'shop' | 'analytics'>('shop')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*')
      if (error) {
        console.error('Error fetching products:', error.message)
      } else if (data) {
        setProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

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

  const fallbackImage = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'

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

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex gap-4 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('shop')}
              className={`transition-colors ${activeTab === 'shop' ? 'text-orange-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Catalog
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`transition-colors ${activeTab === 'analytics' ? 'text-orange-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Value Model
            </button>
          </nav>

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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {activeTab === 'shop' ? (
          <>
            {/* Hero Section */}
            <section className="mb-12 text-center max-w-2xl mx-auto">
              <span className="inline-block bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-orange-200/60">
                Sustainable Goods • Consciously Sourced
              </span>
              <h2 className="text-4xl font-light tracking-tight mb-3 text-neutral-900">
                Crafted for impact, <span className="font-semibold text-orange-600">curated for you.</span>
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                A minimalist marketplace connecting independent eco-artisans with conscious consumers worldwide.
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
                  Loading sustainable catalog from Supabase...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl">
                  <p className="text-neutral-500 text-sm mb-1">No products found matching your search.</p>
                  <p className="text-neutral-400 text-xs">If your catalog is empty, check your Supabase RLS policies.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const imgSource = product.image_url ? product.image_url : fallbackImage;
                    return (
                      <div key={product.id} className="group bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition duration-300">
                        <div>
                          <div className="relative overflow-hidden rounded-xl mb-4 bg-neutral-100 aspect-square">
                            <img 
                              src={imgSource} 
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
                            <span className="font-bold text-base text-neutral-900">${Number(product.price).toFixed(2)}</span>
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            className="w-full bg-neutral-900 hover:bg-orange-600 text-white text-xs py-2.5 rounded-xl font-semibold transition shadow-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Value Creation & Revenue Model Tab */
          <section className="max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-light mb-4">Value Creation & Business Model</h2>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
              TerraMarket operates on a dual-sided marketplace model that aligns platform incentives with artisan success and sustainable consumerism.
            </p>

            <div className="grid gap-6">
              <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50">
                <h3 className="font-semibold text-base mb-2 text-orange-600">1. Revenue Generation (Commission Structure)</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  TerraMarket charges a transparent <strong>8% platform commission</strong> on each successful transaction processed through Supabase and integrated payment gateways. This covers secure escrow, hosting, and dispute resolution.
                </p>
              </div>

              <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50">
                <h3 className="font-semibold text-base mb-2 text-orange-600">2. Artisan Value Proposition</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Independent eco-artisans gain instant access to a high-intent global audience without upfront store-setup fees or complex technical maintenance. Real-time inventory synchronization ensures zero over-selling.
                </p>
              </div>

              <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50">
                <h3 className="font-semibold text-base mb-2 text-orange-600">3. Consumer Value Proposition</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Conscious shoppers enjoy a distraction-free, minimalist shopping experience with verified eco-friendly ratings, fast search, and secure mobile checkout.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <h3 className="font-bold text-base">Your Cart ({cart.length})</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-neutral-700 text-sm">
                    ✕
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400 text-sm">
                    Your cart is empty.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 max-h-[60vh] overflow-y-auto my-4">
                    {cart.map((item, index) => (
                      <div key={index} className="py-3 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image_url || fallbackImage} alt={item.title} className="w-12 h-12 object-cover rounded-lg bg-neutral-100" />
                          <div>
                            <h4 className="text-xs font-medium text-neutral-900">{item.title}</h4>
                            <span className="text-xs text-orange-600 font-semibold">${Number(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(index)} className="text-neutral-400 hover:text-red-500 text-xs">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-neutral-500">Total</span>
                    <span className="text-lg font-bold text-neutral-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-orange-500/20"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
        }
              
