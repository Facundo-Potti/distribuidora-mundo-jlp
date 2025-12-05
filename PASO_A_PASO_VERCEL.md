# 🚀 CONFIGURACIÓN PASO A PASO PARA VERCEL

## 📌 RESUMEN RÁPIDO

Necesitas hacer 3 cosas:
1. Crear una base de datos PostgreSQL (gratis en Supabase)
2. Configurar variables de entorno en Vercel
3. Inicializar la base de datos después del deploy

---

## PASO 1: CREAR BASE DE DATOS EN SUPABASE

### 1.1 Crear cuenta en Supabase

1. Ve a: **https://supabase.com**
2. Haz clic en **"Start your project"** o **"Sign in"**
3. Inicia sesión con GitHub (recomendado) o crea una cuenta con email

### 1.2 Crear un nuevo proyecto

1. Una vez dentro, haz clic en **"New Project"**
2. Completa el formulario:
   - **Name**: `distribuidora-mundo-jlp` (o el nombre que quieras)
   - **Database Password**: **¡GUARDA ESTA CONTRASEÑA!** La necesitarás después
   - **Region**: Elige la más cercana a ti (ej: `South America (São Paulo)`)
3. Haz clic en **"Create new project"**
4. Espera 2-3 minutos mientras se crea el proyecto

### 1.3 Obtener la URL de conexión

1. En tu proyecto de Supabase, ve al menú lateral izquierdo
2. Haz clic en **"Settings"** (icono de engranaje ⚙️)
3. Haz clic en **"Database"** en el submenú
4. Baja hasta la sección **"Connection string"**
5. Verás varias opciones, elige **"URI"** o **"Connection pooling"**
6. Copia la URL que aparece. Se verá algo así:

```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANTE:**
- Reemplaza `[YOUR-PASSWORD]` con la contraseña que guardaste en el paso 1.2
- Si usas "Connection pooling", agrega `?pgbouncer=true` al final
- Si usas "URI" normal, agrega `?sslmode=require` al final

**Ejemplo final:**
```
postgresql://postgres.xxxxxxxxxxxxx:TuPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

---

## PASO 2: CONFIGURAR VERCEL

### 2.1 Ir a tu proyecto en Vercel

1. Ve a: **https://vercel.com**
2. Inicia sesión
3. Selecciona tu proyecto **distribuidora-mundo-jlp**

### 2.2 Agregar variables de entorno

1. En tu proyecto, haz clic en **"Settings"** (arriba en el menú)
2. En el menú lateral izquierdo, haz clic en **"Environment Variables"**
3. Agrega las siguientes variables **UNA POR UNA**:

#### Variable 1: DATABASE_URL

1. Haz clic en **"Add New"**
2. **Name**: `DATABASE_URL`
3. **Value**: Pega la URL que copiaste en el Paso 1.3
4. **Environment**: Selecciona **todas las opciones** (Production, Preview, Development)
5. Haz clic en **"Save"**

#### Variable 2: NEXTAUTH_URL

1. Haz clic en **"Add New"**
2. **Name**: `NEXTAUTH_URL`
3. **Value**: La URL de tu proyecto en Vercel
   - Si ya está desplegado: `https://tu-proyecto.vercel.app`
   - Si no sabes cuál es: después del próximo deploy, Vercel te dará la URL
   - Por ahora puedes poner: `https://distribuidora-mundo-jlp.vercel.app` (ajusta según tu proyecto)
4. **Environment**: Selecciona **todas las opciones**
5. Haz clic en **"Save"**

#### Variable 3: NEXTAUTH_SECRET

1. **Genera un secret seguro:**
   
   **Opción A - Desde PowerShell (Windows):**
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
   Copia el resultado que aparece.

   **Opción B - Desde terminal (Linux/Mac):**
   ```bash
   openssl rand -base64 32
   ```

   **Opción C - Online:**
   Ve a: https://generate-secret.vercel.app/32
   Copia el resultado.

2. En Vercel, haz clic en **"Add New"**
3. **Name**: `NEXTAUTH_SECRET`
4. **Value**: Pega el secret que generaste
5. **Environment**: Selecciona **todas las opciones**
6. Haz clic en **"Save"**

### 2.3 Verificar que las variables estén guardadas

Deberías ver 3 variables:
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`

---

## PASO 3: HACER DEPLOY

### 3.1 Subir los cambios al repositorio

Si ya tienes los cambios en tu código local:

```bash
# Verificar que estás en la raíz del proyecto
cd C:\distribuidora-mundo-jlp

# Ver qué archivos cambiaron
git status

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Configurar PostgreSQL para Vercel"

# Subir a GitHub/GitLab
git push
```

### 3.2 Vercel detectará los cambios automáticamente

1. Vercel detectará automáticamente el push
2. Iniciará un nuevo deploy
3. Puedes ver el progreso en la pestaña **"Deployments"** de tu proyecto

### 3.3 Esperar a que termine el deploy

- El deploy tomará 2-5 minutos
- Verás el progreso en tiempo real
- Cuando termine, verás **"Ready"** en verde ✅

---

## PASO 4: INICIALIZAR LA BASE DE DATOS

### 4.1 Obtener la URL de tu proyecto

1. En Vercel, después del deploy, verás la URL de tu proyecto
2. Será algo como: `https://distribuidora-mundo-jlp.vercel.app`
3. **Copia esta URL**

