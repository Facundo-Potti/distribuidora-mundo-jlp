# 🚀 Cómo Inicializar la Base de Datos

## ✅ Estado Actual

Tu base de datos **YA ESTÁ INICIALIZADA**:
- ✅ 2 usuarios creados (admin y demo)
- ✅ 523 productos importados (520 del CSV + 3 de ejemplo)
- ✅ Tablas creadas

## 🔄 Si Necesitas Reinicializar (Desde Cero)

### Opción 1: Script Automático (Recomendado)

Ejecuta esto en PowerShell:

```powershell
# Configurar conexión
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Ejecutar script completo
npm run db:setup:prod
```

Este script hace:
1. ✅ Crea las tablas
2. ✅ Crea usuarios (admin y demo)
3. ✅ Crea productos de ejemplo

### Opción 2: Paso a Paso

#### Paso 1: Crear Tablas
```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx prisma db push
```

#### Paso 2: Crear Usuarios
```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

#### Paso 3: Importar Productos (Opcional)
```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx tsx scripts/import-products-fixed.ts "e:\Downloads\rptlistarub.csv"
```

## 🔍 Verificar Estado

Para verificar que todo está bien:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:test
```

Deberías ver:
```
✅ Conexión exitosa!
📊 Usuarios en la base de datos: 2
📦 Productos en la base de datos: 523
```

## 📋 Credenciales de Acceso

- **Admin**: `admin@mundojlp.com` / `admin123`
- **Usuario Demo**: `demo@mundojlp.com` / `demo123`

## 🌐 Probar en Vercel

Una vez inicializada, prueba el login en:
```
https://distribuidora-mundo-jlp.vercel.app/auth/login
```

## ⚠️ Nota Importante

- **Para scripts locales**: Usa la conexión de pooling (puerto 6543) que ya funciona
- **Para Vercel**: Ya está configurada automáticamente en las variables de entorno






