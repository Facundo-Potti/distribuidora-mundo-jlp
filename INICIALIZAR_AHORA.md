# ✅ Inicializar Base de Datos - Ahora

## El deploy está listo ✅

Ahora necesitas inicializar la base de datos para crear los usuarios.

---

## 🚀 Pasos Rápidos

### Paso 1: Configurar .env.local

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Agrega o actualiza `DATABASE_URL` con la misma URL que pusiste en Vercel:

```env
DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:TuPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

**IMPORTANTE:** Usa la misma URL exacta que configuraste en Vercel.

### Paso 2: Ejecutar el Script

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm run db:init:prod
```

O directamente:

```powershell
npx tsx scripts/init-production.ts
```

### Paso 3: Verificar el Resultado

Si funciona, verás algo como:

```
✅ Usuarios creados/actualizados
✅ Productos creados
🎉 Base de datos inicializada correctamente!

📋 Credenciales:
   Admin: admin@mundojlp.com / admin123
   Usuario: demo@mundojlp.com / demo123
```

### Paso 4: Probar el Login

1. Ve a: `https://distribuidora-mundo-jlp.vercel.app/auth/login`
2. Logueate con:
   - **Email**: `admin@mundojlp.com`
   - **Contraseña**: `admin123`

✅ **Si funciona, ¡estás completamente listo!**

---

## 🆘 Si hay Errores

### Error: "Can't reach database server"
- Verifica que la `DATABASE_URL` en `.env.local` sea correcta
- Verifica que uses `pooler.supabase.com:6543` (NO `db.xxxxx:5432`)

### Error: "Tenant or user not found"
- Verifica que la contraseña esté correcta
- Si tiene caracteres especiales, debe estar codificada

### Error: "Module not found" o similar
- Ejecuta primero: `npm install`

---

## 📝 Resumen

1. ✅ Deploy listo en Vercel
2. 🔧 Configura `.env.local` con `DATABASE_URL`
3. 🚀 Ejecuta `npm run db:init:prod`
4. 🧪 Prueba el login

