# Entitäten der Dreame-Integration (Heidi, X60)

Stand 2026-09-15, aus dem Entitäts-Register (239 Entitäten, Integration dreame-vacuum 2.0.0b25). Kategorien sind ein Vorschlag zur Einordnung (Herbert + Claude, 15.09.).

Spalten: **Kurzbeschreibung** = was die Entität zeigt oder schaltet (ergänzt 17.09.2026 aus der Integration und der Dreame-App; Wirkung am Gerät nicht einzeln geprüft). **v2** = die Karte v2 liest oder schreibt dieses Merkmal (Vertrag `contract.ts` `ROBOT_FEATURES`; die ID entsteht seit PD-012 zur Laufzeit aus dem erkannten Gerät, `heidi_` steht hier nur als Beispiel; Stand der Spalte 15.09., neue Merkmale seit 4.3b/4.3e: `map_data`, Bereichszuordnung über das Entitäts-Register). **Kat.** = HA-Kategorie der Integration (config = Einstellung, diagnostic = Diagnose). **aus** = im Register deaktiviert. **Integriert (alpha.28)** = wo die Karte v2 die Entität heute zeigt oder schaltet (Stand 2.0.0-alpha.28, 17.09.2026, aus `selectors.ts`/`api.ts`/Bausteinen abgeleitet); „Sicht … vorhanden; … offen“ = Selektor gebaut, Baustein fehlt noch (Modul in Bauplan Abschnitt 1a); „Im Vertrag, noch ohne Sicht“ = nur in `contract.ts`; „–“ = nicht genutzt.

## Roboter: Zustand und Lauf (15)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_clear_warning` | Clear Warning | Quittiert die anstehende Warnung (nur dann verfügbar; Liste unten „Warnungen und Fehler“) |  | diagnostic |  | geplant Modul R: ✕ am gelben Hinweis-Chip des Roboter-Panels (Entscheidung Herbert 17.09., Mockup `warnung.html`, Abnahme offen) |
| `sensor.heidi_cleaned_area` | Cleaned Area | Gereinigte Fläche des laufenden Laufs in m² | ja |  |  | Roboter-Panel (`dx-hero`) Streifen, Auftrag-Kachel (`dx-auftrag`) |
| `sensor.heidi_cleaning_progress` | Cleaning Progress | Fortschritt des laufenden Laufs in % |  |  |  | – |
| `sensor.heidi_cleaning_time` | Cleaning Time | Dauer des laufenden Laufs in Minuten | ja |  |  | Auftrag-Kachel (`dx-auftrag`) |
| `sensor.heidi_current_room` | Current Room | Raum, in dem Heidi gerade ist | ja |  |  | Roboter-Panel (`dx-hero`) Raum-Chip + Streifen, Auftrag-Kachel, Bildunterschrift der Karte |
| `sensor.heidi_error` | Error | Aktueller Fehler- oder Warnungscode (`no_error` = alles in Ordnung; 22 Codes sind Warnungen, Liste unten) | ja |  |  | Roboter-Panel (`dx-hero`) Hinweis-Chip: gelb = Warnung, rot = Fehler |
| `sensor.heidi_mapping_time` | Mapping Time | Dauer der laufenden Kartenerstellung |  |  |  | – |
| `sensor.heidi_relocation_status` | Relocation Status | Sucht Heidi gerade ihre Position auf der Karte neu |  |  |  | – |
| `sensor.heidi_state` | State | Grober Betriebszustand (cleaning, docked, paused …), wie `vacuum.heidi` |  |  |  | – |
| `sensor.heidi_status` | Status | Genauer Status (Charging, Sweeping, Washing, Drying …) | ja |  |  | Roboter-Panel (`dx-hero`) Statustext |
| `sensor.heidi_stream_status` | Stream Status | Zustand des Kamera-Livestreams |  |  |  | – |
| `sensor.heidi_task_status` | Task Status | Art der laufenden Aufgabe (Saugen, Wischen nach Saugen, Rückkehr …) | ja |  |  | Roboter-Panel (`dx-hero`) Auftragsart im Statustext |
| `sensor.heidi_task_type` | Task Type | Auftragsart (ganze Wohnung, Räume, Zone, Punkt) |  |  |  | – |
| `switch.heidi_resume_cleaning` | Resume Cleaning | Unterbrochenen Lauf nach dem Laden fortsetzen |  | config |  | – |
| `vacuum.heidi` |  Heidi | Der Roboter selbst: Start / Pause / Stopp / Station, Zustand, Akku, Attribute |  |  |  | Roboter-Panel (`dx-hero`) Zustand + Knöpfe Start / Pause / Stopp / Station / Orten, Auftrag-Kachel, Karte (Räume / Zone / Punkt / Hinfahren / Sperrzonen), Schnellstart, Kopfzeile |

