# Entitäten der Dreame-Integration (Heidi, X60)

Stand 2026-09-15, aus dem Entitäts-Register (239 Entitäten, Integration dreame-vacuum 2.0.0b25). Kategorien sind ein Vorschlag zur Einordnung (Herbert + Claude, 15.09.).

**Durchgang Herbert (der Reihe nach, seit 17.09.):** 1. `button.heidi_clear_warning` ✔ gebaut (PD-015), 2. `sensor.heidi_cleaning_progress` ✔ gebaut (PD-016); 3. `sensor.heidi_mapping_time` ✘ nicht integrieren (19.09.); 4. `sensor.heidi_relocation_status` ✔ gebaut (PD-020, alpha.40); 5. `sensor.heidi_state` → Post-2.0 (19.09.); 6. `sensor.heidi_stream_status` → Post-2.0 (19.09.); 7. `sensor.heidi_task_type` → Post-2.0 Diagnose (19.09.); 8. `switch.heidi_resume_cleaning` → vorgemerkt für Modul E (19.09.). **Gruppe „Zustand und Lauf“ ist durch; stehen geblieben vor der Gruppe „Akku und Laden“** (9. `binary_sensor.heidi_charging_state`). Stand und Ablauf: Bauplan Abschnitt 10 (18.09., 19.09.).

Spalten: **Art** = HA-Entitätstyp (Staubsauger, Sensor, Ja/Nein-Sensor, Schalter, Auswahl, Zahl, Knopf, Uhrzeit, Kamera). **Kurzbeschreibung** = was die Entität zeigt oder schaltet (ergänzt 17.09.2026 aus der Integration und der Dreame-App; Wirkung am Gerät nicht einzeln geprüft). **Kat.** = HA-Kategorie der Integration (config = Einstellung, diagnostic = Diagnose). **aus** = im Register deaktiviert. **Integriert (alpha.28)** = wo die Karte v2 die Entität heute zeigt oder schaltet (Stand 2.0.0-alpha.28, 17.09.2026, aus `selectors.ts`/`api.ts`/Bausteinen abgeleitet); „Sicht … vorhanden; … offen“ = Selektor gebaut, Baustein fehlt noch (Modul in Bauplan Abschnitt 1a); „Im Vertrag, noch ohne Sicht“ = nur in `contract.ts`; „–“ = nicht genutzt. Die frühere Spalte „v2“ (im Vertrag) ist am 17.09. entfallen – ob und wo eine Entität genutzt wird, steht in „Integriert“.

## Roboter: Zustand und Lauf (15)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_clear_warning` | Knopf | Clear Warning | Quittiert die anstehende Warnung (nur dann verfügbar; Liste unten „Warnungen und Fehler“) | diagnostic |  | Roboter-Panel (`dx-hero`): ✕ am gelben Hinweis-Chip, `button.press` (PD-015, gebaut 17.09., alpha.30; Mockup `warnung.html`) |
| `sensor.heidi_cleaned_area` | Sensor | Cleaned Area | Gereinigte Fläche des laufenden Laufs in m² |  |  | Roboter-Panel (`dx-hero`) Streifen, Auftrag-Kachel (`dx-auftrag`) |
| `sensor.heidi_cleaning_progress` | Sensor | Cleaning Progress | Fortschritt des laufenden Laufs in % (vom Roboter; nur im Lauf verfügbar, sonst `unavailable`) |  |  | Auftrag-Kachel (`dx-auftrag`): Fortschrittsbalken, Rückfall Raumzählung (PD-016, gebaut 17.09., alpha.31) |
| `sensor.heidi_cleaning_time` | Sensor | Cleaning Time | Dauer des laufenden Laufs in Minuten |  |  | Auftrag-Kachel (`dx-auftrag`) |
| `sensor.heidi_current_room` | Sensor | Current Room | Raum, in dem Heidi gerade ist |  |  | Roboter-Panel (`dx-hero`) Raum-Chip + Streifen, Auftrag-Kachel, Bildunterschrift der Karte |
| `sensor.heidi_error` | Sensor | Error | Aktueller Fehler- oder Warnungscode (`no_error` = alles in Ordnung; 22 Codes sind Warnungen, Liste unten) |  |  | Roboter-Panel (`dx-hero`) Hinweis-Chip: gelb = Warnung, rot = Fehler |
| `sensor.heidi_mapping_time` | Sensor | Mapping Time | Dauer der laufenden Kartenerstellung (nur während einer Schnellkartierung verfügbar, sonst `unavailable`) |  |  | – (Entscheidung Herbert 19.09.: nicht integrieren) |
| `sensor.heidi_relocation_status` | Sensor | Relocation Status | Ortung auf der Karte: `located` (weiß, wo sie ist), `locating` (sucht), `failed` (nicht gefunden), `success` |  |  | Roboter-Panel (`dx-hero`): Arbeitsschritt „Sucht Position …“ im Lauf, gelber Hinweis-Chip „Position unbekannt“ bei `failed` (PD-020, gebaut 19.09., alpha.40) |
| `sensor.heidi_state` | Sensor | State | Feiner Betriebszustand (sweeping, paused, charging_completed …; 71 mögliche Werte), überschneidet sich mit `vacuum.heidi`, Status und Phase |  |  | – (Entscheidung Herbert 19.09.: Post-2.0, möglicher Rückfall für den Statustext) |
| `sensor.heidi_status` | Sensor | Status | Genauer Status (Charging, Sweeping, Washing, Drying …) |  |  | Roboter-Panel (`dx-hero`) Statustext |
| `sensor.heidi_stream_status` | Sensor | Stream Status | Zustand des Kamera-Livestreams aus der Dreame-App (`idle`, `video`, `audio`) |  |  | – (Entscheidung Herbert 19.09.: Post-2.0, Symbol „Kamera aktiv“) |
| `sensor.heidi_task_status` | Sensor | Task Status | Art der laufenden Aufgabe (Saugen, Wischen nach Saugen, Rückkehr …) |  |  | Roboter-Panel (`dx-hero`) Auftragsart im Statustext |
| `sensor.heidi_task_type` | Sensor | Task Type | Wie der Auftrag gestartet wurde: `standard`, `custom` (angepasste Reinigung), `shortcut` (App-Szene), `scheduled` (App-Zeitplan), `smart` (CleanGenius) …; nur im Lauf verfügbar |  |  | – (Entscheidung Herbert 19.09.: nicht ins Panel; Post-2.0 Diagnose: Start-Quelle „extern“ verfeinern) |
| `switch.heidi_resume_cleaning` | Schalter | Resume Cleaning | Unterbrochenen Lauf nach dem Laden fortsetzen (die Dauer-Schätzung setzt „an“ voraus) | config |  | – (Entscheidung Herbert 19.09.: vorgemerkt für die Roboter-Einstellungen, Modul E, Karte 4.7) |
| `vacuum.heidi` | Staubsauger |  Heidi | Der Roboter selbst: Start / Pause / Stopp / Station, Zustand, Akku, Attribute |  |  | Roboter-Panel (`dx-hero`) Zustand + Knöpfe Start / Pause / Stopp / Station / Orten, Auftrag-Kachel, Karte (Räume / Zone / Punkt / Hinfahren / Sperrzonen), Schnellstart, Kopfzeile |

