import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { productService } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', costPrice: '', stock: '', category: 'General' })
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, product: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const { logout } = useAuth()
  const { toggleMobile } = useSidebar()

  const categories = ['General', 'Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Deportes', 'Otros']

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true)
      const { data } = await productService.getAll(page, pagination.limit)
      setProducts(data.products)
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts(1)
  }, [])

  const filteredProducts = products.filter(product => {
    if (filterCategory !== 'all' && product.category !== filterCategory) return false
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase().trim()
    return (
      product.name.toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term) ||
      (product.category || '').toLowerCase().includes(term) ||
      product.price.toString().includes(term) ||
      (product.costPrice || '').toString().includes(term)
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, form)
      } else {
        await productService.create(form)
      }
      setShowModal(false)
      setEditingProduct(null)
      setForm({ name: '', description: '', price: '', costPrice: '', stock: '', category: 'General' })
      loadProducts(pagination.page)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      category: product.category || 'General'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await productService.delete(id)
      setDeleteConfirm({ show: false, product: null })
      loadProducts(pagination.page)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const openModal = () => {
    setEditingProduct(null)
    setForm({ name: '', description: '', price: '', costPrice: '', stock: '' })
    setShowModal(true)
  }

  const calculateMargin = (price, costPrice) => {
    const p = parseFloat(price) || 0
    const c = parseFloat(costPrice) || 0
    if (p === 0) return 0
    return ((p - c) / p * 100).toFixed(1)
  }

  const getMarginColor = (margin) => {
    if (margin > 30) return 'text-emerald-600 dark:text-emerald-400'
    if (margin > 10) return 'text-amber-600 dark:text-amber-400'
    if (margin > 0) return 'text-red-500'
    return 'text-red-600 dark:text-red-400'
  }

  const getStockBadge = (stock) => {
    if (stock === 0) return { class: 'badge-danger', label: 'Sin stock' }
    if (stock <= 5) return { class: 'badge-warning', label: 'Stock bajo' }
    if (stock <= 10) return { class: 'badge-neutral', label: 'Stock medio' }
    return { class: 'badge-success', label: 'En stock' }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />

      <main className="flex-1 w-full lg:ml-0 p-4 lg:p-8 overflow-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 animate-fade-in">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white">Productos</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} {searchTerm && `de ${products.length}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 animate-fade-in w-full sm:w-auto">
            {products.length > 0 && (
              <>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full sm:w-40 lg:w-64"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field py-2 w-full sm:w-auto"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </>
            )}
            <button
              onClick={openModal}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo producto
            </button>
          </div>
        </header>

        <div className="card overflow-hidden animate-slide-up">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No hay productos</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Crea tu primer producto para comenzar</p>
              <button onClick={openModal} className="btn-primary">
                Crear producto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Costo</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Margen</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredProducts.map((product, idx) => {
                    const badge = getStockBadge(product.stock)
                    const margin = calculateMargin(product.price, product.costPrice)
                    return (
                      <tr 
                        key={product.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{product.description || 'Sin descripción'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            ${parseFloat(product.costPrice || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">${parseFloat(product.price).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${getMarginColor(margin)}`}>
                            {margin}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${badge.class}`} title={badge.label}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ show: true, product })}
                              className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadProducts(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadProducts(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Descripción opcional"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Precio de Costo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.costPrice}
                      onChange={e => setForm({ ...form, costPrice: e.target.value })}
                      className="input-field pl-8"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Costo del producto</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Precio de Venta</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="input-field pl-8"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingProduct ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card p-6 w-full max-w-sm animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Eliminar Producto</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                ¿Estás seguro de eliminar <span className="font-medium text-slate-700 dark:text-slate-300">"{deleteConfirm.product?.name}"</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, product: null })}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.product?.id)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