## Akku und Laden (7)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `binary_sensor.heidi_charging_state` | Charging State | An, solange Heidi lädt |  |  |  | – (Karte nutzt das Attribut `charging` von `vacuum.heidi`) |
| `select.heidi_battery_charge_level` | Battery Charge Level | Ladegrenze für den Akku (z. B. 80 % zur Schonung) |  | config |  | – |
| `sensor.heidi_battery_level` | Battery Level | Akkustand in % | ja |  |  | Roboter-Panel (`dx-hero`) Akku |
| `sensor.heidi_charging_status` | Charging Status | Ladezustand als Text (Charging, Charging completed, Not charging) |  |  |  | – |
| `switch.heidi_off_peak_charging` | Off-Peak Charging | Nur im festgelegten Zeitfenster laden (günstiger Strom) |  | config |  | – |
| `time.heidi_off_peak_charging_end` | Off-Peak Charging End | Ende des Ladefensters |  | config |  | – |
| `time.heidi_off_peak_charging_start` | Off-Peak Charging Start | Beginn des Ladefensters |  | config |  | – |

## Karte (10)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_backup_saved_map` | Backup Saved Map | Sichert die gespeicherte Karte |  | diagnostic |  | – |
| `button.heidi_start_fast_mapping` | Start Fast Mapping | Schnelle Kartenerstellung ohne Reinigung |  | config |  | – |
| `button.heidi_start_mapping` | Start Mapping | Kartenerstellung mit Reinigung |  | config | aus | – |
| `camera.heidi_map` | Current Map | Aktuelles Kartenbild mit Räumen, Sperrzonen, Position, Pfad (Attribute `rooms`, `calibration_points`) | ja |  |  | Karte auf Übersicht und Seite Reinigen (`dx-map-card`), Heidi-Karte (Bild), Räume + Umrisse für Schnellstart und Geräteprofil |
| `camera.heidi_map_1` | Saved Map 1 | Bild der gespeicherten Karte 1 |  | config |  | – |
| `camera.heidi_map_data` | Current Map Data | Kartenpaket als Daten (Raumflächen für die Heidi-Karte); seit 4.3b aktiviert | ja | config | aus | Heidi-Karte (`dx-heidi-map`, Raumflächen), Einrichtungsprüfung |
| `camera.heidi_wifi_map_1` | Saved Wifi Map 1 | WLAN-Stärke als Karte für Karte 1 |  | config | aus | – |
| `select.heidi_map_rotation` | Map Rotation | Drehung des Kartenbilds (0 / 90 / 180 / 270°) | ja | config |  | Sicht Einstellungen vorhanden; Seite Einstellungen offen (4.11, Modul E) |
| `select.heidi_selected_map` | Selected Map | Aktive gespeicherte Karte (bei mehreren Etagen) | ja |  |  | Kartenwahl auf der Seite Reinigen (`dx-map-card`) |
| `switch.heidi_multi_floor_map` | Multi Floor Map | Mehrere Karten (Etagen) speichern |  | config |  | – |

