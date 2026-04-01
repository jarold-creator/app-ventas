# Documentación de Arquitectura - App Ventas

## 1. Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APP VENTAS                                      │
│                                                                             │
│  ┌──────────────────────────────┐     ┌──────────────────────────────────┐ │
│  │         FRONTEND             │     │          BACKEND                 │ │
│  │         (Cliente)             │     │          (Servidor)               │ │
│  │                              │     │                                   │ │
│  │  React + Vite + Tailwind     │────►│  Express + Sequelize + PostgreSQL │ │
│  │                              │ HTTP│                                   │ │
│  │  Puerto: 5173                │     │  Puerto: 3000                      │ │
│  └──────────────────────────────┘     └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de Capas (Backend)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPAS DEL BACKEND                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                           │   │
│  │                    (Routes - API)                               │   │
│  │                                                                 │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │   │
│  │  │ authRoutes   │ │productRoutes│ │   invoiceRoutes       │   │   │
│  │  │ (login,reg)   │ │ (CRUD)      │ │   (create,list,get)   │   │   │
│  │  └──────────────┘ └──────────────┘ └───────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    BUSINESS LOGIC LAYER                         │   │
│  │                    (Controllers)                               │   │
│  │                                                                 │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │   │
│  │  │authController│ │productController│ │ invoiceController   │   │   │
│  │  │              │ │               │ │                      │   │   │
│  │  │ - register   │ │ - getAll     │ │ - createInvoice      │   │   │
│  │  │ - login      │ │ - create     │ │ - getInvoices        │   │   │
│  │  │ - getProfile │ │ - update     │ │ - getInvoice         │   │   │
│  │  │              │ │ - delete     │ │                      │   │   │
│  │  └──────────────┘ └──────────────┘ └───────────────────────┘   │   │
│  │                                    │                                │
│  │                                    ▼                                │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  │                    BUSINESS LOGIC LAYER (CONT.)               │   │
│  │  │                    (Dashboard Controller)                     │   │
│  │  │                                                                 │   │
│  │  │  ┌────────────────────────┐ ┌─────────────────────────────┐  │   │
│  │  │  │  dashboardController  │ │                               │  │   │
│  │  │  │                        │ │                               │  │   │
│  │  │  │ - getStats            │ │                               │  │   │
│  │  │  │ - getProfitReport     │ │                               │  │   │
│  │  │  │ - getProfitByProduct  │ │                               │  │   │
│  │  │  └────────────────────────┘ └─────────────────────────────┘  │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      DATA ACCESS LAYER                         │   │
│  │                      (Models - Sequelize)                      │   │
│  │                                                                 │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │   │
│  │  │    User      │ │   Product    │ │   Invoice / InvoiceItem│   │   │
│  │  └──────────────┘ └──────────────┘ └───────────────────────┘   │   │
│  │                              │                                   │   │
│  │                              ▼                                   │   │
│  │                    ┌──────────────────┐                         │   │
│  │                    │  Sequelize ORM   │                         │   │
│  │                    └────────┬─────────┘                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DATABASE LAYER                               │   │
│  │                    (PostgreSQL)                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Datos (Request-Response)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE UNA REQUEST                               │
│                                                                             │
│  CLIENTE                    BACKEND                    DATABASE          │
│                                                                             │
│    │                                                                          │
│    │  1. HTTP Request                                                        │
│    │  (POST /api/products)                                                   │
│    ├────────────────────────────────────────────────────────────────────►     │
│    │                                                                          │
│    │                    2. Middleware (authMiddleware)                      │
│    │                    ┌────────────────────────────────────┐             │
│    │                    │ - Verificar token JWT             │             │
│    │                    │ - Adjuntar user al request        │             │
│    │                    └────────────────────────────────────┘             │
│    │                                                                          │
│    │                              │                                         │
│    │                              ▼                                         │
│    │                    3. Route Handler                                    │
│    │                    ┌────────────────────────────────────┐             │
│    │                    │ productController.createProduct   │             │
│    │                    └────────────────────────────────────┘             │
│    │                              │                                         │
│    │                              ▼                                         │
│    │                    4. Business Logic                                  │
│    │                    ┌────────────────────────────────────┐             │
│    │                    │ - Validar datos                   │             │
│    │                    │ - Crear registro en DB            │             │
│    │                    │ - Responder al cliente            │             │
│    │                    └────────────────────────────────────┘             │
│    │                              │                                         │
│    │                              ▼                                         │
│    │                    5. Sequelize ORM                                   │
│    │                    ┌────────────────────────────────────┐             │
│    │                    │ Product.create({...})             │             │
│    │                    └────────────────────────────────────┘             │
│    │                              │                                         │
│    │                              ▼                                         │
│    │                    6. Query a PostgreSQL                             │
│    │                    ┌────────────────────────────────────┐             │
│    │                    │ INSERT INTO products (...)        │             │
│    │                    └────────────────────────────────────┘             │
│    │                                                                  │     │
│    │                              │                                         │
│    │                              ◄──────────────────────────────────────── │
│    │                                                                          │
│    │  7. HTTP Response                                                      │
│    │  (201 Created - {id: 1, ...})                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Autenticación (JWT)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN JWT                              │
│                                                                             │
│                                                                             │
│  1. REGISTRO                                                                │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │  Client  │────►│  Route   │────►│ Controller│────►│   DB     │           │
│  │          │     │ /register│     │ register │     │ users    │           │
│  │ POST     │     │         │     │ + bcrypt │     │ (hash)   │           │
│  │ {email,  │     │         │     │ gen JWT  │     │          │           │
│  │  pass}   │     │         │     │          │     │          │           │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘           │
│                          │                                                   │
│                          ▼                                                   │
│                    { token: "eyJ..." }                                       │
│                                                                             │
│                                                                             │
│  2. LOGIN                                                                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │  Client  │────►│  Route   │────►│ Controller│────►│   DB     │           │
│  │          │     │ /login   │     │ login    │     │ users    │           │
│  │ POST     │     │         │     │ compare  │     │ (verify) │           │
│  │ {email,  │     │         │     │ bcrypt   │     │          │           │
│  │  pass}   │     │         │     │ gen JWT  │     │          │           │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘           │
│                          │                                                   │
│                          ▼                                                   │
│                    { user: {...}, token: "eyJ..." }                         │
│                                                                             │
│                                                                             │
│  3. PETICIONES AUTENTICADAS                                                 │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │  Client  │────►│ Middleware│────►│ Controller│────►│   DB     │           │
│  │          │     │ verify JWT│     │           │     │          │           │
│  │ GET      │     │           │     │           │     │          │           │
│  │ /products│     │ decode    │     │ process   │     │ query    │           │
│  │ Bearer   │     │ extract   │     │ request   │     │          │           │
│  │ eyJ...   │     │ userId     │     │           │     │          │           │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Patrón MVC (Model-View-Controller)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PATRÓN MVC APLICADO                               │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (React)                            │   │
│  │                                                                      │   │
│  │   VIEW                    CONTROLLER              MODEL             │   │
│  │   (Pages)                 (useEffects)            (API services)     │   │
│  │                                                                      │   │
│  │   Dashboard  ──────────►  loadStats()   ─────►  dashboardService   │   │
│  │   Products   ──────────►  loadProducts() ───►  productService      │   │
│  │   Sales      ──────────►  createInvoice() ──►  invoiceService      │   │
│  │                                                                      │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │ HTTP                                   │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                         BACKEND (Express)                          │   │
│  │                                                                      │   │
│  │   ROUTE (View)        CONTROLLER (Logic)        MODEL (Data)       │   │
│  │                                                                      │   │
│  │   /api/products  ──► productController  ──►  Product (Sequelize)  │   │
│  │   GET /             │  getAllProducts()      │  findAll()          │   │
│  │   POST /            │  createProduct()      │  create()           │   │
│  │   PUT /:id          │  updateProduct()       │  update()           │   │
│  │   DELETE /:id       │  deleteProduct()       │  destroy()          │   │
│  │                                                                      │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Diagrama de Componentes (Frontend)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA FRONTEND                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PROVIDERS / CONTEXT                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐     │   │
│  │  │ AuthContext │  │ThemeContext │  │    SidebarContext       │     │   │
│  │  │ (user,token)│  │(darkMode)   │  │    (collapsed)          │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘     │   │
│  │       │                 │                    │                     │   │
│  └───────┼─────────────────┼────────────────────┼─────────────────────┘   │
│          │                 │                    │                         │
│          ▼                 ▼                    ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PÁGINAS                                     │   │
│  │                                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐  │   │
│  │  │  Login   │  │Dashboard │  │ Products │  │  Sales  │  │History│  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └───────┘  │   │
│  │       │              │              │              │          │      │   │
│  │       └──────────────┴──────────────┴──────────────┴──────────┘      │   │
│  │                              │                                         │   │
│  └──────────────────────────────┼─────────────────────────────────────────┘   │
│                                 │                                          │
│                                 ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVICIOS (API)                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │authService │ │productService│ │invoiceService│ │dashboardService│   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │       │                │               │               │            │   │
│  │       └────────────────┴───────────────┴───────────────┘            │   │
│  │                              │                                         │   │
│  └──────────────────────────────┼─────────────────────────────────────────┘   │
│                                 │                                          │
│                                 ▼                                          │
│                        AXIOS / FETCH                                       │
│                                 │                                          │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
                                  ▼
                           ┌─────────────────┐
                           │  BACKEND API    │
                           │  localhost:3000 │
                           └─────────────────┘
