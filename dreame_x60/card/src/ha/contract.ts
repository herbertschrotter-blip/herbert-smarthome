// Entitäts-Vertrag (Bauplan Abschnitt 4, eingefroren). Einzige Stelle, die Entitäts-IDs kennt oder bildet (Regel 1).
// Werte 1:1 aus v1 (ha/www/heidi-panel.js: E, RV, RV_HA, RV_ENT, OPT, Personen) und ha/packages/heidi.yaml.
// Anzeige-Dinge (Kurznamen, Icons, Reihenfolge der Chips) gehören nach config.ts, nicht hierher.

export const ROOM_IDS = [1, 2, 3, 4, 5, 6, 7] as const;
export type RoomId = (typeof ROOM_IDS)[number];
export const PLAN_NUMBERS = [1, 2, 3, 4] as const;
export type PlanNumber = (typeof PLAN_NUMBERS)[number];

/** Feste IDs. */
export const ENTITIES = {
  // Roboter (Dreame-Integration)
  vac: 'vacuum.heidi',
  map: 'camera.heidi_map',
  selectedMap: 'select.heidi_selected_map', // Kartenwahl (4.3), nur wenn verfügbar
  mapData: 'camera.heidi_map_data', // Datenkarte (4.3b, Heidi-Karte): Valetudo-Kartenpaket im PNG-Chunk
  status: 'sensor.heidi_status',
  error: 'sensor.heidi_error',
  taskStatus: 'sensor.heidi_task_status',
  battery: 'sensor.heidi_battery_level',
  currentRoom: 'sensor.heidi_current_room',
  cleanedArea: 'sensor.heidi_cleaned_area',
  cleaningTime: 'sensor.heidi_cleaning_time',
  cleaningHistory: 'sensor.heidi_cleaning_history',
  cleaningCount: 'sensor.heidi_cleaning_count',
  totalCleanedArea: 'sensor.heidi_total_cleaned_area',
  totalCleaningTime: 'sensor.heidi_total_cleaning_time',
  firstCleaningDate: 'sensor.heidi_first_cleaning_date',
  mainBrushLeft: 'sensor.heidi_main_brush_left',
  sideBrushLeft: 'sensor.heidi_side_brush_left',
  filterLeft: 'sensor.heidi_filter_left',
  sensorDirtyLeft: 'sensor.heidi_sensor_dirty_left',
  wheelDirtyLeft: 'sensor.heidi_wheel_dirty_left',
  dustBagStatus: 'sensor.heidi_dust_bag_status',
  cleanWaterTankStatus: 'sensor.heidi_clean_water_tank_status',
  dirtyWaterTankStatus: 'sensor.heidi_dirty_water_tank_status',
  detergentStatus: 'sensor.heidi_detergent_status',
  lowWaterWarning: 'sensor.heidi_low_water_warning',
  autoEmptyStatus: 'sensor.heidi_auto_empty_status',
  selfWashBaseStatus: 'sensor.heidi_self_wash_base_status',
  resetMainBrush: 'button.heidi_reset_main_brush',
  resetSideBrush: 'button.heidi_reset_side_brush',
  resetFilter: 'button.heidi_reset_filter',
  resetSensor: 'button.heidi_reset_sensor',
  resetWheel: 'button.heidi_reset_wheel',
  startAutoEmpty: 'button.heidi_start_auto_empty',
  selfClean: 'button.heidi_self_clean',
  manualDrying: 'button.heidi_manual_drying',
  baseStationCleaning: 'button.heidi_base_station_cleaning',
  customizedCleaning: 'switch.heidi_customized_cleaning',
  carpetCleaning: 'select.heidi_carpet_cleaning',
  waterTemperature: 'select.heidi_water_temperature',
  dryingTime: 'select.heidi_drying_time',
  autoEmptyMode: 'select.heidi_auto_empty_mode',
  selfCleanFrequency: 'select.heidi_self_clean_frequency',
  cleangenius: 'select.heidi_cleangenius',
  mapRotation: 'select.heidi_map_rotation',
  selfCleanArea: 'number.heidi_self_clean_area',
  volume: 'number.heidi_volume',
  dndStart: 'time.heidi_dnd_start',
  dndEnd: 'time.heidi_dnd_end',
  // Paket (ha/packages/heidi.yaml)
  heutePlan: 'sensor.heidi_heutiger_plan',
  autoStatus: 'sensor.heidi_automatik_status',
  phase: 'sensor.heidi_phase',
  prognose: 'sensor.heidi_prognose',
  lern: 'sensor.heidi_lernwerte',
  jemand: 'binary_sensor.heidi_jemand_zu_hause',
  arbeitszeit: 'binary_sensor.heidi_arbeitszeit',
  nichtStoeren: 'binary_sensor.heidi_nicht_storen', // ö → o in der ID (HA), nicht „stoeren“
  automatik: 'input_boolean.heidi_automatik',
  dark: 'input_boolean.heidi_dark_mode',
  planerBereich: 'input_boolean.heidi_planer_bereich',
  prognoseAktiv: 'input_boolean.heidi_prognose_aktiv',
  abweichungHeute: 'input_boolean.heidi_abweichung_heute',
  ninaZaehlt: 'input_boolean.heidi_nina_zaehlt',
  progHerbert: 'input_boolean.heidi_prog_herbert',
  progNicole: 'input_boolean.heidi_prog_nicole',
  progNina: 'input_boolean.heidi_prog_nina',
  autoLauf: 'input_boolean.heidi_auto_lauf',
  chairs: 'input_boolean.stuehle_am_boden',
  autoLetzterPlan: 'input_text.heidi_auto_letzter_plan',
  raumSnapshot: 'input_text.heidi_raum_snapshot',
  laufReihenfolge: 'input_text.heidi_lauf_reihenfolge',
  letzteAutoReinigung: 'input_datetime.heidi_letzte_auto_reinigung',
  arbeitszeitStart: 'input_datetime.heidi_arbeitszeit_start',
  arbeitszeitEnde: 'input_datetime.heidi_arbeitszeit_ende',
  rueckkehr: 'input_datetime.heidi_rueckkehr',
  karte: 'input_select.heidi_kartendarstellung',
  raumnamen: 'input_select.heidi_raumnamen',
  beiHeimkehr: 'input_select.heidi_bei_heimkehr',
  schnellMinuten: 'input_number.heidi_schnell_minuten',
  minAkku: 'input_number.heidi_min_akku',
  prognoseIntervall: 'input_number.heidi_prognose_intervall',
  prognoseAufloesung: 'input_number.heidi_prognose_aufloesung',
  prognoseWochen: 'input_number.heidi_prognose_wochen',
  prognoseHalbwert: 'input_number.heidi_prognose_halbwert',
  prognoseMindesttage: 'input_number.heidi_prognose_mindesttage',
} as const;
export type EntityId = (typeof ENTITIES)[keyof typeof ENTITIES] | string;

