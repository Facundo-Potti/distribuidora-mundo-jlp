# 🔧 Solución al Error 405

## Problema
Error 405 "Método no permitido" al intentar inicializar la base de datos.

## Causas Posibles

1. **El código no está desplegado en Vercel** (más probable)
2. La ruta no está configurada correctamente
3. El deploy falló

## Soluciones

### Solución 1: Verificar que el código esté en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que exista el archivo: `app/api/admin/init-db/route.ts`
3. Si no está, haz commit y push:

```powershell
git add app/api/admin/init-db/route.ts
git commit -m "Agregar ruta de inicialización de base de datos"
git push
```

### Solución 2: Hacer un nuevo deploy

Después de hacer push, Vercel debería detectar los cambios y hacer un nuevo deploy automáticamente.

1. Ve a Vercel Dashboard
2. Verifica que haya un nuevo deploy en progreso
3. Espera a que termine (2-5 minutos)

### Solución 3: Usar GET en lugar de POST (Más fácil)

Ahora la ruta también acepta GET. Puedes probar desde el navegador:

```
https://distribuidora-mundo-jlp.vercel.app/api/admin/init-db?confirm=yes
```

O desde PowerShell:

```powershell
Invoke-RestMethod -Uri "https://distribuidora-mundo-jlp.vercel.app/api/admin/init-db?confirm=yes" -Method Get
```

### Solución 4: Inicializar desde tu máquina local

Si nada funciona, puedes inicializar la base de datos desde tu máquina local:

1. Configura `.env.local` con la URL de Supabase:
   ```
   DATABASE_URL="postgresql://..."
   ```

2. Ejecuta:
   ```powershell
   npm run db:seed
   ```

## Verificar que Funciona

Después de cualquiera de las soluciones:

1. Intenta loguearte en: `https://distribuidora-mundo-jlp.vercel.app/auth/login`
2. Usa: `admin@mundojlp.com` / `admin123`

Si funciona, ¡estás listo! ✅


