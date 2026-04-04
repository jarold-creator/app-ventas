import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { profitService } from '../services/api'
import Sidebar from '../components/Sidebar'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function ProfitReport() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    averageMargin: 0,
    topProducts: [],
    lowMarginProducts: [],
    salesByDay: []
  })
  const { toggleMobile } = useSidebar()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadReport()
  }, [dateRange])

  const loadReport = async () => {
    try {
      setLoading(true)
      const { data } = await profitService.getReport(dateRange.startDate, dateRange.endDate)
      setReportData(data)
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const getMarginColor = (margin) => {
    if (margin > 30) return 'text-emerald-600 dark:text-emerald-400'
    if (margin > 10) return 'text-amber-600 dark:text-amber-400'
    if (margin > 0) return 'text-red-500'
    return 'text-red-600 dark:text-red-400'
  }

  const exportToPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Ganancias - ${dateRange.startDate} al ${dateRange.endDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .header h1 { color: #6366f1; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #64748b; font-size: 14px; }
          .date-range { text-align: center; margin-bottom: 30px; background: #f1f5f9; padding: 15px; border-radius: 8px; }
          .date-range span { font-weight: bold; color: #475569; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .summary-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
          .summary-card .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .summary-card.profit .value { color: #10b981; }
          .summary-card.revenue .value { color: #6366f1; }
          .summary-card.cost .value { color: #ef4444; }
          .section { margin-bottom: 30px; }
          .section h2 { font-size: 18px; color: #334155; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .profit-positive { color: #10b981; }
          .profit-negative { color: #ef4444; }
          .margin-good { color: #10b981; }
          .margin-warning { color: #f59e0b; }
          .margin-bad { color: #ef4444; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Reporte de Ganancias</h1>
          <p>App Ventas - Sistema de Gestión</p>
        </div>
        <div class="date-range">
          Período: <span>${dateRange.startDate}</span> al <span>${dateRange.endDate}</span>
        </div>
        <div class="summary">
          <div class="summary-card revenue">
            <div class="label">Ingresos Totales</div>
            <div class="value">$${reportData.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="summary-card cost">
            <div class="label">Costos Totales</div>
            <div class="value">$${reportData.totalCost.toFixed(2)}</div>
          </div>
          <div class="summary-card profit">
            <div class="label">Ganancia Neta</div>
            <div class="value">$${reportData.totalProfit.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Margen Promedio</div>
            <div class="value">${reportData.averageMargin.toFixed(1)}%</div>
          </div>
        </div>
        <div class="section">
          <h2>📈 Ganancias por Día</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th class="text-right">Ingresos</th>
                <th class="text-right">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.salesByDay.map(day => `
                <tr>
                  <td>${day.date}</td>
                  <td class="text-right">$${day.revenue.toFixed(2)}</td>
                  <td class="text-right ${day.profit >= 0 ? 'profit-positive' : 'profit-negative'}">$${day.profit.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${reportData.topProducts.length > 0 ? `
        <div class="section">
          <h2>🏆 Top Productos más Rentables</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Costo</th>
                <th class="text-right">Vendidos</th>
                <th class="text-right">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topProducts.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-right">$${parseFloat(p.price).toFixed(2)}</td>
                  <td class="text-right">$${parseFloat(p.costPrice || 0).toFixed(2)}</td>
                  <td class="text-right">${p.sold}</td>
                  <td class="text-right profit-positive">$${p.profit.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        ${reportData.lowMarginProducts.length > 0 ? `
        <div class="section">
          <h2>⚠️ Productos con Baja Rentabilidad (&lt;10%)</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Costo</th>
                <th class="text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.lowMarginProducts.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td class="text-right">$${parseFloat(p.price).toFixed(2)}</td>
                  <td class="text-right">$${parseFloat(p.costPrice || 0).toFixed(2)}</td>
                  <td class="text-right margin-bad">${p.margin.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        <div class="footer">
          Reporte generado el ${new Date().toLocaleDateString('es-ES')} | App Ventas
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />

      <main className="flex-1 w-full lg:ml-0 p-4 lg:p-8 overflow-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
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
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-white">Reporte de Ganancias</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Análisis de rentabilidad por período</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 animate-fade-in w-full lg:w-auto">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">Desde:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">Hasta:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field py-2"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Resumen de Ganancias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6 animate-slide-up">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ingresos Totales</span>
                </div>
                <p className="text-3xl font-semibold text-slate-800 dark:text-white">
                  ${reportData.totalRevenue.toFixed(2)}
                </p>
              </div>

              <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Costos Totales</span>
                </div>
                <p className="text-3xl font-semibold text-slate-800 dark:text-white">
                  ${reportData.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ganancia Neta</span>
                </div>
                <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                  ${reportData.totalProfit.toFixed(2)}
                </p>
              </div>

              <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Margen Promedio</span>
                </div>
                <p className={`text-3xl font-semibold ${getMarginColor(reportData.averageMargin)}`}>
                  {reportData.averageMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Ganancias por día */}
              <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Ganancias por Día</h3>
                <div className="h-64">
                  {reportData.salesByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.salesByDay}>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 12 }}
                          tickFormatter={formatDate}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 12 }}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            border: 'none', 
                            borderRadius: '12px', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
                          }}
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Ganancia']}
                        />
                        <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No hay datos en el período seleccionado
                    </div>
                  )}
                </div>
              </div>

              {/* Distribución de productos más vendidos por ganancia */}
              <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Top 5 Productos por Ganancia</h3>
                <div className="h-64">
                  {reportData.topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.topProducts} layout="vertical">
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
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Ganancia']}
                        />
                        <Bar dataKey="profit" fill="#6366F1" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No hay productos vendidos en el período
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Productos con margen bajo */}
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Productos con Margen Bajo (&lt;10%)</h3>
              {reportData.lowMarginProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3">Producto</th>
                        <th className="pb-3 text-right">Precio Costo</th>
                        <th className="pb-3 text-right">Precio Venta</th>
                        <th className="pb-3 text-right">Ganancia Total</th>
                        <th className="pb-3 text-right">Margen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {reportData.lowMarginProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="py-3 font-medium text-slate-800 dark:text-white">{product.name}</td>
                          <td className="py-3 text-right text-slate-500 dark:text-slate-400">${parseFloat(product.costPrice).toFixed(2)}</td>
                          <td className="py-3 text-right text-slate-500 dark:text-slate-400">${parseFloat(product.price).toFixed(2)}</td>
                          <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">${product.totalProfit.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${getMarginColor(product.margin)}`}>
                              {product.margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Todos los productos tienen un margen saludable</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}