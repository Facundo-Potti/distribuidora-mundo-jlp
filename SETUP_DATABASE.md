# Guía de Configuración de Base de Datos

Esta guía te ayudará a configurar la base de datos PostgreSQL para el proyecto Distribuidora MUNDO JLP.

## Requisitos Previos

1. **PostgreSQL instalado** en tu sistema o acceso a una base de datos PostgreSQL en la nube
2. **Node.js y npm** instalados

## Opciones de Base de Datos

### Opción 1: PostgreSQL Local

1. Instala PostgreSQL en tu sistema:
   - **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. Crea una base de datos:
   ```bash
   # Conectarse a PostgreSQL
   psql -U postgres
   
   # Crear base de datos
   CREATE DATABASE distribuidora_mundo_jlp;
   
   # Salir
   \q
   ```

### Opción 2: PostgreSQL en la Nube (Recomendado para producción)

Puedes usar servicios gratuitos como:
- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)
- **Neon**: [neon.tech](https://neon.tech)
- **Render**: [render.com](https://render.com)

Cada servicio te proporcionará una URL de conexión que usarás en `DATABASE_URL`.

### Opción 3: SQLite (Solo para desarrollo rápido)

Si quieres empezar rápido sin configurar PostgreSQL, puedes usar SQLite:

1. Cambia en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. En `.env.local`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `prisma` - CLI de Prisma
- `@prisma/client` - Cliente de Prisma
- `bcryptjs` - Para hashear contraseñas
- `tsx` - Para ejecutar TypeScript

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Edita `.env.local` y configura:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta-aqui

# Base de Datos (PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/distribuidora_mundo_jlp?schema=public"
```

**Para generar NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/macOS
openssl rand -base64 32
```

### 3. Generar Cliente de Prisma

```bash
npm run db:generate
```

### 4. Crear las Tablas en la Base de Datos

```bash
# Opción A: Push directo (desarrollo)
npm run db:push

# Opción B: Migración (recomendado para producción)
npm run db:migrate
```

### 5. Poblar la Base de Datos con Datos Iniciales

```bash
npm run db:seed
```

Esto creará:
- 2 usuarios de ejemplo (demo@mundojlp.com y admin@mundojlp.com)
- 8 productos de ejemplo

**Credenciales de prueba:**
- Email: `demo@mundojlp.com` / Contraseña: `demo123`
- Email: `admin@mundojlp.com` / Contraseña: `admin123`

### 6. (Opcional) Abrir Prisma Studio

Para visualizar y editar datos en la base de datos:

```bash
npm run db:studio
```

Esto abrirá una interfaz web en `http://localhost:5555`

## Estructura de la Base de Datos

La base de datos incluye las siguientes tablas:

- **users**: Usuarios del sistema
- **profiles**: Perfiles extendidos de usuarios
- **products**: Catálogo de productos
- **orders**: Pedidos realizados
- **order_items**: Items de cada pedido

## Comandos Útiles

```bash
# Generar cliente de Prisma después de cambios en schema
npm run db:generate

# Aplicar cambios al esquema
npm run db:push

# Crear migración
npm run db:migrate

# Poblar base de datos
npm run db:seed

# Abrir Prisma Studio
npm run db:studio
```

## Solución de Problemas

### Error: "Can't reach database server"

- Verifica que PostgreSQL esté corriendo
- Verifica que la URL de conexión en `.env.local` sea correcta
- Verifica que el usuario y contraseña sean correctos

### Error: "Database does not exist"

- Crea la base de datos manualmente o verifica que el nombre en `DATABASE_URL` sea correcto

### Error: "Password authentication failed"

- Verifica las credenciales en `DATABASE_URL`
- Si es PostgreSQL local, verifica la configuración de `pg_hba.conf`

## Próximos Pasos

Una vez configurada la base de datos:

1. El sistema de autenticación ahora usa la base de datos
2. Los productos se pueden gestionar desde la base de datos
3. Los pedidos se guardan en la base de datos
4. Los perfiles de usuario se almacenan en la base de datos

¡Listo! Tu aplicación ahora está conectada a una base de datos real.