### 4.2 Actualizar NEXTAUTH_URL (si es necesario)

Si la URL que pusiste en el Paso 2.2 es diferente a la real:

1. Ve a **Settings > Environment Variables**
2. Edita `NEXTAUTH_URL`
3. Pega la URL real de tu proyecto
4. Guarda
5. Haz un nuevo deploy (o espera a que Vercel lo haga automáticamente)

### 4.3 Inicializar la base de datos

Tienes 3 opciones:

#### Opción A: Desde el navegador (Más fácil)

1. Abre una nueva pestaña
2. Ve a: `https://tu-proyecto.vercel.app/api/admin/init-db`
3. Deberías ver un mensaje de error (porque es GET, necesitamos POST)
4. Instala una extensión del navegador como **"REST Client"** o usa Postman

#### Opción B: Desde PowerShell (Recomendado)

Abre PowerShell y ejecuta:

```powershell
# Reemplaza con tu URL real
$url = "https://tu-proyecto.vercel.app/api/admin/init-db"

# Hacer la petición POST
Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json"
```

Si funciona, verás algo como:
```json
{
  "success": true,
  "message": "Base de datos inicializada correctamente",
  "credentials": {
    "admin": {
      "email": "admin@mundojlp.com",
      "password": "admin123"
    }
  }
}
```

#### Opción C: Usar curl (si tienes Git Bash o WSL)

```bash
curl -X POST https://tu-proyecto.vercel.app/api/admin/init-db
```

### 4.4 Verificar que funcionó

1. Ve a tu sitio: `https://tu-proyecto.vercel.app`
2. Haz clic en **"Iniciar Sesión"** o ve a `/auth/login`
3. Intenta loguearte con:
   - **Email**: `admin@mundojlp.com`
   - **Contraseña**: `admin123`

Si funciona, ¡estás listo! ✅

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede conectar a la base de datos"

**Causa:** La `DATABASE_URL` está mal configurada

**Solución:**
1. Ve a Supabase > Settings > Database
2. Copia nuevamente la Connection string
3. Asegúrate de reemplazar `[YOUR-PASSWORD]` con tu contraseña real
4. Agrega `?sslmode=require` al final
5. Actualiza la variable en Vercel
6. Haz un nuevo deploy

### Error: "Credenciales inválidas"

**Causa:** La base de datos no se inicializó

**Solución:**
1. Verifica que ejecutaste el Paso 4.3
2. Revisa los logs en Vercel (Deployments > [tu deploy] > Functions > [función])
3. Intenta ejecutar `/api/admin/init-db` nuevamente

### Error en el build: "Prisma migrate deploy failed"

**Causa:** La base de datos no es accesible o la URL está mal

**Solución:**
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Prueba la conexión desde tu máquina local:
   ```bash
   $env:DATABASE_URL="tu-url-de-supabase"
   npx prisma db pull
   ```
3. Si funciona localmente, el problema es la variable en Vercel

### No puedo ejecutar `/api/admin/init-db`

**Solución alternativa - Desde tu máquina local:**

1. Abre PowerShell en la raíz del proyecto
2. Ejecuta:
   ```powershell
   # Configurar la URL de producción
   $env:DATABASE_URL="tu-url-de-supabase-completa"
   
   # Ejecutar migraciones
   npx prisma migrate deploy
   
   # Ejecutar seed
   npm run db:seed
   ```

---

## ✅ CHECKLIST FINAL

Antes de considerar que todo está listo, verifica:

- [ ] Cuenta en Supabase creada
- [ ] Proyecto en Supabase creado
- [ ] `DATABASE_URL` copiada y configurada en Vercel (con contraseña reemplazada)
- [ ] `NEXTAUTH_URL` configurada en Vercel (URL real del proyecto)
- [ ] `NEXTAUTH_SECRET` generado y configurado en Vercel
- [ ] Código subido a GitHub/GitLab
- [ ] Deploy en Vercel completado exitosamente
- [ ] Base de datos inicializada (`/api/admin/init-db` ejecutado)
- [ ] Login funciona con `admin@mundojlp.com` / `admin123`

---

## 📞 ¿NECESITAS AYUDA?

Si te quedas atascado en algún paso:

1. **Revisa los logs de Vercel:**
   - Ve a Deployments > [tu último deploy] > Logs
   - Busca errores en rojo

2. **Revisa los logs de Supabase:**
   - Ve a Supabase > Logs
   - Verifica si hay intentos de conexión

3. **Prueba localmente primero:**
   - Configura `.env.local` con la URL de Supabase
   - Ejecuta `npm run dev` localmente
   - Si funciona localmente, el problema es la configuración en Vercel

---

## 🎉 ¡LISTO!

Una vez que completes todos los pasos, tu aplicación estará funcionando en Vercel con PostgreSQL. 

**Credenciales de acceso:**
- **Admin**: `admin@mundojlp.com` / `admin123`
- **Usuario**: `demo@mundojlp.com` / `demo123`

**⚠️ IMPORTANTE:** Después de verificar que todo funciona, cambia estas contraseñas por seguridad.


