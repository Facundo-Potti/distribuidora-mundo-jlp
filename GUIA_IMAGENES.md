# Guía para Subir Imágenes de Productos

## Opción 1: Subida Local (Desarrollo)

Las imágenes se guardan en la carpeta `public/productos/` y se sirven como archivos estáticos.

### Cómo usar:

1. **En el panel de administración:**
   - Edita un producto
   - Haz clic en "Subir imagen"
   - Selecciona una imagen (JPG, PNG o WEBP, máximo 5MB)
   - La imagen se guardará automáticamente

2. **Las imágenes estarán disponibles en:**
   - URL: `/productos/nombre-archivo.jpg`
   - Ruta física: `public/productos/nombre-archivo.jpg`

## Opción 2: Servicios en la Nube (Producción)

Para producción, se recomienda usar un servicio de almacenamiento en la nube:

### Cloudinary (Recomendado)

1. **Crear cuenta en Cloudinary:**
   - Visita [cloudinary.com](https://cloudinary.com)
   - Crea una cuenta gratuita
   - Obtén tus credenciales (Cloud Name, API Key, API Secret)

2. **Instalar dependencias:**
   ```bash
   npm install cloudinary
   ```

3. **Configurar variables de entorno:**
   ```env
   CLOUDINARY_CLOUD_NAME=tu-cloud-name
   CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret
   ```

4. **Actualizar la API route:**
   - Modifica `app/api/products/upload-image/route.ts`
   - Reemplaza el código de guardado local con la subida a Cloudinary

### AWS S3

1. **Configurar S3:**
   - Crea un bucket en AWS S3
   - Configura las credenciales de acceso

2. **Instalar dependencias:**
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

3. **Configurar variables de entorno:**
   ```env
   AWS_ACCESS_KEY_ID=tu-access-key
   AWS_SECRET_ACCESS_KEY=tu-secret-key
   AWS_REGION=tu-region
   AWS_S3_BUCKET=tu-bucket-name
   ```

### Otras opciones:
- **Vercel Blob Storage** (si usas Vercel)
- **Supabase Storage**
- **Google Cloud Storage**

## Estructura de Archivos

```
public/
  productos/
    producto-{id}-{timestamp}.jpg
    producto-{id}-{timestamp}.png
    ...
```

## Límites y Validaciones

- **Tipos permitidos:** JPEG, JPG, PNG, WEBP
- **Tamaño máximo:** 5MB por imagen
- **Autenticación:** Solo administradores pueden subir imágenes

## Actualizar Producto con Imagen

Cuando subes una imagen, se actualiza automáticamente el campo `imagen` del producto en la base de datos con la URL de la imagen.

## Notas Importantes

1. **En desarrollo:** Las imágenes se guardan localmente en `public/productos/`
2. **En producción:** Se recomienda usar un servicio en la nube
3. **Backup:** Asegúrate de hacer backup de las imágenes si usas almacenamiento local
4. **Optimización:** Considera usar Next.js Image Optimization para mejorar el rendimiento

## Solución de Problemas

### Error: "No autorizado"
- Asegúrate de estar logueado como administrador
- Verifica que tu sesión tenga el rol `admin`

### Error: "Tipo de archivo no permitido"
- Solo se permiten imágenes: JPEG, PNG, WEBP
- Verifica la extensión del archivo

### Error: "El archivo es demasiado grande"
- El límite es 5MB
- Comprime la imagen antes de subirla

### Las imágenes no se muestran
- Verifica que la carpeta `public/productos/` exista
- Verifica los permisos de escritura
- En producción, verifica la configuración del servicio en la nube



