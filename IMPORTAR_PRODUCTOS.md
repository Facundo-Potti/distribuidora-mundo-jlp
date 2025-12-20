# Guía para Importar Productos desde CSV

## Formato del CSV

El archivo CSV debe tener las siguientes columnas (en este orden):

1. **nombre** (requerido) - Nombre del producto
2. **categoria** (requerido) - Categoría del producto
3. **precio** (requerido) - Precio del producto (puede usar punto o coma decimal)
4. **unidad** (requerido) - Unidad de medida (kg, litro, unidad, docena, etc.)
5. **stock** (opcional) - Cantidad en stock (por defecto: 0)
6. **descripcion** (opcional) - Descripción del producto
7. **imagen** (opcional) - URL o ruta de la imagen

### Ejemplo de CSV:

```csv
nombre,categoria,precio,unidad,stock,descripcion,imagen
Harina 0000,Harinas,850,kg,500,Harina de trigo 0000 para panadería,
Harina 000,Harinas,820,kg,450,Harina de trigo 000 para panadería,
Azúcar Blanca,Endulzantes,650,kg,300,Azúcar refinada blanca,
Aceite de Girasol,Aceites,1200,litro,200,Aceite de girasol refinado,
```

### Notas importantes:

- El archivo puede tener o no encabezados (el script los detecta automáticamente)
- Puede usar coma (`,`) o punto y coma (`;`) como separador
- Los valores pueden estar entre comillas si contienen comas
- Si un producto ya existe (mismo nombre), se actualizará en lugar de crear uno nuevo
- Los campos opcionales pueden dejarse vacíos

## Cómo importar

### Opción 1: Colocar el CSV en la raíz del proyecto

1. Guarda tu archivo CSV como `productos.csv` en la raíz del proyecto
2. Ejecuta:

```bash
npm run db:import
```

### Opción 2: Especificar la ruta del archivo

```bash
npm run db:import ruta/a/tu/archivo.csv
```

### Ejemplo:

```bash
npm run db:import productos.csv
npm run db:import C:\Users\TuNombre\Desktop\productos.csv
```

## Resultado

El script mostrará:
- ✅ Productos creados
- 🔄 Productos actualizados
- ❌ Errores (si los hay)
- 📊 Resumen final

## Solución de problemas

### Error: "El archivo no existe"
- Verifica que la ruta del archivo sea correcta
- Asegúrate de usar rutas absolutas o relativas desde la raíz del proyecto

### Error: "falta el nombre del producto"
- Verifica que todas las filas tengan al menos el nombre del producto
- Revisa que no haya filas vacías al final del archivo

### Precios incorrectos
- Usa punto (`.`) o coma (`,`) como separador decimal
- Asegúrate de que los precios sean números válidos









