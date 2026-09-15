// check-fixture.js – prüft einen Zustandsabzug (tools/dump-states.ps1) gegen den Entitäts-Vertrag (src/ha/contract.ts).
// Meldet fehlende IDs (Vertrag gebrochen), IDs im Zustand unavailable/unknown (vorübergehend) und GPS/Token-Reste.
// Exit-Code 1 bei fehlender ID oder Geheimnis. Aufruf: npm run check-fixture -- tests/fixtures/states-docked.json
// (läuft über tsx, weil der Vertrag TypeScript ist)
import fs from 'node:fs';
import { allContractIds } from '../src/ha/contract.ts';

const file = process.argv[2];
if (!file) { console.error('Aufruf: npm run check-fixture -- <states.json>'); process.exit(2); }
const ids = allContractIds();
const states = JSON.parse(fs.readFileSync(file, 'utf8'));
const missing = ids.filter((id) => !states[id]);
const unavailable = ids.filter((id) => states[id] && ['unavailable', 'unknown'].includes(states[id].state));
const extra = Object.keys(states).filter((id) => !ids.includes(id));
const leaks = Object.entries(states).filter(([, s]) => s.attributes && ('latitude' in s.attributes || 'longitude' in s.attributes || /token=(?!ENTFERNT)/.test(String(s.attributes.entity_picture || '')))).map(([id]) => id);

console.log(`${file}: ${Object.keys(states).length} Entitäten, Vertrag ${ids.length} IDs, vacuum.heidi = ${states['vacuum.heidi']?.state ?? '–'}`);
console.log(`  fehlend (Vertrag gebrochen): ${missing.length}${missing.length ? '\n    ' + missing.join('\n    ') : ''}`);
console.log(`  unavailable/unknown (vorübergehend): ${unavailable.length}${unavailable.length ? '\n    ' + unavailable.join('\n    ') : ''}`);
console.log(`  zusätzlich im Abzug (nicht im Vertrag): ${extra.length}`);
if (leaks.length) console.log(`  ACHTUNG Geheimnisse/GPS in: ${leaks.join(', ')}`);
if (missing.length || leaks.length) process.exitCode = 1;
