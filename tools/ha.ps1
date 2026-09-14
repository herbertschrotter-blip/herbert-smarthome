<#
  ha.ps1 – kleine Hilfe für die Home-Assistant-REST-API.
  Token/URL kommen aus den Benutzer-Umgebungsvariablen HA_TOKEN / HA_URL (nie ausgeben!).

  Beispiele:
    .\tools\ha.ps1 get  states/vacuum.heidi
    .\tools\ha.ps1 get  states/sensor.heidi_prognose
    .\tools\ha.ps1 post services/homeassistant/update_entity '{"entity_id":"sensor.heidi_prognose"}'
    .\tools\ha.ps1 post config/core/check_config
    .\tools\ha.ps1 post services/homeassistant/restart
#>
param(
  [Parameter(Mandatory=$true)][ValidateSet('get','post')] [string]$Method,
  [Parameter(Mandatory=$true)] [string]$Path,
  [string]$Body = '{}'
)
$tok = [Environment]::GetEnvironmentVariable('HA_TOKEN','User'); if (-not $tok) { $tok = $env:HA_TOKEN }
$url = [Environment]::GetEnvironmentVariable('HA_URL','User');   if (-not $url) { $url = $env:HA_URL }
if (-not $url) { $url = 'http://192.168.170.60:8123' }
if (-not $tok) { Write-Error 'HA_TOKEN fehlt (Benutzer-Umgebungsvariable).'; exit 1 }
$wc = New-Object System.Net.WebClient
$wc.Encoding = [Text.Encoding]::UTF8
$wc.Headers.Add('Authorization', "Bearer $tok")
$wc.Headers.Add('Content-Type', 'application/json')
$full = "$($url.TrimEnd('/'))/api/$($Path.TrimStart('/'))"
try {
  if ($Method -eq 'get') { $wc.DownloadString($full) } else { $wc.UploadString($full, $Body) }
} catch { Write-Error $_.Exception.Message; exit 1 }