## Akku und Laden (7)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `binary_sensor.heidi_charging_state` | Ja/Nein-Sensor | Charging State | An, solange Heidi lädt |  |  | – (Karte nutzt das Attribut `charging` von `vacuum.heidi`) |
| `select.heidi_battery_charge_level` | Auswahl | Battery Charge Level | Ladegrenze für den Akku (z. B. 80 % zur Schonung) | config |  | – |
| `sensor.heidi_battery_level` | Sensor | Battery Level | Akkustand in % |  |  | Roboter-Panel (`dx-hero`) Akku |
| `sensor.heidi_charging_status` | Sensor | Charging Status | Ladezustand als Text (Charging, Charging completed, Not charging) |  |  | – |
| `switch.heidi_off_peak_charging` | Schalter | Off-Peak Charging | Nur im festgelegten Zeitfenster laden (günstiger Strom) | config |  | – |
| `time.heidi_off_peak_charging_end` | Uhrzeit | Off-Peak Charging End | Ende des Ladefensters | config |  | – |
| `time.heidi_off_peak_charging_start` | Uhrzeit | Off-Peak Charging Start | Beginn des Ladefensters | config |  | – |

## Karte (10)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_backup_saved_map` | Knopf | Backup Saved Map | Sichert die gespeicherte Karte | diagnostic |  | – |
| `button.heidi_start_fast_mapping` | Knopf | Start Fast Mapping | Schnelle Kartenerstellung ohne Reinigung | config |  | – |
| `button.heidi_start_mapping` | Knopf | Start Mapping | Kartenerstellung mit Reinigung | config | aus | – |
| `camera.heidi_map` | Kamera | Current Map | Aktuelles Kartenbild mit Räumen, Sperrzonen, Position, Pfad (Attribute `rooms`, `calibration_points`) |  |  | Karte auf Übersicht und Seite Reinigen (`dx-map-card`), Heidi-Karte (Bild), Räume + Umrisse für Schnellstart und Geräteprofil |
| `camera.heidi_map_1` | Kamera | Saved Map 1 | Bild der gespeicherten Karte 1 | config |  | – |
| `camera.heidi_map_data` | Kamera | Current Map Data | Kartenpaket als Daten (Raumflächen für die Heidi-Karte); seit 4.3b aktiviert | config | aus | Heidi-Karte (`dx-heidi-map`, Raumflächen), Einrichtungsprüfung |
| `camera.heidi_wifi_map_1` | Kamera | Saved Wifi Map 1 | WLAN-Stärke als Karte für Karte 1 | config | aus | – |
| `select.heidi_map_rotation` | Auswahl | Map Rotation | Drehung des Kartenbilds (0 / 90 / 180 / 270°) | config |  | Sicht Einstellungen vorhanden; Seite Einstellungen offen (4.11, Modul E) |
| `select.heidi_selected_map` | Auswahl | Selected Map | Aktive gespeicherte Karte (bei mehreren Etagen) |  |  | Kartenwahl auf der Seite Reinigen (`dx-map-card`) |
| `switch.heidi_multi_floor_map` | Schalter | Multi Floor Map | Mehrere Karten (Etagen) speichern | config |  | – |

## Reinigung: globale Einstellungen (27)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_wetness_level` | Zahl | Wetness Level | Nässegrad des Mopps als Zahl (feiner als die Wassermenge) |  |  | – |
| `select.heidi_carpet_cleaning` | Auswahl | Carpet Cleaning | Verhalten auf Teppich (meiden, Mopp anheben, überfahren …) | config |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_cleangenius` | Auswahl | CleanGenius | CleanGenius-Automatik: Roboter wählt Saugstufe und Nässe selbst |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_cleangenius_mode` | Auswahl | CleanGenius Mode | Betriebsart der CleanGenius-Automatik |  |  | – |
| `select.heidi_cleaning_mode` | Auswahl | Cleaning Mode | Reinigungsart für den nächsten Lauf (Saugen, Wischen, Saugen + Wischen, Wischen nach Saugen) |  |  | Optionsliste für das Geräteprofil (Rückfall, wenn die Raum-Selects fehlen); Einrichtungsprüfung |
| `select.heidi_cleaning_route` | Auswahl | Cleaning Route | Fahrweg (Standard, Intensiv, Tief, Schnell) |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `select.heidi_low_lying_area_frequency` | Auswahl | Low Lying Area Frequency | Wie oft niedrige Bereiche unter Möbeln gereinigt werden | config |  | – |
| `select.heidi_mop_extend_frequency` | Auswahl | Mop Extend Frequency | Wie oft der Mopp an Kanten ausfährt | config |  | – |
| `select.heidi_mop_pad_humidity` | Auswahl | Mop Pad Humidity | Wassermenge / Moppfeuchte (niedrig, mittel, hoch) |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `select.heidi_suction_level` | Auswahl | Suction Level | Saugstufe (leise, Standard, stark, Turbo) |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `switch.heidi_active_suspension_crossing` | Schalter | Active Suspension Crossing | Fahrwerk anheben, um Schwellen zu überwinden | config |  | – |
| `switch.heidi_carpet_boost` | Schalter | Carpet Boost | Auf Teppich automatisch stärker saugen | config |  | – |
| `switch.heidi_clean_carpets_first` | Schalter | Clean Carpets First | Teppiche zuerst saugen, dann den Rest wischen | config |  | – |
| `switch.heidi_customized_cleaning` | Schalter | Customized Cleaning | Angepasste Reinigung: die Werte je Raum gelten (aus → Raum-Selects `unavailable`) |  |  | Raumwerte-Sicht (Rückfall auf Kartendaten, wenn aus), Einrichtungsprüfung (Warnung) |
| `switch.heidi_floor_direction_cleaning` | Schalter | Floor Direction Cleaning | Entlang der Bodenrichtung (Dielen) fahren | config |  | – |
| `switch.heidi_gap_cleaning_extension` | Schalter | Gap Cleaning Extension | Mopp in Fugen und Lücken ausfahren | config |  | – |
| `switch.heidi_hair_compression` | Schalter | Hair Compression | Haare im Staubbehälter verdichten | config |  | – |
| `switch.heidi_intensive_carpet_cleaning` | Schalter | Intensive Carpet Cleaning | Teppiche intensiv (mehrfach) saugen | config |  | – |
| `switch.heidi_large_particles_boost` | Schalter | Large Particles Boost | Mehr Saugkraft bei groben Partikeln | config |  | – |
| `switch.heidi_lift_chassis_on_carpet` | Schalter | Lift Chassis On Carpet | Fahrwerk auf Teppich anheben, damit der Mopp trocken bleibt | config |  | – |
| `switch.heidi_max_suction_power` | Schalter | Max Suction Power | Maximale Saugkraft |  |  | – |
| `switch.heidi_mop_extend` | Schalter | Mop Extend | Ausfahrbarer Mopp an Kanten ein/aus | config |  | – |
| `switch.heidi_mopping_under_furnitures` | Schalter | Mopping Under Furnitures | Unter Möbeln wischen | config |  | – |
| `switch.heidi_mopping_with_detergent` | Schalter | Mopping With Detergent | Reinigungsmittel beim Wischen zugeben | config |  | – |
| `switch.heidi_obstacle_crossing` | Schalter | Synchronized Obstacle Crossing | Schwellen synchron mit beiden Rädern überwinden | config |  | – |
| `switch.heidi_side_brush_carpet_rotate` | Schalter | Side Brush Carpet Rotate | Seitenbürste auf Teppich weiterdrehen | config |  | – |
| `switch.heidi_side_reach` | Schalter | Side Reach | Seitlich ausfahren für Kanten und Ecken | config |  | – |

