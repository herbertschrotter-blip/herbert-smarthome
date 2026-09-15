// `npm run test:e2e [-- name ...]`: führt tests/e2e/*.js (außer harness/run) nacheinander aus; Exit-Code 1, sobald einer rot ist.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const filter = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const all = fs.readdirSync(HERE).filter((f) => f.endsWith('.js') && !['harness.js', 'run.js'].includes(f)).sort();
const tests = filter.length ? all.filter((f) => filter.some((x) => f.startsWith(x))) : all;
if (!tests.length) { console.error('keine E2E-Tests gefunden für', filter); process.exit(2); }
let red = 0;
for (const t of tests) {
  const r = spawnSync(process.execPath, [path.join(HERE, t)], { stdio: 'inherit' });
  if (r.status !== 0) red++;
}
console.log(red ? `\n${red} von ${tests.length} E2E-Tests rot` : `\nalle ${tests.length} E2E-Tests grün`);
process.exit(red ? 1 : 0);
