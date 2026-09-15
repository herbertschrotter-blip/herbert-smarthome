# Entitäten der Dreame-Integration (Heidi, X60)

Stand 2026-09-15, aus dem Entitäts-Register (239 Entitäten, Integration dreame-vacuum 2.0.0b25). Kategorien sind ein Vorschlag zur Einordnung (Herbert + Claude, 15.09.).

Spalten: **v2** = die Karte v2 liest oder schreibt die Entität (Vertrag `contract.ts`, Abschnitt 4 des Bauplans). **Kat.** = HA-Kategorie der Integration (config = Einstellung, diagnostic = Diagnose). **aus** = im Register deaktiviert.

## Roboter: Zustand und Lauf (15)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `button.heidi_clear_warning` | Clear Warning |  | diagnostic |  |
| `sensor.heidi_cleaned_area` | Cleaned Area | ja |  |  |
| `sensor.heidi_cleaning_progress` | Cleaning Progress |  |  |  |
| `sensor.heidi_cleaning_time` | Cleaning Time | ja |  |  |
| `sensor.heidi_current_room` | Current Room | ja |  |  |
| `sensor.heidi_error` | Error | ja |  |  |
| `sensor.heidi_mapping_time` | Mapping Time |  |  |  |
| `sensor.heidi_relocation_status` | Relocation Status |  |  |  |
| `sensor.heidi_state` | State |  |  |  |
| `sensor.heidi_status` | Status | ja |  |  |
| `sensor.heidi_stream_status` | Stream Status |  |  |  |
| `sensor.heidi_task_status` | Task Status | ja |  |  |
| `sensor.heidi_task_type` | Task Type |  |  |  |
| `switch.heidi_resume_cleaning` | Resume Cleaning |  | config |  |
| `vacuum.heidi` |  Heidi |  |  |  |

## Akku und Laden (7)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `binary_sensor.heidi_charging_state` | Charging State |  |  |  |
| `select.heidi_battery_charge_level` | Battery Charge Level |  | config |  |
| `sensor.heidi_battery_level` | Battery Level | ja |  |  |
| `sensor.heidi_charging_status` | Charging Status |  |  |  |
| `switch.heidi_off_peak_charging` | Off-Peak Charging |  | config |  |
| `time.heidi_off_peak_charging_end` | Off-Peak Charging End |  | config |  |
| `time.heidi_off_peak_charging_start` | Off-Peak Charging Start |  | config |  |

## Karte (10)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `button.heidi_backup_saved_map` | Backup Saved Map |  | diagnostic |  |
| `button.heidi_start_fast_mapping` | Start Fast Mapping |  | config |  |
| `button.heidi_start_mapping` | Start Mapping |  | config | aus |
| `camera.heidi_map` | Current Map | ja |  |  |
| `camera.heidi_map_1` | Saved Map 1 |  | config |  |
| `camera.heidi_map_data` | Current Map Data | ja | config | aus |
| `camera.heidi_wifi_map_1` | Saved Wifi Map 1 |  | config | aus |
| `select.heidi_map_rotation` | Map Rotation | ja | config |  |
| `select.heidi_selected_map` | Selected Map | ja |  |  |
| `switch.heidi_multi_floor_map` | Multi Floor Map |  | config |  |

