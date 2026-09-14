# Herbert SmartHOME

Home Assistant (Raspberry Pi 5) – Konfiguration, eigene Lovelace-Karte und Automatik für den
Saugroboter **Heidi** (Dreame X60 Ultra).

- `ha/` – HA-Dateien (Quelle). Mit `.\tools\deploy.ps1` nach `H:\` (= /config) kopieren.
- `heidi/` – Roboter-Projekt: Kontext für Claude Code, Tests (Playwright), Mockups.
- `tools/` – `ha.ps1` (REST-API mit Token aus Umgebungsvariable), `deploy.ps1`,
  `ha-ws.js` (WebSocket-API, z. B. `node tools/ha-ws.js person/list`).

Voraussetzungen auf dem PC: `H:\` = Samba-Freigabe des HA-Config-Ordners, Benutzer-
Umgebungsvariablen `HA_TOKEN` und `HA_URL`, Node.js ≥ 22. Tests: in `heidi/tests`
`npm i` und `npx playwright install chromium`, dann `npm test`.