/** Personen (Reihenfolge wie v1; `optional` = Helfer, der die Person aus der Anwesenheit nimmt). */
export const PERSONS = [
  { id: 'person.herbert_schrotter', key: 'herbert', name: 'Herbert', letter: 'H' },
  { id: 'person.nicole_2', key: 'nicole', name: 'Nicole', letter: 'N' },
  { id: 'person.nina_2', key: 'nina', name: 'Nina', letter: 'N', optional: ENTITIES.ninaZaehlt },
] as const;
export type PersonKey = (typeof PERSONS)[number]['key'];

/** Planer-Helfer je Eintrag N (1..4). */
export const PLAN_TEXT_FIELDS = ['name', 'raeume', 'tage', 'personen', 'raumwerte'] as const;
export const PLAN_SELECT_FIELDS = ['modus', 'saugstufe', 'wasser', 'route', 'wiederholungen', 'homeoffice', 'ho_saug', 'ho_wdh', 'sp_saug', 'sp_wdh'] as const;
export const PLAN_BOOL_FIELDS = ['aktiv', 'schnell'] as const;
export const PLAN_TIME_FIELDS = ['zeit'] as const;
export type PlanField = (typeof PLAN_TEXT_FIELDS)[number] | (typeof PLAN_SELECT_FIELDS)[number] | (typeof PLAN_BOOL_FIELDS)[number] | (typeof PLAN_TIME_FIELDS)[number];

export function planEntity(n: PlanNumber, feld: PlanField): string {
  const domain = (PLAN_TEXT_FIELDS as readonly string[]).includes(feld) ? 'input_text'
    : (PLAN_SELECT_FIELDS as readonly string[]).includes(feld) ? 'input_select'
    : (PLAN_BOOL_FIELDS as readonly string[]).includes(feld) ? 'input_boolean' : 'input_datetime';
  return `${domain}.heidi_plan${n}_${feld}`;
}

/** Raum-Selects des Roboters je Raum-ID (1..7). */
export const ROOM_SELECT_FIELDS = ['cleaning_mode', 'suction_level', 'cleaning_times', 'mop_pad_humidity', 'cleaning_route'] as const;
export type RoomSelectField = (typeof ROOM_SELECT_FIELDS)[number];

export function roomEntity(id: RoomId, feld: RoomSelectField): string {
  return `select.heidi_room_${id}_${feld}`;
}

