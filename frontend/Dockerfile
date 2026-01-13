# Frontend Dockerfile (React, Node 22, production build served by nginx)

# Build stage
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Optional: copy a custom nginx.conf if you need SPA routing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# For development you can also run with Node directly:
# docker run --rm -it -p 3000:3000 -v $(pwd):/app -w /app node:22 sh -c "npm ci && npm start"
