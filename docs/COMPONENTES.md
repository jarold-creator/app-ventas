# Documentación de Componentes - Frontend

## Estructura de Archivos

```
frontend/src/
├── components/
│   └── Sidebar.jsx          # Navegación lateral
├── context/
│   ├── AuthContext.jsx      # Autenticación global
│   ├── SidebarContext.jsx   # Estado del sidebar
│   └── ThemeContext.jsx     # Modo claro/oscuro
├── pages/
│   ├── Login.jsx            # Inicio de sesión
│   ├── Dashboard.jsx        # Panel principal
│   ├── Products.jsx         # Gestión de productos
│   ├── Sales.jsx            # Punto de venta
│   ├── SalesHistory.jsx     # Historial de ventas
│   └── ProfitReport.jsx     # Reporte de ganancias
├── services/
│   └── api.js               # Configuración de API
├── styles/
│   └── index.css            # Estilos globales
├── App.jsx                  # Componente raíz
└── main.jsx                 # Punto de entrada
```

---

## Pages (Páginas)

### 1. Login.jsx
**Ruta:** `/login`

**Descripción:** Página de autenticación con formulario de login y registro.

**Funcionalidades:**
- Inicio de sesión con email/password
- Registro de nuevos usuarios
- Toggle entre modos login/register
- Toggle modo claro/oscuro
- Validación de campos
- Manejo de errores

**Estados:**
- `isRegister` - Boolean para modo registro
- `email`, `password`, `name` - Inputs del formulario
- `error` - Mensaje de error
- `loading` - Estado de carga

**Componentes hijos:**
- Formulario con inputs
- Botón submit
- Toggle register/login

---

### 2. Dashboard.jsx
**Ruta:** `/` (protegida)

**Descripción:** Panel principal con estadísticas y gráficos.

**Funcionalidades:**
- Mostrar estadísticas del día (ventas, facturas, productos, stock bajo)
- Gráfico de ventas últimos 7 días (AreaChart)
- Gráfico de top 5 productos más vendidos (BarChart)
- Lista de ventas recientes
- Acciones rápidas (Nueva venta, Agregar producto, Ver historial)

**Estados:**
- `stats` - Objeto con todas las estadísticas
- `loading` - Estado de carga

**Gráficos (Recharts):**
- AreaChart para ventas diarias
- BarChart para productos populares

---

### 3. Products.jsx
**Ruta:** `/products` (protegida)

**Descripción:** Gestión completa del inventario con búsqueda y métricas de rentabilidad.

**Funcionalidades:**
- Listar todos los productos en tabla
- Buscar por nombre, descripción, precio o costo
- Crear nuevo producto (modal)
- Editar producto existente (modal)
- Eliminar producto (confirmación)
- Mostrar margen de ganancia con código de colores (verde >30%, ámbar 10-30%, rojo <10%)
- Badges de estado de stock (sin stock, bajo, medio, en stock)

**Estados:**
- `products` - Array de productos
- `searchTerm` - Término de búsqueda
- `filteredProducts` - Productos filtrados dinámicamente
- `showModal` - Mostrar/ocultar modal
- `editingProduct` - Producto en edición
- `form` - Datos del formulario (name, description, price, costPrice, stock)
- `deleteConfirm` - Confirmación de eliminación

**Componentes:**
- Input de búsqueda con icono
- Tabla con columnas: Producto, Costo, Precio, Margen, Stock, Acciones
- Badges de stock y margen
- Modal de creación/edición con campos de precio de costo
- Modal de confirmación de eliminación

---

### 4. Sales.jsx
**Ruta:** `/sales` (protegida)

**Descripción:** Punto de venta con búsqueda y carrito.

**Funcionalidades:**
- Listar productos disponibles
- Buscar productos por nombre
- Ingresar cantidad y agregar al carrito
- Carrito lateral (sticky)
- Actualizar cantidad en carrito
- Eliminar items del carrito
- Registrar venta
- Notificaciones toast

**Estados:**
- `products` - Productos filtrados
- `allProducts` - Todos los productos
- `cart` - Items en el carrito
- `quantities` - Cantidades por producto
- `searchTerm` - Término de búsqueda
- `notification` - Toast de notificación

**Componentes:**
- Input de búsqueda
- Tabla de productos
- Carrito lateral
- Botones de control (+/-)
- Botón de registrar venta

---

### 5. SalesHistory.jsx
**Ruta:** `/sales-history` (protegida)

**Descripción:** Historial de facturas con búsqueda.

**Funcionalidades:**
- Listar todas las facturas
- Buscar por número, fecha, usuario o total
- Ver detalle de factura (expandible)
- Mostrar items de cada factura

**Estados:**
- `invoices` - Lista de facturas
- `selectedInvoice` - Factura expandida
- `searchTerm` - Término de búsqueda
- `loading`, `error` - Estados

**Componentes:**
- Input de búsqueda
- Cards de facturas colapsables
- Tabla de items en factura expandida (incluye columna de ganancia)

---

