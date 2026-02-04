build:
	docker compose build

up:
	docker compose up -d

dev:
	docker compose up

migrate:
	docker compose exec backend npx prisma migrate dev --name init

down:
	docker compose down -v --remove-orphans

start: build up migrate

re: down start