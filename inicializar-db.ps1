# Script para inicializar la base de datos en Vercel
# Reemplaza TU-URL-AQUI con la URL real de tu proyecto en Vercel

$url = "https://distribuidora-mundo-jlp.vercel.app/api/admin/init-db"

Write-Host "🔧 Inicializando base de datos..." -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json"
    
    Write-Host "`n✅ Base de datos inicializada correctamente!" -ForegroundColor Green
    Write-Host "`n📋 Credenciales creadas:" -ForegroundColor Cyan
    Write-Host "   Admin: admin@mundojlp.com / admin123" -ForegroundColor White
    Write-Host "   Usuario: demo@mundojlp.com / demo123" -ForegroundColor White
    
    Write-Host "`n🎉 ¡Listo! Ahora puedes loguearte en tu aplicación." -ForegroundColor Green
} catch {
    Write-Host "`n❌ Error al inicializar la base de datos:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    Write-Host "`n💡 Verifica:" -ForegroundColor Yellow
    Write-Host "   1. Que hayas reemplazado TU-URL-AQUI con tu URL real" -ForegroundColor Gray
    Write-Host "   2. Que el deploy en Vercel haya terminado" -ForegroundColor Gray
    Write-Host "   3. Que las variables de entorno estén configuradas" -ForegroundColor Gray
}

