# 📦 Configurar Supabase Storage para Imágenes

## Problema Resuelto

El error `EROFS: read-only file system` ocurre porque Vercel (y otros entornos serverless) tienen un sistema de archivos de solo lectura. No puedes escribir archivos directamente en el servidor.

**Solución:** Usar Supabase Storage para almacenar las imágenes de productos.

## Pasos para Configurar

### 1. Crear Bucket en Supabase Storage

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Configura el bucket:
   - **Name:** `productos`
   - **Public bucket:** ✅ **SÍ** (marcar como público para que las imágenes sean accesibles)
   - Haz clic en **Create bucket**

### 2. Configurar Políticas de Seguridad (RLS)

1. En el bucket `productos`, ve a **Policies**
2. Haz clic en **New Policy**
3. Selecciona **For full customization**
4. Configura una política para permitir lectura pública:

```sql
-- Policy name: Public read access
-- Allowed operation: SELECT
-- Policy definition:
true
```

5. Para escritura, crea otra política que solo permita a usuarios autenticados con rol admin:

```sql
-- Policy name: Admin write access
-- Allowed operation: INSERT, UPDATE, DELETE
-- Policy definition:
auth.jwt() ->> 'role' = 'admin'
```

**Nota:** Por ahora, puedes usar la Service Role Key para subir imágenes desde el servidor, que ya está configurada.

### 3. Obtener las Variables de Entorno

1. En Supabase Dashboard, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (en la sección "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (opcional, para uso futuro)

### 4. Configurar Variables de Entorno

#### En Local (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

#### En Vercel:

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key-aqui`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tu-anon-key-aqui` (opcional)

### 5. Reiniciar el Servidor

Después de configurar las variables de entorno:

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar
npm run dev
```

## Verificación

1. Ve a `/admin` en tu aplicación
2. Intenta subir una imagen de producto
3. La imagen debería subirse correctamente a Supabase Storage
4. La URL de la imagen será algo como: `https://tu-proyecto.supabase.co/storage/v1/object/public/productos/producto-1-1234567890.png`

## Solución de Problemas

### Error: "Supabase no está configurado"
- Verifica que las variables de entorno estén configuradas correctamente
- Reinicia el servidor después de agregar las variables

### Error: "Bucket not found"
- Verifica que el bucket `productos` exista en Supabase Storage
- Verifica que el nombre del bucket sea exactamente `productos` (minúsculas)

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén configuradas correctamente
- Si usas Service Role Key, deberías poder subir sin problemas de RLS

### Las imágenes no se muestran
- Verifica que el bucket sea público
- Verifica que `next.config.js` tenga configurado el dominio de Supabase en `remotePatterns`
- Verifica que la URL de la imagen sea correcta

## Notas Importantes

- ⚠️ **NUNCA** expongas tu `SUPABASE_SERVICE_ROLE_KEY` en el código del cliente
- ✅ Solo usa `SUPABASE_SERVICE_ROLE_KEY` en rutas API del servidor
- ✅ El bucket debe ser público para que las imágenes sean accesibles sin autenticación
- ✅ Las imágenes se almacenan permanentemente en Supabase Storage





