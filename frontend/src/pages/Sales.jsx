import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { productService, invoiceService } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function Sales() {
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [quantities, setQuantities] = useState({})
  const [notification, setNotification] = useState(null)
  const { logout } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await productService.getAll()
      setAllProducts(data)
      setProducts(data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const filterProducts = (term) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setProducts(allProducts)
    } else {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase())
      )
      setProducts(filtered)
    }
  }

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value) || 0
    setQuantities({ ...quantities, [productId]: qty })
  }

  const addToCart = (product) => {
    const qty = quantities[product.id] || 0
    
    if (qty <= 0) {
      showNotification('Ingresa una cantidad', 'error')
      return
    }

    if (qty > product.stock) {
      showNotification(`Stock máximo: ${product.stock}`, 'error')
      return
    }

    const hasCostPrice = product.costPrice && parseFloat(product.costPrice) > 0
    
    if (!hasCostPrice) {
      showNotification(`⚠️ "${product.name}" no tiene precio de costo configurado. La ganancia no se calculará correctamente.`, 'warning')
    }

    const existing = cart.find(item => item.productId === product.id)
    if (existing) {
      const newQty = existing.quantity + qty
      if (newQty > product.stock) {
        showNotification(`Stock máximo para este producto: ${product.stock}`, 'error')
        return
      }
      setCart(cart.map(item =>
        item.productId === product.id ? { ...item, quantity: newQty } : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        costPrice: parseFloat(product.costPrice || 0),
        quantity: qty,
        stock: product.stock
      }])
    }

    setQuantities({ ...quantities, [product.id]: '' })
    
    const profit = (parseFloat(product.price) - parseFloat(product.costPrice || 0)) * qty
    const profitText = hasCostPrice ? ` (+$${profit.toFixed(2)} ganados)` : ' (sin costo configurado)'
    showNotification(`${qty} x ${product.name} agregado${profitText}`, hasCostPrice ? 'success' : 'warning')
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    const item = cart.find(i => i.productId === productId)
    if (quantity <= item.stock) {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ))
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) {
      showNotification('Agrega productos al carrito', 'error')
      return
    }
    setSubmitting(true)
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
      await invoiceService.create({ items })
      setCart([])
      loadData()
      showNotification('Venta registrada exitosamente!')
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al registrar venta', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const clearCart = () => {
    setCart([])
    showNotification('Carrito vaciado')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {notification && (
        <div className={`fixed top-4 right-4 px-5 py-3 rounded-xl shadow-lg z-50 animate-slide-in flex items-center gap-2 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : notification.type === 'warning'
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-500 text-white'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {notification.type === 'error' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
            {notification.type === 'warning' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
            {notification.type === 'success' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            )}
          </svg>
          {notification.message}
        </div>
      )}

      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">Nueva Venta</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ingresa la cantidad y agrega productos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="card p-4 animate-slide-up">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar productos por nombre..."
                  value={searchTerm}
                  onChange={(e) => filterProducts(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-500 dark:text-slate-400 mt-4">Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No se encontraron productos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                        <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                        <th className="text-right px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</th>
                        <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Cantidad</th>
                        <th className="text-right px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subtotal</th>
                        <th className="px-4 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {products.map((product, idx) => {
                        const qty = quantities[product.id] || ''
                        const subtotal = qty ? (parseFloat(product.price) * parseInt(qty)) : 0
                        const isOutOfStock = product.stock === 0
                        
                        return (
                          <tr 
                            key={product.id} 
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isOutOfStock ? 'opacity-50' : ''}`}
                            style={{ animationDelay: `${idx * 0.03}s` }}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOutOfStock ? 'bg-slate-100 dark:bg-slate-700' : 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20'}`}>
                                  <svg className={`w-5 h-5 ${isOutOfStock ? 'text-slate-400' : 'text-primary-600 dark:text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.description || 'Sin descripción'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`badge ${
                                product.stock === 0 ? 'badge-danger' :
                                product.stock <= 5 ? 'badge-warning' :
                                'badge-success'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">${parseFloat(product.price).toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="number"
                                min="0"
                                max={product.stock}
                                value={qty}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                placeholder="0"
                                disabled={isOutOfStock}
                                className="input-field text-center"
                              />
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                ${subtotal.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => addToCart(product)}
                                disabled={isOutOfStock || !qty}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 active:scale-95"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 h-fit sticky top-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Carrito</h3>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  Vaciar
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-2">Carrito vacío</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Agrega productos de la tabla</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center justify-center disabled:opacity-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-1 w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Productos:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Unidades:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total</span>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-lg"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Registrar Venta
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
