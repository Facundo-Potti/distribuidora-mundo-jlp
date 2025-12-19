# 🚀 Inicializar Base de Datos desde tu Computadora

## Problema
La ruta `/api/admin/init-db` no está disponible en Vercel (error 404). Puedes inicializar la base de datos desde tu computadora.

## ✅ Solución: Inicializar desde Local

### Paso 1: Obtener la URL de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Settings > Database
3. Copia la "Connection string" (URI)
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña
5. Agrega `?sslmode=require` al final

**Ejemplo:**
```
postgresql://postgres.xxxxx:TuPassword123@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require
```

### Paso 2: Configurar en tu computadora

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Agrega o actualiza `DATABASE_URL` con la URL de Supabase:

```env
DATABASE_URL="postgresql://postgres.xxxxx:TuPassword123@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Paso 3: Ejecutar el script

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm run db:init:prod
```

O directamente:

```powershell
npx tsx scripts/init-production.ts
```

### Paso 4: Verificar

1. Ve a tu sitio en Vercel: `https://distribuidora-mundo-jlp.vercel.app`
2. Haz clic en "Iniciar Sesión"
3. Logueate con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

✅ **Si funciona, ¡estás listo!**

---

## 🔍 Verificar Conexión Primero

Antes de inicializar, puedes verificar que la conexión funciona:

```powershell
npm run db:test
```

Esto te dirá si puedes conectarte a la base de datos.

---

## 🆘 Si hay Errores

### Error: "Can't reach database server"
- Verifica que la `DATABASE_URL` esté correcta
- Verifica que la contraseña esté bien escrita
- Verifica que Supabase esté activo

### Error: "Password authentication failed"
- Verifica la contraseña en la URL
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` correctamente

### Error: "Database does not exist"
- La base de datos se crea automáticamente, pero verifica la URL

---

## 📝 Notas

- Este método inicializa la base de datos directamente desde tu computadora
- Los cambios se reflejan inmediatamente en Vercel
- No necesitas hacer deploy adicional
- Puedes ejecutar este script cada vez que necesites resetear la base de datos





