# 🔧 Actualizar .env.local

## Lo que necesitas hacer

Tu `.env.local` actualmente tiene:
```
DATABASE_URL="file:./dev.db"
```

Esto es SQLite (local). Necesitas cambiarlo a la URL de Supabase (PostgreSQL) que configuraste en Vercel.

---

## ✅ Pasos

### Paso 1: Obtener la URL de Vercel

1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Tu proyecto > **Settings** > **Environment Variables**
3. Busca `DATABASE_URL`
4. **Copia** la URL completa (debe ser algo como):
   ```
   postgresql://postgres.qnviwuiqeaoixiplzqac:TuPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Paso 2: Actualizar .env.local

1. Abre el archivo `.env.local` en tu editor
2. **Reemplaza** la línea:
   ```
   DATABASE_URL="file:./dev.db"
   ```
   
   Con:
   ```
   DATABASE_URL="la-url-que-copiaste-de-vercel"
   ```

**Ejemplo completo de .env.local:**
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui

# Database Configuration - PostgreSQL (Producción)
DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:TuPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Paso 3: Guardar el archivo

Guarda `.env.local` con los cambios.

### Paso 4: Ejecutar el script de inicialización

Ahora ejecuta:

```powershell
npm run db:init:prod
```

Esto creará los usuarios en la base de datos de producción.

---

## 🎯 Resumen

1. Copia `DATABASE_URL` de Vercel
2. Pégala en `.env.local` (reemplazando la de SQLite)
3. Guarda el archivo
4. Ejecuta `npm run db:init:prod`
5. Prueba el login