## Reinigung: globale Einstellungen (27)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `number.heidi_wetness_level` | Wetness Level |  |  |  |
| `select.heidi_carpet_cleaning` | Carpet Cleaning | ja | config |  |
| `select.heidi_cleangenius` | CleanGenius | ja |  |  |
| `select.heidi_cleangenius_mode` | CleanGenius Mode |  |  |  |
| `select.heidi_cleaning_mode` | Cleaning Mode |  |  |  |
| `select.heidi_cleaning_route` | Cleaning Route |  |  |  |
| `select.heidi_low_lying_area_frequency` | Low Lying Area Frequency |  | config |  |
| `select.heidi_mop_extend_frequency` | Mop Extend Frequency |  | config |  |
| `select.heidi_mop_pad_humidity` | Mop Pad Humidity |  |  |  |
| `select.heidi_suction_level` | Suction Level |  |  |  |
| `switch.heidi_active_suspension_crossing` | Active Suspension Crossing |  | config |  |
| `switch.heidi_carpet_boost` | Carpet Boost |  | config |  |
| `switch.heidi_clean_carpets_first` | Clean Carpets First |  | config |  |
| `switch.heidi_customized_cleaning` | Customized Cleaning | ja |  |  |
| `switch.heidi_floor_direction_cleaning` | Floor Direction Cleaning |  | config |  |
| `switch.heidi_gap_cleaning_extension` | Gap Cleaning Extension |  | config |  |
| `switch.heidi_hair_compression` | Hair Compression |  | config |  |
| `switch.heidi_intensive_carpet_cleaning` | Intensive Carpet Cleaning |  | config |  |
| `switch.heidi_large_particles_boost` | Large Particles Boost |  | config |  |
| `switch.heidi_lift_chassis_on_carpet` | Lift Chassis On Carpet |  | config |  |
| `switch.heidi_max_suction_power` | Max Suction Power |  |  |  |
| `switch.heidi_mop_extend` | Mop Extend |  | config |  |
| `switch.heidi_mopping_under_furnitures` | Mopping Under Furnitures |  | config |  |
| `switch.heidi_mopping_with_detergent` | Mopping With Detergent |  | config |  |
| `switch.heidi_obstacle_crossing` | Synchronized Obstacle Crossing |  | config |  |
| `switch.heidi_side_brush_carpet_rotate` | Side Brush Carpet Rotate |  | config |  |
| `switch.heidi_side_reach` | Side Reach |  | config |  |

## Raumwerte (je Raum 1–8) (88)

| Muster | Name | Räume | v2 | Kat. |
|---|---|---|---|---|
| `number.heidi_room_N_wetness_level` | Wetness Level | 1, 2, 3, 4, 5, 6, 7, 8 |  |  |
| `select.heidi_room_N_cleaning_mode` | Cleaning Mode | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  |
| `select.heidi_room_N_cleaning_route` | Cleaning Route | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  |
| `select.heidi_room_N_cleaning_times` | Cleaning Times | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  |
| `select.heidi_room_N_floor_material` | Floor Material | 1, 2, 3, 4, 5, 6, 7, 8 |  | config |
| `select.heidi_room_N_floor_material_direction` | Floor Material Direction | 1, 2, 3, 4, 5, 6, 7, 8 |  | config |
| `select.heidi_room_N_mop_pad_humidity` | Mop Pad Humidity | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  |
| `select.heidi_room_N_name` | Room 1 Name | 1, 2, 3, 4, 5, 6, 7, 8 |  | config |
| `select.heidi_room_N_order` | Order | 1, 2, 3, 4, 5, 6, 7, 8 |  |  |
| `select.heidi_room_N_suction_level` | Suction Level | 1, 2, 3, 4, 5, 6, 7, 8 | ja (1–7) |  |
| `select.heidi_room_N_visibility` | Visibility | 1, 2, 3, 4, 5, 6, 7, 8 |  | config |

Raum 8 = „Balkon“, in der App ausgeblendet (Bauplan Abschnitt 10). Raumnamen und -reihenfolge kommen aus `camera.heidi_map.rooms`.

