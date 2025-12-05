# ⚡ INICIO RÁPIDO - CONFIGURACIÓN VERCEL

## 🎯 LO QUE NECESITAS HACER (3 PASOS)

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Crear Base de Datos en Supabase               │
│  ⏱️  Tiempo: 5 minutos                                  │
│  💰 Costo: GRATIS                                       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 2: Configurar Variables en Vercel                │
│  ⏱️  Tiempo: 3 minutos                                 │
│  📝 Necesitas: URL de Supabase                          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 3: Inicializar Base de Datos                      │
│  ⏱️  Tiempo: 1 minuto                                  │
│  🔧 Ejecutar: /api/admin/init-db                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST VISUAL

### ✅ PASO 1: Supabase

- [ ] Ir a https://supabase.com
- [ ] Crear cuenta (con GitHub es más fácil)
- [ ] Crear nuevo proyecto
- [ ] **GUARDAR LA CONTRASEÑA** de la base de datos
- [ ] Ir a Settings > Database
- [ ] Copiar "Connection string" (URI)
- [ ] Reemplazar `[YOUR-PASSWORD]` con tu contraseña
- [ ] Agregar `?sslmode=require` al final

**Resultado esperado:**
```
postgresql://postgres.xxxxx:TuPassword123@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require
```

---

### ✅ PASO 2: Vercel

- [ ] Ir a https://vercel.com
- [ ] Seleccionar tu proyecto
- [ ] Settings > Environment Variables
- [ ] Agregar `DATABASE_URL` (la URL de arriba)
- [ ] Agregar `NEXTAUTH_URL` (tu URL de Vercel)
- [ ] Generar y agregar `NEXTAUTH_SECRET`

**Generar NEXTAUTH_SECRET en PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Variables que debes tener:**
```
✅ DATABASE_URL = postgresql://...
✅ NEXTAUTH_URL = https://tu-proyecto.vercel.app
✅ NEXTAUTH_SECRET = [generado]
```

---

### ✅ PASO 3: Deploy e Inicialización

- [ ] Hacer commit y push de los cambios
- [ ] Esperar a que Vercel haga el deploy
- [ ] Copiar la URL de tu proyecto en Vercel
- [ ] Ejecutar inicialización

**Ejecutar desde PowerShell:**
```powershell
$url = "https://tu-proyecto.vercel.app/api/admin/init-db"
Invoke-RestMethod -Uri $url -Method Post
```

**O desde el navegador con extensión REST Client**

---

## 🧪 VERIFICAR QUE FUNCIONA

1. Ir a: `https://tu-proyecto.vercel.app/auth/login`
2. Loguearse con:
   - Email: `admin@mundojlp.com`
   - Contraseña: `admin123`

Si funciona → ✅ **¡LISTO!**

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, lee:
- **`PASO_A_PASO_VERCEL.md`** - Guía detallada paso a paso
- **`GUIA_VERCEL.md`** - Información técnica completa

---

## 🆘 AYUDA RÁPIDA

### No puedo conectar a la base de datos
→ Verifica que la `DATABASE_URL` tenga la contraseña correcta

### Credenciales inválidas
→ Ejecuta `/api/admin/init-db` para crear los usuarios

### Error en el build
→ Verifica que todas las variables estén en Vercel

---

## 🎉 ¡ÉXITO!

Una vez completado, tendrás:
- ✅ Base de datos PostgreSQL funcionando
- ✅ Usuarios creados (admin y demo)
- ✅ Aplicación desplegada en Vercel
- ✅ Login funcionando

