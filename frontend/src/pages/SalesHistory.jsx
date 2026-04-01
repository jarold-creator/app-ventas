import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { invoiceService } from '../services/api'
import Sidebar from '../components/Sidebar'

export default function SalesHistory() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { logout } = useAuth()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setError(null)
      const { data } = await invoiceService.getAll()
      console.log('Invoices loaded:', data)
      setInvoices(data)
    } catch (err) {
      console.error('Error loading invoices:', err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase().trim()
    const dateStr = formatDate(invoice.created_at).toLowerCase()
    const userName = (invoice.User?.name || 'Usuario').toLowerCase()
    const invoiceId = invoice.id.toString()
    
    const facturaMatch = term.match(/^factura\s*#?\s*(\d+)$/i)
    if (facturaMatch) {
      return invoiceId === facturaMatch[1]
    }
    
    return (
      invoiceId === term ||
      dateStr.includes(term) ||
      userName.includes(term) ||
      invoice.total?.toString().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">Historial de Ventas</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredInvoices.length} {filteredInvoices.length === 1 ? 'factura' : 'facturas'} {searchTerm && `de ${invoices.length}`}</p>
        </header>

        {invoices.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por número de factura, fecha, usuario o total..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 dark:text-slate-400 mt-4">Cargando facturas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Error: {error}
            </div>
            <button onClick={loadInvoices} className="ml-6 underline text-red-700 dark:text-red-300">Reintentar</button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="card p-16 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No hay ventas registradas</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Comienza registrando tu primera venta</p>
            <Link to="/sales" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registrar primera venta
            </Link>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="card p-16 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No se encontraron resultados</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Intenta con otros términos de búsqueda</p>
            <button onClick={() => setSearchTerm('')} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              → Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice, idx) => (
              <div 
                key={invoice.id} 
                className="card overflow-hidden animate-slide-up hover:shadow-card-hover transition-all duration-300"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  onClick={() => setSelectedInvoice(selectedInvoice === invoice.id ? null : invoice.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Factura #{invoice.id}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(invoice.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.User?.name || 'Usuario'}</p>
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400">${parseFloat(invoice.total || invoice.Total || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ganancia</p>
                      <p className={`text-lg font-semibold ${parseFloat(invoice.profit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        ${parseFloat(invoice.profit || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 ${selectedInvoice === invoice.id ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {selectedInvoice === invoice.id && (
                  <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30 animate-fade-in">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                          <th className="pb-3">Producto</th>
                          <th className="pb-3 text-center">Cantidad</th>
                          <th className="pb-3 text-right">Precio Unit.</th>
                          <th className="pb-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                        {invoice.InvoiceItems?.map(item => (
                          <tr key={item.id}>
                            <td className="py-3 text-slate-800 dark:text-slate-200">{item.Product?.name || `Producto #${item.productId}`}</td>
                            <td className="py-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                            <td className="py-3 text-right text-slate-600 dark:text-slate-400">${parseFloat(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                            <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-200">${parseFloat(item.subtotal || item.subTotal || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
