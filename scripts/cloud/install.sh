#!/usr/bin/env bash
# Cloud Agent environment: repository bootstrap.
# Runs after the repository is checked out. Must be idempotent and terminate.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "[install] Installing Node dependencies with npm ci..."
npm ci

echo "[install] Done."
