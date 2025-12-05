# 🚀 Guía de Despliegue en Vercel

## ⚠️ Problema: SQLite no funciona en Vercel

SQLite usa archivos locales, pero Vercel es un entorno serverless sin sistema de archivos persistente. **Debes usar PostgreSQL en la nube**.

## 📋 Pasos para Desplegar

### 1. Crear Base de Datos PostgreSQL en la Nube

Elige una de estas opciones (todas tienen planes gratuitos):

#### Opción A: Supabase (Recomendado) ⭐

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Settings > Database**
4. Copia la **Connection string** (URI)
   - Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - O usa la **Connection pooling** para mejor rendimiento

#### Opción B: Railway

1. Ve a [railway.app](https://railway.app)
2. Crea un proyecto y agrega PostgreSQL
3. Copia la `DATABASE_URL` del servicio

#### Opción C: Neon

1. Ve a [neon.tech](https://neon.tech)
2. Crea un proyecto
3. Copia la `DATABASE_URL` de la conexión

### 2. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings > Environment Variables**
3. Agrega estas variables:

```
DATABASE_URL=postgresql://usuario:password@host:5432/database?sslmode=require
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=genera-un-secret-seguro-aqui
```

**Para generar NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/macOS
openssl rand -base64 32
```

**IMPORTANTE:**
- `NEXTAUTH_URL` debe ser la URL de tu proyecto en Vercel (ej: `https://distribuidora-mundo-jlp.vercel.app`)
- `DATABASE_URL` debe incluir `?sslmode=require` al final para conexiones seguras

### 3. Actualizar el Código

El código ya está actualizado:
- ✅ Schema de Prisma cambiado a PostgreSQL
- ✅ Script de build actualizado para ejecutar migraciones
- ✅ API route para inicializar la base de datos

### 4. Hacer Deploy

1. Haz commit y push de tus cambios:
   ```bash
   git add .
   git commit -m "Configurar PostgreSQL para Vercel"
   git push
   ```

2. Vercel detectará los cambios y hará el deploy automáticamente

3. Durante el build, Vercel ejecutará:
   - `prisma generate` - Genera el cliente de Prisma
   - `prisma migrate deploy` - Aplica las migraciones
   - `next build` - Construye la aplicación

### 5. Inicializar la Base de Datos

Después del primer deploy, necesitas crear los usuarios iniciales:

**Opción A: Usar la API Route (Recomendado)**

1. Visita: `https://tu-proyecto.vercel.app/api/admin/init-db`
2. Haz una petición POST (puedes usar Postman, curl, o el navegador con una extensión)
3. O ejecuta desde tu terminal:
   ```bash
   curl -X POST https://tu-proyecto.vercel.app/api/admin/init-db
   ```

Esto creará:
- **Admin:** `admin@mundojlp.com` / `admin123`
- **Usuario:** `demo@mundojlp.com` / `demo123`

**Opción B: Desde tu máquina local**

```bash
# Conecta a la base de datos de producción
$env:DATABASE_URL="tu-url-de-produccion"
npx prisma migrate deploy
npm run db:seed
```

### 6. Verificar que Funciona

1. Visita tu sitio: `https://tu-proyecto.vercel.app`
2. Intenta loguearte con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

## 🔒 Seguridad

**IMPORTANTE:** Después de inicializar la base de datos, deberías:

1. **Eliminar o proteger la ruta `/api/admin/init-db`**
   - Agregar autenticación
   - O simplemente eliminarla después de usarla

2. **Cambiar las contraseñas por defecto** en producción

3. **No exponer las variables de entorno** en el código

## 🐛 Solución de Problemas

### Error: "No se puede conectar a la base de datos"

- Verifica que `DATABASE_URL` esté correctamente configurada en Vercel
- Asegúrate de que la base de datos permita conexiones externas
- Verifica que el firewall de la base de datos permita conexiones desde Vercel

### Error: "Credenciales inválidas"

- Asegúrate de haber ejecutado `/api/admin/init-db` después del deploy
- Verifica que los usuarios se crearon correctamente
- Revisa los logs de Vercel para ver errores

### Error en el build: "Prisma migrate deploy failed"

- Verifica que `DATABASE_URL` esté configurada en Vercel
- Asegúrate de que la base de datos esté accesible
- Revisa los logs de build en Vercel

## 📝 Checklist de Despliegue

- [ ] Base de datos PostgreSQL creada
- [ ] `DATABASE_URL` configurada en Vercel
- [ ] `NEXTAUTH_URL` configurada en Vercel (URL de producción)
- [ ] `NEXTAUTH_SECRET` generado y configurado
- [ ] Código actualizado y pusheado
- [ ] Deploy completado exitosamente
- [ ] Base de datos inicializada (`/api/admin/init-db`)
- [ ] Login probado y funcionando
- [ ] Ruta `/api/admin/init-db` protegida o eliminada

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa los logs en Vercel (Deployments > [tu deploy] > Logs)
2. Verifica las variables de entorno en Vercel
3. Prueba la conexión a la base de datos desde tu máquina local


