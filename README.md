# Herbert SmartHOME

Home Assistant (Raspberry Pi 5) – Konfiguration, eigene Lovelace-Karte und Automatik für den
Saugroboter **Heidi** (Dreame X60 Ultra).

- `ha/` – HA-Dateien (Quelle). Mit `.\tools\deploy.ps1` nach `H:\` (= /config) kopieren.
- `heidi/` – Roboter-Projekt: Kontext für Claude Code, Tests (Playwright), Mockups.
- `tools/` – `ha.ps1` (REST-API mit Token aus Umgebungsvariable), `deploy.ps1`, `dump-states.ps1`.

Voraussetzungen auf dem PC: `H:\` = Samba-Freigabe des HA-Config-Ordners, Benutzer-
Umgebungsvariablen `HA_TOKEN` und `HA_URL`, Node.js + `npm i playwright` für die Tests.

## Erstes Setup nach dem Klonen
Die großen Dateien liegen bereits auf dem Pi und werden einmalig von dort übernommen
(oder aus dem ZIP `herbert-smarthome.zip` aus der Cowork-Sitzung):

```powershell
Copy-Item H:\www\heidi-panel.js       ha\www\
Copy-Item H:\packages\heidi.yaml      ha\packages\
Copy-Item H:\automations.yaml         ha\
Copy-Item H:\scripts.yaml             ha\
Copy-Item H:\prognose\presence.py     ha\prognose\
.\tools\dump-states.ps1               # Testdaten
git add . ; git commit -m "HA-Dateien vom Pi übernommen" ; git push
```