/** Zulässige Optionsstrings: deutsch für die Helfer (heidi.yaml), HA-Werte für die Dreame-Selects. */
export const HA_OPTIONS = {
  modus: ['Saugen', 'Saugen + Wischen', 'Nur Wischen'],
  saug: ['Leise', 'Standard', 'Stark', 'Turbo'],
  wasser: ['Wenig', 'Mittel', 'Viel'],
  route: ['Standard', 'Intensiv', 'Tief'], // wirkt nur bei „Nur Wischen“
  wdh: ['1', '2', '3'],
  ho: ['Warten', 'Leise starten'],
  saug3: ['Leise', 'Standard', 'Stark'],
  wdh2: ['1', '2'],
  kartendarstellung: ['Dreame-App', 'Xiaomi-Karte', 'Nur Bild', 'Heidi-Karte'],
  raumnamen: ['Original', 'Deutsch'],
  beiHeimkehr: ['Zur Station', 'Weiterreinigen', 'Pausieren'],
} as const;

/** Raumwerte: Kurzcode (input_text …_raumwerte, Snapshot, Skript) ↔ deutsche Bezeichnung ↔ HA-Option ↔ Select-Feld. */
export const ROOM_VALUE_CODES = {
  RV: {
    modus: { S: 'Saugen', B: 'Saugen + Wischen', W: 'Nur Wischen' },
    saug: { L: 'Leise', S: 'Standard', K: 'Stark', T: 'Turbo' },
    wasser: { W: 'Wenig', M: 'Mittel', V: 'Viel' },
    route: { S: 'Standard', I: 'Intensiv', T: 'Tief' },
  },
  RV_HA: {
    modus: { sweeping: 'Saugen', sweeping_and_mopping: 'Saugen + Wischen', mopping: 'Nur Wischen' },
    saug: { quiet: 'Leise', standard: 'Standard', strong: 'Stark', turbo: 'Turbo' },
    wasser: { slightly_dry: 'Wenig', moist: 'Mittel', wet: 'Viel' },
    route: { standard: 'Standard', intensive: 'Intensiv', deep: 'Tief' },
  },
  RV_ENT: { modus: 'cleaning_mode', saug: 'suction_level', wasser: 'mop_pad_humidity', route: 'cleaning_route', wdh: 'cleaning_times' },
  RV_KEYS: ['modus', 'saug', 'wasser', 'route', 'wdh'],
} as const;
export type RoomValueKey = (typeof ROOM_VALUE_CODES.RV_KEYS)[number];

/** Dienste, die v1 aufruft (Namen und Payload-Form unverändert). */
export const SERVICES = {
  vacuum: { domain: 'vacuum', services: ['start', 'pause', 'stop', 'return_to_base', 'locate'] },
  cleanSegment: { domain: 'dreame_vacuum', service: 'vacuum_clean_segment' }, // { entity_id, segments, repeats?, suction_level? }
  setRestrictedZone: { domain: 'dreame_vacuum', service: 'vacuum_set_restricted_zone' }, // { entity_id, zones, no_mops, walls? } – ersetzt alle
  planStarten: { domain: 'script', service: 'heidi_plan_starten' }, // { plan: 1..4, variante: normal|schnell|leise }
  appSzene: { domain: 'script', service: 'heidi_app_szene' }, // { shortcut_id }
  prognoseReset: { domain: 'shell_command', service: 'heidi_prognose_reset' },
  press: { domain: 'button', service: 'press' },
  selectOption: { domain: 'select', service: 'select_option' },
  inputSelectOption: { domain: 'input_select', service: 'select_option' },
  inputText: { domain: 'input_text', service: 'set_value' },
  inputNumber: { domain: 'input_number', service: 'set_value' },
  inputDatetime: { domain: 'input_datetime', service: 'set_datetime' },
  number: { domain: 'number', service: 'set_value' },
  time: { domain: 'time', service: 'set_value' },
  inputBoolean: { domain: 'input_boolean', services: ['turn_on', 'turn_off', 'toggle'] },
} as const;

/** History-Pfad wie v1 (_loadTimeline). */
export function historyPath(startIso: string, endIso: string): string {
  return `history/period/${startIso}?filter_entity_id=${ENTITIES.phase},${ENTITIES.vac}&end_time=${encodeURIComponent(endIso)}&minimal_response&no_attributes`;
}

/** Alle Vertrags-IDs (für Diagnose-Selektor und check-fixture). */
export function allContractIds(): string[] {
  const ids: string[] = [...Object.values(ENTITIES), ...PERSONS.map((p) => p.id)];
  for (const n of PLAN_NUMBERS) for (const f of [...PLAN_TEXT_FIELDS, ...PLAN_SELECT_FIELDS, ...PLAN_BOOL_FIELDS, ...PLAN_TIME_FIELDS]) ids.push(planEntity(n, f));
  for (const r of ROOM_IDS) for (const f of ROOM_SELECT_FIELDS) ids.push(roomEntity(r, f));
  return [...new Set(ids)];
}
