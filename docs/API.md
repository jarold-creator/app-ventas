# Documentación de API - App Ventas

## Base URL
```
http://localhost:3000/api
```

## Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

---

## Endpoints de Autenticación

### 1. Registro de Usuario
**Endpoint:** `POST /auth/register`

**Descripción:** Crear un nuevo usuario en el sistema.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "Jarold Ruda",
    "email": "jarold@email.com",
    "role": "user"
  }
}
```

**Errores:**
- `400` - Email ya registrado o datos inválidos

---

### 2. Inicio de Sesión
**Endpoint:** `POST /auth/login`

**Descripción:** Autenticar usuario y obtener token JWT.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta Exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Jarold Ruda",
    "email": "jarold@email.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401` - Credenciales incorrectas

---

### 3. Obtener Perfil
**Endpoint:** `GET /auth/profile`

**Descripción:** Obtener datos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "name": "Jarold Ruda",
  "email": "jarold@email.com",
  "role": "user",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

## Endpoints de Productos

### 4. Listar Todos los Productos
**Endpoint:** `GET /products`

**Descripción:** Obtener lista de todos los productos.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "name": "Producto A",
    "description": "Descripción del producto",
    "price": "29.99",
    "costPrice": "15.00",
    "stock": 50,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
]
```

---

### 5. Obtener Producto por ID
**Endpoint:** `GET /products/:id`

**Descripción:** Obtener detalles de un producto específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "name": "Producto A",
  "description": "Descripción del producto",
  "price": "29.99",
  "stock": 50,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

**Errores:**
- `404` - Producto no encontrado

---

### 6. Crear Producto
**Endpoint:** `POST /products`

**Descripción:** Crear un nuevo producto.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "string (requerido)",
  "description": "string (opcional)",
  "price": "number (requerido)",
  "costPrice": "number (opcional, default: 0)",
  "stock": "number (opcional, default: 0)"
}
```

**Ejemplo:**
```json
{
  "name": "Laptop HP",
  "description": "Laptop 15 pulgadas",
  "price": 599.99,
  "costPrice": 450.00,
  "stock": 10
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "name": "Laptop HP",
  "description": "Laptop 15 pulgadas",
  "price": "599.99",
  "costPrice": "450.00",
  "stock": 10,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

---

### 7. Actualizar Producto
**Endpoint:** `PUT /products/:id`

**Descripción:** Actualizar un producto existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (enviar solo los campos a actualizar):**
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "costPrice": "number",
  "stock": "number"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "name": "Laptop HP Actualizado",
  "description": "Nueva descripción",
  "price": "549.99",
  "stock": 15,
  "updatedAt": "2026-01-15T11:00:00.000Z"
}
```

**Errores:**
- `404` - Producto no encontrado

---

### 8. Eliminar Producto
**Endpoint:** `DELETE /products/:id`

**Descripción:** Eliminar un producto.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Errores:**
- `404` - Producto no encontrado

---

### 9. Obtener Stock Bajo
**Endpoint:** `GET /products/stock`

**Descripción:** Listar productos con stock bajo (<= 10 unidades).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "name": "Producto A",
    "stock": 5
  }
]
```

---

## Endpoints de Facturas (Ventas)

### 10. Crear Venta
**Endpoint:** `POST /invoices`

**Descripción:** Registrar una nueva venta con sus items.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "userId": 1,
  "total": "109.98",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "InvoiceItems": [
    {
      "id": 1,
      "invoiceId": 1,
      "productId": 1,
      "quantity": 2,
      "unitPrice": "29.99",
      "subtotal": "59.98"
    }
  ]
}
```

**Errores:**
- `400` - Stock insuficiente o datos inválidos

---

### 11. Listar Todas las Ventas
**Endpoint:** `GET /invoices`

