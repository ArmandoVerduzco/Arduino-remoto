# ================================
# ETAPA 1: BUILD
# ================================
FROM node:20-slim AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Limpiar cache de npm y eliminar lockfile si existe
RUN rm -f package-lock.json && \
    npm cache clean --force

# Instalar dependencias con --legacy-peer-deps para evitar conflictos
RUN npm install --legacy-peer-deps

# Forzar reinstalación de rollup y sus binarios nativos
RUN npm install rollup --force

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# ================================
# ETAPA 2: PRODUCCIÓN
# ================================
FROM nginx:alpine

# Copiar build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]