```

---

## 7. Stack Tecnológico Detallado

### Backend
| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| Node.js | Runtime JavaScript | 18+ |
| Express.js | Framework web | ^4.18 |
| Sequelize | ORM para PostgreSQL | ^6.32 |
| PostgreSQL | Base de datos relacional | 14+ |
| JWT | Autenticación stateless | ^9.0 |
| bcryptjs | Hash de contraseñas | ^2.4 |
| dotenv | Variables de entorno | ^16.0 |
| cors | CORS middleware | ^2.8 |

### Frontend
| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| React | Framework UI | 18 |
| Vite | Build tool | 4+ |
| Tailwind CSS | Framework CSS | 3 |
| React Router | Navegación | v6 |
| Recharts | Gráficos | ^2 |
| Axios | HTTP client | ^1.6 |

---

## 8. Decisiones de Diseño

### 8.1 Autenticación
- **JWT (JSON Web Tokens):** Stateless, ideal para APIs REST
- **bcrypt:** Hashing de contraseñas con salt automático
- **Expiración:** 24 horas para el token

### 8.2 Base de Datos
- **Sequelize ORM:** Abstracción de la DB, código más limpio
- ** snake_case:** Convenciones PostgreSQL (users, products, invoice_items)
- **Timestamps automáticos:** created_at, updated_at

### 8.3 Frontend
- **Context API:** Estado global sin necesidad de Redux
- **Tailwind:** Estilos rápidos y consistentes
- **Componentes funcionales:** React hooks (useState, useEffect, useContext)

### 8.4 Seguridad
- **CORS:** Solo permite requests desde localhost:5173
- **Middleware auth:** Verifica JWT en cada request protegida
- **Password hashing:** Nunca se guarda password en texto plano

---

## 9. Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/database
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

---

## 10. Scripts de Ejecución

### Desarrollo
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Producción
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```