# Etapa 1: Construcción de la imagen de la aplicación

# 1. Imagen base mínima y segura
FROM node:18-alpine

# 2. Directorio de trabajo dentro de la imagen
WORKDIR /app

# 3. Copiar definiciones de dependencias
COPY package.json yarn.lock ./
# 4. Dependencias de producción (omitiendo devDependencies)
RUN yarn install --production --frozen-lockfile \
    && yarn cache clean

# 5. Copiar el código fuente de la aplicación al contenedor
COPY src/ ./src/
#COPY public/ ./public/


#carpeta de datos accesible para node
RUN mkdir -p /app/data \
    && chown -R node:node /app/data

# 6. Exponer el puerto de la aplicación (3000)
EXPOSE 3000

# 7. Usar un usuario no root para ejecutar la app por seguridad

USER node

# 8. Comando por defecto para lanzar la aplicación
CMD ["node", "src/index.js"]