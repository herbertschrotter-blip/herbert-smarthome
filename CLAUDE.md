# Herbert SmartHOME

Antworte auf Deutsch. Herbert ist Home-Assistant-Einsteiger: Schritte kurz, konkret, keine
Fachbegriffe ohne Erklärung. Große Umbauten zuerst als Mockup zeigen, dann umsetzen.

**Beim Start zuerst `docs/HANDOFF.md` lesen** – dort steht der Stand aus den bisherigen
Cowork-Sitzungen (was gebaut wurde, warum, bekannte Stolpersteine, offene Punkte).

## Umgebung
- Home Assistant OS 2026.7 auf Raspberry Pi 5, `http://192.168.170.60:8123` (feste IP, FRITZ!Box).
- Der HA-Config-Ordner (`/config` auf dem Pi) ist auf diesem PC als Laufwerk **`H:\`** eingebunden
  (Samba). Alle HA-Dateien dort direkt lesen; Änderungen aber im Repo (`ha/`) machen und mit
  `.\tools\deploy.ps1` nach `H:\` kopieren (UTF-8 ohne BOM).
- **REST-API**: Token in der Benutzer-Umgebungsvariable `HA_TOKEN`, URL in `HA_URL`.
  Nur über `.\tools\ha.ps1 get|post <pfad> [json]` aufrufen. Den Token nie ausgeben, nie in
  Dateien oder Commits schreiben. `Invoke-WebRequest` hängt gelegentlich – ha.ps1 nutzt WebClient.
- Nach Änderungen an `packages/`, `automations.yaml`, `scripts.yaml`: Konfiguration prüfen
  (`.\tools\ha.ps1 post config/core/check_config`), dann HA neu starten
  (`.\tools\ha.ps1 post services/homeassistant/restart`). Dashboard danach mit Strg+F5 laden.
- Nie ins Repo: `H:\.storage\`, `secrets.yaml`, Datenbanken, `prognose/presence_log.csv`.

## Repo-Aufbau
- `ha/` – Spiegel der relevanten HA-Dateien (Quelle der Wahrheit; `H:\` ist das Ziel).
- `heidi/` – Saugroboter Heidi: eigene `CLAUDE.md` mit Details, Tests, Mockups.
- `tools/ha.ps1` (API), `tools/deploy.ps1` (Kopieren nach H:\ + Kartenversion hochzählen),
  `tools/ha-ws.js` (WebSocket-API für Personen/Entitäts-Register; JSON-Argumente über Git Bash).
- Entitäts-IDs mit Umlaut im Namen: HA macht ö→o, ü→u (`heidi_nicht_storen`, nicht `_stoeren`).
  Vor dem Referenzieren die echte ID per `ha.ps1 get states/<id>` prüfen.
- `docs/HANDOFF.md` – Übergabe aus dem Cowork-Chat, offene Punkte als Checkliste pflegen.

## Personen / Anwesenheit
`person.herbert_schrotter` (Companion-App GPS + WLAN), `person.nicole_2`, `person.nina_2`
(WLAN über FRITZ!Box-Integration; „abwesend“ nach ~3 min consider_home). Nicht in YAML anlegen –
Personen werden in der HA-Oberfläche verwaltet.

## HACS
Installiert: dreame-vacuum (Tasshack, 2.0.0b25, Beta nötig), dreame-vacuum-map-card,
xiaomi-vacuum-map-card. Nicht mehr benötigt (können weg): Mushroom, card-mod, expander-card,
stack-in-card.
