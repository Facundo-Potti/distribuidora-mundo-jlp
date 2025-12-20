# Script para configurar variables de entorno en Windows PowerShell

# Generar NEXTAUTH_SECRET
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Crear archivo .env.local
@"
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$secret

# Database Configuration - SQLite (Desarrollo)
DATABASE_URL="file:./dev.db"
"@ | Out-File -FilePath .env.local -Encoding utf8

Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host "NEXTAUTH_SECRET generado: $secret" -ForegroundColor Yellow







