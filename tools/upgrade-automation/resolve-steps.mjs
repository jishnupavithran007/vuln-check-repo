#!/usr/bin/env node
// Given a dependency name, print the verification steps to run, one per line
// as "<name>\t<cmd>". Uses packageOverrides[<dep>] if present, else defaults.
// Dep names are compared after the same sanitizing Renovate applies to branches
// (@ and / -> -), so "react" matches "react" and "@apollo/client" matches
// "apollo-client".
//
// Usage: node resolve-steps.mjs react
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(
  readFileSync(new URL('./upgrade-automation.config.json', import.meta.url), 'utf8'),
);

const dep = process.argv[2] || '';
const sane = (s) => s.replace(/[@/]/g, '-').replace(/^-/, '');

const overrideKey = Object.keys(cfg.packageOverrides || {}).find(
  (k) => sane(k) === sane(dep),
);
const block = overrideKey ? cfg.packageOverrides[overrideKey] : cfg.defaults;

// Emit the source (default vs override) on stderr for humans; steps on stdout.
console.error(
  overrideKey
    ? `steps: packageOverrides["${overrideKey}"]`
    : 'steps: defaults',
);
for (const s of block.verificationSteps) {
  console.log(`${s.name}\t${s.cmd}`);
}
