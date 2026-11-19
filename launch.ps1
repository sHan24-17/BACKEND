$proc = Start-Process node -ArgumentList "D:\evilore_\Evilore U\Semestres\5 Semestre\Desarrollo en Plataformas\RDA2\2. Semanas 7-11\TEST\src\server\index.js" -WorkingDirectory "D:\evilore_\Evilore U\Semestres\5 Semestre\Desarrollo en Plataformas\RDA2\2. Semanas 7-11\TEST" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "Server launched PID: $($proc.Id)"