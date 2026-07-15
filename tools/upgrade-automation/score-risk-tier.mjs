#!/usr/bin/env node
// Stage 1 risk-tier scorer.
// Input : JSON array of updates Renovate discovered:
//         [{ depName, updateType, currentVersion, newVersion }, ...]
//         (read from a file arg, or from stdin)
// Output: same list, each tagged with a tier + reason. Never exits non-zero.
//
// Logic (simple, deterministic):
//   1. base tier from semver bump: patch/pin/digest -> 3, minor -> 2, major -> 1
//   2. criticality override: package in alwaysTier1 -> forced Tier 1
//   3. internal-package floor: @thoughtspot/* never below Tier 2

import { readFileSync } from 'node:fs';

const cfg = JSON.parse(
  readFileSync(new URL('./risk-tiers.json', import.meta.url), 'utf8'),
);

const baseTier = (t) =>
  t === 'major' ? 1 : t === 'minor' ? 2 : 3; // patch/pin/digest -> 3

function score(u) {
  let tier = baseTier(u.updateType);
  let reason = `${u.updateType} bump`;

  if (cfg.alwaysTier1.includes(u.depName)) {
    tier = 1;
    reason = 'critical framework/toolchain (override)';
  } else if (
    tier === 3 &&
    (cfg.minimumTier2Prefixes || []).some((p) => u.depName.startsWith(p))
  ) {
    tier = 2;
    reason = 'internal workspace package floor';
  }
  return { ...u, tier, reason };
}

// ---- read input (file arg or stdin) ----
const arg = process.argv[2];
const raw = arg ? readFileSync(arg, 'utf8') : readFileSync(0, 'utf8');
const updates = JSON.parse(raw).map(score);

// ---- pretty print ----
const label = { 1: 'TIER 1 (high)', 2: 'TIER 2 (med)', 3: 'TIER 3 (low)' };
const pad = (s, n) => String(s).padEnd(n);

console.log(pad('PACKAGE', 22) + pad('CHANGE', 22) + pad('TIER', 15) + 'WHY');
console.log('-'.repeat(90));
for (const u of updates.sort((a, b) => a.tier - b.tier)) {
  console.log(
    pad(u.depName, 22) +
      pad(`${u.currentVersion} -> ${u.newVersion}`, 22) +
      pad(label[u.tier], 15) +
      u.reason,
  );
}

const counts = updates.reduce(
  (m, u) => ((m[u.tier] = (m[u.tier] || 0) + 1), m),
  {},
);
console.log('-'.repeat(90));
console.log(
  `Totals: Tier1=${counts[1] || 0}  Tier2=${counts[2] || 0}  Tier3=${counts[3] || 0}` +
    `   (Tier3 auto-merges, Tier2 needs approval, Tier1 needs a sponsor)`,
);
