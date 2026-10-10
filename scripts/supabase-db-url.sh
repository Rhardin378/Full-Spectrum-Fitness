#!/usr/bin/env bash
# Print a Postgres URL that works from WSL. Direct db.*.supabase.co hosts are
# IPv6-only; the session pooler is reachable over IPv4.
set -euo pipefail

python3 - <<'PY'
import os
from pathlib import Path
from urllib.parse import urlparse, quote

explicit = os.environ.get("DATABASE_POOLER_URL")
if explicit:
    print(explicit)
    raise SystemExit(0)

raw = os.environ.get("DATABASE_URL")
if not raw:
    raise SystemExit("DATABASE_URL is not set")

parsed = urlparse(raw)
host = parsed.hostname or ""
password = parsed.password or ""

if host.startswith("db.") and host.endswith(".supabase.co"):
    project_ref = host.split(".")[1]
    pooler_host = "aws-1-us-west-2.pooler.supabase.com"
    pooler_file = Path("supabase/.temp/pooler-url")
    if pooler_file.exists():
        listed = urlparse(pooler_file.read_text().strip())
        if listed.hostname:
            pooler_host = listed.hostname
    user = f"postgres.{project_ref}"
    print(
        f"postgresql://{user}:{quote(password, safe='')}@{pooler_host}:5432/postgres"
    )
else:
    print(raw)
PY
