<#
  check-dreame-patch.ps1 – prüft die örtlichen Korrekturen an der Dreame-Integration auf dem Pi (H:\custom_components).
  Ein Update der Integration über HACS überschreibt sie. Nach jedem Update ausführen:  .\tools\check-dreame-patch.ps1
  Exit-Code 0 = alles da (oder vom Entwickler selbst behoben), 1 = Korrektur fehlt und der Fehler ist noch im Code.

  HT-0001 / DX-070 (18.09.2026): types.py, Segment.__init__ – "self.area = None" als Startwert. Ohne ihn bricht das
  Neuzeichnen des Kartenbilds ab, sobald es einen Raum ohne Koordinaten gibt (versteckter Raum 8): Segment.__eq__ liest
  self.area, das nur mit Koordinaten gesetzt wird. Fehlerbericht: docs/dreame_x60/upstream/HT-0001-segment-area.md
#>
param([string]$Root = 'H:\custom_components\dreame_vacuum')
$types = Join-Path $Root 'dreame\types.py'
if (-not (Test-Path $types)) { Write-Error "Integration nicht gefunden: $types"; exit 1 }
$version = (Get-Content (Join-Path $Root 'manifest.json') -Raw | ConvertFrom-Json).version
$t = [IO.File]::ReadAllText($types)
$i = $t.IndexOf('class Segment(Zone):'); $j = $t.IndexOf('def mop_pad_humidity', [Math]::Max($i, 0))
if ($i -lt 0 -or $j -lt 0) { Write-Error "Klasse Segment in types.py nicht gefunden (Integration $version) – bitte von Hand prüfen."; exit 1 }
$init = $t.Substring($i, $j - $i)
# Startwert vorhanden = irgendeine Zuweisung an self.area, die nicht unter dem "if x1 != None …" steht
$startwert = [regex]::IsMatch($init, '(?m)^ {8}self\.area\s*=')
$unsere = $init.Contains('# HT-0001')
if ($startwert) {
  "HT-0001: Korrektur vorhanden ($(if ($unsere) { 'unsere Zeile' } else { 'vom Entwickler behoben – örtliche Korrektur nicht mehr nötig' })) · Integration $version"
  exit 0
}
"HT-0001: Korrektur FEHLT · Integration $version – self.area wird nur mit Koordinaten gesetzt, das Kartenbild bleibt bei einem versteckten Raum wieder stehen."
"  Beheben: in $types in Segment.__init__ vor 'if x1 != None and x0 != None …' die Zeile '        self.area = None  # HT-0001' einfügen, dann HA neu starten."
exit 1
