FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ bash

# Set working directory
WORKDIR /app

# Copy dependency files first (optimization)
COPY package.json package-lock.json* .npmrc ./

# Install all dependencies
RUN npm ci

# Copy the rest of the source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
