#!/usr/bin/env node
// Parse a Renovate branch name into the dependency it upgrades.
//   chore/upgrade-<dep>-to-<version>  ->  prints "<dep> <version>"
//   grouped/other (no -to-)           ->  prints just "<dep>"
//
// Tolerant on purpose: the dep is only used to pick verification-step
// overrides (e.g. jest runs tests first), so an imperfect parse just falls
// back to the default steps. Never hard-fails.
//
// Usage: node resolve-target.mjs "chore/upgrade-react-to-18.3.1"  -> react 18.3.1

const branch = process.argv[2] || '';
const rest = branch.replace(/^chore\/upgrade-/, '');
const m = rest.match(/^(.+)-to-(.+)$/);
console.log(m ? `${m[1]} ${m[2]}` : rest);
