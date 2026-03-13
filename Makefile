# Syntropy Platform — local development targets
# Architecture: COMP-001.3

.PHONY: infra-start infra-stop infra-reset

infra-start:
	pnpm dev:infra

infra-stop:
	docker compose down

infra-reset: infra-stop
	docker compose down -v
	pnpm dev:infra
