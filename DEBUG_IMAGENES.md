# 🐛 Depuración: Imágenes No Se Suben

## Pasos para Diagnosticar

### 1. Verificar Configuración de Supabase

Ejecuta este comando para verificar que Supabase esté configurado:

```powershell
npm run verify:supabase
```

Si falta alguna variable de entorno, agrégalas a `.env.local`.

### 2. Verificar en la Consola del Navegador

1. Abre la consola (Ctrl + Shift + J)
2. Ve a la pestaña **Console**
3. Intenta subir una imagen
4. Busca estos mensajes:

#### ✅ Si ves estos mensajes, la subida está funcionando:
```
Subiendo imagen... {fileName: "...", size: ..., type: "..."}
✅ Imagen subida exitosamente: https://...
🖼️ Imagen subida, actualizando formulario: https://...
```

#### ❌ Si ves errores:
- **"Supabase Storage no está configurado"** → Configura las variables de entorno
- **"Bucket not found"** → Crea el bucket `productos` en Supabase Storage
- **"Error de permisos"** → Verifica las políticas RLS del bucket

### 3. Verificar que la Imagen se Guarde

Después de subir la imagen y hacer clic en "Guardar cambios", busca estos mensajes:

```
💾 Guardando producto: {nombre: "...", imagen: "https://..."}
✅ Producto guardado en BD: {nombre: "...", imagen: "https://..."}
```

Si `imagen` es `null` o está vacío, la imagen no se está guardando.

### 4. Verificar en la Base de Datos

Puedes verificar directamente en la base de datos si la imagen se guardó:

```powershell
npm run db:studio
```

Luego busca el producto y verifica que el campo `imagen` tenga la URL de Supabase.

### 5. Verificar Supabase Storage

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Storage** → **productos**
3. Verifica que las imágenes subidas aparezcan ahí

## Problemas Comunes

### Problema 1: La imagen se sube pero desaparece al recargar

**Causa:** La imagen no se está guardando en la base de datos.

**Solución:** 
- Verifica los logs en la consola cuando haces clic en "Guardar cambios"
- Asegúrate de que veas el mensaje "✅ Producto guardado en BD" con la URL de la imagen

### Problema 2: Error "Supabase no está configurado"

**Causa:** Faltan variables de entorno.

**Solución:**
1. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```
2. Reinicia el servidor (`npm run dev`)

### Problema 3: Error "Bucket not found"

**Causa:** El bucket `productos` no existe en Supabase Storage.

**Solución:**
1. Ve a Supabase Dashboard → Storage
2. Crea un nuevo bucket llamado `productos`
3. Márcalo como **público**
4. Intenta subir la imagen de nuevo

### Problema 4: La imagen se muestra en el preview pero no se guarda

**Causa:** El estado `formProducto.imagen` no se está actualizando correctamente.

**Solución:**
- Verifica en la consola que veas "🖼️ Imagen subida, actualizando formulario"
- Si no aparece, hay un problema con el callback `onImageUploaded`

## Logs Esperados (Flujo Correcto)

```
1. Subiendo imagen... {fileName: "imagen.jpg", size: 123456, type: "image/jpeg"}
2. ✅ Imagen subida exitosamente: https://xxx.supabase.co/storage/v1/object/public/productos/...
3. 🖼️ Imagen subida, actualizando formulario: https://xxx.supabase.co/...
4. 💾 Guardando producto: {nombre: "Producto", imagen: "https://xxx.supabase.co/..."}
5. ✅ Producto guardado en BD: {nombre: "Producto", imagen: "https://xxx.supabase.co/..."}
```

Si alguno de estos pasos falta, ese es el punto donde está el problema.





