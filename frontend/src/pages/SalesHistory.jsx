import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { invoiceService } from '../services/api'
import Sidebar from '../components/Sidebar'
import InvoiceModal from '../components/InvoiceModal'

export default function SalesHistory() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [printInvoice, setPrintInvoice] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const { logout } = useAuth()
  const { toggleMobile } = useSidebar()

  useEffect(() => {
    loadInvoices(1)
  }, [])

  const loadInvoices = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await invoiceService.getAll(page, pagination.limit)
      setInvoices(data.invoices)
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }))
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

      <main className="flex-1 w-full lg:ml-0 p-4 lg:p-8 overflow-auto">
        <header className="mb-6 lg:mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white">Historial de Ventas</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{filteredInvoices.length} {filteredInvoices.length === 1 ? 'factura' : 'facturas'} {searchTerm && `de ${pagination.total}`}</p>
        </header>

        {invoices.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
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
            <button onClick={() => loadInvoices(pagination.page)} className="ml-6 underline text-red-700 dark:text-red-300">Reintentar</button>
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
          <>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.User?.name || 'Usuario'}</p>
                        <p className="text-xl font-bold text-primary-600 dark:text-primary-400">${parseFloat(invoice.total || invoice.Total || 0).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setPrintInvoice(invoice)
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Imprimir factura"
                      >
                        <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
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
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-4 py-4 border-t border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadInvoices(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => loadInvoices(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {printInvoice && (
        <InvoiceModal 
          invoice={printInvoice} 
          onClose={() => setPrintInvoice(null)} 
        />
      )}
    </div>
  )
}