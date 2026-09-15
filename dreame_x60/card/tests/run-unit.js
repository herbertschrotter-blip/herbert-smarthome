// `npm run test:unit [-- name ...]`: node --test über tsx für tests/unit/*.test.ts; mit Namen nur passende Dateien.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'unit');
const filter = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const all = fs.readdirSync(DIR).filter((f) => f.endsWith('.test.ts')).sort();
const files = filter.length ? all.filter((f) => filter.some((x) => f.startsWith(x))) : all;
if (!files.length) { console.error('keine Unit-Tests gefunden für', filter); process.exit(2); }
const r = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files.map((f) => path.join(DIR, f))], { stdio: 'inherit' });
process.exit(r.status ?? 1);
