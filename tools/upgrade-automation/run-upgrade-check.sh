#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# run-upgrade-check.sh
#
# "Look but don't touch" upgrade check. Runs Renovate locally against ONE
# folder, then prints a risk-tiered table of every available update.
#
# It creates NO branches, NO commits, NO GitHub PRs. Totally safe to run.
#
# Usage:   ./run-upgrade-check.sh [path-to-app]
# Example: ./run-upgrade-check.sh js/ts-apps/home
# ---------------------------------------------------------------------------
set -euo pipefail

# 1. Which app folder to check (relative to repo root; defaults to home MFE)
TARGET="${1:-js/ts-apps/home}"

# 2. Where this script + its helper files live
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 3. Renovate's local mode scans the folder you run it FROM, so we move to
#    the repo root. Auto-detected via git since this script lives in the repo.
REPO_ROOT="$(git -C "$HERE" rev-parse --show-toplevel)"
cd "$REPO_ROOT"
echo "Scanning repo: $REPO_ROOT   (folder: $TARGET)"

# 4. Renovate 39 needs Node 20+. Use the current node if new enough, else
#    fall back to an nvm-installed Node 20/22 if present.
node_major() { node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0; }
if [ "$(node_major)" -lt 20 ]; then
  for v in v22 v20; do
    d=$(ls -d "$HOME/.nvm/versions/node/${v}."* 2>/dev/null | tail -1 || true)
    if [ -n "${d:-}" ]; then export PATH="$d/bin:$PATH"; break; fi
  done
fi
if [ "$(node_major)" -lt 20 ]; then
  echo "ERROR: Renovate needs Node 20+. Found $(node -v). Install/enable Node 20+." >&2
  exit 1
fi
echo "Using node $(node -v)"

# 5. Run Renovate against the committed config, but layer LOCAL-ONLY overrides
#    on top via CLI flags (the committed config stays production-clean):
#      --platform=local        scan this checkout, never touch GitHub
#      --onboarding=false      skip the onboarding-branch check (crashes locally)
#      --require-config         allow running without a repo-root config file
#      --include-paths          scope the scan to just $TARGET for a fast check
LOG="$HERE/.last-run.log"
echo "==> Step 1/3: Renovate scanning '$TARGET' for outdated packages..."
RENOVATE_CONFIG_FILE="$HERE/renovate.json" LOG_LEVEL=debug LOG_FORMAT=json \
  npx --yes renovate@39 \
    --platform=local \
    --onboarding=false \
    --require-config=optional \
    --include-paths="[\"${TARGET}/**\"]" \
    > "$LOG" 2>&1 || true

echo "==> Step 2/3: Extracting the list of available updates..."
node "$HERE/extract-updates.mjs" "$LOG" > "$HERE/.last-updates.json"

echo "==> Step 3/3: Scoring each update by risk tier..."
echo
node "$HERE/score-risk-tier.mjs" "$HERE/.last-updates.json"

echo
echo "Done. Nothing was changed in your repo or on GitHub."
echo "(Raw Renovate log: $LOG)"