## Reinigung: globale Einstellungen (27)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_wetness_level` | Wetness Level | Nässegrad des Mopps als Zahl (feiner als die Wassermenge) |  |  |  | – |
| `select.heidi_carpet_cleaning` | Carpet Cleaning | Verhalten auf Teppich (meiden, Mopp anheben, überfahren …) | ja | config |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_cleangenius` | CleanGenius | CleanGenius-Automatik: Roboter wählt Saugstufe und Nässe selbst | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_cleangenius_mode` | CleanGenius Mode | Betriebsart der CleanGenius-Automatik |  |  |  | – |
| `select.heidi_cleaning_mode` | Cleaning Mode | Reinigungsart für den nächsten Lauf (Saugen, Wischen, Saugen + Wischen, Wischen nach Saugen) |  |  |  | Optionsliste für das Geräteprofil (Rückfall, wenn die Raum-Selects fehlen); Einrichtungsprüfung |
| `select.heidi_cleaning_route` | Cleaning Route | Fahrweg (Standard, Intensiv, Tief, Schnell) |  |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `select.heidi_low_lying_area_frequency` | Low Lying Area Frequency | Wie oft niedrige Bereiche unter Möbeln gereinigt werden |  | config |  | – |
| `select.heidi_mop_extend_frequency` | Mop Extend Frequency | Wie oft der Mopp an Kanten ausfährt |  | config |  | – |
| `select.heidi_mop_pad_humidity` | Mop Pad Humidity | Wassermenge / Moppfeuchte (niedrig, mittel, hoch) |  |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `select.heidi_suction_level` | Suction Level | Saugstufe (leise, Standard, stark, Turbo) |  |  |  | Optionsliste für das Geräteprofil (Rückfall); Einrichtungsprüfung |
| `switch.heidi_active_suspension_crossing` | Active Suspension Crossing | Fahrwerk anheben, um Schwellen zu überwinden |  | config |  | – |
| `switch.heidi_carpet_boost` | Carpet Boost | Auf Teppich automatisch stärker saugen |  | config |  | – |
| `switch.heidi_clean_carpets_first` | Clean Carpets First | Teppiche zuerst saugen, dann den Rest wischen |  | config |  | – |
| `switch.heidi_customized_cleaning` | Customized Cleaning | Angepasste Reinigung: die Werte je Raum gelten (aus → Raum-Selects `unavailable`) | ja |  |  | Raumwerte-Sicht (Rückfall auf Kartendaten, wenn aus), Einrichtungsprüfung (Warnung) |
| `switch.heidi_floor_direction_cleaning` | Floor Direction Cleaning | Entlang der Bodenrichtung (Dielen) fahren |  | config |  | – |
| `switch.heidi_gap_cleaning_extension` | Gap Cleaning Extension | Mopp in Fugen und Lücken ausfahren |  | config |  | – |
| `switch.heidi_hair_compression` | Hair Compression | Haare im Staubbehälter verdichten |  | config |  | – |
| `switch.heidi_intensive_carpet_cleaning` | Intensive Carpet Cleaning | Teppiche intensiv (mehrfach) saugen |  | config |  | – |
| `switch.heidi_large_particles_boost` | Large Particles Boost | Mehr Saugkraft bei groben Partikeln |  | config |  | – |
| `switch.heidi_lift_chassis_on_carpet` | Lift Chassis On Carpet | Fahrwerk auf Teppich anheben, damit der Mopp trocken bleibt |  | config |  | – |
| `switch.heidi_max_suction_power` | Max Suction Power | Maximale Saugkraft |  |  |  | – |
| `switch.heidi_mop_extend` | Mop Extend | Ausfahrbarer Mopp an Kanten ein/aus |  | config |  | – |
| `switch.heidi_mopping_under_furnitures` | Mopping Under Furnitures | Unter Möbeln wischen |  | config |  | – |
| `switch.heidi_mopping_with_detergent` | Mopping With Detergent | Reinigungsmittel beim Wischen zugeben |  | config |  | – |
| `switch.heidi_obstacle_crossing` | Synchronized Obstacle Crossing | Schwellen synchron mit beiden Rädern überwinden |  | config |  | – |
| `switch.heidi_side_brush_carpet_rotate` | Side Brush Carpet Rotate | Seitenbürste auf Teppich weiterdrehen |  | config |  | – |
| `switch.heidi_side_reach` | Side Reach | Seitlich ausfahren für Kanten und Ecken |  | config |  | – |

## Raumwerte (je Raum 1–8) (88)