## Raumwerte (je Raum 1–8) (88)

| Muster | Art | Name | Kurzbeschreibung | Räume | Kat. | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_room_N_wetness_level` | Zahl | Wetness Level | Nässegrad je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  | – |
| `select.heidi_room_N_cleaning_mode` | Auswahl | Cleaning Mode | Reinigungsart je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  | Roboter-Panel (`dx-hero`) Modus + Streifen, Geräteprofil; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_cleaning_route` | Auswahl | Cleaning Route | Fahrweg je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  | Roboter-Panel (`dx-hero`) Streifen (Route-Chip bei „Nur Wischen“); Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_cleaning_times` | Auswahl | Cleaning Times | Wiederholungen je Raum (1–3) | 1, 2, 3, 4, 5, 6, 7, 8 |  | Roboter-Panel (`dx-hero`) Streifen (Wdh-Chip), Geräteprofil; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_floor_material` | Auswahl | Floor Material | Bodenart je Raum (Fliesen, Holz, Teppich …) | 1, 2, 3, 4, 5, 6, 7, 8 | config | – |
| `select.heidi_room_N_floor_material_direction` | Auswahl | Floor Material Direction | Richtung der Dielen / des Bodenmusters | 1, 2, 3, 4, 5, 6, 7, 8 | config | – |
| `select.heidi_room_N_mop_pad_humidity` | Auswahl | Mop Pad Humidity | Wassermenge je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  | Roboter-Panel (`dx-hero`) Wasser + Streifen; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_name` | Auswahl | Room 1 Name | Raumname (Auswahl aus den Raumtypen der App) | 1, 2, 3, 4, 5, 6, 7, 8 | config | Einrichtungsprüfung (Raumtypen-Hinweis, Sprung zur Namens-Entität) |
| `select.heidi_room_N_order` | Auswahl | Order | Reihenfolge des Raums in der App | 1, 2, 3, 4, 5, 6, 7, 8 |  | – (Reihenfolge kommt aus `camera.heidi_map`) |
| `select.heidi_room_N_suction_level` | Auswahl | Suction Level | Saugstufe je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  | Roboter-Panel (`dx-hero`) Saugstufe + Streifen; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_visibility` | Auswahl | Visibility | Raum in der App sichtbar oder ausgeblendet | 1, 2, 3, 4, 5, 6, 7, 8 | config | – (Sichtbarkeit kommt aus `camera.heidi_map`) |

Raum 8 = „Balkon“, in der App ausgeblendet (Bauplan Abschnitt 10). Raumnamen und -reihenfolge kommen aus `camera.heidi_map.rooms`.

