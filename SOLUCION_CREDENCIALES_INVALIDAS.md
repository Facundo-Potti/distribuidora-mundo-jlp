# Solución: Credenciales Inválidas

## ✅ Estado Actual

Los usuarios están correctamente configurados en la base de datos:
- ✅ `admin@mundojlp.com` / `admin123` (rol: admin)
- ✅ `demo@mundojlp.com` / `demo123` (rol: user)

Las contraseñas están correctamente hasheadas y verificadas.

## 🔍 Si Aún Te Dice "Credenciales Inválidas"

### 1. Verificar Variables de Entorno

#### En Local (`.env.local`):
```env
DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui
```

#### En Vercel:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que tengas:
   - `DATABASE_URL` (con la conexión de pooling)
   - `NEXTAUTH_URL` (tu URL de Vercel)
   - `NEXTAUTH_SECRET` (debe ser el mismo que en local)

### 2. Reiniciar el Servidor

Si estás en local:
```powershell
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

Si estás en Vercel:
- Los cambios se aplican automáticamente al hacer deploy
- Si no funciona, ve a Deployments → Redeploy

### 3. Verificar que los Usuarios Existen

Ejecuta este comando para verificar:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx tsx scripts/fix-users.ts
```

### 4. Verificar Logs de Autenticación

El código de autenticación tiene logs. Si estás en local, deberías ver en la consola:

```
🔐 Intentando autenticar: admin@mundojlp.com
✅ Usuario encontrado: admin@mundojlp.com, rol: admin
✅ Usuario autenticado exitosamente: admin@mundojlp.com (rol: admin)
```

Si ves `❌ Usuario no encontrado` o `❌ Contraseña inválida`, hay un problema.

### 5. Corregir Usuarios Manualmente

Si necesitas recrear los usuarios:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npx tsx scripts/fix-users.ts
```

## 📋 Credenciales Correctas

- **Admin**: `admin@mundojlp.com` / `admin123`
- **Usuario**: `demo@mundojlp.com` / `demo123`

## ⚠️ Nota Importante

- Asegúrate de que `NEXTAUTH_SECRET` esté configurado (es necesario para NextAuth)
- Si cambias `NEXTAUTH_SECRET`, los usuarios tendrán que volver a iniciar sesión
- En Vercel, asegúrate de que todas las variables de entorno estén configuradas

## 🔄 Si el Problema Persiste

1. Verifica los logs del servidor (local o Vercel)
2. Asegúrate de que la base de datos esté accesible
3. Verifica que `DATABASE_URL` sea correcta en Vercel
4. Prueba con el script `fix-users.ts` para recrear los usuarios






