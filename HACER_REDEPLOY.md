# 🚀 Hacer Redeploy en Vercel

## Lo que estás viendo

Estás en el diálogo de "Redeploy" de Vercel. Esto creará un nuevo deploy con la configuración actualizada (incluyendo la nueva `DATABASE_URL`).

## ✅ Pasos

### Paso 1: Verificar el Environment

- El dropdown "Choose Environment" debe estar en **"Production"** (ya está seleccionado ✅)

### Paso 2: Hacer Redeploy

1. **Haz clic en el botón "Redeploy"** (botón azul a la derecha)
2. Espera a que se cree el nuevo deploy

### Paso 3: Esperar el Deploy

1. Serás redirigido a la página de Deployments
2. Verás un nuevo deploy en progreso
3. ⏳ Espera 2-5 minutos hasta que diga **"Ready"** ✅

### Paso 4: Verificar que Funcionó

1. Haz clic en el nuevo deploy
2. Ve a la pestaña **"Logs"**
3. Busca si hay errores
4. Si ves "Build successful" o "Ready", el deploy fue exitoso ✅

### Paso 5: Inicializar la Base de Datos

Después de que el deploy termine exitosamente, inicializa la base de datos:

**Opción A: Desde tu computadora (Recomendado)**

1. Abre `.env.local`
2. Agrega la `DATABASE_URL` de Supabase (la misma que pusiste en Vercel)
3. Ejecuta:
   ```powershell
   npm run db:init:prod
   ```

**Opción B: Desde el navegador (si la ruta funciona)**

Visita:
```
https://distribuidora-mundo-jlp.vercel.app/api/admin/init-db?confirm=yes
```

### Paso 6: Probar el Login

1. Ve a: `https://distribuidora-mundo-jlp.vercel.app/auth/login`
2. Logueate con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

✅ **Si funciona, ¡estás listo!**

---

## 🆘 Si el Deploy Falla

Si ves errores en los logs:

1. **Error de conexión a la base de datos:**
   - Verifica que `DATABASE_URL` esté correctamente configurada en Vercel
   - Verifica que uses `pooler.supabase.com:6543` (NO `db.xxxxx:5432`)

2. **Error "Tenant or user not found":**
   - Verifica que la contraseña esté correcta
   - Verifica que la contraseña esté codificada si tiene caracteres especiales

3. **Otros errores:**
   - Revisa los logs completos
   - Verifica que todas las variables de entorno estén configuradas

---

## 📝 Resumen

1. ✅ Haz clic en **"Redeploy"**
2. ⏳ Espera a que termine (2-5 minutos)
3. 🔧 Inicializa la base de datos
4. 🧪 Prueba el login








