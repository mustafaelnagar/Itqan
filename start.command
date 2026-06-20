#!/usr/bin/env bash
#
# Itqān — one-click launcher.
#
#   • Double-click in Finder (macOS), or run `./start.command` from a terminal.
#   • Idempotent: it only installs deps, vendors the sql.js engine, downloads
#     fonts, or generates Quran data when those assets are MISSING. Nothing is
#     re-downloaded if it's already there.
#
# Flags:
#   --backend     also start the local Supabase stack (requires Docker)
#   --reinstall   force `pnpm install` even if node_modules exists
#   --no-open     don't auto-open the browser
#
set -euo pipefail

# Run from the repo root regardless of where it was launched from.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BOLD=$'\033[1m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[0;33m'; DIM=$'\033[2m'; RESET=$'\033[0m'
step()  { printf "%s▸ %s%s\n" "$BOLD" "$1" "$RESET"; }
ok()    { printf "  %s✓ %s%s\n" "$GREEN" "$1" "$RESET"; }
warn()  { printf "  %s⚠ %s%s\n" "$YELLOW" "$1" "$RESET"; }

BACKEND=false; REINSTALL=false; OPEN=true
for arg in "$@"; do
  case "$arg" in
    --backend) BACKEND=true ;;
    --reinstall) REINSTALL=true ;;
    --no-open) OPEN=false ;;
  esac
done

printf "\n%s☪  Itqān — The Hafiz OS%s\n\n" "$BOLD" "$RESET"

# --- 0. Prerequisites -------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    step "Enabling pnpm via corepack"; corepack enable >/dev/null 2>&1 || true
  fi
fi
command -v pnpm >/dev/null 2>&1 || { echo "pnpm not found. Install Node 20+ and run: corepack enable"; exit 1; }

# --- 1. Dependencies (install only if missing) ------------------------------
step "Dependencies"
if [ "$REINSTALL" = true ] || [ ! -d node_modules ] || [ ! -d apps/mobile/node_modules ]; then
  echo "  installing…"; pnpm install
else
  ok "already installed (skipping)"
fi

# --- 2. sql.js engine for web (vendor from node_modules only if missing) ----
step "Web SQLite engine"
if [ ! -f apps/mobile/public/sql-wasm.wasm ] || [ ! -f apps/mobile/public/sql-wasm.js ]; then
  echo "  vendoring…"; pnpm --filter @itqan/mobile sync:sql-wasm
else
  ok "present (skipping)"
fi

# --- 3. Fonts (download only if missing; they are normally committed) -------
step "Fonts"
FONT_DIR="apps/mobile/assets/fonts"; mkdir -p "$FONT_DIR"
download_font() { # url dest
  if [ ! -f "$2" ]; then echo "  downloading $(basename "$2")…"; curl -sSL -o "$2" "$1"; else ok "$(basename "$2") present"; fi
}
download_font "https://github.com/google/fonts/raw/main/ofl/amiriquran/AmiriQuran-Regular.ttf" "$FONT_DIR/AmiriQuran-Regular.ttf"
download_font "https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"   "$FONT_DIR/Inter.ttf"

# --- 4. Quran data (generate only if missing) -------------------------------
step "Quran data"
if [ ! -f packages/quran-data/data/ayahs.json ]; then
  echo "  generating (one-time fetch)…"; pnpm --filter @itqan/quran-data generate
else
  ok "present (skipping)"
fi

# --- 5. Optional backend ----------------------------------------------------
if [ "$BACKEND" = true ]; then
  step "Supabase backend"
  if docker info >/dev/null 2>&1; then
    pnpm db:start || warn "supabase failed to start (continuing without backend)"
  else
    warn "Docker not running — skipping backend (the app works fully offline without it)"
  fi
fi

# --- 6. Launch the web app --------------------------------------------------
step "Starting Itqān (web)"
printf "  %sopens at http://localhost:8081 — press Ctrl+C to stop%s\n\n" "$DIM" "$RESET"
if [ "$OPEN" = false ]; then export BROWSER=none; fi
exec pnpm --filter @itqan/mobile web