**Descripción:** Obtener historial de todas las ventas.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcional):**
- `limit` - Número de resultados (default: 10)
- `offset` - Offset para paginación (default: 0)

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "total": "109.98",
    "createdAt": "2026-01-15T12:00:00.000Z",
    "User": {
      "name": "Jarold Ruda"
    },
    "InvoiceItems": [...]
  }
]
```

---

### 12. Obtener Detalle de Venta
**Endpoint:** `GET /invoices/:id`

**Descripción:** Obtener detalles completos de una factura.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "userId": 1,
  "total": "109.98",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "User": {
    "id": 1,
    "name": "Jarold Ruda",
    "email": "jarold@email.com"
  },
  "InvoiceItems": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "unitPrice": "29.99",
      "subtotal": "59.98",
      "Product": {
        "name": "Producto A"
      }
    }
  ]
}
```

**Errores:**
- `404` - Factura no encontrada

---

## Endpoints de Dashboard

### 13. Obtener Estadísticas
**Endpoint:** `GET /dashboard/stats`

**Descripción:** Obtener estadísticas para el dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "total": 1250.50,
  "profit": 350.00,
  "totalInvoices": 15,
  "totalProducts": 25,
  "lowStockCount": 3,
  "topProducts": [
    { "name": "Producto A", "total": 500.00 },
    { "name": "Producto B", "total": 300.00 }
  ],
  "salesLast7Days": [
    { "date": "2026-01-09", "total": 150.00 },
    { "date": "2026-01-10", "total": 200.00 }
  ],
  "recentInvoices": [
    {
      "id": 1,
      "invoice_number": "1",
      "total": 109.98,
      "profit": 35.00,
      "createdAt": "2026-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### 14. Obtener Reporte de Ganancias
**Endpoint:** `GET /dashboard/profit-report`

**Descripción:** Obtener reporte de ganancias por período.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcional):**
- `startDate` - Fecha inicio (YYYY-MM-DD)
- `endDate` - Fecha fin (YYYY-MM-DD)

**Respuesta Exitosa (200):**
```json
{
  "totalRevenue": 5000.00,
  "totalCost": 3000.00,
  "totalProfit": 2000.00,
  "averageMargin": 40.0,
  "salesByDay": [
    { "date": "2026-04-01", "profit": 150.00, "revenue": 500.00 },
    { "date": "2026-04-02", "profit": 200.00, "revenue": 600.00 }
  ],
  "topProducts": [
    {
      "id": 1,
      "name": "Producto A",
      "price": "29.99",
      "costPrice": "15.00",
      "profit": 450.00,
      "sold": 30
    }
  ],
  "lowMarginProducts": [
    {
      "id": 2,
      "name": "Producto B",
      "price": "50.00",
      "costPrice": "45.00",
      "totalProfit": 25.00,
      "margin": 5.0
    }
  ]
}
```

---

### 15. Obtener Ganancias por Producto
**Endpoint:** `GET /dashboard/profit-by-product`

**Descripción:** Obtener detalle de ganancias por producto.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcional):**
- `startDate` - Fecha inicio (YYYY-MM-DD)
- `endDate` - Fecha fin (YYYY-MM-DD)

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "name": "Producto A",
    "price": "29.99",
    "costPrice": "15.00",
    "stock": 50,
    "totalSold": 30,
    "totalRevenue": 899.70,
    "totalCost": 450.00,
    "totalProfit": 449.70,
    "marginPercentage": 49.97
  }
]
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 |OK - Request exitosa |
| 201 |Created - Recurso creado |
| 400 |Bad Request - Datos inválidos |
| 401 |Unauthorized - Sin autenticación |
| 403 |Forbidden - Sin permisos |
| 404 |Not Found - Recurso no existe |
| 500 |Internal Server Error - Error del servidor |

---

## Notas Adicionales

1. **Tiempo de expiración del token:** 24 horas
2. **Sincronización de DB:** El servidor ejecuta `sequelize.sync({ alter: true })` al iniciar
3. **Validaciones:** Los productos automáticamente descuenta stock al crear una venta
4. **Cálculo de ganancias:** Al registrar una venta se calcula automáticamente:
   - `profit` = (unitPrice - costPrice) × quantity
   - El margen se muestra en la tabla de productos (verde >30%, ámbar 10-30%, rojo <10%)
5. **Filtros de fecha:** Los reportes de ganancias incluyen todo el día seleccionado (00:00:00 a 23:59:59)
6. **Logs:** Errores se muestran en consola del backend