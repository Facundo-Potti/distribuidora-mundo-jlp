# Solución: Error "prepared statement already exists"

## Problema

Cuando usas **Connection Pooling** de Supabase (puerto `6543`), puedes encontrar este error:
```
ERROR: prepared statement "s0" already exists
```

Esto ocurre porque el pooling comparte prepared statements entre conexiones.

## Solución

Para scripts administrativos (`db:test`, `db:init:prod`), usa la **conexión directa** en lugar del pooling.

### Paso 1: Obtener la conexión directa

1. Ve a tu proyecto en Supabase
2. Settings → Database
3. Busca "Connection string" → "Direct connection"
4. Copia la URL (puerto `5432`, no `6543`)

### Paso 2: Usar la conexión directa en scripts

En PowerShell, antes de ejecutar los scripts, configura `DATABASE_URL` con la conexión directa:

```powershell
# Conexión DIRECTA (para scripts administrativos)
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:TU_PASSWORD@db.qnviwuiqeaoixiplzqac.supabase.co:5432/postgres?sslmode=require"

# Luego ejecuta el script
npm run db:test
# o
npm run db:init:prod
```

### Paso 3: Para producción (Vercel)

En Vercel, **SIEMPRE usa Connection Pooling** (puerto `6543`):
```
postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Resumen

- **Scripts locales**: Usa conexión directa (puerto `5432`)
- **Vercel/Producción**: Usa connection pooling (puerto `6543`)

## Nota

Los productos ya están importados (520 productos). Si solo necesitas verificar, puedes usar Prisma Studio:

```powershell
$env:DATABASE_URL="postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres?sslmode=require"
npx prisma studio
```
