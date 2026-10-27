@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo  Compilando Gestor de Contactos (C a WebAssembly)
echo  Universidad Nacional Casimiro Sotelo Montenegro
echo ====================================================
echo.

:: 1. Verificar si emcc ya esta disponible en el PATH
where emcc >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Emscripten detectado en el PATH del sistema.
    goto compilar
)

:: 2. Intentar buscar emsdk_env.bat en rutas comunes
echo Buscando entorno de Emscripten...

set "EMSDK_ENV="
if defined EMSDK (
    if exist "%EMSDK%\emsdk_env.bat" set "EMSDK_ENV=%EMSDK%\emsdk_env.bat"
)
if not defined EMSDK_ENV (
    if exist "%USERPROFILE%\emsdk\emsdk_env.bat" set "EMSDK_ENV=%USERPROFILE%\emsdk\emsdk_env.bat"
)
if not defined EMSDK_ENV (
    if exist "C:\emsdk\emsdk_env.bat" set "EMSDK_ENV=C:\emsdk\emsdk_env.bat"
)
if not defined EMSDK_ENV (
    if exist "C:\Users\Toten\emsdk\emsdk_env.bat" set "EMSDK_ENV=C:\Users\Toten\emsdk\emsdk_env.bat"
)
if not defined EMSDK_ENV (
    if exist "..\emsdk\emsdk_env.bat" set "EMSDK_ENV=..\emsdk\emsdk_env.bat"
)

if defined EMSDK_ENV (
    echo [INFO] Activando Emscripten desde: !EMSDK_ENV!
    call "!EMSDK_ENV!" >nul 2>&1
    where emcc >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Entorno activado correctamente.
        goto compilar
    )
)

:: 3. Si no se encontro Emscripten
echo.
echo ====================================================
echo  [AVISO] No se encontro Emscripten (emcc).
echo ====================================================
echo  Para compilar este proyecto requieres Emscripten SDK:
echo   1. Descarga o clona emsdk: https://github.com/emscripten-core/emsdk
echo   2. Ejecuta en tu terminal: emsdk_env.bat
echo   3. O define la variable de entorno EMSDK con la ruta de tu instalacion.
echo.
echo  NOTA: Si solo deseas PROBAR la aplicacion en el navegador,
echo  NO necesitas compilar. Los archivos compilados ya estan en 'public/'.
echo  Ejecuta: python -m http.server 8085 --directory public
echo ====================================================
echo.
pause
exit /b 1

:compilar
echo.
echo Ejecutando emcc para compilar C a WebAssembly...
emcc -O2 -Iinclude src/main.c src/contactos.c src/utilidades.c -o public/proyecto.js -sMODULARIZE=1 -sEXPORT_NAME=crearModulo -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_main,_agregar_contacto,_editar_contacto,_eliminar_contacto,_buscar_contacto,_total_contactos,_obtener_nombre,_obtener_telefono,_obtener_correo,_vaciar_contactos,_inicializar_agenda

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un error durante la compilacion.
    pause
    exit /b 1
)

echo.
echo ====================================================
echo  Compilacion exitosa.
echo  Archivos generados en carpeta 'public':
echo   - public/proyecto.js
echo   - public/proyecto.wasm
echo ====================================================
echo.
pause
