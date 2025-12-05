# 🚀 Ejecutar Todo - Instrucciones Simples

## Problema
El comando `prisma db push` se queda esperando confirmación.

## ✅ Solución: Ejecutar en 2 Pasos Simples

### Paso 1: Crear las Tablas

Ejecuta esto en PowerShell:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx tsx scripts/crear-tablas-simple.ts
```

Este comando creará las tablas sin pedir confirmación.

### Paso 2: Crear Usuarios y Productos

Después de que termine el Paso 1, ejecuta:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

Este comando creará los usuarios y productos.

## 🎯 Resumen

1. Ejecuta `npx tsx scripts/crear-tablas-simple.ts` (crea tablas)
2. Ejecuta `npm run db:init:prod` (crea usuarios)
3. Prueba el login en Vercel

## ⏱️ Tiempo Estimado

- Paso 1: 10-30 segundos
- Paso 2: 5-10 segundos
- **Total: menos de 1 minuto**

---

## 🧪 Después de Ejecutar

1. Ve a: `https://distribuidora-mundo-jlp.vercel.app/auth/login`
2. Logueate con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

✅ **Si funciona, ¡estás completamente listo!**


