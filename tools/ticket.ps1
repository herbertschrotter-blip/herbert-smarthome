<#
  ticket.ps1 – Diagnose-Tickets HT-NNNN lesen und ändern (Bauplan F.2, DX-069). Dünne Hülle um den HA-Dienst
  shell_command.heidi_ticket (einziger Schreibweg der Tickets; die Karte benutzt denselben). Token/URL wie ha.ps1.

  Beispiele:
    .\tools\ticket.ps1 liste                      offene Tickets
    .\tools\ticket.ps1 liste alle                 alle (auch gelöste, verworfene)
    .\tools\ticket.ps1 zeige HT-0001              Ticket als Text mit den gesicherten Beweisen (für Claude Code)
    .\tools\ticket.ps1 status HT-0001 angenommen -Dx DX-071
    .\tools\ticket.ps1 status HT-0001 in_arbeit
    .\tools\ticket.ps1 status HT-0001 geloest -Commit abc1234 -Version 2.0.0-alpha.34
    .\tools\ticket.ps1 status HT-0001 geschlossen          (erst nach Herberts Prüfung)
    .\tools\ticket.ps1 notiz HT-0001 "tritt nur nach App-Start auf"
    .\tools\ticket.ps1 verwerfen HT-0002 "kein Fehler: Test-Ereignis"
    .\tools\ticket.ps1 auswertung                 Auswertung sofort laufen lassen (sonst alle 10 min)
#>
param(
  [Parameter(Mandatory=$true, Position=0)][ValidateSet('liste','zeige','status','notiz','verwerfen','auswertung')] [string]$Befehl,
  [Parameter(Position=1)] [string]$Arg1 = '',
  [Parameter(Position=2)] [string]$Arg2 = '',
  [string]$Dx = '', [string]$Commit = '', [string]$Version = '', [string]$Wer = 'Claude Code'
)
$ha = Join-Path $PSScriptRoot 'ha.ps1'
function Invoke-Dienst([string]$dienst, $obj) {
  $body = '{}'
  if ($obj) { $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Compress))); $body = (@{ args = $b64 } | ConvertTo-Json -Compress) }
  $r = & $ha post "services/shell_command/$dienst`?return_response" $body | ConvertFrom-Json
  if ($r.service_response.returncode -ne 0) { Write-Error "Dienst $dienst meldet Fehler: $($r.service_response.stderr)"; exit 1 }
  $r.service_response.stdout | ConvertFrom-Json
}
switch ($Befehl) {
  'auswertung' { $a = Invoke-Dienst 'heidi_diag_auswertung' $null; "Funde heute: $($a.funde) · neue Tickets: $($a.tickets.neu -join ', ') · wieder aufgetreten: $($a.tickets.wieder -join ', ') · Zähler neu/in Arbeit/gelöst: $($a.zaehler.neu)/$($a.zaehler.in_arbeit)/$($a.zaehler.geloest)"; return }
  'liste' {
    $r = Invoke-Dienst 'heidi_ticket' @{ cmd = 'liste'; welche = $(if ($Arg1 -eq 'alle') { 'alle' } else { 'offen' }) }
    foreach ($t in $r.tickets) { '{0}  {1,-11} {2,4}x  {3,-7} {4}{5}' -f $t.nr, $t.status, $t.anzahl, $(if ($t.regel) { $t.regel } else { 'Meldung' }), $t.titel, $(if ($t.dx) { "  [$($t.dx)]" } else { '' }) }
    "`n$($r.tickets.Count) Tickets · neu $($r.zaehler.neu) · in Arbeit $($r.zaehler.in_arbeit) · gelöst $($r.zaehler.geloest)"; return
  }
  'zeige' { $r = Invoke-Dienst 'heidi_ticket' @{ cmd = 'text'; nr = $Arg1 } }
  'status' { $r = Invoke-Dienst 'heidi_ticket' @{ cmd = 'status'; nr = $Arg1; status = $Arg2; dx = $Dx; commit = $Commit; version = $Version; wer = $Wer } }
  'notiz' { $r = Invoke-Dienst 'heidi_ticket' @{ cmd = 'notiz'; nr = $Arg1; text = $Arg2; wer = $Wer } }
  'verwerfen' { $r = Invoke-Dienst 'heidi_ticket' @{ cmd = 'verwerfen'; nr = $Arg1; grund = $Arg2; wer = $Wer } }
}
if (-not $r.ok) { Write-Error $r.fehler; exit 1 }
if ($Befehl -eq 'zeige') { $r.text } else { "$($r.ticket.nr): Status $($r.ticket.status)$(if ($r.ticket.dx) { " · $($r.ticket.dx)" })$(if ($r.ticket.commit) { " · Commit $($r.ticket.commit)" })" }
