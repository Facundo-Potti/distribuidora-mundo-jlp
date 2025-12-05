# 📸 Configuración de Supabase - Paso a Paso Visual

## Lo que estás viendo

Estás en la pantalla de "Connection String" con "URI" seleccionado, pero **necesitas usar el Pooler**.

## ✅ Pasos Exactos

### Paso 1: Cambiar el Method

En la pantalla que estás viendo:

1. **Mira el dropdown "Method"** (el tercer dropdown)
2. **Cámbialo de "Direct connection" a "Session Pooler"** o **"Connection pooling"**

### Paso 2: Obtener la URL del Pooler

Después de cambiar a "Session Pooler", verás una nueva URL que se verá así:

```
postgresql://postgres.qnviwuiqeaoixiplzqac:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Nota importante:**
- Usa `pooler.supabase.com` (NO `db.xxxxx.supabase.co`)
- Puerto `6543` (NO `5432`)

### Paso 3: Copiar y Formatear la URL

1. **Copia** la URL completa que aparece
2. **Reemplaza** `[YOUR-PASSWORD]` con tu contraseña real
3. **Agrega** `?sslmode=require` al final

**Ejemplo final:**
```
postgresql://postgres.qnviwuiqeaoixiplzqac:TuPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Paso 4: Si tu contraseña tiene caracteres especiales

Si tu contraseña tiene `@`, `#`, `$`, `%`, etc., debes codificarla:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

O ejecuta:
```powershell
.\scripts\encode-password.ps1
```

### Paso 5: Usar esta URL en Vercel

1. Ve a Vercel Dashboard
2. Tu proyecto > Settings > Environment Variables
3. Busca o crea `DATABASE_URL`
4. Pega la URL completa del Paso 3
5. Guarda

---

## 🔍 Diferencias Clave

### ❌ NO uses esto (Direct connection):
```
postgresql://postgres:[PASSWORD]@db.qnviwuiqeaoixiplzqac.supabase.co:5432/postgres
```
- Usa `db.xxxxx.supabase.co`
- Puerto `5432`
- No es compatible con IPv4 (por eso el warning)

### ✅ USA esto (Session Pooler):
```
postgresql://postgres.qnviwuiqeaoixiplzqac:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```
- Usa `pooler.supabase.com`
- Puerto `6543`
- Compatible con Vercel

---

## 🎯 Resumen Rápido

1. En Supabase, cambia **"Method"** a **"Session Pooler"**
2. Copia la nueva URL (con `pooler.supabase.com` y puerto `6543`)
3. Reemplaza `[YOUR-PASSWORD]` con tu contraseña
4. Agrega `?sslmode=require` al final
5. Pega esta URL en Vercel como `DATABASE_URL`
6. Haz redeploy

---

## ⚠️ Si no ves la opción "Session Pooler"

1. Busca un botón que diga **"Pooler settings"** (está cerca del warning)
2. O busca otra pestaña que diga **"Connection pooling"**
3. O en el dropdown "Type", busca opciones relacionadas con "Pooler"

