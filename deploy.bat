@echo off
setlocal
cd /d "%~dp0"

echo [1/4] Preparando ofrendas para el Panteon...
git add .

echo [2/4] Sincronizando identidad de la rama...
git branch -M main

echo [3/4] Sellando las cronicas de Rasganorte...
set /p msg="Mensaje de la cronica (Enter para 'Update World OF Wanos Web'): "
if "%msg%"=="" set msg=Update World OF Wanos Web

git commit -m "%msg%"

echo [4/4] Ascendiendo al Nexo de Github...
git push -u origin main

if %errorlevel% neq 0 (
    echo [X] Error en el Nexo. Revisa tu conexion o permisos.
    pause
    exit /b %errorlevel%
)

echo [!] Despliegue completado. El Universo Wanos ha sido actualizado.
pause
exit /b 0
