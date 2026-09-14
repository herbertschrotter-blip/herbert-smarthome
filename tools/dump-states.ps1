<#
  dump-states.ps1 – zieht alle HA-States (JSON) und speichert sie als heidi\tests\real_states.json
  (Testdaten für die Playwright-Tests). Nutzt HA_TOKEN/HA_URL aus den Umgebungsvariablen.
#>
$root = Split-Path $PSScriptRoot -Parent
$json = & (Join-Path $PSScriptRoot 'ha.ps1') get states
$arr = $json | ConvertFrom-Json
$map = @{}
foreach ($s in $arr) { $map[$s.entity_id] = @{ state = $s.state; attributes = $s.attributes; last_updated = $s.last_updated } }
$out = Join-Path $root 'heidi\tests\real_states.json'
[IO.File]::WriteAllText($out, ($map | ConvertTo-Json -Depth 12 -Compress), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "→ $out ($($map.Count) Entitäten)"
