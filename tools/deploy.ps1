<#
  deploy.ps1 – kopiert die HA-Dateien aus ha\ nach H:\ (Samba-Freigabe = /config auf dem Pi).
  UTF-8 ohne BOM. Ressourcen-Versionen in .storage/lovelace_resources werden gesetzt (Cache-Bust):
    heidi-panel.js?v=   aus HP_VERSION in ha\www\heidi-panel.js          (v1)
    dreame_x60.js?v=    aus "version" in dreame_x60\card\package.json     (v2, Projekt dreame_x60)
  Danach: HA neu starten, Browser Strg+F5.

  Aufruf im Repo-Wurzelordner:  .\tools\deploy.ps1            (alles)
                                .\tools\deploy.ps1 -OnlyCard  (nur die beiden Karten-Dateien)
#>
param([switch]$OnlyCard, [string]$Target = 'H:\')
$root = Split-Path $PSScriptRoot -Parent
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Copy-Utf8($src, $dst) {
  $dir = Split-Path $dst -Parent; if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir | Out-Null }
  [IO.File]::WriteAllText($dst, [IO.File]::ReadAllText($src, $utf8), $utf8); Write-Host "→ $dst"
}
$files = if ($OnlyCard) { @('www\heidi-panel.js', 'www\dreame_x60.js') } else {
  @('configuration.yaml','automations.yaml','scripts.yaml','packages\heidi.yaml','dashboards\heidi.yaml','dashboards\dreame_x60.yaml','themes\heidi.yaml','www\heidi-panel.js','www\dreame_x60.js','prognose\presence.py','prognose\runlog.py') }
foreach ($f in $files) { $src = Join-Path $root "ha\$f"; if (Test-Path $src) { Copy-Utf8 $src (Join-Path $Target $f) } else { Write-Host "übersprungen (fehlt): ha\$f" } }

# Ressourcen-Versionen anpassen
$res = Join-Path $Target '.storage\lovelace_resources'
$txt = [IO.File]::ReadAllText($res, $utf8); $new = $txt
$js = [IO.File]::ReadAllText((Join-Path $root 'ha\www\heidi-panel.js'), $utf8)
if ($js -match 'HP_VERSION = "([^"]+)"') { $new = [regex]::Replace($new, 'heidi-panel\.js\?v=[0-9.]+', "heidi-panel.js?v=$($Matches[1])"); Write-Host "v1: heidi-panel.js?v=$($Matches[1])" }
$pkg = Join-Path $root 'dreame_x60\card\package.json'
if (Test-Path $pkg) {
  $v2 = (Get-Content $pkg -Raw | ConvertFrom-Json).version
  if ($new -match 'dreame_x60\.js\?v=') { $new = [regex]::Replace($new, 'dreame_x60\.js\?v=[^"]+', "dreame_x60.js?v=$v2"); Write-Host "v2: dreame_x60.js?v=$v2" }
  else { Write-Host "v2: Ressource /local/dreame_x60.js fehlt noch – anlegen mit: node tools\ha-ws.js lovelace/resources/create '{""res_type"":""module"",""url"":""/local/dreame_x60.js?v=$v2""}'" }
}
if ($new -ne $txt) { [IO.File]::WriteAllText($res, $new, $utf8); Write-Host "Ressourcen-Datei aktualisiert" } else { Write-Host "Ressourcen-Datei unverändert" }
Write-Host "Fertig. Jetzt: Konfiguration prüfen (.\tools\ha.ps1 post config/core/check_config), HA neu starten, Strg+F5."