### 6. ProfitReport.jsx
**Ruta:** `/profit-report` (protegida)

**Descripción:** Reporte de ganancias con gráficos, filtros y análisis de rentabilidad.

**Funcionalidades:**
- Selector de rango de fechas (inicio/fin)
- Tarjetas resumen: Ingresos totales, Costo total, Ganancia neta, Margen promedio
- Gráfico de barras de ganancias por día
- Gráfico de productos más rentables
- Tabla de productos con baja rentabilidad (<10% margen)
- Actualización automática al cambiar fechas

**Estados:**
- `dateRange` - Objeto con startDate y endDate
- `reportData` - Datos del reporte (totalRevenue, totalCost, totalProfit, averageMargin, etc.)
- `loading` - Estado de carga

**Componentes:**
- Inputs de fecha con selector
- Tarjetas de estadísticas con iconos
- Gráficos usando Recharts (BarChart, PieChart)
- Tabla de productos con margen

**Cálculos:**
- Margen = (profit / revenue) × 100
- Productos con margen < 10% se marcan como "baja rentabilidad" en rojo

---

## Componentes Reutilizables

### Sidebar.jsx
**Descripción:** Navegación lateral con menú y controles.

**Funcionalidades:**
- Links de navegación (Dashboard, Productos, Ventas, Historial, Ganancias)
- Indicador de página activa
- Collapsible (expandir/colapsar)
- Toggle modo claro/oscuro
- Información del usuario
- Botón cerrar sesión

**Propiedades visuales:**
- Logo con gradiente
- Iconos SVG para cada sección
- Tooltips cuando está colapsado

**Rutas del menú:**
- `/` - Dashboard
- `/products` - Productos
- `/sales` - Nueva Venta
- `/sales-history` - Historial
- `/profit-report` - Ganancias

---

## Contextos (Estado Global)

### AuthContext.jsx
**Proveedor:** `AuthProvider`

**Estado:**
- `user` - Usuario autenticado
- `token` - JWT token
- `loading` - Estado de carga inicial
- `login(user, token)` - Función para iniciar sesión
- `logout()` - Función para cerrar sesión

**Uso:**
```jsx
const { user, login, logout } = useAuth()
```

**Storage:** Token guardado en localStorage

---

### ThemeContext.jsx
**Proveedor:** `ThemeProvider`

**Estado:**
- `darkMode` - Boolean para modo oscuro
- `toggleDarkMode()` - Función para cambiar modo

**Uso:**
```jsx
const { darkMode, toggleDarkMode } = useTheme()
```

**Efectos:** Agrega/remove clase `dark` del elemento `html`

---

### SidebarContext.jsx
**Proveedor:** `SidebarProvider`

**Estado:**
- `sidebarOpen` - Boolean (expandido/colapsado)
- `toggleSidebar()` - Función para cambiar estado

**Uso:**
```jsx
const { sidebarOpen, toggleSidebar } = useSidebar()
```

---

## Servicios (API)

### services/api.js
**Descripción:** Configuración de clientes HTTP y endpoints.

**Servicios:**
- `authService` - Endpoints de auth (login, register, profile)
- `productService` - Endpoints de productos (getAll, create, update, delete, getStock)
- `invoiceService` - Endpoints de facturas (create, getAll, getById)
- `dashboardService` - Endpoint de estadísticas del dashboard (getStats)
- `profitService` - Endpoints de reportes de ganancias (getReport, getByProduct)

**Configuración:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

## Estilos (CSS)

### styles/index.css

**Tailwind Config:**
- Colores primary (Indigo) y secondary (Pink)
- Animaciones personalizadas
- Componentes reutilizables

**Componentes CSS:**
```css
.card        /* Card con sombra y border */
.btn-primary /* Botón primario con gradiente */
.btn-secondary /* Botón secundario outline */
.input-field /* Input con focus ring */
.badge       /* Badges de colores */
```

**Modo Oscuro:**
- Soporte completo con `dark:` prefix
- Colores adaptados para黑暗中

---

## Rutas (React Router)

```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
  <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
  <Route path="/sales-history" element={<PrivateRoute><SalesHistory /></PrivateRoute>} />
</Routes>
```

**PrivateRoute:** Componente que verifica autenticación antes de renderizar.

---

## Dependencias de Estilos

### Tailwind CSS
- Colores personalizados en `tailwind.config.js`
- Clases de utilidad para responsive design

### Font
- Google Fonts: Inter (cargado en index.css)

---

## Notas de Diseño UI/UX

### Design System (./.stitch/DESIGN.md)
- **Paleta:** Primary (Indigo #6366F1), Secondary (Pink #EC4899)
- **Componentes:** Cards, Buttons, Inputs, Badges
- **Animaciones:** fade-in, slide-up, scale-in
- **Modo Oscuro:** Totalmente soportado

### Mejor reciente (Abril 2026)
- Gradientes sutiles en backgrounds
- Sombras suaves (shadow-card, shadow-glow)
- Hover effects con transform y transitions
- Estados vacíos con iconos SVG
- Toasts de notificación animados