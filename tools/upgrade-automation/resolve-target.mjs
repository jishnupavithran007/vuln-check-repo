#!/usr/bin/env node
// Parse a Renovate branch name into the dependency it upgrades.
//   chore/upgrade-<sanitized-dep>-to-<version>  ->  { dep, version }
//   chore/upgrade-<sanitized-dep>-monorepo      ->  { dep, version: "monorepo" }
//
// The second form is a grouped, monorepo-wide bump (the same dep updated in
// more than one workspace package.json in a single PR) — there's no single
// "-to-<version>" since each package can land on a different resolved
// version; the branch just names the dep. Step lookup below only needs the
// dep name, so a placeholder version is fine.
//
// Renovate sanitizes the dep name for the branch (@ and / become -), so
// "@apollo/client" -> "apollo-client". We can't perfectly un-sanitize a scoped
// name, so we return the sanitized token; step lookup compares against it.
//
// Usage: node resolve-target.mjs "chore/upgrade-react-to-18.3.1"
//        -> prints:  react 18.3.1
//        node resolve-target.mjs "chore/upgrade-lodash-monorepo"
//        -> prints:  lodash monorepo

const branch = process.argv[2] || '';
const m = branch.match(
  /^chore\/upgrade-(.+)-(?:to-([0-9][^-]*(?:-[0-9A-Za-z.]+)?)|(monorepo))$/,
);

if (!m) {
  console.error(`Not a Renovate upgrade branch: "${branch}"`);
  process.exit(2);
}

const [, dep, version, monorepo] = m;
// Machine-readable on stdout: "<dep> <version>"
console.log(`${dep} ${version ?? monorepo}`);
