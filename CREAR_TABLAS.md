# 🗄️ Crear Tablas en la Base de Datos

## Situación Actual

✅ **Conexión exitosa** - Ya puedes conectarte a Supabase
❌ **Tablas no existen** - Necesitas crear las tablas primero

## ✅ Solución

Ejecuta estos comandos en PowerShell (uno por uno):

### Paso 1: Crear las Tablas

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx prisma db push
```

Esto creará todas las tablas (users, products, orders, etc.) en tu base de datos de Supabase.

### Paso 2: Inicializar con Usuarios

Después de que termine el Paso 1, ejecuta:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

Esto creará los usuarios y productos iniciales.

### Paso 3: Probar el Login

1. Ve a: `https://distribuidora-mundo-jlp.vercel.app/auth/login`
2. Logueate con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

## 🎯 Resumen

1. Ejecuta `npx prisma db push` (crea tablas)
2. Ejecuta `npm run db:init:prod` (crea usuarios)
3. Prueba el login

---

## ⚠️ Nota

Si el comando se queda colgado, espera unos segundos. La creación de tablas puede tardar 30-60 segundos.

