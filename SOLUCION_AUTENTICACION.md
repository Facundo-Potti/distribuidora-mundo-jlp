# Solución: Error de Autenticación en Base de Datos

## Problema

```
Authentication failed against database server, the provided database credentials for `postgres.qnviwuiqeaoixiplzqac` are not valid.
```

## Solución

### Opción 1: Usar Connection Pooling (Recomendado para scripts)

Para scripts administrativos, usa la conexión de **pooling** que ya funciona:

```powershell
# Conexión POOLING (puerto 6543) - Funciona para scripts
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Ejecutar test
npm run db:test
```

### Opción 2: Obtener la Conexión Directa Correcta

Si necesitas usar la conexión directa (puerto 5432):

1. Ve a tu proyecto en Supabase
2. Settings → Database
3. Busca "Connection string" → "Direct connection"
4. Copia la URL completa
5. **IMPORTANTE**: Verifica que la contraseña sea correcta

La URL debería verse así:
```
postgresql://postgres.qnviwuiqeaoixiplzqac:TU_PASSWORD@db.qnviwuiqeaoixiplzqac.supabase.co:5432/postgres?sslmode=require
```

### Opción 3: Resetear la Contraseña de la Base de Datos

Si las credenciales no funcionan:

1. Ve a Supabase → Settings → Database
2. Busca "Database password"
3. Haz clic en "Reset database password"
4. Copia la nueva contraseña
5. Actualiza `DATABASE_URL` con la nueva contraseña

## Verificar que Funciona

Después de configurar `DATABASE_URL`, ejecuta:

```powershell
npm run db:test
```

Deberías ver:
```
✅ Conexión exitosa!
📊 Usuarios en la base de datos: X
📦 Productos en la base de datos: 520
```

## Nota Importante

- **Para scripts locales**: Puedes usar pooling (puerto 6543) o directa (puerto 5432)
- **Para Vercel**: SIEMPRE usa pooling (puerto 6543)
- **Los productos ya están importados**: 520 productos en la base de datos

## Si el Error Persiste

1. Verifica que no haya espacios extra en `DATABASE_URL`
2. Asegúrate de que la contraseña esté entre comillas si tiene caracteres especiales
3. Prueba con la conexión de pooling primero (es más confiable)