## Station: Waschen, Trocknen, Absaugen, Wasser (34)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_base_station_cleaning` | Knopf | Base Station Cleaning | Station reinigen (Waschwanne spülen) | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_base_station_self_repair` | Knopf | Base Station Self Repair | Selbstreparatur der Station (Pumpen und Leitungen spülen) | diagnostic |  | – |
| `button.heidi_empty_water_tank` | Knopf | Empty Water Tank | Wassertank des Roboters leeren | diagnostic |  | – |
| `button.heidi_manual_drying` | Knopf | Manual Drying | Mopp jetzt trocknen |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_self_clean` | Knopf | Self Clean | Mopp-Wäsche jetzt starten |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_start_auto_empty` | Knopf | Start Auto Empty | Staubbehälter jetzt absaugen |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_water_tank_draining` | Knopf | Water Tank Draining | Station entwässern | diagnostic |  | – |
| `number.heidi_self_clean_area` | Zahl | Self Clean Area | Nach wie viel m² der Mopp zwischendurch gewaschen wird |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `number.heidi_self_clean_time` | Zahl | Self Clean Time | Nach wie viel Minuten der Mopp zwischendurch gewaschen wird |  |  | – |
| `select.heidi_auto_empty_mode` | Auswahl | Auto Empty Mode | Häufigkeit des Absaugens (aus, Standard, häufig, selten) |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_drying_time` | Auswahl | Drying Time | Trocknungsdauer (2 / 3 / 4 h) |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_self_clean_frequency` | Auswahl | Self Clean Frequency | Mopp-Wäsche nach Fläche, nach Zeit oder je Raum |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_washing_mode` | Auswahl | Washing Mode | Waschintensität (leicht, Standard, tief) |  |  | – |
| `select.heidi_water_temperature` | Auswahl | Water Temperature | Wassertemperatur der Mopp-Wäsche (kalt, warm, heiß) |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `sensor.heidi_auto_empty_status` | Sensor | Auto Empty Status | Läuft das Absaugen gerade |  |  | Im Vertrag, noch ohne Sicht |
| `sensor.heidi_clean_water_tank_status` | Sensor | Clean Water Tank Status | Frischwassertank: ok, leer oder fehlt | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_detergent_status` | Sensor | Detergent Status | Reinigungsmittel: ok oder leer | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_dirty_water_tank_status` | Sensor | Dirty Water Tank Status | Schmutzwassertank: ok, voll oder fehlt | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_drainage_status` | Sensor | Drainage Status | Entwässerung läuft / fertig |  |  | – |
| `sensor.heidi_drying_left` | Sensor | Drying Left | Restzeit der Trocknung in Minuten |  |  | – |
| `sensor.heidi_drying_progress` | Sensor | Drying Progress | Fortschritt der Trocknung in % |  |  | – |
| `sensor.heidi_dust_bag_status` | Sensor | Dust Bag Status | Staubbeutel: ok, voll oder fehlt | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_dust_collection` | Sensor | Dust Collection | Zustand der Staubabsaugung (aktiv, gesperrt) |  |  | – |
| `sensor.heidi_hot_water_status` | Sensor | Hot Water Status | Heißwasserbereitung der Station | diagnostic |  | – |
| `sensor.heidi_low_water_warning` | Sensor | Low Water Warning | Warnung: Frischwasser knapp oder Tank fehlt |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_mop_pad` | Sensor | Mop Pad | Mopp-Pad eingesetzt oder fehlt |  |  | – |
| `sensor.heidi_self_wash_base_status` | Sensor | Self-Wash Base Status | Zustand der Waschstation (Waschen, Trocknen, Leerlauf) |  |  | Im Vertrag, noch ohne Sicht (Stationszeile im Roboter-Panel nutzt die Attribute `washing` / `drying` von `vacuum.heidi`) |
| `sensor.heidi_station_drainage_status` | Sensor | Station Drainage Status | Entwässerungsanschluss der Station | diagnostic |  | – |
| `switch.heidi_auto_drying` | Schalter | Auto Drying | Nach der Mopp-Wäsche automatisch trocknen |  |  | – |
| `switch.heidi_auto_mount_mop` | Schalter | Auto Mount Mop | Mopp automatisch an- und abkoppeln | config |  | – |
| `switch.heidi_auto_water_refilling` | Schalter | Auto Water Refilling | Wassertank des Roboters automatisch nachfüllen | config |  | – |
| `switch.heidi_mop_washing_with_detergent` | Schalter | Mop Washing With Detergent | Reinigungsmittel bei der Mopp-Wäsche zugeben | config |  | – |
| `switch.heidi_self_clean` | Schalter | Self-Clean | Mopp-Wäsche zwischendurch in der Station erlaubt |  |  | – |
| `switch.heidi_smart_mop_washing` | Schalter | Smart Mop Washing | Waschintensität automatisch nach Verschmutzung | config |  | – |

## Verschleiß und Statistik (22)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_reset_filter` | Knopf | Reset Filter | Filterzähler nach dem Tausch zurücksetzen | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_main_brush` | Knopf | Reset Main Brush | Hauptbürste nach dem Tausch zurücksetzen | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_sensor` | Knopf | Reset Sensor | Sensorreinigung als erledigt setzen | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_side_brush` | Knopf | Reset Side Brush | Seitenbürste nach dem Tausch zurücksetzen | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_wheel` | Knopf | Reset Wheel | Radreinigung als erledigt setzen | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_cleaning_count` | Sensor | Cleaning Count | Anzahl aller Läufe | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_cleaning_history` | Sensor | Cleaning History | Letzte Läufe mit Zeit, Dauer, Fläche, Ergebnis (Attribut; Quelle des Protokolls) | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_cruising_history` | Sensor | Cruising History | Verlauf der Erkundungsfahrten (Kamera-Rundgang) | diagnostic |  | – |
| `sensor.heidi_filter_left` | Sensor | Filter Left | Restlebensdauer Filter in % | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_filter_time_left` | Sensor | Filter Time Left | Restlebensdauer Filter in Stunden | diagnostic |  | – |
| `sensor.heidi_firmware_version` | Sensor | Firmware Version | Firmware-Stand des Roboters | diagnostic |  | – |
| `sensor.heidi_first_cleaning_date` | Sensor | First Cleaning Date | Datum des ersten Laufs | diagnostic |  | Im Vertrag, noch ohne Sicht |
| `sensor.heidi_main_brush_left` | Sensor | Main Brush Left | Restlebensdauer Hauptbürste in % | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_main_brush_time_left` | Sensor | Main Brush  Time Left | Restlebensdauer Hauptbürste in Stunden | diagnostic |  | – |
| `sensor.heidi_sensor_dirty_left` | Sensor | Sensor Dirty Left | Bis zur nächsten Sensorreinigung in % | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_sensor_dirty_time_left` | Sensor | Sensor Dirty Time Left | Bis zur nächsten Sensorreinigung in Stunden | diagnostic |  | – |
| `sensor.heidi_side_brush_left` | Sensor | Side Brush Left | Restlebensdauer Seitenbürste in % | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_side_brush_time_left` | Sensor | Side Brush Time Left | Restlebensdauer Seitenbürste in Stunden | diagnostic |  | – |
| `sensor.heidi_total_cleaned_area` | Sensor | Total Cleaned Area | Gesamtfläche aller Läufe in m² | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_total_cleaning_time` | Sensor | Total Cleaning Time | Gesamtzeit aller Läufe | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_wheel_dirty_left` | Sensor | Wheel Dirty Left | Bis zur nächsten Radreinigung in % | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_wheel_dirty_time_left` | Sensor | Wheel Dirty Time Left | Bis zur nächsten Radreinigung in Stunden | diagnostic |  | – |

