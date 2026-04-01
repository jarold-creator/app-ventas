# Documentación de Base de Datos - App Ventas

## Diagrama de Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │       │    Products    │       │  InvoiceItems  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email (unique)  │       │ name            │       │ invoiceId (FK)  │
│ password        │       │ description     │       │ productId (FK)  │
│ name            │       │ price           │◄──────┤ quantity        │
│ role            │       │ costPrice       │       │ unitPrice       │
│ created_at      │       │ stock           │       │ subtotal        │
│ updated_at      │       │ created_at      │       │ cost            │
└───────┬─────────┘       │ updated_at      │       │ profit          │
        │                └─────────────────┘       └────────┬────────┘
        │                                                    
        │                                                    
        │              ┌─────────────────┐                  
        └─────────────►│    Invoices     │                  
                       ├─────────────────┤                  
                       │ id (PK)         │                  
                       │ userId (FK)     │◄──────────────────
                       │ total           │                  
                       │ profit          │                  
                       │ created_at      │                  
                       │ updated_at      │                  
                       └─────────────────┘                  
```

## Esquema de Tablas

---

### 1. Tabla: `users`

**Descripción:** Almacena los usuarios del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PK, autoIncrement | Identificador único |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico |
| password | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| name | VARCHAR(255) | NOT NULL | Nombre del usuario |
| role | VARCHAR(50) | DEFAULT 'user' | Rol del usuario |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT now() | Fecha de actualización |

**Índices:**
- `email` (único)

---

### 2. Tabla: `products`

**Descripción:** Catálogo de productos disponibles para venta.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PK, autoIncrement | Identificador único |
| name | VARCHAR(255) | NOT NULL | Nombre del producto |
| description | TEXT | NULL | Descripción del producto |
| price | DECIMAL(10,2) | NOT NULL | Precio unitario de venta |
| costPrice | DECIMAL(10,2) | DEFAULT 0 | Precio de costo unitario |
| stock | INTEGER | DEFAULT 0 | Cantidad en inventario |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT now() | Fecha de actualización |

**Índices:**
- `name`

---

### 3. Tabla: `invoices`

**Descripción:** Registro de ventas/facturas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PK, autoIncrement | Identificador único |
| userId | INTEGER | NOT NULL, FK → users.id | Vendedor que realizó la venta |
| total | DECIMAL(10,2) | NOT NULL | Total de la factura |
| profit | DECIMAL(10,2) | DEFAULT 0 | Ganancia neta de la venta |
| created_at | TIMESTAMP | DEFAULT now() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT now() | Fecha de actualización |

**Relaciones:**
- `userId` → `users.id` (Many-to-One)

**Índices:**
- `userId`

---

### 4. Tabla: `invoice_items`

**Descripción:** Detalle de cada producto en una factura.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PK, autoIncrement | Identificador único |
| invoiceId | INTEGER | NOT NULL, FK → invoices.id | Factura relacionada |
| productId | INTEGER | NOT NULL, FK → products.id | Producto vendido |
| quantity | INTEGER | NOT NULL | Cantidad de unidades |
| unitPrice | DECIMAL(10,2) | NOT NULL | Precio unitario al momento |
| subtotal | DECIMAL(10,2) | NOT NULL | quantity × unitPrice |
| cost | DECIMAL(10,2) | DEFAULT 0 | Costo total del ítem (costPrice × quantity) |
| profit | DECIMAL(10,2) | DEFAULT 0 | Ganancia del ítem ((unitPrice - costPrice) × quantity) |

**Relaciones:**
- `invoiceId` → `invoices.id` (Many-to-One)
- `productId` → `products.id` (Many-to-One)

**Índices:**
- `invoiceId`
- `productId`

---

## Relaciones entre Tablas

```
User (1) ──────────< (N) Invoice
                            │
                            └─< (N) InvoiceItem
                                          │
                                          └─< (N) Product
