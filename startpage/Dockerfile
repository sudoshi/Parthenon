# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY project/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY project/ ./

# Build the application
RUN npm run build

# Stage 2: Setup the Node.js server
FROM node:20-alpine AS server

WORKDIR /app

# Copy server package.json and package-lock.json
COPY project/server/package*.json ./

# Install server dependencies
RUN npm install --production

# Copy server code
COPY project/server/ ./

# Stage 3: Serve the built application with Nginx and run the Node.js server
FROM nginx:alpine

# Install Node.js, npm, and PostgreSQL client
RUN apk add --no-cache nodejs npm postgresql-client bash

# Copy the build output from the first stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the server from the second stage
COPY --from=server /app /app/server

# Copy database setup files
COPY project/db-setup.sql /app/
COPY project/setup-db.sh /app/

# Copy Nginx configuration
COPY project/nginx.conf /etc/nginx/conf.d/default.conf

# Make the setup script executable
RUN chmod +x /app/setup-db.sh

# Expose ports
EXPOSE 80 3009

# Start Nginx server, setup database, and run Node.js server
CMD ["/bin/bash", "-c", "/app/setup-db.sh && cd /app/server && node index.js & nginx -g 'daemon off;'"]