## Station: Waschen, Trocknen, Absaugen, Wasser (34)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `button.heidi_base_station_cleaning` | Base Station Cleaning | ja | diagnostic |  |
| `button.heidi_base_station_self_repair` | Base Station Self Repair |  | diagnostic |  |
| `button.heidi_empty_water_tank` | Empty Water Tank |  | diagnostic |  |
| `button.heidi_manual_drying` | Manual Drying | ja |  |  |
| `button.heidi_self_clean` | Self Clean | ja |  |  |
| `button.heidi_start_auto_empty` | Start Auto Empty | ja |  |  |
| `button.heidi_water_tank_draining` | Water Tank Draining |  | diagnostic |  |
| `number.heidi_self_clean_area` | Self Clean Area | ja |  |  |
| `number.heidi_self_clean_time` | Self Clean Time |  |  |  |
| `select.heidi_auto_empty_mode` | Auto Empty Mode | ja |  |  |
| `select.heidi_drying_time` | Drying Time | ja |  |  |
| `select.heidi_self_clean_frequency` | Self Clean Frequency | ja |  |  |
| `select.heidi_washing_mode` | Washing Mode |  |  |  |
| `select.heidi_water_temperature` | Water Temperature | ja |  |  |
| `sensor.heidi_auto_empty_status` | Auto Empty Status | ja |  |  |
| `sensor.heidi_clean_water_tank_status` | Clean Water Tank Status | ja | diagnostic |  |
| `sensor.heidi_detergent_status` | Detergent Status | ja | diagnostic |  |
| `sensor.heidi_dirty_water_tank_status` | Dirty Water Tank Status | ja | diagnostic |  |
| `sensor.heidi_drainage_status` | Drainage Status |  |  |  |
| `sensor.heidi_drying_left` | Drying Left |  |  |  |
| `sensor.heidi_drying_progress` | Drying Progress |  |  |  |
| `sensor.heidi_dust_bag_status` | Dust Bag Status | ja | diagnostic |  |
| `sensor.heidi_dust_collection` | Dust Collection |  |  |  |
| `sensor.heidi_hot_water_status` | Hot Water Status |  | diagnostic |  |
| `sensor.heidi_low_water_warning` | Low Water Warning | ja |  |  |
| `sensor.heidi_mop_pad` | Mop Pad |  |  |  |
| `sensor.heidi_self_wash_base_status` | Self-Wash Base Status | ja |  |  |
| `sensor.heidi_station_drainage_status` | Station Drainage Status |  | diagnostic |  |
| `switch.heidi_auto_drying` | Auto Drying |  |  |  |
| `switch.heidi_auto_mount_mop` | Auto Mount Mop |  | config |  |
| `switch.heidi_auto_water_refilling` | Auto Water Refilling |  | config |  |
| `switch.heidi_mop_washing_with_detergent` | Mop Washing With Detergent |  | config |  |
| `switch.heidi_self_clean` | Self-Clean |  |  |  |
| `switch.heidi_smart_mop_washing` | Smart Mop Washing |  | config |  |

## Verschleiß und Statistik (22)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `button.heidi_reset_filter` | Reset Filter | ja | diagnostic |  |
| `button.heidi_reset_main_brush` | Reset Main Brush | ja | diagnostic |  |
| `button.heidi_reset_sensor` | Reset Sensor | ja | diagnostic |  |
| `button.heidi_reset_side_brush` | Reset Side Brush | ja | diagnostic |  |
| `button.heidi_reset_wheel` | Reset Wheel | ja | diagnostic |  |
| `sensor.heidi_cleaning_count` | Cleaning Count | ja | diagnostic |  |
| `sensor.heidi_cleaning_history` | Cleaning History | ja | diagnostic |  |
| `sensor.heidi_cruising_history` | Cruising History |  | diagnostic |  |
| `sensor.heidi_filter_left` | Filter Left | ja | diagnostic |  |
| `sensor.heidi_filter_time_left` | Filter Time Left |  | diagnostic |  |
| `sensor.heidi_firmware_version` | Firmware Version |  | diagnostic |  |
| `sensor.heidi_first_cleaning_date` | First Cleaning Date | ja | diagnostic |  |
| `sensor.heidi_main_brush_left` | Main Brush Left | ja | diagnostic |  |
| `sensor.heidi_main_brush_time_left` | Main Brush  Time Left |  | diagnostic |  |
| `sensor.heidi_sensor_dirty_left` | Sensor Dirty Left | ja | diagnostic |  |
| `sensor.heidi_sensor_dirty_time_left` | Sensor Dirty Time Left |  | diagnostic |  |
| `sensor.heidi_side_brush_left` | Side Brush Left | ja | diagnostic |  |
| `sensor.heidi_side_brush_time_left` | Side Brush Time Left |  | diagnostic |  |
| `sensor.heidi_total_cleaned_area` | Total Cleaned Area | ja | diagnostic |  |
| `sensor.heidi_total_cleaning_time` | Total Cleaning Time | ja | diagnostic |  |
| `sensor.heidi_wheel_dirty_left` | Wheel Dirty Left | ja | diagnostic |  |
| `sensor.heidi_wheel_dirty_time_left` | Wheel Dirty Time Left |  | diagnostic |  |

