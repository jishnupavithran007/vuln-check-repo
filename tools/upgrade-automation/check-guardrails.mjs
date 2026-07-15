#!/usr/bin/env node
// Stage 4 — guardrail gates. Runs AFTER Stage 3 healing, on the PR diff.
// Blocks "green but wrong" fixes. Exits non-zero (and prints findings) if any
// gate fails, so CI can escalate to human review instead of auto-merging.
//
//   Gate 1 structural   : no suppressions added (@ts-ignore, eslint-disable,
//                         .skip(, `as any`)
//   Gate 2 config       : no edits to tsconfig / eslint / stylelint / babel
//                         config (package.json + lockfile are allowed — those
//                         are the upgrade itself)
//   Gate 3 intent       : a dependency whose version changed must still be
//                         imported. If the heal removed the last import to make
//                         the build pass (e.g. the chalk shortcut), flag it.
//
// Usage: node check-guardrails.mjs [--base main]
import { execSync } from 'node:child_process';

const base = (() => {
  const i = process.argv.indexOf('--base');
  return i >= 0 ? process.argv[i + 1] : 'main';
})();

const sh = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8' }); } catch (e) { return e.stdout || ''; }
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/@]/g, '\\$&');
const SRC = "'*.cjs' '*.js' '*.mjs' '*.ts' '*.tsx' '*.jsx'";

const findings = [];

// ---- Gate 1: suppressions in added lines ----
const diff = sh(`git diff ${base}...HEAD`);
const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
const SUPPRESSIONS = [
  [/@ts-ignore/, '@ts-ignore'],
  [/@ts-expect-error/, '@ts-expect-error'],
  [/eslint-disable/, 'eslint-disable'],
  [/\.skip\s*\(/, '.skip('],
  [/\bas any\b/, 'as any'],
];
for (const line of added) {
  for (const [re, name] of SUPPRESSIONS) {
    if (re.test(line)) findings.push(`GATE 1 (structural): added suppression "${name}": ${line.slice(1).trim()}`);
  }
}

// ---- Gate 2: config files edited ----
const changed = sh(`git diff --name-only ${base}...HEAD`).split('\n').filter(Boolean);
for (const f of changed) {
  if (/(^|\/)(tsconfig[^/]*\.json|\.eslintrc[^/]*|\.stylelintrc[^/]*|babel\.config[^/]*)$/.test(f)) {
    findings.push(`GATE 2 (structural): config file edited (should not be needed to fix an upgrade): ${f}`);
  }
}

// ---- Gate 3: upgraded-but-no-longer-imported ----
// Find external deps whose version changed in any package.json.
const bumped = new Set();
for (const f of changed.filter((f) => f.endsWith('package.json'))) {
  const d = sh(`git diff ${base}...HEAD -- "${f}"`);
  for (const m of d.matchAll(/^[+-]\s*"([^"]+)":\s*"[^"]+"/gm)) {
    const name = m[1];
    if (!name.startsWith('@sandbox/') && !/^(name|version|description|main|private|type)$/.test(name)) {
      bumped.add(name);
    }
  }
}
const importCount = (ref, name) => {
  const pat = `(require\\(['\\"]${esc(name)}(['\\"/])|from ['\\"]${esc(name)}['\\"]|import ['\\"]${esc(name)}['\\"])`;
  const out = sh(`git grep -lE "${pat}" ${ref} -- ${SRC}`);
  return out.split('\n').filter(Boolean).length;
};
for (const name of bumped) {
  const before = importCount(base, name);
  const after = importCount('HEAD', name);
  if (before > 0 && after === 0) {
    findings.push(`GATE 3 (intent): "${name}" was upgraded but is no longer imported anywhere — the fix removed its usage instead of adapting to it.`);
  }
}

// ---- report ----
if (findings.length === 0) {
  console.log('Guardrails PASSED — no suppressions, no config edits, all upgraded deps still used.');
  process.exit(0);
}
console.log('Guardrails FAILED:');
for (const f of findings) console.log('  - ' + f);
process.exit(1);
