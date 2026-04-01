# App Ventas - Sistema de Gestión de Ventas

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Node%20%2B%20PostgreSQL-green" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

## 📋 Descripción

Sistema de gestión de ventas moderno con panel administrativo para gestionar productos, registrar ventas y visualizar estadísticas en tiempo real.

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │ Login   │  │Dashboard│  │Products │  │ Sales   │  │History│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│         │         │         │         │         │         │      │
│         └─────────┴─────────┴─────────┴─────────┴──────┬───────┘      │
│                              │                         │              │
│                        API REST              /profit-report            │
└──────────────────────────────┬──────────────────────────────────┘
                                │
┌──────────────────────────────┴──────────────────────────────────┐
│                      BACKEND (Express + Sequelize)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Auth Routes  │  │Product Routes│  │ Invoice Routes      │   │
│  │ (login,register)│ │ (CRUD)      │  │ (create, list, get) │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dashboard Routes (stats, profit-report, profit-by-product)│   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                │                    │                  │
│         └────────────────┴────────────────────┘                  │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │   Controllers         │                          │
│              │   (Lógica de negocio) │                          │
│              │   + Profit Module    │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┬──────────────────────────────────────┘
                            │
┌──────────────────────────┴──────────────────────────────────────┐
│                   BASE DE DATOS (PostgreSQL)                    │
│  ┌────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐          │
│  │ Users  │  │Products │  │Invoices │  │InvoiceItems │          │
│  │        │  │+costPrice│  │+profit  │  │+cost,profit │          │
│  └────────┘  └─────────┘  └─────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS
- **Gráficos:** Recharts
- **Router:** React Router DOM
- **Estado:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + bcryptjs

## ✨ Características

### Módulo de Productos
- CRUD completo de productos
- Control de stock con badges visuales
- Campo de precio de costo (costPrice)
- Cálculo automático de margen
- Código de colores según rentabilidad

### Módulo de Ventas
- Punto de venta con búsqueda de productos
- Carrito de compras interactivo
- Registro automático de ganancia por venta
- Descuento de stock en tiempo real
- Validación de inventario

### Módulo de Ganancias
- Dashboard con "Ganancia de Hoy"
- Reporte por período con filtros de fecha
- Gráficos de ganancias diarias
- Top productos más rentables
- Productos con baja rentabilidad (<10%)

### Historial
- Lista de todas las facturas
- Búsqueda por número, fecha, usuario o total
- Detalle expandible de cada factura

## 📁 Estructura del Proyecto

```
app-ventas/
├── backend/                    # Servidor API
│   ├── src/
│   │   ├── config/             # Configuración de DB
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middlewares/        # Middlewares (auth)
│   │   ├── models/             # Modelos Sequelize
│   │   └── routes/             # Rutas API
│   ├── package.json
│   └── .env                    # Variables de entorno
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── context/            # Contextos (Auth, Theme, Sidebar)
│   │   ├── pages/              # Páginas de la app
│   │   ├── services/           # Llamadas a API
│   │   └── styles/             # Estilos globales
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/                       # Documentación
│   ├── API.md
│   ├── DATABASE.md
│   ├── ARQUITECTURA.md
│   └── COMPONENTES.md
│
├── .stitch/                    # Design System
│   └── DESIGN.md
│
├── docker-compose.yml          # Contenedores
└── README.md
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Paso 1: Clonar el proyecto
```bash
git clone <repo-url>
cd app-ventas
```

### Paso 2: Configurar Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus credenciales de PostgreSQL
# DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Iniciar servidor ( puerto 3000 )
npm run dev
```

### Paso 3: Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar desarrollo (puerto 5173)
npm run dev
```

### Paso 4: Ejecutar con Docker (Opcional)
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

## 📡 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Crear usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/invoices` | Listar facturas |
| POST | `/api/invoices` | Crear venta |
| GET | `/api/invoices/:id` | Ver detalle de venta |
| GET | `/api/dashboard/stats` | Estadísticas del dashboard |
| GET | `/api/dashboard/profit-report` | Reporte de ganancias |
| GET | `/api/dashboard/profit-by-product` | Ganancias por producto |

## 📊 Módulo de Ganancias

El sistema incluye un completo módulo de seguimiento de ganancias:

### Funcionalidades
- **Precio de costo:** Cada producto tiene un campo `costPrice` configurable
- **Cálculo automático:** Al registrar una venta se calcula:
  - `profit` = (unitPrice - costPrice) × quantity
  - `margen` = (profit / total) × 100
- **Dashboard:** Muestra "Ganancia de Hoy" en tiempo real
- **Reportes:** Gráficos y tablas de ganancias por período
- **Alertas:** Productos con margen < 10% se marcan como baja rentabilidad

### Códigos de Color del Margen
- 🟢 **Verde:** Margen > 30%
- 🟡 **Ámbar:** Margen 10-30%
- 🔴 **Rojo:** Margen < 10%

## 🎨 Design System

El proyecto utiliza un sistema de diseño documentado en `.stitch/DESIGN.md`:

- **Paleta:** Primary (Indigo) + Secondary (Pink)
- **Componentes:** Cards, Buttons, Inputs, Badges
- **Animaciones:** Fade-in, Slide-up, Scale-in
- **Soporte:** Modo claro/oscuro

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev      # Iniciar en modo desarrollo
npm start        # Iniciar en modo producción
```

### Frontend
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Previsualizar build
```

## 🔐 Autenticación

- Los endpoints protegidos requieren token JWT en el header
- Formato: `Authorization: Bearer <token>`
- El token expira en 24 horas

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👤 Autor

Jarold Ruda

---

*Documentado: Abril 2026*