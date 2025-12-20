# 🔧 Solución: Error de Conexión a Base de Datos en Vercel

## Error
```
P1001: Can't reach database server at `db.qnviwuiqeaoixiplzqac.supabase.co:5432`
```

## Causas Comunes

1. **URL de conexión incorrecta** (más común)
2. **Falta el parámetro SSL** (`?sslmode=require`)
3. **Puerto incorrecto** (debe usar 6543 para connection pooling, no 5432)
4. **Contraseña mal escrita** en la URL

---

## ✅ Solución Paso a Paso

### Paso 1: Obtener la URL Correcta de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **Database**
4. Baja hasta **"Connection string"**
5. **IMPORTANTE:** Elige la pestaña **"Connection pooling"** (NO "URI" normal)
6. Copia la URL que aparece

**Debería verse así:**
```
postgresql://postgres.qnviwuiqeaoixiplzqac:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**NO uses esta (es la directa, no funciona bien con Vercel):**
```
postgresql://postgres.qnviwuiqeaoixiplzqac:[YOUR-PASSWORD]@db.qnviwuiqeaoixiplzqac.supabase.co:5432/postgres
```

### Paso 2: Formatear la URL Correctamente

1. **Reemplaza** `[YOUR-PASSWORD]` con tu contraseña real
2. **Agrega** `?sslmode=require` al final
3. **Verifica** que use el puerto **6543** (connection pooling), NO 5432

**Ejemplo correcto:**
```
postgresql://postgres.qnviwuiqeaoixiplzqac:TuPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Paso 3: Actualizar en Vercel

1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Busca `DATABASE_URL`
5. Haz clic en **Edit** (o elimínala y créala de nuevo)
6. Pega la URL correcta (la del Paso 2)
7. Asegúrate de que esté marcada para **Production, Preview y Development**
8. Haz clic en **Save**

### Paso 4: Hacer un Nuevo Deploy

1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** del último deploy
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push:

```powershell
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🔍 Verificar la URL

La URL debe tener estas características:

✅ **Correcto:**
- Usa `pooler.supabase.com` (connection pooling)
- Puerto `6543`
- Tiene `?sslmode=require` al final
- La contraseña está reemplazada (no dice `[YOUR-PASSWORD]`)

❌ **Incorrecto:**
- Usa `db.xxxxx.supabase.co` (conexión directa)
- Puerto `5432`
- No tiene `?sslmode=require`
- Dice `[YOUR-PASSWORD]` sin reemplazar

---

## 🧪 Probar la Conexión Localmente

Antes de hacer deploy, puedes probar la conexión desde tu computadora:

1. Actualiza `.env.local` con la URL de Supabase
2. Ejecuta:
   ```powershell
   npm run db:test
   ```

Si funciona localmente pero no en Vercel, el problema es la variable de entorno en Vercel.

---

## 🆘 Si Aún No Funciona

### Opción 1: Usar Transaction Mode (Más Estable)

En Supabase, en Connection string, elige **"Transaction"** en lugar de "Session":

```
postgresql://postgres.qnviwuiqeaoixiplzqac:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### Opción 2: Verificar Firewall de Supabase

1. Ve a Supabase > Settings > Database
2. Verifica que **"Allow connections from anywhere"** esté habilitado
3. O agrega la IP de Vercel si está restringido

### Opción 3: Verificar que Supabase Esté Activo

1. Ve a tu proyecto en Supabase
2. Verifica que el proyecto esté **activo** (no pausado)
3. Si está pausado, reactívalo

---

## 📝 Checklist

Antes de hacer deploy, verifica:

- [ ] URL usa `pooler.supabase.com` (NO `db.xxxxx.supabase.co`)
- [ ] Puerto es `6543` (NO `5432`)
- [ ] Tiene `?sslmode=require` al final
- [ ] La contraseña está reemplazada (NO dice `[YOUR-PASSWORD]`)
- [ ] Variable está configurada en Vercel para Production, Preview y Development
- [ ] Proyecto de Supabase está activo

---

## ✅ Después de Corregir

1. Haz un nuevo deploy en Vercel
2. Espera a que termine (2-5 minutos)
3. Verifica los logs del deploy
4. Si el build es exitoso, inicializa la base de datos (ver `INICIALIZAR_DESDE_LOCAL.md`)






