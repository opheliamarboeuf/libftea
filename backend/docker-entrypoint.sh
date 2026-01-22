#!/bin/sh
set -e

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  npm install
fi

# Generate Prisma client if prisma/schema.prisma exists
if [ -f "prisma/schema.prisma" ]; then
  npx prisma generate
fi

# Execute the command passed to the container
exec "$@"