## Hinderniserkennung, Kamera, KI (21)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `binary_sensor.heidi_lds_status` | LDS Status |  |  |  |
| `number.heidi_camera_light_brightness` | Camera Light Brightness |  | config |  |
| `switch.heidi_ai_fluid_detection` | AI Fluid Detection |  | config |  |
| `switch.heidi_ai_furniture_detection` | AI Furniture Detection |  | config |  |
| `switch.heidi_ai_obstacle_detection` | AI Obstacle Detection |  | config |  |
| `switch.heidi_ai_obstacle_image_upload` | AI Obstacle Image Upload |  | config |  |
| `switch.heidi_ai_obstacle_picture` | AI Obstacle Picture |  | config |  |
| `switch.heidi_ai_pet_detection` | AI Pet Detection |  | config |  |
| `switch.heidi_camera_light_brightness_auto` | Camera Light Brightness Auto |  | config |  |
| `switch.heidi_collision_avoidance` | Collision Avoidance |  | config |  |
| `switch.heidi_dynamic_obstacle_cleaning` | Dynamic Obstacle Cleaning |  | config |  |
| `switch.heidi_fill_light` | Fill Light |  | config |  |
| `switch.heidi_fuzzy_obstacle_detection` | Fuzzy Obstacle Detection |  | config |  |
| `switch.heidi_human_follow` | Human Follow |  | config |  |
| `switch.heidi_intelligent_recognition` | Intelligent Recognition |  | config |  |
| `switch.heidi_lds_state` | LDS State |  | diagnostic |  |
| `switch.heidi_obstacle_avoidance` | Obstacle Avoidance |  | config |  |
| `switch.heidi_pet_focused_detection` | Pet Focused Detection |  | config |  |
| `switch.heidi_pet_picture` | Pet Picture |  | config |  |
| `switch.heidi_ring_light_always_on` | Ring Light Always On |  | config |  |
| `switch.heidi_stain_avoidance` | Stain Avoidance |  | config |  |

## Nicht stören, Töne, Sprache, Sperre (11)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `number.heidi_volume` | Volume | ja | config |  |
| `select.heidi_voice_assistant_language` | Voice Assistant Language |  | config |  |
| `switch.heidi_child_lock` | Child Lock |  | config |  |
| `switch.heidi_dnd` | DnD |  | config |  |
| `switch.heidi_dnd_disable_auto_empty` | DnD Disable Auto Empty |  | config |  |
| `switch.heidi_dnd_disable_resume_cleaning` | DnD Disable Resume Cleaning |  | config |  |
| `switch.heidi_dnd_reduce_volume` | DnD Reduce Volume |  | config |  |
| `switch.heidi_streaming_voice_prompt` | Streaming Voice Prompt |  | config |  |
| `switch.heidi_voice_assistant` | Voice Assistant |  | config |  |
| `time.heidi_dnd_end` | DnD End | ja | config |  |
| `time.heidi_dnd_start` | DnD Start | ja | config |  |

## App-Szenen (3)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `button.heidi_reload_shortcuts` | Reload Shortcuts |  | diagnostic |  |
| `button.heidi_shortcut_2` | Shortcut Bad Saugen/Wischen |  |  |  |
| `button.heidi_shortcut_3` | Shortcut Wischen Nach Dem Saugen |  |  |  |

## Nicht zugeordnet (1)

| Entität | Name | v2 | Kat. | aus |
|---|---|---|---|---|
| `select.heidi_auto_lds_coverage` | Auto Lds Coverage |  | config |  |

