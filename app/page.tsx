'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rooqmdajofzxhqpmdhrs.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Sb_publishable_NOkG9kvA45hMhgBjQs2pgQ_KOrsWeWA'
)

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*')
    if (data) setProducts(data)
    setLoading(false)
  }

  async function addProduct(e: any) {
    e.preventDefault()
    const { error } = await supabase.from('products').insert([
      { title, price: parseFloat(price), stock: parseInt(stock), description }
    ])
    if (error) {
      setMsg(`Error: ${error.message}`)
    } else {
      setMsg('Product added successfully!')
      setTitle('')
      setPrice('')
      setStock('')
      setDescription('')
      fetchProducts()
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 p-8 max-w-4xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-10 pb-4 border-b">
        <h1 className="text-2xl font-bold">TerraMarket (Kenya)</h1>
        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">Live Database Connected</span>
      </header>

      <section className="mb-12 bg-neutral-50 p-6 rounded-2xl border">
        <h2 className="text-lg font-semibold mb-4">Add Product (Seller Portal)</h2>
        {msg && <p className="mb-4 text-xs font-bold text-orange-600">{msg}</p>}
        <form onSubmit={addProduct} className="space-y-4">
          <input type="text" placeholder="Product Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 border rounded-xl bg-white text-sm" />
          <input type="number" placeholder="Price in KSh" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-3 border rounded-xl bg-white text-sm" />
          <input type="number" placeholder="Stock Quantity" value={stock} onChange={e => setStock(e.target.value)} required className="w-full p-3 border rounded-xl bg-white text-sm" />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 border rounded-xl bg-white text-sm" />
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl font-semibold text-xs">Publish to Database</button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Catalog ({products.length} items)</h2>
        {loading ? <p className="text-sm text-neutral-400">Loading products from Supabase...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="border p-4 rounded-2xl bg-white shadow-xs">
                <h3 className="font-bold text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-neutral-500 mb-3">{p.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600">KSh {Number(p.price).toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-400">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

