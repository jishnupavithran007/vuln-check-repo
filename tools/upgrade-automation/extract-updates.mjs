#!/usr/bin/env node
// Pull the "packageFiles with updates" line out of a Renovate JSON debug log
// and flatten it into the updates.json shape the scorer wants.
//
// Usage: node extract-updates.mjs <renovate-debug-log> > updates.json
import { readFileSync } from 'node:fs';

const log = readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean);

// find the log record whose msg is "packageFiles with updates"
let rec;
for (const line of log) {
  try {
    const o = JSON.parse(line);
    if (o.msg === 'packageFiles with updates') { rec = o; break; }
  } catch { /* non-JSON banner line, skip */ }
}
if (!rec) { console.error('no packageFiles record found'); process.exit(1); }

// the payload key varies by version; grab the block that looks like
// { npm: [ {deps:[...]}, ... ] }
const payload = rec.config || rec.packageFiles || rec.baseBranch || rec;
const managerBlock = payload.npm ? payload : (payload.packageFiles || payload);
const files = managerBlock.npm || [];

const out = [];
for (const f of files) {
  for (const dep of f.deps || []) {
    for (const u of dep.updates || []) {
      out.push({
        depName: dep.depName,
        updateType: u.updateType,
        currentVersion: dep.currentValue ?? dep.currentVersion,
        newVersion: u.newVersion ?? u.newValue,
      });
    }
  }
}

// de-dupe identical (dep, type, newVersion) rows across dep/devDep duplicates
const seen = new Set();
const deduped = out.filter((u) => {
  const k = `${u.depName}|${u.updateType}|${u.newVersion}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

console.log(JSON.stringify(deduped, null, 2));
