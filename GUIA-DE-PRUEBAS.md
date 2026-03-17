# 🚀 MERCADO SIMPLE — Guía Completa de Pruebas

> **Versión:** 1.0.0 — Marzo 2026  
> **Estado:** ✅ Listo para pruebas reales  
> **URLs locales:** Frontend → http://localhost:3000 | API → http://localhost:3001/api  
> **Producción (Fly.io):** Frontend → https://mercadosimple-web.fly.dev | API → https://mercadosimple-api.fly.dev/api

---

## 📋 CREDENCIALES DE ACCESO

### 🔐 Administrador
| Campo | Valor |
|-------|-------|
| Email | `admin@mercadosimple.com` |
| Contraseña | `Admin123*` |
| Acceso | Panel Admin + Todo el sistema |
| Saldo Pago Simple | $100.000 |

---

### 🏪 Vendedores (5 tiendas activas)

| Tienda | Email | Contraseña | Ciudad | Productos |
|--------|-------|------------|--------|-----------|
| **TechStore Argentina** | `techstore@mercadosimple.com` | `Vendedor123*` | Buenos Aires | Electrónica, Gaming, Audio |
| **ModaBA** | `modaba@mercadosimple.com` | `Vendedor123*` | Buenos Aires | Ropa, Calzado, Accesorios |
| **CasaHogar** | `casahogar@mercadosimple.com` | `Vendedor123*` | Rosario | Muebles, Electrodomésticos |
| **DeportesPlus** | `deportesplus@mercadosimple.com` | `Vendedor123*` | Córdoba | Deportes, Fitness, Outdoor |
| **AgroSimple** | `agrosimple@mercadosimple.com` | `Vendedor123*` | Rosario | Agro, Campo, Ganadería |

---

### 👤 Compradores (5 cuentas activas)

| Nombre | Email | Contraseña | Ciudad |
|--------|-------|------------|--------|
| **Usuario Demo** | `comprador@mercadosimple.com` | `Comprador123*` | Córdoba |
| **María García** | `maria.garcia@gmail.com` | `Comprador123*` | Buenos Aires |
| **Carlos López** | `carlos.lopez@gmail.com` | `Comprador123*` | Mendoza |
| **Ana Fernández** | `ana.fernandez@gmail.com` | `Comprador123*` | Rosario |
| **Pedro Martínez** | `pedro.martinez@gmail.com` | `Comprador123*` | Tucumán |

---

## 📦 CATÁLOGO DE PRODUCTOS (60+ productos)

### Por tienda:
- **TechStore** (17 productos): iPhone 15 Pro, Samsung S24 Ultra, MacBook Pro M3, PS5 Slim, Xbox Series X, Nintendo Switch, Sony WH-1000XM5, Canon EOS R6 II, etc.
- **ModaBA** (8 productos): Nike Air Max, Adidas Ultraboost, Converse, Levi's 501, Ray-Ban Aviador, etc.
- **CasaHogar** (8 productos): Sillón Nórdico, Mesa Comedor Extensible, Lavarropas Whirlpool, Heladera LG Side by Side, Aire Acondicionado Carrier, etc.
- **DeportesPlus** (7 productos): Pelota UCL, MTB SLP, Mancuernas Ajustables, ASICS Gel-Nimbus, The North Face Puffer, etc.
- **AgroSimple** (6 productos): Tractor PAUNY 280, Semillas Soja RR, Glifosato 48%, Mochila Fumigadora, etc.

### Categorías disponibles (20):
Smartphones · Televisores · Laptops y PC · Audio · Gaming · Tablets · Cámaras · Electrodomésticos · Muebles y Deco · Ropa · Calzado · Deportes · **Automotor** · **Agro y Campo** · **Herramientas** · **Bebés y Niños** · Salud y Belleza · Libros · Mascotas · Colección y Arte

---

## 🧪 FLUJOS DE PRUEBA PASO A PASO

### 1. 🛒 FLUJO COMPRADOR

#### A. Registro nuevo comprador
1. Ir a → http://localhost:3000/auth/registro
2. Elegir "Quiero comprar"
3. Completar datos (nombre, email real, contraseña mínimo **8 caracteres** con número y mayúscula)
4. Hacer clic en "Crear cuenta"
5. ✅ Deberías ser redirigido al inicio con sesión iniciada

#### B. Explorar y buscar productos
1. En el buscador → escribir "iPhone" → ver resultados
2. En categorías → clic en "Gaming" → ver filtros por precio
3. Entrar a un producto → ver fotos, descripción, preguntas y respuestas
4. Clic en "Agregar al carrito"

#### C. Proceso de compra completo
1. Ir al carrito (ícono superior derecho)
2. Verificar productos, cantidades
3. Clic "Proceder al pago"
4. **Pago con Pago Simple** (billetera digital):
   - Seleccionar "Pago Simple — Mi billetera"
   - Si el saldo es suficiente → confirmar
