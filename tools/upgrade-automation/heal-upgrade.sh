#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# heal-upgrade.sh  —  Stage 3: the Claude contextual healing loop
#
# Runs a verification command; if it fails, asks Claude to fix the code, then
# re-verifies. Repeats up to --max-retries. Every attempt is journaled to
# AI_CHANGES.md (the model's memory across retries, and the human's audit log).
#
#   PASS on first try         -> no AI needed.
#   PASS after N fixes        -> HEALED; journal + code are the PR's story.
#   still failing at max      -> ESCALATE (in prod: label PR + alert owners).
#
# Usage:
#   heal-upgrade.sh --workdir <dir> --verify-cmd "<cmd>" [--dep <name>]
#                   [--max-retries 3] [--prompt <file>]
#
# --workdir     the blast radius: Claude may only edit files here (it runs here)
# --verify-cmd  how to check success (exit 0 = pass). In the real pipeline this
#               is the Stage 2 runner; for a quick demo it can be "node test.mjs"
# ---------------------------------------------------------------------------
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="$PWD"; VERIFY_CMD=""; DEP="the dependency"; MAX=3
PROMPT_FILE="$HERE/prompts/fixer.v1.md"
while [ $# -gt 0 ]; do
  case "$1" in
    --workdir)     WORKDIR="$2"; shift 2 ;;
    --verify-cmd)  VERIFY_CMD="$2"; shift 2 ;;
    --dep)         DEP="$2"; shift 2 ;;
    --max-retries) MAX="$2"; shift 2 ;;
    --prompt)      PROMPT_FILE="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$VERIFY_CMD" ] || { echo "need --verify-cmd" >&2; exit 2; }

cd "$WORKDIR"
JOURNAL="$WORKDIR/AI_CHANGES.md"
[ -f "$JOURNAL" ] || printf '# AI_CHANGES.md\nUpgrade: %s\n' "$DEP" > "$JOURNAL"

attempt=0
while : ; do
  echo "──> verify (attempt $attempt)"
  if eval "$VERIFY_CMD" > "$WORKDIR/.verify.log" 2>&1; then
    if [ "$attempt" -eq 0 ]; then
      echo "PASSED on first try — no AI needed."
    else
      echo "HEALED after $attempt attempt(s). See AI_CHANGES.md."
    fi
    exit 0
  fi

  if [ "$attempt" -ge "$MAX" ]; then
    echo "MAX RETRIES ($MAX) reached — ESCALATE."
    echo "  (prod: commit AI_CHANGES.md, add needs-human-review, alert code owners)"
    exit 1
  fi
  attempt=$((attempt + 1))
  echo "──> verify failed; invoking Claude (attempt $attempt of $MAX)"

  PROMPT="$(cat "$PROMPT_FILE")

DEPENDENCY UPGRADED: $DEP
ATTEMPT: $attempt of $MAX

===== VERIFICATION ERROR =====
$(cat "$WORKDIR/.verify.log")

===== YOUR PREVIOUS ATTEMPTS (AI_CHANGES.md) =====
$(cat "$JOURNAL")
"

  # Claude edits code in this dir. acceptEdits auto-applies its file edits so
  # the loop is non-interactive; it is constrained to $WORKDIR because that is
  # the cwd and the prompt forbids editing elsewhere.
  claude -p "$PROMPT" \
    --permission-mode acceptEdits \
    --allowedTools "Read,Edit,Write,Grep,Glob" \
    > "$WORKDIR/.claude-attempt-$attempt.log" 2>&1 || true

  # Safety net: if Claude did not journal, record a minimal entry.
  if ! grep -q "## Attempt $attempt" "$JOURNAL" 2>/dev/null; then
    {
      echo ""
      echo "## Attempt $attempt"
      echo "- Error: $(head -1 "$WORKDIR/.verify.log")"
      echo "- Reasoning: (model did not journal; see .claude-attempt-$attempt.log)"
    } >> "$JOURNAL"
  fi
done
