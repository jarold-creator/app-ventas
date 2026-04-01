import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile')
}

export const productService = {
  getAll: () => api.get('/products'),
  getStock: () => api.get('/products/stock'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

export const invoiceService = {
  create: (data) => api.post('/invoices', data),
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`)
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
}

export const profitService = {
  getReport: (startDate, endDate) => api.get('/dashboard/profit-report', {
    params: { startDate, endDate }
  }),
  getByProduct: (startDate, endDate) => api.get('/dashboard/profit-by-product', {
    params: { startDate, endDate }
  })
}

export default api
