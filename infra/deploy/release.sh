#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"
WEB_SERVICE="${WEB_SERVICE:-web}"
DB_SERVICE="${DB_SERVICE:-db}"
BOOTSTRAP_COMMAND="${BOOTSTRAP_COMMAND:-npm run db:push && npm run db:seed}"

usage() {
	cat <<'EOF'
Usage: infra/deploy/release.sh [deploy|build|bootstrap|up|down|ps|logs]

Environment overrides:
	COMPOSE_FILE       Compose file path relative to repo root (default: docker-compose.prod.yml)
	ENV_FILE           Env file path relative to repo root (default: .env)
	WEB_SERVICE        Web service name in the compose file (default: web)
	DB_SERVICE         Database service name in the compose file (default: db)
	BOOTSTRAP_COMMAND  Bootstrap command run inside the web image

Examples:
	./infra/deploy/release.sh
	cp .env.production.example .env
	./infra/deploy/release.sh deploy
	./infra/deploy/release.sh logs
EOF
}

detect_compose() {
	if docker compose version >/dev/null 2>&1; then
		COMPOSE_CMD=(docker compose)
	elif command -v docker-compose >/dev/null 2>&1; then
		COMPOSE_CMD=(docker-compose)
	else
		echo "No Docker Compose command found. Install 'docker compose' or 'docker-compose'." >&2
		exit 1
	fi
}

compose() {
	"${COMPOSE_CMD[@]}" --env-file "$ENV_PATH" -f "$COMPOSE_PATH" "$@"
}

wait_for_service() {
	local service="$1"
	local container_id
	local status

	container_id="$(compose ps -q "$service")"

	if [[ -z "$container_id" ]]; then
		echo "Could not find a container for service '$service'." >&2
		exit 1
	fi

	echo "Waiting for $service to become healthy..."

	for _ in $(seq 1 60); do
		status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")"

		if [[ "$status" == "healthy" || "$status" == "running" ]]; then
			return 0
		fi

		sleep 2
	done

	echo "Timed out waiting for $service. Current status: $status" >&2
	compose ps
	exit 1
}

require_file() {
	local path="$1"

	if [[ ! -f "$path" ]]; then
		echo "Required file not found: $path" >&2
		exit 1
	fi
}

deploy() {
	compose build "$WEB_SERVICE"
	compose up -d "$DB_SERVICE"
	wait_for_service "$DB_SERVICE"
	compose run --rm --no-deps "$WEB_SERVICE" sh -lc "$BOOTSTRAP_COMMAND"
	compose up -d "$WEB_SERVICE"
	compose ps
}

logs() {
	compose logs --tail=120 "$WEB_SERVICE" "$DB_SERVICE"
}

main() {
	local command="${1:-deploy}"

	cd "$ROOT_DIR"

	case "$command" in
		-h|--help|help)
			usage
			return 0
			;;
	esac

	COMPOSE_PATH="$ROOT_DIR/$COMPOSE_FILE"
	ENV_PATH="$ROOT_DIR/$ENV_FILE"

	require_file "$COMPOSE_PATH"
	require_file "$ENV_PATH"
	detect_compose

	case "$command" in
		deploy)
			deploy
			;;
		build)
			compose build "$WEB_SERVICE"
			;;
		bootstrap)
			wait_for_service "$DB_SERVICE"
			compose run --rm --no-deps "$WEB_SERVICE" sh -lc "$BOOTSTRAP_COMMAND"
			;;
		up)
			compose up -d "$DB_SERVICE" "$WEB_SERVICE"
			;;
		down)
			compose down
			;;
		ps)
			compose ps
			;;
		logs)
			logs
			;;
		*)
			echo "Unknown command: $command" >&2
			usage >&2
			exit 1
			;;
	esac
}

main "$@"