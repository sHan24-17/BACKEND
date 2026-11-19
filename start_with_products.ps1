param($SleepSeconds = 3)

Write-Host "Iniciando servidor con routes de productos..." -ForegroundColor Cyan

# Iniciar servidor en background
$null = Start-Process powershell -ArgumentList "-NoProfile -Command `"cd 'D:\evilore_\Evilore U\Semestres\5 Semestre\Desarrollo en Plataformas\RDA2\2. Semanas 7-11\TEST'; node .\src\server\index.js`"" -WorkingDirectory "D:\evilore_\Evilore U\Semestres\5 Semestre\Desarrollo en Plataformas\RDA2\2. Semanas 7-11\TEST" -WindowStyle Hidden

# Esperar a que el servidor inicie
Start-Sleep -Seconds $SleepSeconds

Write-Host "Servidor iniciado, probando endpoints..." -ForegroundColor Cyan