```

### Detalle de Relaciones

| Padre | Hijo | Tipo | FK en hijo |
|-------|------|------|-------------|
| User | Invoice | One-to-Many | invoice.userId |
| Invoice | InvoiceItem | One-to-Many | invoiceItem.invoiceId |
| Product | InvoiceItem | One-to-Many | invoiceItem.productId |

---

## Tipos de Datos PostgreSQL

| Tipo Sequelize | Tipo PostgreSQL | Uso |
|----------------|-----------------|-----|
| INTEGER | INTEGER | IDs, contadores |
| STRING(n) | VARCHAR(n) | Textos cortos |
| TEXT | TEXT | Descripciones largas |
| DECIMAL(p,s) | NUMERIC(p,s) | Valores monetarios |
| TIMESTAMP | TIMESTAMP | Fechas con hora |

---

## Reglas de Negocio

### Inventario (Stock)
1. Al crear una venta, el stock del producto se descuenta automáticamente
2. No se permite vender más unidades de las disponibles en stock
3. Productos con stock <= 5 se consideran "stock bajo"
4. Productos con stock = 0 se consideran "sin stock"

### Facturación
1. Cada factura guarda el precio unitario al momento de la venta
2. El subtotal se calcula automáticamente (quantity × unitPrice)
3. El total de la factura es la suma de todos los subtotales

### Módulo de Ganancias
1. Cada producto tiene un `costPrice` (precio de costo) configurable
2. Al registrar una venta, se calcula automáticamente:
   - `cost` = costPrice × quantity (costo del ítem)
   - `profit` = (unitPrice - costPrice) × quantity (ganancia del ítem)
3. La factura totaliza el `profit` de todos los ítems
4. El margen se calcula: `margen = (profit / total) × 100`
5. Productos con margen < 10% se consideran "baja rentabilidad"

### Timestamps
- `created_at` se genera automáticamente al crear
- `updated_at` se actualiza automáticamente en cada modificación

---

## Consultas Útiles

### Ver todos los productos con stock bajo
```sql
SELECT name, stock 
FROM products 
WHERE stock <= 5 
ORDER BY stock ASC;
```

### Ver ventas de hoy
```sql
SELECT i.*, u.name as user_name 
FROM invoices i 
JOIN users u ON i.userId = u.id 
WHERE DATE(i.created_at) = CURRENT_DATE;
```

### Ver productos más vendidos
```sql
SELECT p.name, SUM(ii.quantity) as total_vendido 
FROM invoice_items ii 
JOIN products p ON ii.productId = p.id 
GROUP BY p.id 
ORDER BY total_vendido DESC 
LIMIT 10;
```

### Ver ingresos por día (últimos 7 días)
```sql
SELECT DATE(created_at) as fecha, SUM(total) as ingresos 
FROM invoices 
WHERE created_at >= NOW() - INTERVAL '7 days' 
GROUP BY DATE(created_at) 
ORDER BY fecha;
```

### Ver ganancias de hoy
```sql
SELECT COALESCE(SUM(profit), 0) as ganancia_neta 
FROM invoices 
WHERE DATE(created_at) = CURRENT_DATE;
```

### Ver productos por rentabilidad (margen)
```sql
SELECT p.name, p.price, p.cost_price,
       (p.price - p.cost_price) as ganancia_unit,
       ((p.price - p.cost_price) / p.price * 100) as margen_porcentaje
FROM products p
WHERE p.price > 0
ORDER BY margen_porcentaje DESC;
```

### Ver productos con baja rentabilidad
```sql
SELECT p.name, p.price, p.cost_price,
       SUM(ii.quantity) as vendido,
       SUM(ii.profit) as ganancia_total,
       (SUM(ii.profit) / SUM(ii.quantity * p.price) * 100) as margen
FROM invoice_items ii
JOIN products p ON ii.productId = p.id
GROUP BY p.id
HAVING (SUM(ii.profit) / NULLIF(SUM(ii.quantity * p.price), 0) * 100) < 10
ORDER BY margen ASC;
```

---

## Notas de Implementación

1. **Sequelize sync:** El servidor ejecuta `sequelize.sync({ alter: true })` que crea/actualiza tablas automáticamente
2. **Naming:** Sequelize usa camelCase en modelos y snake_case en la DB (configurado)
3. **Soft deletes:** No hay, los productos se eliminan físicamente
4. **Transacciones:** Las ventas se registran en una sola operación atómica