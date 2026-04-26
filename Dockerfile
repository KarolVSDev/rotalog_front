# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Serve com Nginx
FROM nginx:stable-alpine
# Copia o build do React para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copia configuração do Nginx (opcional, para lidar com rotas do React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
