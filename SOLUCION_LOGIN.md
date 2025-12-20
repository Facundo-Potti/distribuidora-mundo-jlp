# Solución: Credenciales Inválidas

## Problema
Al intentar loguearse como administrador, aparece el error "Credenciales inválidas".

## Solución

### 1. Verificar que la base de datos tenga los usuarios

Ejecuta:
```bash
npm run db:seed
```

Esto creará/actualizará los usuarios:
- **Admin:** `admin@mundojlp.com` / `admin123`
- **Usuario:** `demo@mundojlp.com` / `demo123`

### 2. Verificar la ubicación de la base de datos

La base de datos debe estar en la raíz del proyecto como `dev.db`.

Si está en `prisma/dev.db`, cópiala:
```bash
Copy-Item "prisma\dev.db" -Destination "dev.db" -Force
```

### 3. Reiniciar el servidor

**IMPORTANTE:** Después de cualquier cambio en la base de datos o variables de entorno, **reinicia el servidor**:

1. Detén el servidor (Ctrl+C)
2. Inícialo nuevamente:
   ```bash
   npm run dev
   ```

### 4. Verificar credenciales

**Credenciales de Administrador:**
- Email: `admin@mundojlp.com`
- Contraseña: `admin123`

**Credenciales de Usuario:**
- Email: `demo@mundojlp.com`
- Contraseña: `demo123`

### 5. Si aún no funciona

1. Verifica que el archivo `.env.local` tenga:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Verifica que la base de datos tenga usuarios:
   ```bash
   npx tsx scripts/check-users.ts
   ```

3. Revisa la consola del servidor para ver los logs de autenticación (agregué logs de depuración)

### 6. Limpiar y recrear

Si nada funciona, puedes limpiar y recrear todo:

```bash
# Eliminar base de datos
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue

# Recrear base de datos
npm run db:push

# Poblar con datos
npm run db:seed
```

## Notas

- El servidor debe estar corriendo para que la autenticación funcione
- Los cambios en la base de datos requieren reiniciar el servidor
- Las contraseñas están hasheadas con bcrypt, no se pueden leer directamente








