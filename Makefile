build:
	docker compose build

up:
	docker compose up -d

# Start in development mode 
dev:
	docker compose up

# Apply Prisma migrations
migrate:
	docker compose exec backend npx prisma migrate dev

# Stop containers and network (volumes are preserved)
down:
	docker compose down --remove-orphans

# Stop everything including volumes (DB deleted intentionally)
reset:
	docker compose down -v --remove-orphans

# Full startup for development (build + up + migrations)
start: build up migrate

# Rebuild completely without losing the DB
re: down start