## Hinderniserkennung, Kamera, KI (22)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `binary_sensor.heidi_lds_status` | Ja/Nein-Sensor | LDS Status | Laser-Sensor (Lidar) in Betrieb |  |  | – |
| `number.heidi_camera_light_brightness` | Zahl | Camera Light Brightness | Helligkeit des Kameralichts | config |  | – |
| `select.heidi_auto_lds_coverage` | Auswahl | Auto Lds Coverage | Laserturm automatisch einfahren (niedrige Möbel) | config |  | – |
| `switch.heidi_ai_fluid_detection` | Schalter | AI Fluid Detection | Flüssigkeiten per Kamera-KI erkennen und meiden | config |  | – |
| `switch.heidi_ai_furniture_detection` | Schalter | AI Furniture Detection | Möbel erkennen und in die Karte eintragen | config |  | – |
| `switch.heidi_ai_obstacle_detection` | Schalter | AI Obstacle Detection | Hindernisse per Kamera-KI erkennen | config |  | – |
| `switch.heidi_ai_obstacle_image_upload` | Schalter | AI Obstacle Image Upload | Hindernisbilder in die Dreame-Cloud hochladen | config |  | – |
| `switch.heidi_ai_obstacle_picture` | Schalter | AI Obstacle Picture | Fotos erkannter Hindernisse speichern | config |  | – |
| `switch.heidi_ai_pet_detection` | Schalter | AI Pet Detection | Haustiere und Hinterlassenschaften erkennen und meiden | config |  | – |
| `switch.heidi_camera_light_brightness_auto` | Schalter | Camera Light Brightness Auto | Kameralicht automatisch regeln | config |  | – |
| `switch.heidi_collision_avoidance` | Schalter | Collision Avoidance | Zusammenstöße vermeiden (sanft anfahren) | config |  | – |
| `switch.heidi_dynamic_obstacle_cleaning` | Schalter | Dynamic Obstacle Cleaning | Stellen mit bewegten Hindernissen später nachreinigen | config |  | – |
| `switch.heidi_fill_light` | Schalter | Fill Light | Zusatzlicht bei Dunkelheit | config |  | – |
| `switch.heidi_fuzzy_obstacle_detection` | Schalter | Fuzzy Obstacle Detection | Auch kleine, unscharfe Hindernisse erkennen | config |  | – |
| `switch.heidi_human_follow` | Schalter | Human Follow | Einer Person folgen (Kamera) | config |  | – |
| `switch.heidi_intelligent_recognition` | Schalter | Intelligent Recognition | Intelligente Erkennung von Bodentypen und Teppichen | config |  | – |
| `switch.heidi_lds_state` | Schalter | LDS State | Laser-Sensor ein/aus | diagnostic |  | – |
| `switch.heidi_obstacle_avoidance` | Schalter | Obstacle Avoidance | Hindernissen ausweichen ein/aus | config |  | – |
| `switch.heidi_pet_focused_detection` | Schalter | Pet Focused Detection | Verstärkte Haustier-Erkennung | config |  | – |
| `switch.heidi_pet_picture` | Schalter | Pet Picture | Fotos von Haustieren aufnehmen | config |  | – |
| `switch.heidi_ring_light_always_on` | Schalter | Ring Light Always On | Ringlicht dauerhaft an | config |  | – |
| `switch.heidi_stain_avoidance` | Schalter | Stain Avoidance | Flecken erkennen und umfahren | config |  | – |

## Nicht stören, Töne, Sprache, Sperre (11)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_volume` | Zahl | Volume | Lautstärke der Sprachansagen | config |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_voice_assistant_language` | Auswahl | Voice Assistant Language | Sprache des Sprachassistenten | config |  | – |
| `switch.heidi_child_lock` | Schalter | Child Lock | Tasten am Roboter sperren | config |  | – |
| `switch.heidi_dnd` | Schalter | DnD | Nicht stören ein/aus | config |  | – |
| `switch.heidi_dnd_disable_auto_empty` | Schalter | DnD Disable Auto Empty | Kein Absaugen während Nicht stören | config |  | – |
| `switch.heidi_dnd_disable_resume_cleaning` | Schalter | DnD Disable Resume Cleaning | Kein Fortsetzen während Nicht stören | config |  | – |
| `switch.heidi_dnd_reduce_volume` | Schalter | DnD Reduce Volume | Leisere Ansagen während Nicht stören | config |  | – |
| `switch.heidi_streaming_voice_prompt` | Schalter | Streaming Voice Prompt | Ansage, wenn der Kamerastream startet | config |  | – |
| `switch.heidi_voice_assistant` | Schalter | Voice Assistant | Sprachassistent ein/aus | config |  | – |
| `time.heidi_dnd_end` | Uhrzeit | DnD End | Ende von Nicht stören (aktuell 07:00) | config |  | Kopfzeile „Nicht stören“; Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `time.heidi_dnd_start` | Uhrzeit | DnD Start | Beginn von Nicht stören (aktuell 20:00) | config |  | Kopfzeile „Nicht stören“; Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |

## App-Szenen (3)

