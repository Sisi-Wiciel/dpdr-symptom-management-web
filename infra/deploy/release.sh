#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

docker compose build web bootstrap
docker compose up -d db
docker compose --profile bootstrap run --rm bootstrap
docker compose up -d web