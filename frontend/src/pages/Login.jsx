import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/api'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved && JSON.parse(saved)) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos')
      return
    }
    
    if (isRegister && !name.trim()) {
      setError('Ingresa tu nombre')
      return
    }
    
    setLoading(true)

    try {
      if (isRegister) {
        const { data } = await authService.register({ email, password, name })
        setError('Cuenta creada. Inicia sesión.')
        setIsRegister(false)
        setLoading(false)
        return
      } else {
        const { data } = await authService.login({ email, password })
        login(data.user, data.token)
      }
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      const errorMsg = err.response?.data?.error
      
      if (status === 401) {
        setError('Correo o contraseña incorrectos')
      } else if (status === 400 && errorMsg?.includes('exists')) {
        setError('El correo ya está registrado')
      } else if (status === 400) {
        setError(errorMsg || 'Error en los datos')
      } else {
        setError('Error de conexión. Intenta más tarde.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-secondary-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-10"
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {darkMode ? (
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-white tracking-tight">Ventas</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</p>
        </div>

        <div className="card p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div className="animate-slide-up" style={{ animationDelay: isRegister ? '0.1s' : '0s' }}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: isRegister ? '0.2s' : '0.1s' }}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isRegister ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0H15m-2 8V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586l-.828.828A2 2 0 019.828 6H12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              )}
              {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
