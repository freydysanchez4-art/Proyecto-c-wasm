# Gestor de Contactos — C + WebAssembly
**Universidad Nacional Casimiro Sotelo Montenegro (UNCSM)**  
*Programación Estructurada · INS3111 e INS3131*  
*Tutor: Ing. Iván Bonilla Villarreal*

---

## 📋 Resumen del Proyecto

Este proyecto implementa un **Gestor de Contactos** modular desarrollado en **lenguaje C puro**, compilado con **Emscripten** a **WebAssembly (WASM)** y ejecutado en tiempo real dentro del navegador web con una interfaz moderna y accesible adaptada a la estética institucional de la **VirtualExpo UNCSM**.

### ✨ Características Principales
- **Núcleo en C Modular:** Gestión eficiente en memoria de contactos (inserción, búsqueda binaria/lineal, edición, eliminación y conteo).
- **Rendimiento Nativo con WebAssembly:** El motor en C se ejecuta a velocidad casi nativa dentro del navegador del usuario.
- **Interfaz Web Interactiva:** Formulario reactivo, vista de tarjeta/tabla, búsqueda en vivo, consola de diagnóstico y modo oscuro/claro.
- **Listo para Despliegue:** Optimizado para publicarse en Vercel sin necesidad de pasos de compilación en el servidor.

---

## 📁 Estructura del Repositorio

```text
├── README.md              <- Documentación principal del proyecto
├── build_wasm.bat         <- Script de compilación automática a WebAssembly (Windows)
├── vercel.json            <- Configuración lista para despliegue en Vercel
├── include/
│   ├── contactos.h        <- Estructura Contacto y prototipos de la agenda
│   └── utilidades.h       <- Funciones auxiliares para manejo seguro de cadenas
├── src/
│   ├── contactos.c        <- Lógica CRUD y gestión de memoria de contactos
│   ├── utilidades.c       <- Validaciones y formateo de texto
│   └── main.c             <- Punto de entrada dual (consola CLI y WebAssembly)
├── public/
│   ├── index.html         <- Interfaz web de usuario (UNCSM VirtualExpo)
│   ├── estilos.css        <- Sistema de diseño con modo oscuro/claro
│   ├── app.js             <- Conector JavaScript con el módulo WebAssembly
│   ├── proyecto.js        <- Código pegamento generado por Emscripten
│   └── proyecto.wasm      <- Binario precompilado de WebAssembly
└── legacy/
    └── registro-1.c       <- Respaldo de versión previa no modular
```

---

## 🚀 ¿Cómo Probar el Proyecto Localmente? (Sin Compilar)

> **Nota para colaboradores:** Los binarios de WebAssembly (`public/proyecto.js` y `public/proyecto.wasm`) **ya están precompilados**. No necesitas instalar Emscripten ni compilar en C a menos que desees modificar la lógica del código fuente.

Debido a las políticas de seguridad de los navegadores (CORS para archivos `.wasm`), la aplicación debe servirse a través de un servidor HTTP local:

### Opción 1: Con Python (Recomendado)
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
python -m http.server 8085 --directory public
```
Abre en tu navegador: **[http://localhost:8085](http://localhost:8085)**

### Opción 2: Con la extensión Live Server de VS Code
1. Abre esta carpeta en **Visual Studio Code**.
2. Haz clic derecho sobre el archivo `public/index.html`.
3. Selecciona **"Open with Live Server"**.

### Opción 3: Con Node.js / npx
```bash
npx serve public
```

---

## 🛠️ ¿Cómo Modificar y Recompilar el Código C?

Si realizas cambios en los archivos de las carpetas `src/` o `include/`, deberás regenerar el binario WebAssembly.

### Prerrequisito: Emscripten SDK (emsdk)
Si aún no tienes instalado Emscripten:
1. Clona e instala el SDK oficial:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   emsdk install latest
   emsdk activate latest
   ```
2. Para activar las herramientas en tu terminal actual:
   - **Windows (CMD):** `emsdk_env.bat`
   - **Windows (PowerShell):** `emsdk_env.ps1`
   - **Linux / macOS:** `source ./emsdk_env.sh`

### Compilación en Windows (Automática)
Simplemente haz doble clic o ejecuta desde la terminal:
```cmd
build_wasm.bat
```
*(El script detecta automáticamente si `emcc` está en tu PATH o en rutas habituales como `%USERPROFILE%\emsdk` o `C:\emsdk`).*

### Compilación Manual o en Linux / macOS
Ejecuta el siguiente comando desde la raíz del proyecto:
```bash
emcc -O2 -Iinclude src/main.c src/contactos.c src/utilidades.c -o public/proyecto.js -sMODULARIZE=1 -sEXPORT_NAME=crearModulo -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sEXPORTED_FUNCTIONS=_main,_agregar_contacto,_editar_contacto,_eliminar_contacto,_buscar_contacto,_total_contactos,_obtener_nombre,_obtener_telefono,_obtener_correo,_vaciar_contactos,_inicializar_agenda
```

---

## 🌐 Publicar en Vercel e Integrar a la VirtualExpo

El archivo `vercel.json` ya tiene configurado el directorio de salida en `public`.

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "Gestor de Contactos en C con WebAssembly - UNCSM"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 2: Desplegar en Vercel
1. Inicia sesión en [Vercel](https://vercel.com).
2. Haz clic en **"Add New Project"** e importa tu repositorio de GitHub.
3. Vercel detectará automáticamente la configuración de `vercel.json` (no requiere *Build Command*).
4. Haz clic en **"Deploy"**. En unos segundos obtendrás tu URL pública (ejemplo: `https://mi-proyecto-c.vercel.app`).

### Paso 3: Enlazar en el portal de la VirtualExpo UNCSM
Una vez publicado, puedes vincular tu URL en la tarjeta de proyectos de la feria institucional:  
🔗 **[https://virtualexpo-estudiantes-csm.vercel.app/#portada](https://virtualexpo-estudiantes-csm.vercel.app/#portada)**  
Asignando el enlace a tu grupo correspondiente (Grupo 3, 4, 5 o 6).

---

## 👥 Créditos y Autoría
- **Institución:** Universidad Nacional Casimiro Sotelo Montenegro (UNCSM)
- **Asignatura:** Programación Estructurada (INS3111 e INS3131)
- **Tutor:** Ing. Iván Bonilla Villarreal
- **Integrantes:** 
Emiliana del Carmen Muñoz Guzmán
Katherine de los Angeles Murillo Muñoz
Gabriela Francisca Rios Treminio
Bryan Enmanuel Rayos Treminio
Freydy Odiel Gómez Sánchez

