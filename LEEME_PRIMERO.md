# 🚀 CONFIGURACIÓN PARA VERCEL - GUÍA SIMPLE

## ⚠️ PROBLEMA
Tu aplicación en Vercel no puede loguearse porque SQLite no funciona en Vercel. Necesitas PostgreSQL.

---

## ✅ SOLUCIÓN EN 3 PASOS

### 📍 PASO 1: CREAR BASE DE DATOS (5 minutos)

#### 1.1 Ir a Supabase
👉 **Abre este enlace:** https://supabase.com/dashboard

#### 1.2 Crear cuenta
- Haz clic en **"Start your project"** o **"Sign in"**
- Elige **"Continue with GitHub"** (más fácil) o crea cuenta con email

#### 1.3 Crear proyecto
1. Haz clic en **"New Project"** (botón verde)
2. Completa:
   - **Name**: `distribuidora-mundo-jlp`
   - **Database Password**: ⚠️ **ESCRIBE UNA CONTRASEÑA Y GUÁRDALA** (ej: `MiPassword123!`)
   - **Region**: Elige la más cercana
3. Haz clic en **"Create new project"**
4. ⏳ Espera 2-3 minutos

#### 1.4 Obtener la URL de conexión
1. En el menú izquierdo, haz clic en **⚙️ Settings**
2. Haz clic en **Database** (en el submenú)
3. Baja hasta **"Connection string"**
4. Haz clic en la pestaña **"URI"**
5. Verás algo como:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **COPIA ESTA URL**
7. **REEMPLAZA** `[YOUR-PASSWORD]` con la contraseña que guardaste
8. **AGREGA** `?sslmode=require` al final

**Ejemplo final:**
```
postgresql://postgres.xxxxxxxxxxxxx:MiPassword123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

✅ **GUARDA ESTA URL COMPLETA** - La necesitarás en el siguiente paso

---

### 📍 PASO 2: CONFIGURAR VERCEL (3 minutos)

#### 2.1 Ir a Vercel
👉 **Abre este enlace:** https://vercel.com/dashboard

#### 2.2 Seleccionar tu proyecto
- Busca tu proyecto **distribuidora-mundo-jlp**
- Haz clic en él

#### 2.3 Ir a Variables de Entorno
1. Haz clic en **"Settings"** (arriba en el menú)
2. En el menú lateral izquierdo, haz clic en **"Environment Variables"**

#### 2.4 Agregar Variable 1: DATABASE_URL
1. Haz clic en **"Add New"**
2. **Name**: `DATABASE_URL`
3. **Value**: Pega la URL completa que guardaste en el Paso 1.4
4. **Environment**: Marca las 3 casillas (Production, Preview, Development)
5. Haz clic en **"Save"**

#### 2.5 Agregar Variable 2: NEXTAUTH_URL
1. Haz clic en **"Add New"**
2. **Name**: `NEXTAUTH_URL`
3. **Value**: 
   - Si ya tienes el proyecto desplegado, copia la URL (ej: `https://distribuidora-mundo-jlp.vercel.app`)
   - Si no, usa: `https://distribuidora-mundo-jlp.vercel.app` (ajusta según tu proyecto)
4. **Environment**: Marca las 3 casillas
5. Haz clic en **"Save"**

#### 2.6 Agregar Variable 3: NEXTAUTH_SECRET
1. **Abre PowerShell** en tu computadora
2. Copia y pega este comando:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
3. Presiona Enter
4. **Copia el resultado** (será una cadena larga de letras y números)
5. En Vercel, haz clic en **"Add New"**
6. **Name**: `NEXTAUTH_SECRET`
7. **Value**: Pega el resultado que copiaste
8. **Environment**: Marca las 3 casillas
9. Haz clic en **"Save"**

✅ **Verifica que tengas 3 variables:**
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET

---

### 📍 PASO 3: HACER DEPLOY E INICIALIZAR (5 minutos)

