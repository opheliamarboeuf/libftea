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

# Seed the database with initial users (admin, moderators, and test users)
seed:
	docker compose exec backend npm run db:seed

# Apply migrations and seed the database
migrate-and-seed: migrate seed

# Stop containers and network (volumes are preserved)
down:
	docker compose down --remove-orphans

# Stop everything including volumes (DB deleted intentionally)
reset:
	docker compose down -v --remove-orphans

# Full startup for development (build + up + migrations + seed)
start: build up migrate-and-seed

# Rebuild completely without losing the DB
re: down start
