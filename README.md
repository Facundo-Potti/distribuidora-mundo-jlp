# Distribuidora MUNDO JLP

Sitio web informativo y funcional para Distribuidora MUNDO JLP, distribuidora mayorista de materias primas para panaderías, confiterías, pizzerías y más.

## Características

- 🎨 Diseño moderno con colores corporativos (rojo, blanco, negro)
- 👤 Sistema de autenticación y registro de usuarios
- 📊 Panel de estadísticas
- 👤 Perfil de usuario
- 🛒 Preparado para escalar a tienda online
- 📱 Diseño responsive

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth.js

## Instalación

1. Clona el repositorio o navega al directorio del proyecto
2. Instala las dependencias:

```bash
npm install
```

3. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env.local
```

4. Edita `.env.local` y agrega tu `NEXTAUTH_SECRET`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta-aqui
```

Para generar un `NEXTAUTH_SECRET`, puedes usar:
```bash
openssl rand -base64 32
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Credenciales de Prueba

Para probar el sistema de autenticación, puedes usar:

- **Email:** demo@mundojlp.com
- **Contraseña:** demo123

> **Nota:** Esta es una implementación básica para desarrollo. En producción, debes:
> - Conectar a una base de datos real
> - Implementar hash de contraseñas
> - Agregar validación de email
> - Implementar recuperación de contraseña

## Estructura del Proyecto

```
distribuidora-mundo-jlp/
├── app/                    # Páginas y rutas (App Router)
│   ├── api/               # API routes
│   ├── auth/              # Páginas de autenticación
│   ├── perfil/            # Página de perfil
│   ├── estadisticas/      # Página de estadísticas
│   └── page.tsx           # Página principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de shadcn/ui
│   ├── header.tsx        # Header principal
│   ├── footer.tsx        # Footer
│   └── ...
├── lib/                   # Utilidades y configuraciones
├── public/                # Archivos estáticos
└── types/                 # Definiciones de tipos TypeScript
```

## Páginas Disponibles

- `/` - Página principal
- `/productos` - Catálogo de productos
- `/nosotros` - Información sobre la empresa
- `/contacto` - Formulario de contacto
- `/auth/login` - Iniciar sesión
- `/auth/register` - Registrarse
- `/perfil` - Perfil de usuario (requiere autenticación)
- `/estadisticas` - Estadísticas del usuario (requiere autenticación)

## Próximos Pasos

Para escalar a una tienda online completa, considera:

1. **Base de Datos:** Integrar PostgreSQL, MySQL o MongoDB
2. **Carrito de Compras:** Implementar funcionalidad de carrito
3. **Pagos:** Integrar pasarela de pagos (Mercado Pago, Stripe, etc.)
4. **Gestión de Inventario:** Sistema de stock y productos
5. **Panel de Administración:** Dashboard para gestionar pedidos y productos
6. **Notificaciones:** Email y SMS para confirmaciones de pedidos

## Build para Producción

```bash
npm run build
npm start
```

## Licencia

Este proyecto es privado y propiedad de Distribuidora MUNDO JLP.