5. ✅ Orden creada, ver en "Mis pedidos"

#### D. Favoritos
1. En cualquier producto → clic en ♡ (corazón)
2. Ir a "Mi cuenta" → "Favoritos"
3. ✅ El producto aparece guardado

#### E. Hacer una pregunta
1. Ir a un producto
2. En la sección "Preguntas" → escribir una pregunta
3. Clic "Preguntar"
4. ✅ La pregunta aparece como "pendiente de respuesta"

---

### 2. 🏪 FLUJO VENDEDOR

#### A. Registro nuevo vendedor
1. Ir a → http://localhost:3000/auth/registro
2. Elegir "Quiero vender"
3. Completar datos
4. ✅ Cuenta creada con rol vendedor

#### B. Panel del vendedor
1. Ir a → http://localhost:3000/vendedor/dashboard
2. Ver resumen de ventas, productos y métricas
3. Navegar por los tabs: Productos, Pedidos, Estadísticas, Preguntas

#### C. Publicar un producto
1. En panel vendedor → clic "Nuevo producto" O ir directamente a:
   → http://localhost:3000/vendedor/productos/nuevo
2. Completar:
   - **Título**: ej. "Bicicleta de montaña Trek X-Caliber 7"
   - **Descripción**: descripción detallada
   - **Precio**: ej. 450
   - **Precio anterior**: ej. 580
   - **Stock**: ej. 3
   - **Categoría**: Deportes y Fitness
   - **Marca**: Trek
   - **Modelo**: X-Caliber 7
   - **Condición**: Nuevo
   - **Envío gratis**: activar si aplica
   - **Imagen URL**: (usar imágenes de Unsplash, ej: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600`)
3. Clic "Publicar producto"
4. ✅ Producto activo visible en la tienda

#### D. Responder preguntas
1. Panel vendedor → tab "Preguntas"
2. Ver preguntas de compradores
3. Escribir respuesta y enviar
4. ✅ Comprador ve la respuesta en el producto

#### E. Gestionar pedidos
1. Panel vendedor → tab "Pedidos"
2. Ver pedidos recibidos
3. Cambiar estado: Pendiente → Enviado → Entregado

---

### 3. 💳 FLUJO PAGO SIMPLE (Billetera Digital)

#### A. Ver saldo y movimientos
1. Ir a → http://localhost:3000/mi-cuenta?tab=billetera
2. Ver saldo disponible, CVU único y alias

#### B. Solicitar carga de saldo
1. Tab "Depositar" → ingresar monto (mín. $100)
2. Seleccionar método de pago
3. Enviar solicitud
4. ⏳ Queda como "Pendiente aprobación"
5. Admin debe aprobar → ir al panel admin → "Cargas pendientes"

#### C. Transferir dinero
1. Tab "Transferir"
2. Ingresar CVU, alias o email del destinatario
3. El sistema identifica automáticamente al receptor
4. Confirmar monto y enviar
5. ✅ Transferencia instantánea, ambos reciben notificación

#### D. Generar QR de cobro
1. Tab "Cobrar con QR"
2. Seleccionar tipo: Comercio / Caja / Producto
3. Completar datos del comercio (nombre, CUIT)
4. Generar y descargar QR
5. ✅ QR guardado permanentemente

#### E. Pagar servicios (Rapipago)
1. Tab "Servicios" → Pagar Servicios
2. Seleccionar categoría: ej. "Servicios Básicos"
3. Seleccionar empresa: ej. "Edesur"
4. Ingresar número de cuenta o escanear código de barras
5. Ver factura → Confirmar pago
6. ✅ Comprobante descargable en PDF

#### F. Extracto de cuenta
1. Tab "Extracto" → http://localhost:3000/billetera/extracto
2. Seleccionar período (ej. último mes)
3. Descargar como PDF limpio (sin header/footer)

---

### 4. 🔐 FLUJO ADMINISTRADOR

#### A. Acceso al panel
1. Hacer login como `admin@mercadosimple.com / Admin123*`
2. En el menú de usuario (esquina superior derecha) → "Panel de Administración"
3. O directamente → http://localhost:3000/admin

#### B. Gestión de usuarios
1. Tab "Usuarios" → ver todos los usuarios
2. **Verificar un vendedor**: clic en usuario → cambiar estado a "Verificado"
3. **Bloquear usuario**: cambiar estado a "Bloqueado"
4. **Agregar saldo manualmente**: botón "Agregar saldo" → ingresar monto

#### C. Aprobar cargas de saldo
1. Tab "Cargas pendientes" (con badge rojo si hay pendientes)
2. Ver solicitudes de carga de saldo de los usuarios
3. Clic "Aprobar y acreditar" → saldo se acredita instantáneamente
4. O clic "Rechazar" → ingresar motivo → usuario es notificado

#### D. Gestión de productos
1. Tab "Productos" → ver todos los productos del marketplace
2. **Activar/Desactivar** productos con problemas
3. Ver reseñas pendientes de moderación

#### E. Gestión de órdenes
1. Tab "Pedidos" → ver todas las órdenes del sistema
2. Filtrar por estado: pendiente, confirmado, enviado, entregado
3. Ver detalles de cualquier orden

#### F. Congelar billetera (disputa)
1. Tab "Usuarios" → buscar usuario → clic en el usuario
2. En la sección billetera → "Congelar billetera"
3. Ingresar motivo (disputa abierta, sospecha de fraude, etc.)
4. ✅ Usuario no puede hacer movimientos hasta que se descongele

---

### 5. 📧 EMAIL EN TESTING

El sistema usa **Ethereal Email** (preview mode) para testing. Los emails NO se envían realmente.

Para ver los emails enviados:
1. Mirá los logs del backend en la terminal
2. Buscá una línea como: `Preview URL: https://ethereal.email/message/XXXXXX`
3. Abrí esa URL en el navegador para ver el email completo

Emails que se envían automáticamente:
- **Bienvenida**: al registrarse
- **Confirmación de orden**: al comprar
- **Notificación de transferencia**: al recibir dinero
- **Pago aprobado**: al vendedor cuando se procesa un pago
- **Reset de contraseña**: al usar "Olvidé mi contraseña"

---

## 🌐 RUTAS PRINCIPALES

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage con ofertas y categorías |
| `/auth/login` | Iniciar sesión |
| `/auth/registro` | Crear cuenta |
| `/productos` | Catálogo completo |
| `/productos/[slug]` | Detalle de producto |
| `/carrito` | Carrito de compras |
| `/checkout` | Finalizar compra |
| `/mi-cuenta` | Dashboard del comprador |
| `/mi-cuenta?tab=billetera` | Billetera / Pago Simple |
| `/mi-cuenta?tab=depositar` | Cargar saldo |
| `/mi-cuenta?tab=transferir` | Transferir dinero |
| `/mi-cuenta?tab=servicios` | Pagar servicios |
| `/mi-cuenta?tab=qr` | Generar QR |
| `/mi-cuenta?tab=historial` | Historial de movimientos |
| `/vendedor/dashboard` | Panel del vendedor |
| `/vendedor/productos/nuevo` | Publicar producto |
| `/admin` | Panel administrador |
| `/billetera/extracto` | Extracto bancario descargable |
| `/pago-simple` | Página de Pago Simple |
| `/ayuda` | Centro de ayuda |

---

## 🐛 RESOLUCIÓN DE PROBLEMAS

### ❌ "No puedo iniciar sesión"
- Verificá que el backend esté corriendo en http://localhost:3001
- Verificá que el frontend esté en http://localhost:3000
- En caso de error CORS, revisar `FRONTEND_URL` en `backend/.env`

### ❌ "Internal Server Error al hacer algo con la billetera"
- Verificar que la billetera del usuario fue creada (el seed la crea automáticamente)
- Revisar logs del backend en la terminal

### ❌ "Las imágenes no cargan"
- Las imágenes son URLs de Unsplash, requieren conexión a internet
- Para imágenes locales, usar el campo de URL en publicar producto

### ❌ "No veo los productos en el catálogo"
- Ejecutar el seed: en la carpeta `backend/` → `npm run seed`
- Verificar que el backend esté corriendo

### 🔄 Reiniciar servidores
```powershell
# Backend (carpeta backend/)
npm run start:dev

# Frontend (carpeta frontend/)
npm run dev
```

### 🌱 Re-ejecutar seed (seguro, es idempotente)
```powershell
# Carpeta backend/
npm run seed
```

---

## 💡 RECOMENDACIONES PARA PRUEBAS REALES

1. **Registrate como nuevo vendedor** con tu email real → publicá un producto de prueba
2. **Con otra cuenta, comprá ese producto** → verificá el flujo completo
3. **Como admin**, aprobá la carga de saldo de algún usuario
4. **Probá la transferencia** entre dos cuentas → verificá que el saldo se actualiza en tiempo real
5. **Generá un QR** de comercio → descargarlo y probarlo
6. **Pagá un servicio** (modo simulado) → descargá el comprobante
7. **Probá el buscador** con distintos términos

---

## 📞 SOPORTE TÉCNICO

Para reportar bugs o solicitar nuevas funcionalidades, documentar:
- URL donde ocurrió el error
- Qué usuario estaba usando
- Qué acción realizó
- Mensaje de error exacto
- Screenshot si es posible

---

*Mercado Simple © 2026 — Todos los derechos reservados*
