# ✅ Solución Final - Configurar Base de Datos

## Problema
Las tablas no existen en la base de datos de Supabase.

## Solución Completa

He creado un script que hace todo automáticamente. Ejecuta esto en PowerShell:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:setup:prod
```

Este script:
1. ✅ Crea las tablas automáticamente
2. ✅ Crea los usuarios (admin y demo)
3. ✅ Crea productos de ejemplo

## Después de Ejecutar

1. Espera a que termine (puede tardar 1-2 minutos)
2. Verás un mensaje de éxito con las credenciales
3. Prueba el login en: `https://distribuidora-mundo-jlp.vercel.app/auth/login`

## Credenciales

- **Admin**: `admin@mundojlp.com` / `admin123`
- **Usuario**: `demo@mundojlp.com` / `demo123`

---

## Si Prefieres Hacerlo en 2 Pasos

### Paso 1: Crear Tablas
```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx prisma db push
```

### Paso 2: Inicializar Datos
```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

---

## 🎯 Recomendación

Usa el script automático (`npm run db:setup:prod`) - es más fácil y hace todo de una vez.

