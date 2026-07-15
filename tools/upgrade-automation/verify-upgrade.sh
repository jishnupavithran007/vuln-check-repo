#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# verify-upgrade.sh  —  Stage 2 verification runner
#
# Given a Renovate upgrade branch, it:
#   1. parses the branch name to find the upgraded dependency
#   2. finds which workspace packages are AFFECTED: the packages whose
#      package.json changed in the PR, plus everything that depends on them
#   3. looks up the verification steps for that dependency
#   4. runs them (build / lint / test), scoped by pnpm to only those packages
#   5. on failure, saves a structured log per step (this is what later feeds
#      the AI remediation loop in Stage 3)
#
# Why we compute the affected set ourselves instead of pnpm's "...[<ref>]"
# changed-since selector: that selector returns nothing in a linked git
# worktree (this repo). So we diff package.json files with git and expand with
# pnpm's reliable path selector "...{<dir>}".
#
# Usage:
#   ./verify-upgrade.sh [--branch <name>] [--base <ref>] [--dry-run]
#   ./verify-upgrade.sh --dry-run --branch chore/upgrade-react-to-18.3.1
# ---------------------------------------------------------------------------
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$HERE" rev-parse --show-toplevel)"

BRANCH=""; BASE="app_ib_dev"; DRY_RUN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2 ;;
    --base)   BASE="$2";   shift 2 ;;
    --dry-run) DRY_RUN=1;  shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$BRANCH" ] || BRANCH="$(git -C "$REPO_ROOT" branch --show-current)"
cd "$REPO_ROOT"

# 1. Which dependency does this branch upgrade?
read -r DEP VERSION < <(node "$HERE/resolve-target.mjs" "$BRANCH")
echo "Branch : $BRANCH"
echo "Target : $DEP -> $VERSION   (base: $BASE)"

# 2. Which workspace packages changed? -> build a pnpm path filter for them
#    plus their dependents ("...{dir}").
CHANGED_DIRS="$(git diff --name-only "${BASE}...HEAD" -- '**/package.json' 2>/dev/null \
  | xargs -n1 dirname 2>/dev/null | sort -u || true)"

FILTER=""
if [ -n "$CHANGED_DIRS" ]; then
  while IFS= read -r d; do
    [ -n "$d" ] || continue
    FILTER="$FILTER --filter \"...{$d}\""
  done <<< "$CHANGED_DIRS"
fi

echo
echo "Affected packages (changed package.json + dependents vs $BASE):"
if [ -z "$FILTER" ]; then
  echo "  (no package.json changed vs $BASE — nothing to verify)"
else
  eval "pnpm -r $FILTER exec pwd" 2>/dev/null \
    | grep "^$REPO_ROOT/" | sed "s#$REPO_ROOT/##" | sed 's/^/  - /' || true
fi

# 3. Which verification steps apply to this dependency?
echo
STEPS_RAW="$(node "$HERE/resolve-steps.mjs" "$DEP")"

# Guard: never run steps with an empty filter (that would build EVERYTHING).
if [ -z "$FILTER" ] && [ "$DRY_RUN" != "1" ]; then
  echo "No affected packages; skipping verification (exit 0)."
  exit 0
fi

# 4. Run (or dry-run) each step. Portable loop (works on bash 3.2).
LOGDIR="$HERE/.verify-logs"; mkdir -p "$LOGDIR"
FAILED=0
while IFS= read -r line; do
  [ -n "$line" ] || continue
  NAME="${line%%$'\t'*}"
  CMD="${line#*$'\t'}"
  CMD="${CMD//\$\{filter\}/$FILTER}"   # substitute the computed filter
  if [ "$DRY_RUN" = "1" ]; then
    echo "  [plan] $NAME:  $CMD"
    continue
  fi
  echo "==> $NAME"
  LOG="$LOGDIR/${DEP}__${NAME}.log"
  if eval "$CMD" >"$LOG" 2>&1; then
    echo "    OK ($NAME)"
  else
    echo "    FAILED ($NAME) — log: $LOG"
    FAILED=1
    break   # stop at first failure; that log is the AI loop's input
  fi
done <<< "$STEPS_RAW"

echo
if [ "$DRY_RUN" = "1" ]; then
  echo "Dry run only — nothing executed."
elif [ "$FAILED" = "1" ]; then
  echo "VERIFICATION FAILED. The saved log is the hand-off point to Stage 3 (AI loop)."
  exit 1
else
  echo "VERIFICATION PASSED. Safe to auto-merge / request review per tier."
fi
