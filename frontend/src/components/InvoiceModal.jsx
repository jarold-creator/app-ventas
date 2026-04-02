export default function InvoiceModal({ invoice, onClose }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = () => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Factura #${invoice.id}</title>
    <style>
      @page { size: 80mm; margin: 0; }
      body { font-family: 'Courier New', monospace; width: 70mm; margin: 0 auto; padding: 5mm; font-size: 11px; }
      .header { text-align: center; margin-bottom: 10px; }
      .title { font-size: 16px; font-weight: bold; }
      .subtitle { font-size: 10px; color: #666; }
      .divider { border-bottom: 1px dashed #333; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; font-size: 10px; }
      .total { font-size: 14px; font-weight: bold; text-align: right; margin-top: 8px; }
      .footer { text-align: center; margin-top: 12px; font-size: 9px; color: #666; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">VENTAS</div>
      <div class="subtitle">Ticket de Venta</div>
    </div>
    <div class="divider"></div>
    <div class="row"><span>Factura #: ${invoice.id}</span></div>
    <div class="row"><span>Fecha: ${formatDate(invoice.created_at)}</span></div>
    <div class="row"><span>Vendedor: ${invoice.User?.name || 'Usuario'}</span></div>
    <div class="divider"></div>
    <div class="items">
      ${invoice.InvoiceItems?.map(item => `
        <div style="margin: 4px 0;">
          <div class="row">
            <span>${item.Product?.name || 'Producto #' + item.productId}</span>
            <span>$${parseFloat(item.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style="font-size: 9px; color: #666;">${item.quantity} x $${parseFloat(item.unitPrice || 0).toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
    <div class="divider"></div>
    <div class="total">TOTAL: $${parseFloat(invoice.total || 0).toFixed(2)}</div>
    <div class="divider"></div>
    <div class="footer"><p>Gracias por su compra</p><p>Conserve este ticket</p></div>
  </body>
</html>
`
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${invoice.id}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error en handleDownload:', err)
      alert('Error: ' + err.message)
    }
  }

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir')
        return
      }
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura #${invoice.id}</title>
          <style>
            @page { size: 80mm; margin: 0; }
            body { font-family: 'Courier New', monospace; width: 70mm; margin: 0 auto; padding: 5mm; font-size: 11px; }
            .header { text-align: center; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; }
            .subtitle { font-size: 10px; color: #666; }
            .divider { border-bottom: 1px dashed #333; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; font-size: 10px; }
            .total { font-size: 14px; font-weight: bold; text-align: right; margin-top: 8px; }
            .footer { text-align: center; margin-top: 12px; font-size: 9px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">VENTAS</div>
            <div class="subtitle">Ticket de Venta</div>
          </div>
          <div class="divider"></div>
          <div class="row"><span>Factura #: ${invoice.id}</span></div>
          <div class="row"><span>Fecha: ${formatDate(invoice.created_at)}</span></div>
          <div class="row"><span>Vendedor: ${invoice.User?.name || 'Usuario'}</span></div>
          <div class="divider"></div>
          <div class="items">
            ${invoice.InvoiceItems?.map(item => `
              <div style="margin: 4px 0;">
                <div class="row">
                  <span>${item.Product?.name || 'Producto #' + item.productId}</span>
                  <span>$${parseFloat(item.subtotal || 0).toFixed(2)}</span>
                </div>
                <div style="font-size: 9px; color: #666;">${item.quantity} x $${parseFloat(item.unitPrice || 0).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="total">TOTAL: $${parseFloat(invoice.total || 0).toFixed(2)}</div>
          <div class="divider"></div>
          <div class="footer"><p>Gracias por su compra</p><p>Conserve este ticket</p></div>
        </body>
      </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (err) {
      console.error('Error in handlePrint:', err)
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Factura #{invoice.id}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50 dark:bg-slate-900">
          <div id="invoice-content" className="font-mono text-sm bg-white p-4 mx-auto" style={{ width: '260px', border: '1px solid #e2e8f0' }}>
            <div className="header">
              <div className="title font-bold text-center">VENTAS</div>
              <div className="text-xs text-slate-500 text-center">Ticket de Venta</div>
            </div>
            
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            
            <div className="flex justify-between text-xs">
              <span>Factura #:</span>
              <span>{invoice.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Fecha:</span>
              <span>{formatDate(invoice.created_at)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Vendedor:</span>
              <span>{invoice.User?.name || 'Usuario'}</span>
            </div>
            
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            
            <div className="text-xs">
              <div className="font-semibold mb-1">PRODUCTOS</div>
              {invoice.InvoiceItems?.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex justify-between">
                    <span className="truncate max-w-[150px]">{item.Product?.name || `Producto #${item.productId}`}</span>
                    <span>${parseFloat(item.subtotal || item.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.quantity} x ${parseFloat(item.unitPrice || item.unit_price || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL:</span>
              <span>${parseFloat(invoice.total || invoice.Total || 0).toFixed(2)}</span>
            </div>
            
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            
            <div className="text-center text-xs text-slate-500 mt-3">
              <p>Gracias por su compra</p>
              <p>Conserve este ticket</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}