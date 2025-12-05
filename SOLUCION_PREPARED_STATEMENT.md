# 🔧 Solución: Error "prepared statement already exists"

## Problema
Error `prepared statement "s0" already exists` al ejecutar el script de inicialización.

## ✅ Solución: Ejecutar en Sesiones Separadas

El problema es un conflicto con el connection pooling. La solución más simple es ejecutar los comandos en sesiones separadas de PowerShell.

### Opción 1: Cerrar y Abrir Nueva Terminal (Recomendado)

1. **Cierra la terminal actual** (o abre una nueva)
2. **Abre una nueva terminal de PowerShell**
3. Ejecuta el Paso 2:

```powershell
cd C:\distribuidora-mundo-jlp
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

### Opción 2: Esperar y Ejecutar de Nuevo

Si las tablas ya se crearon (viste "✅ Tablas creadas exitosamente!"), simplemente:

1. Espera 5 segundos
2. Ejecuta de nuevo el Paso 2 en la misma terminal:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:init:prod
```

### Opción 3: Verificar que las Tablas Existen

Primero verifica que las tablas se crearon:

```powershell
$env:DATABASE_URL="postgresql://postgres.qnviwuiqeaoixiplzqac:levis19facU!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
npm run db:test
```

Si funciona, las tablas están creadas. Luego ejecuta el script de inicialización.

---

## 🎯 Recomendación

**Usa la Opción 1** - Abre una nueva terminal y ejecuta el Paso 2. Es la forma más confiable de evitar conflictos.