| Entität | Art | Name | Kurzbeschreibung | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_reload_shortcuts` | Knopf | Reload Shortcuts | Szenen (Shortcuts) aus der App neu laden | diagnostic |  | – |
| `button.heidi_shortcut_2` | Knopf | Shortcut Bad Saugen/Wischen | App-Szene „Bad Saugen/Wischen“ starten |  |  | Seite Reinigen „App-Szenen“ über das Paket-Skript `heidi_app_szene` (nicht über die Button-Entität) |
| `button.heidi_shortcut_3` | Knopf | Shortcut Wischen Nach Dem Saugen | App-Szene „Wischen nach dem Saugen“ starten |  |  | Seite Reinigen „App-Szenen“ über das Paket-Skript `heidi_app_szene` (nicht über die Button-Entität) |

## Warnungen und Fehler (`sensor.heidi_error`, ausgelesen 17.09.2026)

Die Integration kennt **kein eigenes Warnungs-Attribut**. Warnung und Fehler sind derselbe Fehlersensor
`sensor.heidi_error` (Zustand = Zustandswert unten, Attribute `value` = Nummer, `description`). Eine feste Liste von
**22 Codes** gilt als Warnung (`WARNING_ERROR_CODE` in `custom_components/dreame_vacuum/dreame/types.py`),
die übrigen **120 Codes** sind Fehler. Daraus leitet die Integration ab:

- `vacuum.heidi` Attribut `has_error` = Fehler, der **keine** Warnung ist (bei einer Warnung bleibt `has_error` false).
- `button.heidi_clear_warning` ist nur verfügbar, solange eine Warnung ansteht, außerdem bei „Wasser knapp“
  (`sensor.heidi_low_water_warning`) und „Entwässerung abgeschlossen“. Sonst `unavailable`. Fehler lassen sich nicht quittieren;
  sie verschwinden, wenn die Ursache behoben ist (Roboter neu starten, Hindernis räumen …).
- Bei einer Warnung legt die Integration zusätzlich eine HA-Benachrichtigung „warning“ an (mit Bild vom Roboter, wenn vorhanden);
  Quittieren entfernt sie. Fehler bekommen eine eigene Benachrichtigung je Code.
- Die Karte v2 zeigt den Fehlersensor im Roboter-Panel als Chip: **gelb** bei Warnung (`has_error` false), **rot** bei Fehler;
  deutsche Texte aus `ERR_DE` in `dreame_x60/card/src/config.ts` (v1-Stand). Entscheidung Herbert 17.09.: der gelbe Chip
  bekommt ein ✕ zum Quittieren über `button.heidi_clear_warning` (Modul R, Bauplan Abschnitt 10; Mockup `dreame_x60/mockups/warnung.html`).
- Mehrere Nummern teilen sich einen Zustandswert (z. B. `blocked` = 47 Warnung, 63/64 Fehler; `robot_stuck` = 80/81/90).
  Die Karte unterscheidet Warnung und Fehler daher nur über `has_error`, nicht über den Zustandswert.
- Die Liste gilt für alle Dreame-Modelle der Integration; Rollen-Mopp, Kanten-Mopp, Roboterarm und Aufplusterrolle betreffen den X60 nicht.

Alle Codes (Nummer = Attribut `value`; Bedeutung aus den englischen Texten der Integration übersetzt):

| Nr. | Art | Zustandswert | Bedeutung | Text in der Karte (`ERR_DE`) |
|---|---|---|---|---|
| 0 | – | `no_error` | Kein Fehler | – |
| 1 | Fehler | `drop` | Räder hängen in der Luft – Roboter neu aufsetzen | – (fehlt) |
| 2 | Fehler | `cliff` | Absturzsensor gestört – Sensor abwischen, nicht an der Treppe starten | – (fehlt) |
| 3 | Fehler | `bumper` | Stoßsensor klemmt | – (fehlt) |
| 4 | Fehler | `gesture` | Roboter steht schräg – auf ebene Fläche setzen | – (fehlt) |
| 5 | Fehler | `bumper_repeat` | Stoßsensor klemmt (wiederholt) | – (fehlt) |
| 6 | Fehler | `drop_repeat` | Räder hängen in der Luft (wiederholt) | – (fehlt) |
| 7 | Fehler | `optical_flow` | Optischer Flusssensor gestört – Neustart | – (fehlt) |
| 8 | Fehler | `no_box` | Staubbox nicht eingesetzt | – (fehlt) |
| 9 | **Warnung** | `no_tank_box` | Wassertank nicht eingesetzt | – (fehlt) |
| 10 | **Warnung** | `water_box_empty` | Wassertank leer | – (fehlt) |
| 11 | Fehler | `box_full` | Filter feucht oder verstopft | – (fehlt) |
| 12 | Fehler | `brush` | Hauptbürste verwickelt | – (fehlt) |
| 13 | Fehler | `side_brush` | Seitenbürste verwickelt | – (fehlt) |
| 14 | Fehler | `fan` | Filter feucht oder verstopft (Lüfter) | – (fehlt) |
| 15 | Fehler | `left_wheel_motor` | Roboter steckt fest oder linkes Rad blockiert | – (fehlt) |
| 16 | Fehler | `right_wheel_motor` | Roboter steckt fest oder rechtes Rad blockiert | – (fehlt) |
| 17 | Fehler | `turn_suffocate` | Roboter steckt fest, kann nicht drehen | – (fehlt) |
| 18 | Fehler | `forward_suffocate` | Roboter steckt fest, kann nicht vorwärts | – (fehlt) |
| 19 | Fehler | `charger_get` | Station nicht gefunden – Stromkabel prüfen | – (fehlt) |
| 20 | **Warnung** | `battery_low` | Akku schwach – bitte laden | – (fehlt) |
| 21 | Fehler | `charge_fault` | Ladefehler – Ladekontakte abwischen | – (fehlt) |
| 22 | Fehler | `battery_percentage` | Fehler beim Akkustand | – (fehlt) |
| 23 | Fehler | `heart` | Interner Fehler – Neustart | – (fehlt) |
| 24 | Fehler | `camera_occlusion` | Bildpositionierungs-Sensor verdeckt – reinigen | – (fehlt) |
| 25 | Fehler | `move` | Bewegungssensor gestört – Neustart | – (fehlt) |
| 26 | Fehler | `flow_shielding` | Optischer Sensor verdeckt – abwischen | – (fehlt) |
| 27 | Fehler | `infrared_shielding` | Infrarotsensor verdeckt – Neustart | – (fehlt) |
| 28 | Fehler | `charge_no_electric` | Ladestation ohne Strom | – (fehlt) |
| 29 | Fehler | `battery_fault` | Akkutemperatur außerhalb des Bereichs – warten | – (fehlt) |
| 30 | Fehler | `fan_speed_error` | Lüfterdrehzahl-Sensor gestört | – (fehlt) |
| 31 | Fehler | `left_wheell_speed` | Linkes Rad blockiert | – (fehlt) |
| 32 | Fehler | `right_wheell_speed` | Rechtes Rad blockiert | – (fehlt) |
| 33 | Fehler | `bmi055_acce` | Beschleunigungssensor gestört | – (fehlt) |
| 34 | Fehler | `bmi055_gyro` | Gyroskop gestört | – (fehlt) |
| 35 | Fehler | `xv7001` | Gyroskop gestört | – (fehlt) |
| 36 | Fehler | `left_magnet` | Magnetsensor links gestört | – (fehlt) |
| 37 | Fehler | `right_magnet` | Magnetsensor rechts gestört | – (fehlt) |
| 38 | Fehler | `flow_error` | Flusssensor gestört | – (fehlt) |
| 39 | Fehler | `infrared_fault` | Infrarot gestört | – (fehlt) |
| 40 | Fehler | `camera_fault` | Kamera gestört | – (fehlt) |
| 41 | Fehler | `strong_magnet` | Starkes Magnetfeld – nicht an der virtuellen Wand starten | – (fehlt) |
| 42 | Fehler | `water_pump` | Wasserpumpe gestört | – (fehlt) |
| 43 | Fehler | `rtc` | Uhr (RTC) gestört | – (fehlt) |
| 44 | Fehler | `auto_key_trig` | Interner Fehler | – (fehlt) |
| 45 | Fehler | `p3v3` | Interner Fehler | – (fehlt) |
| 46 | Fehler | `camera_idle` | Interner Fehler | – (fehlt) |
| 47 | **Warnung** | `blocked` | Roboter blockiert oder steckt fest, kehrt zur Station zurück | – (fehlt) |
| 48 | Fehler | `lds_error` | Laser-Abstandssensor gestört – auf Fremdkörper prüfen | – (fehlt) |
| 49 | Fehler | `lds_bumper` | Stoßsensor des Laserturms klemmt | – (fehlt) |
| 50 | Fehler | `water_pump` | Wasserpumpe gestört | – (fehlt) |
| 51 | **Warnung** | `filter_blocked` | Filter feucht oder verstopft | – (fehlt) |
| 54 | Fehler | `edge` | Kantensensor gestört – reinigen | – (fehlt) |
| 55 | Fehler | `carpet` | Teppich beim Wischen erkannt – Roboter versetzen | – (fehlt) |
| 56 | **Warnung** | `laser` | 3D-Hindernissensor gestört – reinigen | – (fehlt) |
| 57 | Fehler | `edge` | Kantensensor gestört – reinigen | – (fehlt) |
| 58 | Fehler | `ultrasonic` | Ultraschallsensor gestört – Neustart | – (fehlt) |
| 59 | Fehler | `no_go_zone` | Sperrzone oder virtuelle Wand erkannt – Roboter wegsetzen | – (fehlt) |
| 61 | Fehler | `route` | Zielbereich nicht erreichbar – Türen öffnen, Hindernisse räumen | – (fehlt) |
| 62 | Fehler | `route` | Zielbereich nicht erreichbar – Sperrzone im Weg | – (fehlt) |
| 63 | Fehler | `blocked` | Reinigungsweg blockiert – Türen, Hindernisse | – (fehlt) |
| 64 | Fehler | `blocked` | Reinigungsweg blockiert – Sperrzone | – (fehlt) |
| 65 | Fehler | `restricted` | Roboter steht in einer Sperrzone | – (fehlt) |
| 66 | Fehler | `restricted` | Roboter steht in einer Sperrzone | – (fehlt) |
| 67 | Fehler | `restricted` | Roboter steht in einer Sperrzone | – (fehlt) |
| 68 | **Warnung** | `remove_mop` | Wischen fertig – Mopp abnehmen und reinigen | – (fehlt) |
| 69 | Fehler | `mop_removed` | Mopp-Pad während der Reinigung abgefallen | – (fehlt) |
| 70 | **Warnung** | `mop_removed` | Mopp-Pad abgefallen – vor dem Weiterfahren anbringen | – (fehlt) |
| 71 | **Warnung** | `mop_pad_stop_rotate` | Mopp-Pad dreht sich nicht | „Mopp blockiert“ |
| 72 | **Warnung** | `mop_pad_stop_rotate` | Mopp-Pad dreht sich nicht | „Mopp blockiert“ |
| 74 | Fehler | `mop_install_failed` | Mopp-Pad automatisch anbringen fehlgeschlagen – von Hand anbringen | – (fehlt) |
| 75 | **Warnung** | `low_battery_turn_off` | Akku leer – Roboter schaltet gleich ab | – (fehlt) |
| 76 | Fehler | `dirty_tank_not_installed` | Schmutzwassertank im Roboter fehlt | – (fehlt) |
| 78 | Fehler | `robot_in_hidden_room` | Roboter steht in einem ausgeblendeten Bereich | – (fehlt) |
| 79 | Fehler | `lds_failed_to_lift` | Laserturm lässt sich nicht anheben | – (fehlt) |
| 80 | Fehler | `robot_stuck` | Positionierung nicht möglich – Roboter in offenen Bereich setzen | – (fehlt) |
| 81 | Fehler | `robot_stuck` | Positionierung nicht möglich (wiederholt) | – (fehlt) |
| 82 | **Warnung** | `slippery_floor` | Rutschiger Boden – später erneut versuchen | – (fehlt) |
| 84 | Fehler | `unknown` | Unbekannter Fehler | – (fehlt) |
| 85 | **Warnung** | `check_mop_install` | Mopp-Halterung prüfen | – (fehlt) |
| 86 | Fehler | `dirty_water_tank_full` | Schmutzwassertank im Roboter zu schmutzig – leeren und reinigen | „Abwasser voll“ |
| 88 | Fehler | `retractable_leg_stuck` | Ausfahrbare Beine verwickelt | – (fehlt) |
| 89 | Fehler | `internal_error` | Interner Fehler – Neustart | – (fehlt) |
| 90 | Fehler | `robot_stuck` | Roboter steckt fest – Umgebung freiräumen | – (fehlt) |
| 91 | Fehler | `robot_stuck_on_tables` | Steckt zwischen Tischen und Stühlen fest | – (fehlt) |
| 92 | Fehler | `robot_stuck_on_passage` | Steckt in engem Durchgang fest | – (fehlt) |
| 93 | Fehler | `robot_stuck_on_threshold` | Steckt an Stufe oder Schwelle fest | – (fehlt) |
| 94 | Fehler | `robot_stuck_on_low_lying_area` | Steckt unter niedrigem Möbel fest | – (fehlt) |
| 95 | Fehler | `robot_stuck_on_ramp` | Absturzgefährdete Rampe auf dem Weg erkannt | – (fehlt) |
| 96 | Fehler | `robot_stuck_on_obstacle` | Hindernis auf dem Weg | – (fehlt) |
| 97 | Fehler | `robot_stuck_on_pet` | Person oder Haustier auf dem Weg | – (fehlt) |
| 98 | Fehler | `robot_stuck_on_slippery_surface` | Steckt fest wegen Rutschens – Räder reinigen | – (fehlt) |
| 99 | Fehler | `robot_stuck_on_carpet` | Rutscht auf Teppich | – (fehlt) |
| 101 | Fehler | `bin_full` | Staubbeutel voll oder Luftkanal verstopft | – (fehlt) |
| 102 | Fehler | `bin_open` | Deckel der Absaugstation offen oder Staubbeutel fehlt | – (fehlt) |
| 103 | Fehler | `bin_open` | Deckel der Absaugstation offen oder Staubbeutel fehlt | – (fehlt) |
| 104 | Fehler | `bin_full` | Staubbeutel voll oder Luftkanal verstopft | – (fehlt) |
| 105 | Fehler | `water_tank` | Frischwassertank nicht eingesetzt | – (fehlt) |
| 106 | Fehler | `dirty_water_tank` | Schmutzwassertank voll oder nicht eingesetzt | – (fehlt) |
| 107 | **Warnung** | `water_tank_dry` | Frischwasser knapp – nachfüllen, sonst keine Mopp-Wäsche | – (fehlt) |
| 108 | Fehler | `dirty_water_tank` | Schmutzwassertank voll oder nicht eingesetzt | – (fehlt) |
| 109 | Fehler | `dirty_water_tank_blocked` | Schmutzwassertank verstopft | – (fehlt) |
| 110 | Fehler | `dirty_water_tank_pump` | Pumpe des Schmutzwassertanks gestört | – (fehlt) |
| 111 | Fehler | `mop_pad` | Waschbrett nicht richtig eingesetzt | – (fehlt) |
| 112 | Fehler | `wet_mop_pad` | Wasserstand im Waschbrett abnormal – Waschbrett reinigen | – (fehlt) |
| 114 | **Warnung** | `clean_mop_pad` | Reinigung fertig – Waschbrett des Mopps reinigen | „Mopp reinigen“ |
| 116 | Fehler | `clean_tank_level` | Frischwassertank bald leer – nachfüllen | – (fehlt) |
| 117 | **Warnung** | `station_disconnected` | Station ohne Strom | „Station getrennt“ |
| 118 | Fehler | `dirty_tank_level` | Schmutzwassertank zu voll | – (fehlt) |
| 119 | Fehler | `washboard_level` | Wasserstand im Waschbrett zu hoch – reinigen | – (fehlt) |
| 120 | Fehler | `no_mop_in_station` | Mopp nicht in der Station – einlegen oder am Roboter anbringen | – (fehlt) |
| 121 | **Warnung** | `dust_bag_full` | Staubbeutel voll – wechseln | „Staubbeutel voll“ |
| 122 | **Warnung** | `unknown` | Unbekannte Warnung | – (fehlt) |
| 123 | **Warnung** | `self_test_failed` | Selbsttest fehlgeschlagen – kein Wasser im Wassermodul | – (fehlt) |
| 124 | Fehler | `washboard_not_working` | Waschbrett arbeitet nicht | – (fehlt) |
| 125 | Fehler | `drainage_failed` | Abpumpen des Schmutzwassers gestört – Kundendienst | – (fehlt) |
| 126 | Fehler | `mop_not_detected` | Mopp nicht erkannt | – (fehlt) |
| 127 | Fehler | `mop_holder_error` | Mopp-Halter in der Station falsch | – (fehlt) |
| 128 | Fehler | `dock_error` | Stationsfehler – Klappe und Mopps prüfen | – (fehlt) |
| 129 | **Warnung** | `wash_failed` | Mopp-Wäsche fehlgeschlagen | – (fehlt) |
| 200 | Fehler | `robot_stuck_on_curtain` | Steckt im Vorhang fest | – (fehlt) |
| 201 | Fehler | `edge_mop_stop_rotate` | Kanten-Mopp dreht sich nicht | – (fehlt) |
| 202 | Fehler | `edge_mop_detached` | Kanten-Mopp abgefallen | – (fehlt) |
| 203 | Fehler | `chassis_lift_malfunction` | Fahrwerkshub defekt | – (fehlt) |
| 207 | Fehler | `internal_error` | Interner Fehler | – (fehlt) |
| 209 | Fehler | `mop_cover_error` | Mopp-Abdeckung gestört (Rollen-Mopp) | – (fehlt) |
| 210 | Fehler | `roller_mop_error` | Rollen-Mopp gestört | – (fehlt) |
| 212 | Fehler | `robotic_arm_stopped` | Roboterarm gestoppt | – (fehlt) |
| 213 | **Warnung** | `onboard_water_tank_empty` | Wassertank im Roboter leer | – (fehlt) |
| 214 | **Warnung** | `onboard_dirty_water_tank_full` | Schmutzwassertank im Roboter voll | – (fehlt) |
| 215 | Fehler | `mop_not_installed` | Mopp nicht eingesetzt | – (fehlt) |
| 217 | Fehler | `lds_error` | Laser-Abstandssensor gestört | – (fehlt) |
| 218 | Fehler | `roller_mop_error` | Rollen-Mopp gestört | – (fehlt) |
| 222 | Fehler | `fluffing_roller_error` | Aufplusterrolle gestört | – (fehlt) |
| 223 | Fehler | `mop_cover_error` | Mopp-Abdeckung gestört | – (fehlt) |
| 224 | Fehler | `mop_cover_error` | Mopp-Abdeckung gestört | – (fehlt) |
| 225 | Fehler | `roller_mop_error` | Rollen-Mopp gestört | – (fehlt) |
| 226 | Fehler | `blocked_by_obstacle` | Von Hindernis blockiert – vor dem Roboter räumen | – (fehlt) |
| 227 | Fehler | `drainage_outlet_filter` | Abwasserfilter des Roboters verstopft | – (fehlt) |
| 228 | Fehler | `main_wheels_error` | Hauptrad-Fehler – Reinigung pausiert | – (fehlt) |
| 229 | Fehler | `internal_error` | Interner Fehler | – (fehlt) |
| 230 | Fehler | `internal_error` | Interner Fehler | – (fehlt) |
| 1000 | Fehler | `return_to_charge_failed` | Rückkehr zur Station fehlgeschlagen – Rampe und Strom prüfen | – (fehlt) |

Nur 5 Zustandswerte haben heute einen deutschen Text in der Karte (`clean_mop_pad`, `dust_bag_full`, `dirty_water_tank_full`,
`mop_pad_stop_rotate`, `station_disconnected`); alle anderen erscheinen als Zustandswert mit Leerzeichen (z. B. „water tank dry“).
Die übrigen Schlüssel in `ERR_DE` (`clean_water_tank_empty`, `dust_box_missing`, `wheels_stuck`, `brush_stuck`, `low_battery`,
`detergent_empty`, `water_tank_missing`, `clean_water_tank_missing`, `dirty_water_tank_missing`) stammen aus v1 und passen zu
keinem Zustandswert dieser Integrationsversion. Beim Bau des Warnungs-Chips (Modul R) wird `ERR_DE` auf diese Tabelle
umgestellt (Karte 4.1, Bauplan Abschnitt 10).
