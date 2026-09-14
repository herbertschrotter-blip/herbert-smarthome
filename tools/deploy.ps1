<#
  deploy.ps1 – kopiert die HA-Dateien aus ha\ nach H:\ (Samba-Freigabe = /config auf dem Pi).
  UTF-8 ohne BOM. Bei heidi-panel.js wird die Ressourcen-Version in .storage/lovelace_resources
  auf HP_VERSION aus der JS-Datei gesetzt (Cache-Bust). Danach: HA neu starten, Browser Strg+F5.

  Aufruf im Repo-Wurzelordner:  .\tools\deploy.ps1            (alles)
                                .\tools\deploy.ps1 -OnlyCard  (nur die Karte)
#>
param([switch]$OnlyCard, [string]$Target = 'H:\')
$root = Split-Path $PSScriptRoot -Parent
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Copy-Utf8($src, $dst) {
  $dir = Split-Path $dst -Parent; if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir | Out-Null }
  [IO.File]::WriteAllText($dst, [IO.File]::ReadAllText($src, $utf8), $utf8); Write-Host "→ $dst"
}
$files = if ($OnlyCard) { @('www\heidi-panel.js') } else {
  @('configuration.yaml','automations.yaml','scripts.yaml','packages\heidi.yaml','dashboards\heidi.yaml','themes\heidi.yaml','www\heidi-panel.js','prognose\presence.py','prognose\runlog.py') }
foreach ($f in $files) { Copy-Utf8 (Join-Path $root "ha\$f") (Join-Path $Target $f) }
# Ressourcen-Version anpassen
$js = [IO.File]::ReadAllText((Join-Path $root 'ha\www\heidi-panel.js'), $utf8)
if ($js -match 'HP_VERSION = "([^"]+)"') {
  $v = $Matches[1]; $res = Join-Path $Target '.storage\lovelace_resources'
  $txt = [IO.File]::ReadAllText($res, $utf8)
  $new = [regex]::Replace($txt, 'heidi-panel\.js\?v=[0-9.]+', "heidi-panel.js?v=$v")
  if ($new -ne $txt) { [IO.File]::WriteAllText($res, $new, $utf8); Write-Host "Ressource auf ?v=$v gesetzt" } else { Write-Host "Ressource bereits auf ?v=$v" }
}
Write-Host "Fertig. Jetzt: Konfiguration prüfen (.\tools\ha.ps1 post config/core/check_config), HA neu starten, Strg+F5."
