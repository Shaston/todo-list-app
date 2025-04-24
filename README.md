# To-Do List App — versión contenedorizada y "securizada"

Aplicación web sencilla de listado de tareas implementada en **Node.js 18** con front-end HTML/JS plano y base de datos **SQLite** por defecto  

Todo está empaquetado con **Docker Compose** aplicando buenas prácticas de seguridad (usuario no-root, variables de entorno externas, volúmenes, etc.).

---

## 1 . Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Docker Desktop (Windows / macOS / Linux) | 4.x (Compose v2 incluido) |
| Git | opcional (para clonar) |

> **Windows**: Docker Desktop debe estar en modo **Linux containers**.

---

## 2 . Preparar variables de entorno

El proyecto **nunca** incluye credenciales reales.
Copia el fichero de ejemplo y, si lo deseas, ajusta los valores:

```bash
cp .env.example .env        # Linux/macOS/WSL/Git-Bash
# o
copy .env.example .env      # PowerShell/CMD

# .env está en .gitignore -> nunca se sube

## 3 . Puesta en marcha rápida

# 1. Clonar (o descomprimir) el proyecto
git clone https://github.com/Shaston/todo-list-app.git
cd todo-list-app

# 2. Copiar .env (ver paso anterior)
cp .env.example .env        # Linux/macOS/WSL/Git-Bash
# o
copy .env.example .env      # PowerShell/CMD
# 3. Arrancar (build + run en segundo plano)
docker compose up -d --build

# 4. Abrir en el navegador
http://localhost:3000

# algunos comandos útiles sobre docker

#Ver contenedores del proyecto
docker compose ps
#Detener y borrar contenedores
docker compose down
#Reconstruir solo la imagen de la app
docker compose build app

## 5 · Medidas de seguridad aplicadas SDLC

### 1. Planificación & Diseño
- Arquitectura **micro-servicios**: contenedor `app` separado de `mysql`, comunicación solo por red interna Docker.
- Se expone únicamente el puerto **3000** de la app; MySQL no publica puertos por defecto -> menor superficie de ataque.

### 2. Construcción Build
- Imagen base mínima **`node:18-alpine`** (oficial, ligera, menos CVEs).
- Instalación solo de dependencias de **producción** (`yarn install --production`).
- Ejecución con usuario **no-root** (`USER node`).
- Carpeta `/app/data` creada con permisos para *node*.

### 3. Gestión de secretos
- Credenciales fuera del código: variables leídas de **`.env`** (no versionado)
  + plantilla **`.env.example`** para quien clone el repo.
- Interpolación `${VAR}` en `compose.yaml`.

### 4. Persistencia de datos
- Volumen **`todo-data`** -> monta `/app/data` (SQLite).
- Volumen **`mysql-data`** -> monta `/var/lib/mysql` (MySQL).
