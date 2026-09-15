<#
  dump-states.ps1 – zieht die Heidi-relevanten HA-States (JSON) als Testdaten.
  Nutzt HA_TOKEN/HA_URL aus den Benutzer-Umgebungsvariablen (über ha.ps1).

  Aufruf im Repo-Wurzelordner:
    .\tools\dump-states.ps1                                   → heidi\tests\real_states.json (v1-Tests)
    .\tools\dump-states.ps1 -Out dreame_x60\card\tests\fixtures\states-docked.json
    .\tools\dump-states.ps1 -Out dreame_x60\card\tests\fixtures\states-cleaning.json   (mitten im Lauf ziehen)

  Enthalten: alle Entitäten mit „heidi“ in der ID, die drei Personen, input_boolean.stuehle_am_boden.
  Entfernt (nie ins Repo): GPS-Daten der Personen (latitude, longitude, gps_accuracy, source, user_id,
  device_trackers, id), Kamera-Tokens in entity_picture. Danach: node dreame_x60\card\tools\check-fixture.js <datei>
#>
param([string]$Out = 'heidi\tests\real_states.json')
$root = Split-Path $PSScriptRoot -Parent
$json = & (Join-Path $PSScriptRoot 'ha.ps1') get states
$arr = $json | ConvertFrom-Json
$keep = @('person.herbert_schrotter', 'person.nicole_2', 'person.nina_2', 'input_boolean.stuehle_am_boden')
$strip = @('latitude', 'longitude', 'gps_accuracy', 'source', 'user_id', 'device_trackers', 'id')
$map = [ordered]@{}
foreach ($s in ($arr | Sort-Object entity_id)) {
  if (-not ($s.entity_id -like '*heidi*' -or $keep -contains $s.entity_id)) { continue }
  $attrs = [ordered]@{}
  foreach ($p in $s.attributes.PSObject.Properties) {
    if ($s.entity_id -like 'person.*' -and $strip -contains $p.Name) { continue }
    $v = $p.Value
    if ($p.Name -eq 'entity_picture' -and $v -is [string] -and $v -match 'token=') { $v = ($v -replace 'token=[^&]+', 'token=ENTFERNT') }
    $attrs[$p.Name] = $v
  }
  $map[$s.entity_id] = [ordered]@{ entity_id = $s.entity_id; state = $s.state; attributes = $attrs; last_changed = $s.last_changed; last_updated = $s.last_updated }
}
$outPath = if ([IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path $root $Out }
$dir = Split-Path $outPath -Parent; if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir -Force | Out-Null }
[IO.File]::WriteAllText($outPath, ($map | ConvertTo-Json -Depth 12 -Compress), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "→ $outPath ($($map.Count) Entitäten, vacuum.heidi = $($map['vacuum.heidi'].state))"
