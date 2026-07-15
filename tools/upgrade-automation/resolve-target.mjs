#!/usr/bin/env node
// Parse a Renovate branch name into the dependency it upgrades.
//   chore/upgrade-<sanitized-dep>-to-<version>  ->  { dep, version }
//
// Renovate sanitizes the dep name for the branch (@ and / become -), so
// "@apollo/client" -> "apollo-client". We can't perfectly un-sanitize a scoped
// name, so we return the sanitized token; step lookup compares against it.
//
// Usage: node resolve-target.mjs "chore/upgrade-react-to-18.3.1"
//        -> prints:  react 18.3.1

const branch = process.argv[2] || '';
const m = branch.match(/^chore\/upgrade-(.+)-to-([0-9][^-]*(?:-[0-9A-Za-z.]+)?)$/);

if (!m) {
  console.error(`Not a Renovate upgrade branch: "${branch}"`);
  process.exit(2);
}

const [, dep, version] = m;
// Machine-readable on stdout: "<dep> <version>"
console.log(`${dep} ${version}`);