#### 3.1 Subir cambios al código
Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd C:\distribuidora-mundo-jlp
git add .
git commit -m "Configurar PostgreSQL para Vercel"
git push
```

#### 3.2 Esperar el deploy
1. Ve a Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Verás un nuevo deploy en progreso
5. ⏳ Espera 2-5 minutos hasta que diga **"Ready"** ✅

#### 3.3 Copiar la URL de tu proyecto
1. En Vercel, después del deploy, verás la URL de tu proyecto
2. Será algo como: `https://distribuidora-mundo-jlp-xxxxx.vercel.app`
3. **Copia esta URL completa**

#### 3.4 Inicializar la base de datos

**Opción A: Usar el script (Más fácil)**

1. Abre el archivo `inicializar-db.ps1` en tu editor
2. Reemplaza `TU-URL-AQUI` con tu URL real de Vercel
3. Guarda el archivo
4. Abre PowerShell en la carpeta del proyecto
5. Ejecuta:
   ```powershell
   .\inicializar-db.ps1
   ```

**Opción B: Comando directo (Una línea)**

Abre PowerShell y ejecuta (reemplaza `TU-URL-AQUI` con tu URL):

```powershell
Invoke-RestMethod -Uri "https://TU-URL-AQUI.vercel.app/api/admin/init-db" -Method Post
```

**Ejemplo:**
```powershell
Invoke-RestMethod -Uri "https://distribuidora-mundo-jlp-xxxxx.vercel.app/api/admin/init-db" -Method Post
```

⚠️ **IMPORTANTE:** Todo debe estar en UNA SOLA LÍNEA. No copies varias líneas.

Si funciona, verás un mensaje como:
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

#### 3.5 Probar el login
1. Ve a tu sitio: `https://tu-url.vercel.app/auth/login`
2. Ingresa:
   - **Email**: `admin@mundojlp.com`
   - **Contraseña**: `admin123`
3. Haz clic en **"Iniciar Sesión"**

✅ **Si funciona, ¡estás listo!**

---

## 🆘 SI ALGO NO FUNCIONA

### No puedo crear cuenta en Supabase
- Intenta con otra cuenta de email
- O usa GitHub para registrarte

### No encuentro "Settings" en Supabase
- Está en el menú lateral izquierdo, icono de ⚙️ engranaje
- Si no lo ves, haz clic en tu proyecto primero

### No encuentro "Environment Variables" en Vercel
- Está en Settings > Environment Variables
- Asegúrate de estar dentro de tu proyecto, no en el dashboard general

### El deploy falla
- Verifica que las 3 variables estén configuradas en Vercel
- Revisa los logs en Vercel (Deployments > [tu deploy] > Logs)

### No puedo ejecutar el comando de inicialización
**Opción alternativa:**
1. Ve a: `https://tu-url.vercel.app/api/admin/init-db`
2. Instala una extensión del navegador como "REST Client" o "Postman"
3. Haz una petición POST a esa URL

### Credenciales inválidas después de todo
- Verifica que ejecutaste el paso 3.4 (inicialización)
- Revisa los logs en Vercel para ver errores

---

## 📞 ¿NECESITAS AYUDA?

Si te quedas atascado:
1. Dime en qué paso estás
2. Dime qué error ves (si hay alguno)
3. Te ayudo a resolverlo

---

## ✅ CHECKLIST FINAL

Antes de terminar, verifica:

- [ ] Cuenta en Supabase creada
- [ ] Proyecto en Supabase creado
- [ ] URL de conexión copiada (con contraseña reemplazada)
- [ ] 3 variables configuradas en Vercel
- [ ] Código subido a GitHub
- [ ] Deploy completado en Vercel
- [ ] Base de datos inicializada
- [ ] Login funciona

---

## 🎉 ¡LISTO!

Una vez completado, tu aplicación funcionará en Vercel con PostgreSQL.

**Credenciales:**
- Admin: `admin@mundojlp.com` / `admin123`
- Usuario: `demo@mundojlp.com` / `demo123`

