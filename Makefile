build:
	docker compose build

up:
	docker compose up -d

migrate:
	docker compose exec backend npx prisma migrate dev --name init

dev:
	docker compose up

reset:
	docker compose down -v --remove-orphans

start: build up migrate

re: reset start