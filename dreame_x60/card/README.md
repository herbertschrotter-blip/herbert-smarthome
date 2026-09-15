# dreame_x60 – Karte (v2)

Neubau der Heidi-Karte als Lit-3-Element `dreame-x60-panel`, TypeScript strict, esbuild.
Bauplan und Regeln: `docs/dreame_x60/BAUPLAN.md` (Statusliste dort ist die Wahrheit).

- `npm ci` – Abhängigkeiten. `npm run build` – Bundle nach `ha/www/dreame_x60.js` (`--watch` mit `npm run watch`).
- `npm run check` – TypeScript, `npm run lint` – ESLint, `npm run test:unit` – `node --test` über tsx,
  `npm run test:e2e` – Playwright gegen `tests/fixtures/states-*.json`, `npm test` – alles.
- Version steht in `package.json` und landet als `HP_VERSION` im Bundle; `tools/deploy.ps1` setzt `?v=`.
- Fixtures: `..\..\tools\dump-states.ps1 -Out dreame_x60\card\tests\fixtures\states-docked.json`,
  danach `node tools/check-fixture.js tests/fixtures/states-docked.json` (Entitäts-Vertrag, Abschnitt 4).
- v1 (`heidi/archiv/heidi-panel.js`, Tests in `heidi/tests`) ist seit 15.09.2026 abgeschaltet und dient nur noch als Referenz (Paritätsvektoren, Verhalten).
