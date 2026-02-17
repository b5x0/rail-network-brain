# Stage 1: Build React/Vite App
FROM node:18-alpine as build

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install

# Source code
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
