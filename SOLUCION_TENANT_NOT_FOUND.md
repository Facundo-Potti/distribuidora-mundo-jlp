# 🔧 Solución: Error "Tenant or user not found"

## Error
```
FATAL: Tenant or user not found
```

## Causa
La URL de conexión tiene credenciales incorrectas o está mal formateada.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar la Contraseña en Supabase

1. Ve a Supabase Dashboard: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **Database**
4. Si olvidaste la contraseña, puedes **resetearla**:
   - Haz clic en **"Reset database password"**
   - Copia la nueva contraseña (guárdala bien)

### Paso 2: Obtener la URL Correcta

1. En Settings > Database, baja hasta **"Connection string"**
2. Elige la pestaña **"Connection pooling"** (NO "URI")
3. Copia la URL completa

**Formato esperado:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Paso 3: Codificar la Contraseña (IMPORTANTE)

Si tu contraseña tiene caracteres especiales (`@`, `#`, `$`, `%`, `&`, etc.), debes **codificarlos** en la URL.

**Caracteres que deben codificarse:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`

**Ejemplo:**
Si tu contraseña es: `Mi@Pass#123`
Debe quedar: `Mi%40Pass%23123`

### Paso 4: Construir la URL Completa

**Ejemplo paso a paso:**

1. URL base de Supabase:
   ```
   postgresql://postgres.qnviwuiqeaoixiplzqac:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

2. Si tu contraseña es `Mi@Pass#123`, codifícala: `Mi%40Pass%23123`

3. Reemplaza `[YOUR-PASSWORD]`:
   ```
   postgresql://postgres.qnviwuiqeaoixiplzqac:Mi%40Pass%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. Agrega `?sslmode=require` al final:
   ```
   postgresql://postgres.qnviwuiqeaoixiplzqac:Mi%40Pass%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Paso 5: Actualizar en Vercel

1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Tu proyecto > **Settings** > **Environment Variables**
3. Busca `DATABASE_URL`
4. **Elimínala** y créala de nuevo (para asegurarte de que no haya espacios o caracteres ocultos)
5. Pega la URL completa del Paso 4
6. Verifica que esté marcada para **Production, Preview y Development**
7. Haz clic en **Save**

### Paso 6: Probar Localmente Primero

Antes de hacer deploy, prueba la conexión desde tu computadora:

1. Abre `.env.local`
2. Agrega o actualiza:
   ```env
   DATABASE_URL="la-url-completa-del-paso-4"
   ```

3. Ejecuta:
   ```powershell
   npm run db:test
   ```

Si funciona localmente, la URL está correcta. Si no, verifica la contraseña.

### Paso 7: Hacer Nuevo Deploy

Después de verificar que funciona localmente:

1. En Vercel, ve a **Deployments**
2. Haz clic en los **3 puntos** del último deploy
3. Selecciona **"Redeploy"**

O desde PowerShell:
```powershell
git commit --allow-empty -m "Fix database credentials"
git push
```

---

## 🛠️ Herramienta para Codificar la Contraseña

Si tu contraseña tiene caracteres especiales, puedes usar PowerShell para codificarla:

```powershell
# Reemplaza "TuPassword" con tu contraseña real
[System.Web.HttpUtility]::UrlEncode("TuPassword")
```

O usa esta herramienta online: https://www.urlencoder.org/

---

## 🔍 Verificar la URL

La URL debe:

✅ **Tener:**
- `postgresql://` al inicio
- `postgres.[PROJECT-REF]` como usuario
- Contraseña codificada (si tiene caracteres especiales)
- `pooler.supabase.com` (NO `db.xxxxx.supabase.co`)
- Puerto `6543`
- `?sslmode=require` al final

❌ **NO debe:**
- Tener espacios
- Tener `[YOUR-PASSWORD]` sin reemplazar
- Usar `db.xxxxx.supabase.co` (conexión directa)
- Usar puerto `5432`
- Tener caracteres especiales sin codificar

---

## 🆘 Si Aún No Funciona

### Opción 1: Resetear la Contraseña

1. Ve a Supabase > Settings > Database
2. Haz clic en **"Reset database password"**
3. Copia la nueva contraseña
4. Construye la URL de nuevo con la nueva contraseña

### Opción 2: Usar Transaction Mode

En Supabase, en Connection string, elige **"Transaction"**:

```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### Opción 3: Verificar el Proyecto

1. Verifica que estés usando el proyecto correcto en Supabase
2. Verifica que el proyecto esté activo (no pausado)

---

## 📝 Checklist

- [ ] Contraseña verificada/reseteada en Supabase
- [ ] Contraseña codificada si tiene caracteres especiales
- [ ] URL usa `pooler.supabase.com` (NO `db.xxxxx.supabase.co`)
- [ ] Puerto es `6543` (NO `5432`)
- [ ] Tiene `?sslmode=require` al final
- [ ] Probada localmente con `npm run db:test`
- [ ] Variable actualizada en Vercel
- [ ] Nuevo deploy realizado


