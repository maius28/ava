# 1. 构建阶段
FROM node:18.20.8 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

# 2. 生产环境阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]