| Muster | Name | Kurzbeschreibung | Räume | v2 | Kat. | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_room_N_wetness_level` | Wetness Level | Nässegrad je Raum | 1, 2, 3, 4, 5, 6, 7, 8 |  |  | – |
| `select.heidi_room_N_cleaning_mode` | Cleaning Mode | Reinigungsart je Raum | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  | Roboter-Panel (`dx-hero`) Modus + Streifen, Geräteprofil; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_cleaning_route` | Cleaning Route | Fahrweg je Raum | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  | Roboter-Panel (`dx-hero`) Streifen (Route-Chip bei „Nur Wischen“); Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_cleaning_times` | Cleaning Times | Wiederholungen je Raum (1–3) | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  | Roboter-Panel (`dx-hero`) Streifen (Wdh-Chip), Geräteprofil; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_floor_material` | Floor Material | Bodenart je Raum (Fliesen, Holz, Teppich …) | 1, 2, 3, 4, 5, 6, 7, 8 |  | config | – |
| `select.heidi_room_N_floor_material_direction` | Floor Material Direction | Richtung der Dielen / des Bodenmusters | 1, 2, 3, 4, 5, 6, 7, 8 |  | config | – |
| `select.heidi_room_N_mop_pad_humidity` | Mop Pad Humidity | Wassermenge je Raum | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  | Roboter-Panel (`dx-hero`) Wasser + Streifen; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_name` | Room 1 Name | Raumname (Auswahl aus den Raumtypen der App) | 1, 2, 3, 4, 5, 6, 7, 8 |  | config | Einrichtungsprüfung (Raumtypen-Hinweis, Sprung zur Namens-Entität) |
| `select.heidi_room_N_order` | Order | Reihenfolge des Raums in der App | 1, 2, 3, 4, 5, 6, 7, 8 |  |  | – (Reihenfolge kommt aus `camera.heidi_map`) |
| `select.heidi_room_N_suction_level` | Suction Level | Saugstufe je Raum | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  | Roboter-Panel (`dx-hero`) Saugstufe + Streifen; Räume-Dialog offen (4.6a, Modul R) |
| `select.heidi_room_N_visibility` | Visibility | Raum in der App sichtbar oder ausgeblendet | 1, 2, 3, 4, 5, 6, 7, 8 |  | config | – (Sichtbarkeit kommt aus `camera.heidi_map`) |

Raum 8 = „Balkon“, in der App ausgeblendet (Bauplan Abschnitt 10). Raumnamen und -reihenfolge kommen aus `camera.heidi_map.rooms`.

## Station: Waschen, Trocknen, Absaugen, Wasser (34)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_base_station_cleaning` | Base Station Cleaning | Station reinigen (Waschwanne spülen) | ja | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_base_station_self_repair` | Base Station Self Repair | Selbstreparatur der Station (Pumpen und Leitungen spülen) |  | diagnostic |  | – |
| `button.heidi_empty_water_tank` | Empty Water Tank | Wassertank des Roboters leeren |  | diagnostic |  | – |
| `button.heidi_manual_drying` | Manual Drying | Mopp jetzt trocknen | ja |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_self_clean` | Self Clean | Mopp-Wäsche jetzt starten | ja |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_start_auto_empty` | Start Auto Empty | Staubbehälter jetzt absaugen | ja |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `button.heidi_water_tank_draining` | Water Tank Draining | Station entwässern |  | diagnostic |  | – |
| `number.heidi_self_clean_area` | Self Clean Area | Nach wie viel m² der Mopp zwischendurch gewaschen wird | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `number.heidi_self_clean_time` | Self Clean Time | Nach wie viel Minuten der Mopp zwischendurch gewaschen wird |  |  |  | – |
| `select.heidi_auto_empty_mode` | Auto Empty Mode | Häufigkeit des Absaugens (aus, Standard, häufig, selten) | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_drying_time` | Drying Time | Trocknungsdauer (2 / 3 / 4 h) | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_self_clean_frequency` | Self Clean Frequency | Mopp-Wäsche nach Fläche, nach Zeit oder je Raum | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_washing_mode` | Washing Mode | Waschintensität (leicht, Standard, tief) |  |  |  | – |
| `select.heidi_water_temperature` | Water Temperature | Wassertemperatur der Mopp-Wäsche (kalt, warm, heiß) | ja |  |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `sensor.heidi_auto_empty_status` | Auto Empty Status | Läuft das Absaugen gerade | ja |  |  | Im Vertrag, noch ohne Sicht |
| `sensor.heidi_clean_water_tank_status` | Clean Water Tank Status | Frischwassertank: ok, leer oder fehlt | ja | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_detergent_status` | Detergent Status | Reinigungsmittel: ok oder leer | ja | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_dirty_water_tank_status` | Dirty Water Tank Status | Schmutzwassertank: ok, voll oder fehlt | ja | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_drainage_status` | Drainage Status | Entwässerung läuft / fertig |  |  |  | – |
| `sensor.heidi_drying_left` | Drying Left | Restzeit der Trocknung in Minuten |  |  |  | – |
| `sensor.heidi_drying_progress` | Drying Progress | Fortschritt der Trocknung in % |  |  |  | – |
| `sensor.heidi_dust_bag_status` | Dust Bag Status | Staubbeutel: ok, voll oder fehlt | ja | diagnostic |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_dust_collection` | Dust Collection | Zustand der Staubabsaugung (aktiv, gesperrt) |  |  |  | – |
| `sensor.heidi_hot_water_status` | Hot Water Status | Heißwasserbereitung der Station |  | diagnostic |  | – |
| `sensor.heidi_low_water_warning` | Low Water Warning | Warnung: Frischwasser knapp oder Tank fehlt | ja |  |  | Sicht Station vorhanden; Kachel Station offen (4.9, Modul C) |
| `sensor.heidi_mop_pad` | Mop Pad | Mopp-Pad eingesetzt oder fehlt |  |  |  | – |
| `sensor.heidi_self_wash_base_status` | Self-Wash Base Status | Zustand der Waschstation (Waschen, Trocknen, Leerlauf) | ja |  |  | Im Vertrag, noch ohne Sicht (Stationszeile im Roboter-Panel nutzt die Attribute `washing` / `drying` von `vacuum.heidi`) |
| `sensor.heidi_station_drainage_status` | Station Drainage Status | Entwässerungsanschluss der Station |  | diagnostic |  | – |
| `switch.heidi_auto_drying` | Auto Drying | Nach der Mopp-Wäsche automatisch trocknen |  |  |  | – |
| `switch.heidi_auto_mount_mop` | Auto Mount Mop | Mopp automatisch an- und abkoppeln |  | config |  | – |
| `switch.heidi_auto_water_refilling` | Auto Water Refilling | Wassertank des Roboters automatisch nachfüllen |  | config |  | – |
| `switch.heidi_mop_washing_with_detergent` | Mop Washing With Detergent | Reinigungsmittel bei der Mopp-Wäsche zugeben |  | config |  | – |
| `switch.heidi_self_clean` | Self-Clean | Mopp-Wäsche zwischendurch in der Station erlaubt |  |  |  | – |
| `switch.heidi_smart_mop_washing` | Smart Mop Washing | Waschintensität automatisch nach Verschmutzung |  | config |  | – |

