# Guía de Despliegue en Vercel

## ⚠️ Problema: SQLite no funciona en Vercel

SQLite usa archivos locales, pero Vercel es un entorno serverless sin sistema de archivos persistente. **Necesitas usar PostgreSQL en la nube**.

## Solución: Configurar PostgreSQL

### Opción 1: Supabase (Recomendado - Gratis)

1. **Crear cuenta en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener la URL de conexión:**
   - En tu proyecto de Supabase, ve a Settings > Database
   - Copia la "Connection string" (URI)
   - Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

3. **Configurar en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Agrega:
     ```
     DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
     NEXTAUTH_URL=https://tu-proyecto.vercel.app
     NEXTAUTH_SECRET=tu-secret-aqui
     ```

### Opción 2: Railway (Gratis)

1. Ve a [railway.app](https://railway.app)
2. Crea un proyecto y agrega PostgreSQL
3. Copia la DATABASE_URL y configúrala en Vercel

### Opción 3: Neon (Gratis)

1. Ve a [neon.tech](https://neon.tech)
2. Crea un proyecto
3. Copia la DATABASE_URL y configúrala en Vercel

## Pasos para Configurar

### 1. Actualizar el esquema de Prisma

El esquema ya está configurado para PostgreSQL, solo necesitas cambiar la URL.

### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel:
1. Ve a tu proyecto
2. Settings > Environment Variables
3. Agrega estas variables:

```
DATABASE_URL=postgresql://usuario:password@host:5432/database
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=genera-un-secret-seguro
```

### 3. Actualizar el esquema para producción

Cambia en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Ejecutar migraciones en producción

Después de desplegar, necesitas ejecutar las migraciones. Puedes hacerlo de dos formas:

**Opción A: Desde tu máquina local**
```bash
# Conecta a la base de datos de producción
DATABASE_URL="tu-url-de-produccion" npx prisma migrate deploy
DATABASE_URL="tu-url-de-produccion" npm run db:seed
```

**Opción B: Usar un script de build en Vercel**

Agrega esto a `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate",
  "vercel-build": "prisma generate && prisma migrate deploy"
}
```

Y crea un script de seed que se ejecute después del deploy.

### 5. Crear usuarios en producción

Después del deploy, ejecuta el seed:
```bash
DATABASE_URL="tu-url-de-produccion" npm run db:seed
```

O crea un script de API route para hacerlo desde el dashboard.

## Script de Inicialización Automática

Puedo crear un script que se ejecute automáticamente después del deploy para crear los usuarios si no existen.

## Notas Importantes

1. **Nunca subas `.env.local` al repositorio** - Usa variables de entorno en Vercel
2. **SQLite NO funciona en Vercel** - Debes usar PostgreSQL
3. **Las migraciones deben ejecutarse** después de cada deploy
4. **El seed debe ejecutarse** al menos una vez para crear usuarios

## Solución Rápida

Si necesitas una solución rápida, puedo:
1. Crear un script de API para inicializar la base de datos
2. Configurar el build para ejecutar migraciones automáticamente
3. Crear un endpoint para ejecutar el seed de forma segura






