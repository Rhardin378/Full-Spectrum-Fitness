#!/usr/bin/env bash
# Cloud Agent environment: per-boot service startup.
#
# Brings up the Docker daemon (needed by the local Supabase stack), applies the
# networking fixes required for Docker inside the nested Cloud Agent VM, starts
# the local Supabase stack (Postgres + Auth + REST + Studio), and writes the
# .env.local consumed by the Next.js app.
#
# The Next.js dev server itself is launched separately as a persistent terminal
# (see .cursor/environment.json "terminals").
#
# This script is idempotent: it can run on every boot and detects services that
# are already running.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

log() { echo "[start] $*"; }

# ---------------------------------------------------------------------------
# 1. Docker daemon
# ---------------------------------------------------------------------------
ensure_dockerd() {
  if sudo docker info >/dev/null 2>&1; then
    log "Docker daemon already running."
  else
    log "Starting Docker daemon (storage-driver=fuse-overlayfs)..."
    sudo mkdir -p /etc/docker
    if [ ! -f /etc/docker/daemon.json ]; then
      echo '{ "storage-driver": "fuse-overlayfs" }' | sudo tee /etc/docker/daemon.json >/dev/null
    fi
    sudo bash -c 'nohup dockerd >/tmp/dockerd.log 2>&1 &'
    log "Waiting for Docker daemon to become ready..."
    for _ in $(seq 1 60); do
      if sudo docker info >/dev/null 2>&1; then break; fi
      sleep 1
    done
    sudo docker info >/dev/null 2>&1 || { log "ERROR: Docker daemon did not start"; tail -n 40 /tmp/dockerd.log || true; exit 1; }
    log "Docker daemon is ready."
  fi
}

# ---------------------------------------------------------------------------
# 2. Networking fixes for Docker inside the nested VM
#
# The host ships a legacy-iptables FORWARD chain with a DROP policy, while
# Docker v29 programs the nft backend. With bridge-nf-call-iptables enabled,
# inter-container traffic on custom bridges (used by the Supabase stack) hits
# the legacy DROP policy and times out. We open the legacy FORWARD policy and
# stop bridged frames from traversing iptables so containers can talk to each
# other.
# ---------------------------------------------------------------------------
fix_networking() {
  log "Applying nested-VM Docker networking fixes..."
  sudo iptables-legacy -P FORWARD ACCEPT 2>/dev/null || true
  if [ -w /proc/sys/net/bridge/bridge-nf-call-iptables ] || [ -e /proc/sys/net/bridge/bridge-nf-call-iptables ]; then
    echo 0 | sudo tee /proc/sys/net/bridge/bridge-nf-call-iptables >/dev/null 2>&1 || true
  fi
  # Make the daemon socket usable without requiring a docker-group login shell.
  sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# 3. Local Supabase stack
# ---------------------------------------------------------------------------
ensure_supabase() {
  if npx --no-install supabase status >/dev/null 2>&1; then
    log "Supabase stack already running."
  else
    log "Starting local Supabase stack (this pulls images on first run)..."
    npx --no-install supabase start
  fi
}

# ---------------------------------------------------------------------------
# 4. App environment file
# ---------------------------------------------------------------------------
write_env_local() {
  log "Writing .env.local from supabase status..."
  local status_env api_url anon_key db_url
  status_env="$(npx --no-install supabase status -o env)"
  api_url="$(echo "$status_env"  | sed -n 's/^API_URL="\(.*\)"$/\1/p')"
  anon_key="$(echo "$status_env" | sed -n 's/^ANON_KEY="\(.*\)"$/\1/p')"
  db_url="$(echo "$status_env"   | sed -n 's/^DB_URL="\(.*\)"$/\1/p')"

  cat > "$REPO_ROOT/.env.local" <<EOF
NEXT_PUBLIC_SUPABASE_URL=${api_url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon_key}

# Local Supabase DB URL (used by npm run db:push / db:status)
DATABASE_URL=${db_url}
EOF
  log ".env.local written:"
  sed 's/\(ANON_KEY=\).*/\1<redacted>/' "$REPO_ROOT/.env.local" | sed 's#^#[start]   #'
}

ensure_dockerd
fix_networking
ensure_supabase
write_env_local

log "Environment ready. Next.js dev server starts in the 'next-dev' terminal."
