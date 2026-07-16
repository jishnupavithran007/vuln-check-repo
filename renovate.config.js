// Renovate config (self-hosted). Single source of truth.
//
// STAIR-STEP: for every external dependency we compute an `allowedVersions`
// cap of "current major + next major only". So a dep at v27 gets ONE PR to
// v28 — no PR is created for v29 or v30. After you merge 27->28, the next run
// recomputes the cap from v28 and offers 28->29. You climb one major at a time
// and never leap to latest.
const fs = require('fs');
const path = require('path');

const config = {
  extends: ['config:recommended'],
  onboarding: false,
  requireConfig: 'optional',
  // Recreate upgrade PRs even if a previous one was closed. Without this,
  // Renovate treats a closed PR as "don't want it" and silently drops the
  // upgrade — which is why react/typescript/webpack/chalk went missing after
  // our earlier config churn. For this sandbox we always want them back.
  recreateWhen: 'always',
  enabledManagers: ['npm'],
  separateMultipleMajor: true,
  prConcurrentLimit: 20,
  prHourlyLimit: 0,
  branchPrefix: 'chore/upgrade-',
  branchNameStrict: true,
  branchTopic: '{{{depNameSanitized}}}-to-{{{newVersion}}}',
  commitMessageExtra: 'from {{currentValue}} to {{newValue}}',
  packageRules: [
    {
      description: 'Internal workspace packages are managed by pnpm, not Renovate',
      matchPackageNames: ['@sandbox/**'],
      enabled: false,
    },
    {
      description: 'Tier 3 - low risk: patch/pin/digest (excludes critical frameworks). Auto-merges once CI is green (Stage 5).',
      matchUpdateTypes: ['patch', 'pin', 'digest'],
      matchPackageNames: ['*', '!react', '!react-dom', '!typescript', '!jest', '!webpack', '!vite', '!next'],
      addLabels: ['upgrade:tier-3', 'auto-merge'],
      automerge: true,
      platformAutomerge: true,
    },
    {
      description: 'Tier 2 - minor (excludes critical frameworks)',
      matchUpdateTypes: ['minor'],
      matchPackageNames: ['*', '!react', '!react-dom', '!typescript', '!jest', '!webpack', '!vite', '!next'],
      addLabels: ['upgrade:tier-2'],
    },
    {
      description: 'Tier 1 - every major',
      matchUpdateTypes: ['major'],
      addLabels: ['upgrade:tier-1', 'major-upgrade', 'needs-human-review'],
    },
    {
      description: 'Critical frameworks/toolchain always Tier 1',
      matchPackageNames: ['react', 'react-dom', 'typescript', 'jest', 'webpack', 'vite', 'next'],
      addLabels: ['upgrade:tier-1', 'critical-pkg', 'needs-human-review'],
    },
  ],
};

// ---- dynamic: cap each external dependency to its NEXT major only ----
function packageJsons(root) {
  const out = [];
  const add = (p) => fs.existsSync(p) && out.push(p);
  add(path.join(root, 'package.json'));
  add(path.join(root, 'blink-v2', 'package.json'));
  for (const group of ['js/ts-apps', 'js/ts-packages']) {
    const dir = path.join(root, group);
    if (fs.existsSync(dir)) for (const name of fs.readdirSync(dir)) add(path.join(dir, name, 'package.json'));
  }
  return out;
}

const caps = {};
for (const file of packageJsons(__dirname)) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const deps of [pkg.dependencies, pkg.devDependencies]) {
    if (!deps) continue;
    for (const [name, range] of Object.entries(deps)) {
      if (name.startsWith('@sandbox/')) continue;
      const major = parseInt(String(range).replace(/^[^\d]*/, '').split('.')[0], 10);
      if (!Number.isFinite(major)) continue;
      const ceiling = major + 2; // allow current major + the next one, block beyond
      caps[name] = caps[name] === undefined ? ceiling : Math.min(caps[name], ceiling);
    }
  }
}
for (const [name, ceiling] of Object.entries(caps)) {
  config.packageRules.push({ matchPackageNames: [name], allowedVersions: `<${ceiling}.0.0` });
}

module.exports = config;
