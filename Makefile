build:
	docker compose build

up:
	docker compose up -d

migrate:
	docker compose exec backend npx prisma migrate dev --name init

dev:
	docker compose up

start:
	make build
	make up
	make migrate