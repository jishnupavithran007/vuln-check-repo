# Autonomous setup — how this runs without a human orchestrator

Two GitHub Actions do everything. Once set up, nobody drives it.

```
          ┌─────────────────────── periodic / manual ───────────────────────┐
          │                                                                  │
  renovate.yml (or Mend app)                                                 │
     scan deps → create a branch per upgrade → open a PR                     │
     → apply risk-tier LABELS (upgrade:tier-1/2/3, auto-merge, ...)          │
                          │  (a PR is opened)                                │
                          ▼                                                  │
  verify-and-heal.yml   [trigger: pull_request on chore/upgrade-*]           │
     Stage 2  verify affected packages (build/test)                         │
       pass → done (tier-3 auto-merges; tier-1/2 wait for review)           │
       fail → Stage 3  Claude heals (claude CLI + ANTHROPIC_API_KEY)         │
              → pushes fix → Stage 4 guardrails                             │
                 clean   → green check                                      │
                 flagged → label needs-human-review                         │
                 no heal → label needs-human-review                         │
          └──────────────────────────────────────────────────────────────────┘
```

**Ranking is automatic:** Renovate applies the tier labels at PR creation (see
`packageRules` in `/renovate.json`). No separate scoring step runs in CI — the
label *is* the rank. (`score-risk-tier.mjs` is only for local dry-runs.)

## How it triggers

- **Periodic:** `renovate.yml` runs on a weekly cron.
- **Manual:** GitHub → **Actions → renovate → Run workflow** (workflow_dispatch).
- **Per PR:** `verify-and-heal.yml` fires automatically on every
  `chore/upgrade-*` pull request (opened / updated).

## Recommended setup (least moving parts)

### 1. Stage 1 — pick ONE way to create PRs
- **Best: install the Mend Renovate GitHub App** →
  https://github.com/apps/renovate → enable it on this repo. It runs on a
  schedule, reads `renovate.json`, opens tiered PRs, and gives Merge Confidence
  badges. **No token to manage.** If you do this, you can delete `renovate.yml`.
- **Or self-host** `renovate.yml`: add secret `RENOVATE_TOKEN` = a GitHub PAT
  with `repo` scope (fine-grained: Contents R/W, Pull requests R/W, Issues R/W).

### 2. Stage 3 — the only secret you must add
- Create an Anthropic API key at https://console.anthropic.com → API Keys.
- Repo → **Settings → Secrets and variables → Actions → New repository secret**
  - Name: `ANTHROPIC_API_KEY`   Value: your key

### 3. Stage 5 — let tier-3 auto-merge
- Repo → **Settings → General → Pull Requests → ✅ Allow auto-merge**
- (Optional) **Settings → Branches → add a rule for `main`** requiring the
  `verify-and-heal` status check, so nothing merges until verification is green.

## That's it

With the Mend app + `ANTHROPIC_API_KEY`, the whole pipeline is autonomous:
- **weekly** (or on demand) Renovate opens tiered PRs,
- each PR self-verifies,
- breaking ones get healed by Claude,
- shortcuts get caught by guardrails and routed to a human,
- clean tier-3 patches auto-merge.

No local scripts, no orchestrator. The local scripts in this folder are the
same logic, runnable by hand for debugging.
