import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { dashboardService } from '../services/api'
import Sidebar from '../components/Sidebar'
import { useSidebar } from '../context/SidebarContext'

const statCards = [
  { key: 'total', label: 'Ventas de Hoy', icon: 'currency', color: 'primary' },
  { key: 'profit', label: 'Ganancia de Hoy', icon: 'profit', color: 'emerald', isProfit: true },
  { key: 'totalInvoices', label: 'Ventas Hoy', icon: 'invoice', color: 'violet' },
  { key: 'totalProducts', label: 'Productos', icon: 'products', color: 'blue' },
  { key: 'lowStockCount', label: 'Stock Bajo', icon: 'warning', color: 'amber', isAlert: true }
]

const icons = {
  currency: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  profit: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  invoice: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  products: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

const colorClasses = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-500/10', icon: 'text-primary-600 dark:text-primary-400', gradient: 'from-primary-500 to-primary-600' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-400', gradient: 'from-violet-500 to-violet-600' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-amber-600' }
}

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    total: 0, 
    profit: 0,
    totalInvoices: 0, 
    totalProducts: 0,
    lowStockCount: 0,
    topProducts: [], 
    salesLast7Days: [],
    recentInvoices: [] 
  })
  const [loading, setLoading] = useState(true)
  const { toggleMobile } = useSidebar()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await dashboardService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  })

  const getValue = (key) => {
    const value = stats[key]
    if (key === 'total' || key === 'profit') return `$${value.toFixed(2)}`
    return value
  }

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Sidebar />

        <main className="flex-1 w-full lg:ml-0 p-4 lg:p-8 overflow-auto">
        <header className="flex justify-between items-start mb-6 lg:mb-8">
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
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white">Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">Resumen de tu negocio</p>
            </div>
          </div>
          <div className="text-right animate-fade-in">
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{today}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {statCards.map((card, index) => {
            const colors = colorClasses[card.color]
            const value = getValue(card.key)
            const isAlert = card.isAlert && stats[card.key] > 0
            const isProfit = card.isProfit
            
            return (
              <div 
                key={card.key}
                className={`card p-6 animate-slide-up hover:-translate-y-1 transition-all duration-300`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`stat-icon ${colors.bg}`}>
                    <span className={colors.icon}>{icons[card.icon]}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                </div>
                <p className={`text-3xl font-semibold ${
                  isAlert 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : isProfit
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-800 dark:text-white'
                }`}>
                  {loading ? '...' : value}
                </p>
                {isAlert && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-500 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-soft"></span>
                    Requiere atención
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {stats.lowStockCount > 0 && (
          <div className="mb-6 card p-4 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-500/10 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  ⚠️ Productos con Stock Bajo
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {stats.lowStockCount} producto{stats.lowStockCount > 1 ? 's' : ''} requieren atención
                </p>
              </div>
              <Link 
                to="/products" 
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                Ver Productos
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ventas últimos 7 días</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-violet-500"></span>
                Ingresos
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stats.salesLast7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesLast7Days}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                      labelFormatter={(value) => formatDate(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No hay ventas en los últimos 7 días</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                to="/sales"
                className="group flex items-center gap-3 p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-semibold">Nueva Venta</span>
              </Link>
              <Link
                to="/products"
                className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="font-semibold">Agregar Producto</span>
              </Link>
              <Link
                to="/sales-history"
                className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-semibold">Ver Historial</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Top 5 Productos</h3>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stats.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topProducts} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} tickFormatter={(v) => `$${v}`} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                    />
                    <Bar dataKey="total" fill="#6366F1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p>No hay ventas hoy</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Ventas Recientes</h3>
            <div className="overflow-hidden">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stats.recentInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3">Factura</th>
                        <th className="pb-3">Hora</th>
                        <th className="pb-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {stats.recentInvoices.map((invoice, idx) => (
                        <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">#{invoice.invoice_number}</span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{formatTime(invoice.created_at)}</td>
                          <td className="py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 text-right">${invoice.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No hay ventas recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
