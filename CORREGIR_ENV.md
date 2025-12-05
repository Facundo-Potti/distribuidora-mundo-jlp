# 🔧 Corregir .env.local

## Problema Detectado

Tu `.env.local` tiene:
```
DATABASE_URL=postgresql://...@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Problemas:**
1. ❌ Puerto `5432` (debe ser `6543` para pooler)
2. ❌ Falta comillas alrededor de la URL

## ✅ Solución

Actualiza tu `.env.local` con esto:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=HrifPW7N3kdYGr7uAW5mzawg6b2Xd5C3eDX/cuCQ0rA=

# Database Configuration - PostgreSQL (Producción)
DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

**Cambios:**
1. ✅ Puerto cambiado de `5432` a `6543`
2. ✅ Agregadas comillas alrededor de la URL
3. ✅ Comentario actualizado

## Después de Actualizar

1. Guarda el archivo `.env.local`
2. Ejecuta:
   ```powershell
   npm run db:generate
   ```
3. Luego ejecuta:
   ```powershell
   npm run db:init:prod
   ```


