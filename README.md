# vuln-check-repo 

A small monorepo that mirrors the ThoughtSpot app layout, on purpose:

```
js/
  ts-apps/          <- micro-frontends (MFEs)
    home/           @sandbox/home
    admin/          @sandbox/admin
  ts-packages/      <- shared libraries
    js-util/        @sandbox/js-util   (uses lodash)
    logger/         @sandbox/logger    (uses chalk)
blink-v2/           @sandbox/blink-v2  (depends on home + logger)
```

Dependency graph (so upgrades ripple like the real repo):

```
js-util  ←── home ←── blink-v2
logger   ←── home, blink-v2
js-util  ←── admin
```

Every package pins **deliberately outdated** dependencies (react 17, jest 27,
typescript 4.9, webpack 4, chalk 4, lodash 4.17.20, is-odd 2) so the upgrade
pipeline has real work to do:

- **Stage 1** (Renovate) discovers the updates and tiers them by risk.
- **Stage 2** verifies an upgrade by building/testing only the affected packages.
- **Stage 3** (Claude) repairs breaking changes — e.g. upgrading `chalk` 4→5
  (ESM-only) breaks `logger`'s `require('chalk')`, which the loop fixes.

This repo is a safe place to run all of that end-to-end.
