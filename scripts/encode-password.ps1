# Script para codificar una contraseña para usar en URL
# Uso: .\encode-password.ps1

Write-Host "🔐 Codificador de Contraseña para URL" -ForegroundColor Cyan
Write-Host ""

# Pedir la contraseña de forma segura
$password = Read-Host "Ingresa tu contraseña de Supabase" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Codificar
$encoded = [System.Web.HttpUtility]::UrlEncode($plainPassword)

Write-Host ""
Write-Host "✅ Contraseña codificada:" -ForegroundColor Green
Write-Host $encoded -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Úsala en tu DATABASE_URL reemplazando [YOUR-PASSWORD]" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ejemplo completo:" -ForegroundColor Gray
Write-Host "postgresql://postgres.xxxxx:$encoded@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require" -ForegroundColor White