## Verschleiß und Statistik (22)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_reset_filter` | Reset Filter | Filterzähler nach dem Tausch zurücksetzen | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_main_brush` | Reset Main Brush | Hauptbürste nach dem Tausch zurücksetzen | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_sensor` | Reset Sensor | Sensorreinigung als erledigt setzen | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_side_brush` | Reset Side Brush | Seitenbürste nach dem Tausch zurücksetzen | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `button.heidi_reset_wheel` | Reset Wheel | Radreinigung als erledigt setzen | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_cleaning_count` | Cleaning Count | Anzahl aller Läufe | ja | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_cleaning_history` | Cleaning History | Letzte Läufe mit Zeit, Dauer, Fläche, Ergebnis (Attribut; Quelle des Protokolls) | ja | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_cruising_history` | Cruising History | Verlauf der Erkundungsfahrten (Kamera-Rundgang) |  | diagnostic |  | – |
| `sensor.heidi_filter_left` | Filter Left | Restlebensdauer Filter in % | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_filter_time_left` | Filter Time Left | Restlebensdauer Filter in Stunden |  | diagnostic |  | – |
| `sensor.heidi_firmware_version` | Firmware Version | Firmware-Stand des Roboters |  | diagnostic |  | – |
| `sensor.heidi_first_cleaning_date` | First Cleaning Date | Datum des ersten Laufs | ja | diagnostic |  | Im Vertrag, noch ohne Sicht |
| `sensor.heidi_main_brush_left` | Main Brush Left | Restlebensdauer Hauptbürste in % | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_main_brush_time_left` | Main Brush  Time Left | Restlebensdauer Hauptbürste in Stunden |  | diagnostic |  | – |
| `sensor.heidi_sensor_dirty_left` | Sensor Dirty Left | Bis zur nächsten Sensorreinigung in % | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_sensor_dirty_time_left` | Sensor Dirty Time Left | Bis zur nächsten Sensorreinigung in Stunden |  | diagnostic |  | – |
| `sensor.heidi_side_brush_left` | Side Brush Left | Restlebensdauer Seitenbürste in % | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_side_brush_time_left` | Side Brush Time Left | Restlebensdauer Seitenbürste in Stunden |  | diagnostic |  | – |
| `sensor.heidi_total_cleaned_area` | Total Cleaned Area | Gesamtfläche aller Läufe in m² | ja | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_total_cleaning_time` | Total Cleaning Time | Gesamtzeit aller Läufe | ja | diagnostic |  | Sicht Verlauf vorhanden; Verlauf / Statistik offen (4.7, Modul D) |
| `sensor.heidi_wheel_dirty_left` | Wheel Dirty Left | Bis zur nächsten Radreinigung in % | ja | diagnostic |  | Sicht Verschleiß vorhanden; Kachel Verschleiß offen (4.9, Modul C) |
| `sensor.heidi_wheel_dirty_time_left` | Wheel Dirty Time Left | Bis zur nächsten Radreinigung in Stunden |  | diagnostic |  | – |

## Hinderniserkennung, Kamera, KI (22)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `binary_sensor.heidi_lds_status` | LDS Status | Laser-Sensor (Lidar) in Betrieb |  |  |  | – |
| `number.heidi_camera_light_brightness` | Camera Light Brightness | Helligkeit des Kameralichts |  | config |  | – |
| `select.heidi_auto_lds_coverage` | Auto Lds Coverage | Laserturm automatisch einfahren (niedrige Möbel) |  | config |  | – |
| `switch.heidi_ai_fluid_detection` | AI Fluid Detection | Flüssigkeiten per Kamera-KI erkennen und meiden |  | config |  | – |
| `switch.heidi_ai_furniture_detection` | AI Furniture Detection | Möbel erkennen und in die Karte eintragen |  | config |  | – |
| `switch.heidi_ai_obstacle_detection` | AI Obstacle Detection | Hindernisse per Kamera-KI erkennen |  | config |  | – |
| `switch.heidi_ai_obstacle_image_upload` | AI Obstacle Image Upload | Hindernisbilder in die Dreame-Cloud hochladen |  | config |  | – |
| `switch.heidi_ai_obstacle_picture` | AI Obstacle Picture | Fotos erkannter Hindernisse speichern |  | config |  | – |
| `switch.heidi_ai_pet_detection` | AI Pet Detection | Haustiere und Hinterlassenschaften erkennen und meiden |  | config |  | – |
| `switch.heidi_camera_light_brightness_auto` | Camera Light Brightness Auto | Kameralicht automatisch regeln |  | config |  | – |
| `switch.heidi_collision_avoidance` | Collision Avoidance | Zusammenstöße vermeiden (sanft anfahren) |  | config |  | – |
| `switch.heidi_dynamic_obstacle_cleaning` | Dynamic Obstacle Cleaning | Stellen mit bewegten Hindernissen später nachreinigen |  | config |  | – |
| `switch.heidi_fill_light` | Fill Light | Zusatzlicht bei Dunkelheit |  | config |  | – |
| `switch.heidi_fuzzy_obstacle_detection` | Fuzzy Obstacle Detection | Auch kleine, unscharfe Hindernisse erkennen |  | config |  | – |
| `switch.heidi_human_follow` | Human Follow | Einer Person folgen (Kamera) |  | config |  | – |
| `switch.heidi_intelligent_recognition` | Intelligent Recognition | Intelligente Erkennung von Bodentypen und Teppichen |  | config |  | – |
| `switch.heidi_lds_state` | LDS State | Laser-Sensor ein/aus |  | diagnostic |  | – |
| `switch.heidi_obstacle_avoidance` | Obstacle Avoidance | Hindernissen ausweichen ein/aus |  | config |  | – |
| `switch.heidi_pet_focused_detection` | Pet Focused Detection | Verstärkte Haustier-Erkennung |  | config |  | – |
| `switch.heidi_pet_picture` | Pet Picture | Fotos von Haustieren aufnehmen |  | config |  | – |
| `switch.heidi_ring_light_always_on` | Ring Light Always On | Ringlicht dauerhaft an |  | config |  | – |
| `switch.heidi_stain_avoidance` | Stain Avoidance | Flecken erkennen und umfahren |  | config |  | – |

## Nicht stören, Töne, Sprache, Sperre (11)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `number.heidi_volume` | Volume | Lautstärke der Sprachansagen | ja | config |  | Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `select.heidi_voice_assistant_language` | Voice Assistant Language | Sprache des Sprachassistenten |  | config |  | – |
| `switch.heidi_child_lock` | Child Lock | Tasten am Roboter sperren |  | config |  | – |
| `switch.heidi_dnd` | DnD | Nicht stören ein/aus |  | config |  | – |
| `switch.heidi_dnd_disable_auto_empty` | DnD Disable Auto Empty | Kein Absaugen während Nicht stören |  | config |  | – |
| `switch.heidi_dnd_disable_resume_cleaning` | DnD Disable Resume Cleaning | Kein Fortsetzen während Nicht stören |  | config |  | – |
| `switch.heidi_dnd_reduce_volume` | DnD Reduce Volume | Leisere Ansagen während Nicht stören |  | config |  | – |
| `switch.heidi_streaming_voice_prompt` | Streaming Voice Prompt | Ansage, wenn der Kamerastream startet |  | config |  | – |
| `switch.heidi_voice_assistant` | Voice Assistant | Sprachassistent ein/aus |  | config |  | – |
| `time.heidi_dnd_end` | DnD End | Ende von Nicht stören (aktuell 07:00) | ja | config |  | Kopfzeile „Nicht stören“; Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |
| `time.heidi_dnd_start` | DnD Start | Beginn von Nicht stören (aktuell 20:00) | ja | config |  | Kopfzeile „Nicht stören“; Sicht Roboter-Einstellungen vorhanden; Baustein offen (Modul E) |

## App-Szenen (3)

| Entität | Name | Kurzbeschreibung | v2 | Kat. | aus | Integriert (alpha.28) |
|---|---|---|---|---|---|---|
| `button.heidi_reload_shortcuts` | Reload Shortcuts | Szenen (Shortcuts) aus der App neu laden |  | diagnostic |  | – |
| `button.heidi_shortcut_2` | Shortcut Bad Saugen/Wischen | App-Szene „Bad Saugen/Wischen“ starten |  |  |  | Seite Reinigen „App-Szenen“ über das Paket-Skript `heidi_app_szene` (nicht über die Button-Entität) |
| `button.heidi_shortcut_3` | Shortcut Wischen Nach Dem Saugen | App-Szene „Wischen nach dem Saugen“ starten |  |  |  | Seite Reinigen „App-Szenen“ über das Paket-Skript `heidi_app_szene` (nicht über die Button-Entität) |

## Warnungen und Fehler (`sensor.heidi_error`, ausgelesen 17.09.2026)

Die Integration kennt **kein eigenes Warnungs-Attribut**. Warnung und Fehler sind derselbe Fehlersensor
`sensor.heidi_error` (Zustand = Code-Name, Attribute `value` = Nummer, `description`). Eine feste Liste von
**22 Codes** gilt als Warnung (`WARNING_ERROR_CODE` in `custom_components/dreame_vacuum/dreame/types.py`),
alle anderen rund 100 Codes sind Fehler. Daraus leitet die Integration ab:

- `vacuum.heidi` Attribut `has_error` = Fehler, der **keine** Warnung ist (bei einer Warnung bleibt `has_error` false).
- `button.heidi_clear_warning` ist nur verfügbar, solange eine Warnung ansteht, außerdem bei „Wasser knapp“
  (`sensor.heidi_low_water_warning`) und „Entwässerung abgeschlossen“. Sonst `unavailable`.
- Bei einer Warnung legt die Integration zusätzlich eine HA-Benachrichtigung „warning“ an (mit Bild vom Roboter, wenn vorhanden);
  Quittieren entfernt sie. Fehler bekommen eine eigene Benachrichtigung je Code.
- Die Karte v2 zeigt den Fehlersensor im Roboter-Panel als Chip: **gelb** bei Warnung (`has_error` false), **rot** bei Fehler;
  deutsche Texte aus `ERR_DE` in `dreame_x60/card/src/config.ts` (v1-Stand). Entscheidung Herbert 17.09.: der gelbe Chip
  bekommt ein ✕ zum Quittieren über `button.heidi_clear_warning` (Modul R, Bauplan Abschnitt 10; Mockup `dreame_x60/mockups/warnung.html`).

Die 22 Warnungen (Nummer = Attribut `value`, Zustandswert = `sensor.heidi_error`):

| Nr. | Zustandswert | Bedeutung | Text in der Karte (`ERR_DE`) |
|---|---|---|---|
| 9 | `no_tank_box` | Wassertank (Tankbox) nicht eingesetzt | – (fehlt) |
| 10 | `water_box_empty` | Wassertank leer | – (fehlt) |
| 20 | `battery_low` | Akku schwach | – (fehlt) |
| 47 | `blocked` | Roboter blockiert (nur Code 47; die Codes 63 und 64 heißen ebenfalls `blocked`, zählen aber als Fehler) | – (fehlt) |
| 51 | `filter_blocked` | Filter verstopft | – (fehlt) |
| 56 | `laser` | Laser-Sensor verdeckt oder gestört | – (fehlt) |
| 68 | `remove_mop` | Mopp abnehmen (z. B. vor reinem Saugen) | – (fehlt) |
| 70 | `mop_removed` | Mopp abgenommen | – (fehlt) |
| 71, 72 | `mop_pad_stop_rotate` | Mopp-Pad dreht sich nicht | „Mopp blockiert“ |
| 75 | `low_battery_turn_off` | Wegen leerem Akku ausgeschaltet | – (fehlt) |
| 82 | `slippery_floor` | Rutschiger Boden | – (fehlt) |
| 85 | `check_mop_install` | Mopp-Halterung prüfen | – (fehlt) |
| 107 | `water_tank_dry` | Frischwassertank der Station leer | – (fehlt) |
| 114 | `clean_mop_pad` | Mopp reinigen | „Mopp reinigen“ |
| 117 | `station_disconnected` | Station getrennt | „Station getrennt“ |
| 121 | `dust_bag_full` | Staubbeutel voll | „Staubbeutel voll“ |
| 122 | `unknown` | Unbekannte Warnung (die Integration meldet den Zustandswert `unknown`) | – (fehlt) |
| 123 | `self_test_failed` | Selbsttest fehlgeschlagen | – (fehlt) |
| 129 | `wash_failed` | Mopp-Wäsche fehlgeschlagen | – (fehlt) |
| 213 | `onboard_water_tank_empty` | Wassertank im Roboter leer | – (fehlt) |
| 214 | `onboard_dirty_water_tank_full` | Schmutzwassertank im Roboter voll | – (fehlt) |

Nur 4 der 22 Warnungen haben heute einen deutschen Text in der Karte; die übrigen erscheinen als Zustandswert mit
Leerzeichen (z. B. „water tank dry“). Die restlichen Schlüssel in `ERR_DE` (`clean_water_tank_empty`, `dirty_water_tank_full`,
`dust_box_missing`, `wheels_stuck`, `brush_stuck`, `low_battery`, `detergent_empty`, `water_tank_missing`,
`clean_water_tank_missing`, `dirty_water_tank_missing`) stammen aus v1 und passen zu keinem der 22 Warnungs-Codes
dieser Integrationsversion – sie gehören zu Fehlercodes oder älteren Namen. Beim Bau des Warnungs-Chips (Modul R)
werden die fehlenden 18 Texte ergänzt (Karte 4.1, Abschnitt 10).
