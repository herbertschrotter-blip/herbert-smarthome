/* Heidi Panel – eigene Home-Assistant-Karte für den Dreame X60 „Heidi“.
 * Rendert die komplette Übersicht (Kopf, Karte, Planer, Automatik, Station, Statistik,
 * Robotereinstellungen, Einstellungs-Panel, Prognose) als HTML/CSS/JS.
 * Alle Daten kommen live aus Home Assistant (hass.states), alle Aktionen laufen über hass.callService.
 */
const HP_VERSION = "1.5.0";

const E = {
  vac: "vacuum.heidi",
  map: "camera.heidi_map",
  persons: [
    { id: "person.herbert_schrotter", name: "Herbert", letter: "H" },
    { id: "person.nicole_2", name: "Nicole", letter: "N" },
    { id: "person.nina_2", name: "Nina", letter: "N", optional: "input_boolean.heidi_nina_zaehlt" },
  ],
  chairs: "input_boolean.stuehle_am_boden",
  automatik: "input_boolean.heidi_automatik",
  autoStatus: "sensor.heidi_automatik_status",
  heutePlan: "sensor.heidi_heutiger_plan",
  prognose: "sensor.heidi_prognose",
  prognoseAktiv: "input_boolean.heidi_prognose_aktiv",
  planerBereich: "input_boolean.heidi_planer_bereich",
  dark: "input_boolean.heidi_dark_mode",
  karte: "input_select.heidi_kartendarstellung",
  raumnamen: "input_select.heidi_raumnamen",
  rotation: "select.heidi_map_rotation",
  jemand: "binary_sensor.heidi_jemand_zu_hause",
  phase: "sensor.heidi_phase", // feiner Arbeitsschritt (Template-Sensor im Paket), Verlauf = Zeitleiste im Protokoll
};
const PHASE_IDLE = ["Schläft", "Lädt", "Angedockt", "Bereit", "unknown", "unavailable", ""];

const ROOMS = [
  { id: 7, short: "Wohnz.", icon: "mdi:sofa-outline" }, { id: 6, short: "Küche", icon: "mdi:chef-hat" }, { id: 5, short: "Büro", icon: "mdi:desk" },
  { id: 4, short: "Flur", icon: "mdi:foot-print" }, { id: 3, short: "WC", icon: "mdi:toilet" }, { id: 2, short: "Schlafz.", icon: "mdi:bed-king-outline" }, { id: 1, short: "Bad", icon: "mdi:shower" },
];
const ROOMS_DE = { Bathroom: "Bad", "Primary Bedroom": "Schlafzimmer", WC: "WC", Corridor: "Flur", Study: "Büro", Kitchen: "Küche", "Living Room": "Wohnzimmer" };
const STATUS_DE = { sleeping: "schläft", charging: "lädt", cleaning: "reinigt", sweeping: "saugt", mopping: "wischt", sweeping_and_mopping: "saugt und wischt", returning: "fährt zur Station", paused: "pausiert", idle: "bereit", docked: "angedockt", washing: "Mopp-Wäsche", drying: "trocknet", auto_emptying: "saugt ab", error: "Fehler", charging_completed: "voll geladen", segment_cleaning: "reinigt Räume", zone_cleaning: "reinigt Zone", spot_cleaning: "reinigt Punkt", cruising: "fährt" };
const APP_SCENES = [
  { id: 32, name: "Eingang reinigen", sub: "Flur · Saugen + Wischen · 2×", icon: "mdi:door-open" },
  { id: 33, name: "Bad Saugen/Wischen", sub: "Bad · 1×", icon: "mdi:shower" },
  { id: 34, name: "Wischen nach dem Saugen", sub: "Ganze Wohnung · nur Wischen", icon: "mdi:water" },
];
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
// Raum-Einstellungen sind am Roboter aktiv (switch.heidi_customized_cleaning): alle Werte gelten je Raum.
// "Saugen, dann Wischen" und Route "Schnell" gibt es nur global und sind deshalb nicht mehr wählbar.
const OPT = {
  modus: ["Saugen", "Saugen + Wischen", "Nur Wischen"],
  saug: ["Leise", "Standard", "Stark", "Turbo"],
  wasser: ["Wenig", "Mittel", "Viel"],
  route: ["Standard", "Intensiv", "Tief"], // nur bei "Nur Wischen"
  wdh: ["1", "2", "3"],
  ho: ["Warten", "Leise starten"],
  saug3: ["Leise", "Standard", "Stark"],
  wdh2: ["1", "2"],
};
// Raumwerte: Kurzcodes (input_text.heidi_planN_raumwerte, Snapshot, Skript) ↔ deutsche Bezeichnung ↔ HA-Option
const RV = {
  modus: { S: "Saugen", B: "Saugen + Wischen", W: "Nur Wischen" },
  saug: { L: "Leise", S: "Standard", K: "Stark", T: "Turbo" },
  wasser: { W: "Wenig", M: "Mittel", V: "Viel" },
  route: { S: "Standard", I: "Intensiv", T: "Tief" },
};
const RV_HA = {
  modus: { sweeping: "Saugen", sweeping_and_mopping: "Saugen + Wischen", mopping: "Nur Wischen" },
  saug: { quiet: "Leise", standard: "Standard", strong: "Stark", turbo: "Turbo" },
  wasser: { slightly_dry: "Wenig", moist: "Mittel", wet: "Viel" },
  route: { standard: "Standard", intensive: "Intensiv", deep: "Tief" },
};
const RV_ENT = { modus: "cleaning_mode", saug: "suction_level", wasser: "mop_pad_humidity", route: "cleaning_route", wdh: "cleaning_times" };
const RV_KEYS = ["modus", "saug", "wasser", "route", "wdh"];
const inv = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
// "1:B/T/V/-/2;2:S/L/-/-/1"  →  { 1: {modus:"Saugen + Wischen", saug:"Turbo", wasser:"Viel", route:null, wdh:"2"}, … }
const parseRaum = (s) => {
  const out = {};
  String(s || "").split(";").forEach((p) => {
    const [id, rest] = p.split(":"); if (!id || !rest) return; const f = rest.split("/");
    const n = parseInt(id); if (!(n >= 1 && n <= 7)) return;
    out[n] = { modus: RV.modus[f[0]] || "Saugen", saug: RV.saug[f[1]] || "Standard", wasser: RV.wasser[f[2]] || null, route: RV.route[f[3]] || null, wdh: /^[123]$/.test(f[4]) ? f[4] : "1" };
  });
  return out;
};
const encodeRaum = (o) => Object.keys(o).map((n) => parseInt(n)).sort((a, b) => a - b).map((n) => {
  const v = o[n], c = (k) => inv(RV[k])[v[k]] || "-";
  return `${n}:${c("modus")}/${c("saug")}/${v.modus === "Saugen" ? "-" : c("wasser")}/${v.modus === "Nur Wischen" ? c("route") : "-"}/${v.wdh || "1"}`;
}).join(";");

const CSS = `
:host { display: block; }
* { box-sizing: border-box; }
.root {
  --bg: #0c1219; --solid: #141c25; --surface: rgba(255,255,255,.045); --surface-2: rgba(255,255,255,.055); --surface-3: rgba(255,255,255,.09); --line: rgba(255,255,255,.09);
  --text: #e8edf2; --muted: #94a4b4; --accent: #2fd1b6; --accent-soft: rgba(47,209,182,.16); --accent-ink: #9be9db;
  --good: #43d17a; --warn: #f2b544; --bad: #ff6b6b; --blue: #5aa9ff;
  --glow1: rgba(47,209,182,.16); --glow2: rgba(90,169,255,.12);
  --shadow: 0 10px 30px rgba(0,0,0,.35); --radius: 16px;
  color: var(--text); font-family: "IBM Plex Sans", Roboto, system-ui, sans-serif; font-size: 14px; line-height: 1.4; font-variant-numeric: tabular-nums;
  background: radial-gradient(900px 500px at 8% -10%, var(--glow1), transparent 60%), radial-gradient(800px 500px at 100% 30%, var(--glow2), transparent 60%), radial-gradient(700px 400px at 40% 110%, var(--glow1), transparent 60%), var(--bg);
  padding: 12px 12px 40px; min-height: 100vh;
}
.root.light {
  --bg: #e9eef3; --solid: #ffffff; --surface: rgba(255,255,255,.55); --surface-2: rgba(255,255,255,.6); --surface-3: rgba(20,40,60,.08); --line: rgba(20,40,60,.10);
  --text: #16202a; --muted: #5f7080; --accent: #0fa892; --accent-soft: rgba(15,168,146,.14); --accent-ink: #0a6e61;
  --good: #2f9e63; --warn: #d98c1a; --bad: #d04b4b; --blue: #2f6fd0;
  --glow1: rgba(15,168,146,.18); --glow2: rgba(90,169,255,.18);
  --shadow: 0 8px 24px rgba(20,40,60,.10);
}
button { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
ha-icon { --mdc-icon-size: 18px; }
.num, h1, h2 { font-family: "Sora", "IBM Plex Sans", Roboto, system-ui, sans-serif; }
.wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 14px; }
.topbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.topbar h1 { margin: 0; font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.logo { width: 34px; height: 34px; border-radius: 50%; background: var(--accent); color: var(--bg); display: grid; place-items: center; }
.tabs { margin-left: auto; display: flex; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 3px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.tab { padding: 6px 14px; border-radius: 999px; border: 0; background: transparent; color: var(--muted); font-weight: 500; }
.tab.on { background: var(--surface-3); color: var(--text); }
.iconbtn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); display: grid; place-items: center; }
.grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 14px; }
.col { display: grid; gap: 14px; align-content: start; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: inset 0 1px 0 rgba(255,255,255,.06); }
.card h2 { margin: 0 0 12px; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.card h2 ha-icon { --mdc-icon-size: 16px; }
.card h2 .r { margin-left: auto; font-weight: 500; text-transform: none; letter-spacing: 0; font-family: inherit; display: flex; align-items: center; gap: 8px; }
/* Kopf */
.hero { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; }
@media (max-width: 560px) { .hero { grid-template-columns: auto 1fr; } .hero .ctl { grid-column: 1 / -1; } }
.ring { width: 96px; height: 96px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; display: grid; place-items: center; position: relative; background: conic-gradient(var(--rc, var(--accent)) calc(var(--p) * 1%), var(--surface-3) 0); }
.ring::after { content: ""; position: absolute; inset: 8px; border-radius: 50%; background: var(--solid); }
.ring .num { position: relative; z-index: 1; font-size: 22px; font-weight: 700; text-align: center; line-height: 1.1; }
.ring .num small { display: block; font-size: 11px; font-weight: 500; color: var(--muted); font-family: inherit; }
.status { display: grid; gap: 8px; min-width: 0; }
.status .big { font-family: "Sora", "IBM Plex Sans", Roboto, sans-serif; font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--good); box-shadow: 0 0 0 4px color-mix(in srgb, var(--good) 25%, transparent); flex: none; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--line); font-size: 12px; font-weight: 500; color: var(--muted); }
.chip ha-icon { --mdc-icon-size: 14px; }
.chip.on { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
.chip.warn { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 50%, var(--line)); }
.chip.bad { color: var(--bad); border-color: color-mix(in srgb, var(--bad) 50%, var(--line)); }
.ctl { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 8px; min-width: 150px; }
.status .sub { font-size: 13px; color: var(--muted); margin-top: -4px; display: flex; align-items: center; gap: 6px; }
.status .sub ha-icon { --mdc-icon-size: 15px; color: var(--accent); }
.btn { border: 1px solid var(--line); background: var(--surface-2); color: var(--text); border-radius: 12px; padding: 10px 6px 8px; display: grid; justify-items: center; gap: 4px; font-size: 11px; font-weight: 500; }
.btn.primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.btn:disabled { opacity: .45; cursor: default; }
/* Karte */
.mapwrap { position: relative; border-radius: 12px; overflow: hidden; }
.mapwrap > * { display: block; }
.mapwrap .tools { position: absolute; right: 10px; bottom: 10px; display: flex; gap: 6px; z-index: 2; }
.tb { border: 1px solid var(--line); background: var(--solid); color: var(--text); border-radius: 10px; padding: 7px 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; box-shadow: var(--shadow); }
.tb ha-icon { --mdc-icon-size: 16px; }
.tb.warn { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 55%, var(--line)); }
/* Einstellungs-Streifen im Kopf */
.strip { display: grid; gap: 6px; padding-top: 10px; margin-top: 12px; border-top: 1px solid var(--line); cursor: pointer; }
.strip .lab { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 600; display: flex; gap: 8px; align-items: center; }
.strip .lab .r { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--accent); display: flex; align-items: center; gap: 2px; }
.strip .lab .r ha-icon { --mdc-icon-size: 16px; }
.chip.k { color: var(--text); } .chip.k b { color: var(--muted); font-weight: 500; }
/* Untermenü Räume */
.rlist { display: grid; gap: 8px; }
.rr { display: grid; gap: 4px; padding: 10px 12px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.rr.std .rc { opacity: .45; }
.rr .rn { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 2px; } .rr .rn ha-icon { --mdc-icon-size: 18px; color: var(--muted); }
.rr .rn .chip { margin-left: auto; cursor: pointer; padding: 4px 10px; font-size: 11px; }
.rr .rc { display: grid; grid-template-columns: 72px 1fr; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
.rr .rc.dim { opacity: .35; }
.seg.dis button { pointer-events: none; }
.rr.all { background: color-mix(in srgb, var(--accent) 8%, var(--surface-2)); border-color: color-mix(in srgb, var(--accent) 35%, var(--line)); }
.ed .rooms .chip { position: relative; } .dotm { position: absolute; top: 5px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
.ed .btnrow { display: flex; gap: 8px; flex-wrap: wrap; } .ed .btnrow .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; font-size: 13px; }
.hint { font-size: 12px; color: var(--muted); }
.rooms { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 10px; }
@media (max-width: 900px) { .rooms { grid-template-columns: repeat(4, 1fr); } }
.rooms .btn { padding: 8px 4px 6px; border-radius: 10px; }
.rooms .btn.sel { border-color: var(--accent); color: var(--accent); }
.roomrun { margin-top: 8px; display: flex; gap: 8px; align-items: center; }
.roomrun .btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; font-size: 13px; }
/* Verschleiß */
.cons { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
@media (max-width: 520px) { .cons { grid-template-columns: repeat(3, 1fr); } }
.cons button { display: grid; justify-items: center; gap: 4px; border: 0; background: transparent; padding: 0; }
.mini { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; position: relative; background: conic-gradient(var(--v, var(--accent)) calc(var(--p) * 1%), var(--surface-3) 0); }
.mini::after { content: ""; position: absolute; inset: 5px; border-radius: 50%; background: var(--solid); }
.mini span { position: relative; z-index: 1; font: 600 12px "Sora", "IBM Plex Sans", Roboto, sans-serif; }
.cons .l { font-size: 11px; color: var(--muted); }
/* Automatik */
.auto { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; }
.auto .t { font-weight: 600; }
.auto .s { font-size: 12px; color: var(--muted); }
.sw { width: 38px; height: 22px; border-radius: 999px; background: var(--surface-3); position: relative; cursor: pointer; flex: none; transition: background .2s; }
.sw::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .15s; }
.on > .sw, .sw.on { background: var(--accent); }
.on > .sw::after, .sw.on::after { left: 19px; }
/* Planer */
.plan { display: grid; gap: 6px; }
.pr { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto auto auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.pr.today { border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); }
.pr.off { opacity: .5; }
.pr .ic { width: 34px; height: 34px; border-radius: 9px; background: var(--surface-3); display: grid; place-items: center; color: var(--accent); }
.pr .ic.blue { color: var(--blue); }
.pr .n { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr .s { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tag { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--muted); white-space: nowrap; }
.tag.acc { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
.ib { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--text); display: grid; place-items: center; }
.ib ha-icon { --mdc-icon-size: 16px; }
.ib.go { color: var(--accent); }
/* Kacheln */
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tiles.four { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 520px) { .tiles.four { grid-template-columns: repeat(2, 1fr); } }
.tile { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 10px; display: grid; gap: 2px; min-width: 0; }
.tile .k { font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.tile .k ha-icon { --mdc-icon-size: 14px; }
.tile .num { font-size: 18px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tile .num small { font-size: 11px; color: var(--muted); font-weight: 500; margin-left: 3px; font-family: inherit; }
.tile.warn .num { color: var(--warn); }
.tile.bad .num { color: var(--bad); }
.bar { height: 5px; border-radius: 3px; background: var(--surface-3); overflow: hidden; margin-top: 4px; }
.bar i { display: block; height: 100%; background: var(--v, var(--accent)); }
button.tile { text-align: left; cursor: pointer; }
.stbtns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
.stbtns .btn { padding: 8px 4px 6px; font-size: 10px; }
/* Protokoll */
.hist { display: grid; gap: 4px; margin-top: 8px; max-height: 320px; overflow: auto; }
.hrow { display: grid; grid-template-columns: 1fr 58px 58px 96px 22px; align-items: center; gap: 8px; font-size: 12px; padding: 6px 8px; border-radius: 8px; background: var(--surface-2); }
.hrow .hd { color: var(--text); font-weight: 500; }
.hrow .hm { color: var(--blue); } .hrow .hm ha-icon { --mdc-icon-size: 14px; }
.hrow[data-tl] { cursor: pointer; } .hrow[data-tl]:hover, .hrow.open { background: var(--surface-3); }
.tl { display: grid; gap: 2px; margin: 0 0 6px 14px; padding-left: 10px; border-left: 2px solid color-mix(in srgb, var(--accent) 55%, transparent); }
.tlr { display: grid; grid-template-columns: 42px 1fr auto; gap: 8px; align-items: center; font-size: 12px; padding: 3px 6px; color: var(--muted); }
.tlr .tt { color: var(--text); font-weight: 500; font-variant-numeric: tabular-nums; } .tlr .tx { color: var(--text); } .tlr .td { font-variant-numeric: tabular-nums; white-space: nowrap; }
.tlr.now .tx { color: var(--accent); }
/* Klappbereiche */
details { border-top: 1px solid var(--line); padding-top: 8px; margin-top: 10px; }
summary { cursor: pointer; color: var(--muted); font-size: 12px; font-weight: 500; list-style: none; display: flex; align-items: center; gap: 6px; }
summary::-webkit-details-marker { display: none; }
summary ha-icon { --mdc-icon-size: 14px; transition: transform .2s; }
details[open] > summary ha-icon.chev { transform: rotate(180deg); }
.set { display: grid; gap: 4px; margin-top: 8px; }
.set .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line); gap: 12px; }
.set .row:last-child { border-bottom: 0; }
.set .sub { font-size: 12px; color: var(--muted); }
select, input[type=text], input[type=time] { background: var(--solid); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; font: inherit; font-size: 13px; max-width: 100%; }
input[type=range] { accent-color: var(--accent); width: 130px; }
.hint { font-size: 12px; color: var(--muted); margin-top: 8px; }
/* Panel / Modal */
.scrim { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 20; }
.panel { position: fixed; top: 0; right: 0; bottom: 0; width: min(380px, 100%); background: var(--solid); color: var(--text); z-index: 21; box-shadow: -8px 0 30px rgba(0,0,0,.35); padding: 20px; overflow: auto; display: grid; gap: 18px; align-content: start; }
.panel h2, .modal h2 { margin: 0; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; text-transform: none; letter-spacing: 0; color: var(--text); }
.panel h3 { margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.seg { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; background: var(--surface-3); padding: 4px; border-radius: 10px; }
.seg button { border: 0; border-radius: 8px; padding: 8px 6px; background: transparent; color: var(--muted); font-weight: 500; font-size: 13px; }
.seg button.on { background: var(--solid); color: var(--text); box-shadow: var(--shadow); }
.prow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.prow:last-child { border-bottom: 0; }
.prow .d { font-size: 12px; color: var(--muted); }
.modal { position: fixed; inset: 0; z-index: 25; display: grid; place-items: center; padding: 16px; }
.modal .box { width: min(560px, 100%); max-height: 92vh; overflow: auto; background: var(--solid); color: var(--text); border-radius: 16px; box-shadow: var(--shadow); padding: 20px; display: grid; gap: 14px; }
.modal label.f { display: grid; gap: 6px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.frow { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (max-width: 480px) { .frow { grid-template-columns: 1fr; } }
.modal .foot { display: flex; gap: 8px; justify-content: flex-end; }
.modal .foot .btn, .ztools .btn { padding: 10px 16px; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
.switchrow { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); cursor: pointer; }
.switchrow .ic { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; background: var(--surface-3); color: var(--muted); flex-shrink: 0; }
.switchrow.on .ic { background: var(--accent-soft); color: var(--accent); }
.switchrow .t { font-weight: 500; }
.switchrow .s { font-size: 12px; color: var(--muted); }
.switchrow .sw { margin-left: auto; }
.toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 10px 16px; border-radius: 10px; font-weight: 500; z-index: 30; box-shadow: var(--shadow); }
/* Prognose */
.pgrid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
@media (max-width: 800px) { .pgrid { grid-template-columns: 1fr; } }
.fc { display: grid; gap: 8px; }
.fc .row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.fc .row .k { font-size: 12px; color: var(--muted); }
.fc .row .v { font-weight: 600; font-size: 16px; font-family: "Sora", "IBM Plex Sans", Roboto, sans-serif; }
.fc .row .conf { margin-left: auto; font-size: 11px; padding: 2px 8px; border-radius: 6px; background: var(--surface-3); color: var(--muted); }
.fc .row .conf.hi { color: var(--good); } .fc .row .conf.mid { color: var(--warn); }
.datab { height: 6px; border-radius: 3px; background: var(--surface-3); overflow: hidden; }
.datab i { display: block; height: 100%; background: var(--accent); }
.pill.small { font-size: 11px; padding: 3px 8px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--line); font-weight: 500; }
.heat img { width: 100%; border-radius: 8px; display: block; margin-bottom: 12px; }
.heat .n { font-weight: 600; margin-bottom: 6px; }
/* Planer-Editor */
.modal .box.ed { gap: 16px; background: color-mix(in srgb, var(--solid) 82%, transparent); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid var(--line); }
.ed .sec { display: grid; gap: 8px; }
.ed .lab { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 8px; }
.ed .lab .r { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; font-size: 12px; display: flex; align-items: center; gap: 8px; }
.ed input[type=text] { width: 100%; font-size: 15px; padding: 10px 12px; border-radius: 10px; }
.ed .chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ed .chip { cursor: pointer; padding: 7px 12px; font-size: 13px; }
.ed .rooms { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 0; }
@media (max-width: 520px) { .ed .rooms { grid-template-columns: repeat(4, 1fr); } }
.ed .rooms .chip { border-radius: 12px; padding: 9px 4px 7px; display: grid; justify-items: center; gap: 4px; font-size: 11px; }
.ed .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.ed .days .chip { justify-content: center; border-radius: 12px; padding: 9px 0; }
.ed .seg button { padding: 9px 6px; }
.ed .seg.s { padding: 3px; } .ed .seg.s button { padding: 6px 4px; font-size: 12px; }
.ed .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 520px) { .ed .two { grid-template-columns: 1fr; } }
.crow { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--line); }
.crow .ic { width: 34px; height: 34px; border-radius: 9px; background: var(--surface-3); display: grid; place-items: center; color: var(--muted); }
.crow .ic.on { color: var(--accent); background: var(--accent-soft); }
.crow .t { font-weight: 600; } .crow .s { font-size: 12px; color: var(--muted); }
.crow .sub { grid-column: 2 / 4; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.crow .sub .chip { padding: 5px 10px; font-size: 12px; }
.mini { width: 100%; display: grid; gap: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
.mlab { font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.mrow { display: grid; grid-template-columns: 110px 1fr; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
@media (max-width: 480px) { .mrow { grid-template-columns: 1fr; } }
.timebtn { display: inline-flex; align-items: center; gap: 10px; background: var(--solid); border: 1px solid var(--line); border-radius: 10px; padding: 8px 14px; font-family: "Sora", "IBM Plex Sans", Roboto, sans-serif; font-size: 22px; font-weight: 600; color: var(--text); }
.timebtn small { font: 500 12px "IBM Plex Sans", Roboto, sans-serif; color: var(--muted); }
.clock { display: grid; justify-items: center; gap: 10px; background: var(--solid); border: 1px solid var(--line); border-radius: 16px; padding: 14px; margin-top: 8px; }
.clock .hd { display: flex; gap: 6px; align-items: baseline; font-family: "Sora", sans-serif; font-size: 34px; font-weight: 600; }
.clock .hd span { cursor: pointer; padding: 2px 8px; border-radius: 8px; color: var(--muted); }
.clock .hd span.on { color: var(--text); background: var(--surface-3); }
.dial { position: relative; width: 240px; height: 240px; border-radius: 50%; background: var(--surface-3); user-select: none; }
.dial .n { position: absolute; width: 32px; height: 32px; margin: -16px; border-radius: 50%; border: 0; background: transparent; color: var(--text); display: grid; place-items: center; font-size: 13px; font-weight: 500; padding: 0; }
.dial .n.sel { background: var(--accent); color: var(--bg); font-weight: 600; }
.dial .hand { position: absolute; left: 50%; top: 50%; width: 2px; background: var(--accent); transform-origin: top center; margin-left: -1px; }
.dial .hub { position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px; border-radius: 50%; background: var(--accent); }
.clock .cfoot { display: flex; gap: 8px; justify-content: flex-end; width: 100%; }
.clock .cfoot .btn, .ed .foot .btn { display: inline-flex; padding: 10px 16px; font-size: 13px; }
.ed .foot { display: flex; gap: 8px; justify-content: flex-end; padding-top: 10px; border-top: 1px solid var(--line); }
/* Zonen-Editor */
.zwrap { position: relative; border-radius: 10px; overflow: hidden; background: #1c2732; touch-action: none; user-select: none; }
.zwrap img { display: block; width: 100%; height: auto; pointer-events: none; }
.zwrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.zwrap rect.z { fill: rgba(239,107,107,.28); stroke: #ef6b6b; stroke-width: 2; vector-effect: non-scaling-stroke; cursor: pointer; }
.zwrap rect.m { fill: rgba(90,160,240,.28); stroke: #5aa0f0; stroke-width: 2; vector-effect: non-scaling-stroke; cursor: pointer; }
.zwrap rect.sel { stroke-width: 4; stroke-dasharray: 6 4; }
.zwrap rect.draft { fill: rgba(47,209,182,.25); stroke: #2fd1b6; stroke-width: 2; stroke-dasharray: 6 4; vector-effect: non-scaling-stroke; }
.zwrap text { font-size: 11px; fill: #fff; pointer-events: none; }
.ztools { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ztools .btn.danger { background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
[hidden] { display: none !important; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ic = (name, extra = "") => `<ha-icon icon="${name}" ${extra}></ha-icon>`;

class HeidiPanel extends HTMLElement {
  static getStubConfig() { return {}; }
  setConfig(config) { this._config = config || {}; }
  getCardSize() { return 20; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._open = new Set(["verbrauch"]);
    this._tl = {};            // Zeitleisten-Cache je Lauf (Schlüssel = Zeitstempel bzw. "cur")
    this._tlOpen = new Set(); // aufgeklappte Protokoll-Einträge
    this._rooms = null;       // Untermenü Räume: { mode: "robot"|"plan", back: "editor"|null }
    this._view = "main";
    this._sig = "";
    this._mapEls = {};
    this._editing = null;
    this._panel = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (this._mapEl) this._mapEl.hass = hass;
    if (!this._built) { this._build(); this._built = true; }
    const sig = this._signature();
    if (sig !== this._sig && !this._editing && !this._zones) { this._sig = sig; this._render(); }
    else if (this._editing && this._rooms?.mode === "robot" && sig !== this._sig) { this._sig = sig; this._renderOverlay(); }
    else if (this._editing) { /* Editor offen: nur Kopf still lassen */ }
  }

  // ───────── Helpers ─────────
  st(id) { const s = this._hass?.states?.[id]; return s ? s.state : "unavailable"; }
  attr(id, a) { return this._hass?.states?.[id]?.attributes?.[a]; }
  on(id) { return this.st(id) === "on"; }
  num(id, d = 0) { const v = parseFloat(this.st(id)); return isNaN(v) ? d : v; }
  $(sel) { return this.shadowRoot.querySelector(sel); }
  $$(sel) { return Array.from(this.shadowRoot.querySelectorAll(sel)); }
  call(domain, service, data) { return this._hass.callService(domain, service, data); }
  toggle(id) { return this.call("input_boolean", "toggle", { entity_id: id }); }
  roomName(r) { if (!r || ["unknown", "unavailable"].includes(r)) return "–"; return this.st(E.raumnamen) === "Deutsch" ? (ROOMS_DE[r] || r) : r; }
  toast(msg) { let t = this.$(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; this.shadowRoot.appendChild(t); } t.textContent = msg; clearTimeout(this._tt); this._tt = setTimeout(() => t.remove(), 2400); }
  fmtDate(iso) { const d = new Date(iso); if (isNaN(d)) return "–"; const today = new Date(); const same = d.toDateString() === today.toDateString(); return (same ? "heute" : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" })) + " " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); }

  _signature() {
    const ids = [E.vac, E.autoStatus, E.heutePlan, E.prognose, E.prognoseAktiv, E.planerBereich, E.dark, E.karte, E.raumnamen, E.rotation, E.jemand, E.chairs, E.automatik,
      "sensor.heidi_status", E.phase, "sensor.heidi_battery_level", "sensor.heidi_current_room", "sensor.heidi_error", "sensor.heidi_cleaning_history", "sensor.heidi_cleaned_area", "sensor.heidi_cleaning_time",
      "sensor.heidi_main_brush_left", "sensor.heidi_side_brush_left", "sensor.heidi_filter_left", "sensor.heidi_sensor_dirty_left", "sensor.heidi_wheel_dirty_left",
      "sensor.heidi_dust_bag_status", "sensor.heidi_clean_water_tank_status", "sensor.heidi_dirty_water_tank_status", "sensor.heidi_detergent_status", "sensor.heidi_low_water_warning", "sensor.heidi_auto_empty_status", "sensor.heidi_self_wash_base_status",
      "sensor.heidi_cleaning_count", "sensor.heidi_total_cleaned_area", "sensor.heidi_total_cleaning_time", "sensor.heidi_first_cleaning_date",
      "select.heidi_carpet_cleaning", "select.heidi_water_temperature", "select.heidi_drying_time", "select.heidi_auto_empty_mode", "select.heidi_self_clean_frequency", "number.heidi_self_clean_area", "select.heidi_cleangenius", "number.heidi_volume", "time.heidi_dnd_start", "time.heidi_dnd_end",
      "input_datetime.heidi_arbeitszeit_start", "input_datetime.heidi_arbeitszeit_ende", "binary_sensor.heidi_arbeitszeit", "input_datetime.heidi_rueckkehr", "input_number.heidi_schnell_minuten", "input_number.heidi_min_akku", "input_select.heidi_bei_heimkehr", "input_boolean.heidi_nina_zaehlt", "input_text.heidi_auto_letzter_plan", "input_datetime.heidi_letzte_auto_reinigung",
      "input_boolean.heidi_abweichung_heute", "input_boolean.heidi_prog_herbert", "input_boolean.heidi_prog_nicole", "input_boolean.heidi_prog_nina",
      "input_number.heidi_prognose_intervall", "input_number.heidi_prognose_aufloesung", "input_number.heidi_prognose_wochen", "input_number.heidi_prognose_halbwert", "input_number.heidi_prognose_mindesttage"];
    E.persons.forEach((p) => ids.push(p.id));
    for (let n = 1; n <= 4; n++) {
      ["aktiv", "schnell"].forEach((k) => ids.push(`input_boolean.heidi_plan${n}_${k}`));
      ["name", "raeume", "tage", "personen", "raumwerte"].forEach((k) => ids.push(`input_text.heidi_plan${n}_${k}`));
      ids.push(`input_datetime.heidi_plan${n}_zeit`);
      ["modus", "saugstufe", "wasser", "route", "wiederholungen", "homeoffice", "ho_saug", "ho_wdh", "sp_saug", "sp_wdh"].forEach((k) => ids.push(`input_select.heidi_plan${n}_${k}`));
    }
    for (let r = 1; r <= 7; r++) RV_KEYS.forEach((k) => ids.push(`select.heidi_room_${r}_${RV_ENT[k]}`));
    ids.push("switch.heidi_customized_cleaning", "input_boolean.heidi_auto_lauf", "input_text.heidi_raum_snapshot");
    const s = this._hass.states;
    return ids.map((i) => { const x = s[i]; return x ? x.state + "|" + (x.last_updated || "") : "?"; }).join(";") + "|" + this._view + "|" + this._panel;
  }

  _build() {
    if (!document.getElementById("heidi-fonts")) { const l = document.createElement("link"); l.id = "heidi-fonts"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"; document.head.appendChild(l); }
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="root"><div class="wrap"><div class="topbar"></div><div id="viewMain"></div><div id="viewProg" hidden></div></div><div id="overlay"></div></div>`;
    this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
    this.shadowRoot.addEventListener("change", (e) => this._onChange(e));
    this.shadowRoot.addEventListener("input", (e) => { const t = e.target; if (t.dataset.ed === "name" && this._ed) this._ed.name = t.value; if (t.type === "range" && t.dataset.number) { const b = t.parentElement.querySelector("b"); if (b) b.textContent = `${t.value}${t.dataset.unit || ""}`; } });
    this.shadowRoot.addEventListener("keydown", (e) => { if (e.key === "Escape") { this._closeOverlays(); } });
  }

  // ───────── Rendering ─────────
  _render() {
    const root = this.$(".root");
    root.classList.toggle("light", !this.on(E.dark));
    this._renderTop();
    if (this._view === "prog") { this.$("#viewMain").hidden = true; this.$("#viewProg").hidden = false; this._renderProg(); }
    else { this.$("#viewProg").hidden = true; this.$("#viewMain").hidden = false; this._renderMain(); }
    this._renderOverlay();
  }

  _renderTop() {
    const prog = this.on(E.prognoseAktiv);
    if (!prog && this._view === "prog") this._view = "main";
    this.$(".topbar").innerHTML = `
      <h1><span class="logo">${ic("mdi:robot-vacuum")}</span>Heidi</h1>
      <div class="tabs"><button class="tab ${this._view === "main" ? "on" : ""}" data-view="main">Übersicht</button>${prog ? `<button class="tab ${this._view === "prog" ? "on" : ""}" data-view="prog">Prognose</button>` : ""}</div>
      <button class="iconbtn" data-act="settings" aria-label="Dashboard-Einstellungen" title="Dashboard-Einstellungen">${ic("mdi:cog")}</button>`;
  }

  _hero() {
    const vac = this.st(E.vac), status = this.st("sensor.heidi_status"), err = this.st("sensor.heidi_error"), task = this.st("sensor.heidi_task_status");
    const col = vac === "cleaning" ? "var(--accent)" : vac === "returning" ? "var(--warn)" : vac === "error" ? "var(--bad)" : "var(--good)";
    const batt = this.num("sensor.heidi_battery_level", 0);
    const persons = E.persons.map((p) => {
      const s = this._hass.states[p.id]; if (!s) return "";
      const home = s.state === "home", counts = !p.optional || this.on(p.optional);
      return `<button class="chip ${home ? "on" : ""}" data-more="${p.id}" title="${home ? "zu Hause" : "abwesend"}${counts ? "" : " · zählt nicht"}" style="${counts ? "" : "opacity:.6"}">${ic(home ? "mdi:account" : "mdi:account-outline")}${p.name}</button>`;
    }).join("");
    const phase = this.st(E.phase), phaseOk = !["unknown", "unavailable", ""].includes(phase);
    const statusTxt = phaseOk ? phase : (STATUS_DE[status] || status.replace(/_/g, " ")).replace(/^./, (c) => c.toUpperCase());
    // Groß: Gesamtauftrag (Planer-Eintrag oder Auftragsart) bzw. Zustand · klein: aktueller Arbeitsschritt
    const TASK = { room_cleaning: "Reinigt Räume", zone_cleaning: "Reinigt Zone", spot_cleaning: "Reinigt Punkt", cleaning: "Reinigt", cruising: "Fährt", mapping: "Erstellt Karte", fast_mapping: "Erstellt Karte" };
    const auto = this.on("input_boolean.heidi_auto_lauf") ? this.st("input_text.heidi_auto_letzter_plan") : "";
    const job = auto && !["unknown", "unavailable", ""].includes(auto) ? auto : (TASK[task] || "Reinigt");
    let big = statusTxt, sub = "";
    if (vac === "error") big = "Fehler";
    else if (vac === "paused") { big = "Pausiert"; sub = job; }
    else if (vac === "returning") { big = "Fährt zur Station"; sub = phaseOk && phase !== big ? phase : ""; }
    else if (vac === "cleaning") { big = job; sub = phaseOk ? phase : ""; }
    if (sub === big) sub = "";
    // Knöpfe je nach Zustand
    const B = (svc, icon, label, primary = false) => `<button class="btn ${primary ? "primary" : ""}" data-svc="vacuum.${svc}">${ic(icon)}${label}</button>`;
    const ctl = vac === "cleaning" ? B("pause", "mdi:pause", "Pause", true) + B("stop", "mdi:stop", "Stopp") + B("return_to_base", "mdi:home-import-outline", "Station")
      : vac === "paused" ? B("start", "mdi:play", "Weiter", true) + B("stop", "mdi:stop", "Stopp") + B("return_to_base", "mdi:home-import-outline", "Station")
      : vac === "returning" ? B("pause", "mdi:pause", "Pause", true) + B("stop", "mdi:stop", "Stopp") + B("locate", "mdi:map-marker", "Orten")
      : vac === "docked" ? B("start", "mdi:play", "Start", true) + B("locate", "mdi:map-marker", "Orten")
      : B("start", "mdi:play", "Start", true) + B("return_to_base", "mdi:home-import-outline", "Station") + B("locate", "mdi:map-marker", "Orten");
    const dnd = `${(this.st("time.heidi_dnd_start") || "").slice(0, 5)}–${(this.st("time.heidi_dnd_end") || "").slice(0, 5)}`;
    const room = this.roomName(this.st("sensor.heidi_current_room"));
    return `<div class="card"><div class="hero">
      <button class="ring" style="--p:${batt};--rc:${batt <= 20 ? "var(--bad)" : "var(--accent)"};border:0;padding:0" data-more="sensor.heidi_battery_level"><div class="num">${batt}<small>Akku</small></div></button>
      <div class="status">
        <button class="big" data-more="${E.vac}" style="border:0;background:transparent;padding:0;text-align:left"><span class="dot" style="background:${col};box-shadow:0 0 0 4px color-mix(in srgb, ${col} 25%, transparent)"></span>${esc(big)}</button>
        ${sub ? `<div class="sub">${ic("mdi:subdirectory-arrow-right")}${esc(sub)}</div>` : ""}
        <div class="chips">${persons}
          ${room !== "–" && vac === "cleaning" && !phaseOk ? `<span class="chip on">${ic("mdi:floor-plan")}${esc(room)}</span>` : ""}
          ${err !== "no_error" && err !== "unavailable" ? `<span class="chip bad">${ic("mdi:alert")}${esc(err.replace(/_/g, " "))}</span>` : ""}
          <span class="chip" title="Nicht stören">${ic("mdi:sleep")}${esc(dnd)}</span>
        </div>
      </div>
      <div class="ctl">${ctl}</div></div>${this._strip()}</div>`;
  }

  // Werte eines Raums vom Roboter (deutsch); null, wenn Raum-Einstellungen nicht verfügbar sind
  _roomVals(id) {
    const g = (k) => { const v = this.st(`select.heidi_room_${id}_${RV_ENT[k]}`); return ["unknown", "unavailable"].includes(v) ? null : v; };
    const m = g("modus"); if (m === null) return null;
    return { modus: RV_HA.modus[m] || m, saug: RV_HA.saug[g("saug")] || "–", wasser: g("wasser") ? RV_HA.wasser[g("wasser")] || g("wasser") : null, route: g("route") ? RV_HA.route[g("route")] || g("route") : null, wdh: (g("wdh") || "1x").replace("x", "") };
  }

  // Streifen "Fährt mit": Zusammenfassung der Raumwerte (laufender Auftrag: nur die aktiven Räume)
  _strip() {
    const vac = this.st(E.vac), running = ["cleaning", "paused", "returning"].includes(vac);
    const segs = running ? (this.attr(E.vac, "active_segments") || []) : [];
    const ids = segs.length ? segs : ROOMS.map((r) => r.id);
    const vals = ids.map((id) => this._roomVals(id)).filter(Boolean);
    if (!vals.length) return `<div class="strip" data-act="rooms"><div class="lab">Fährt mit <span class="r">Raum-Einstellungen am Roboter aus ${ic("mdi:chevron-right")}</span></div></div>`;
    const auto = this.on("input_boolean.heidi_auto_lauf") ? this.st("input_text.heidi_auto_letzter_plan") : "";
    const src = running && auto && !["unknown", "unavailable", ""].includes(auto) ? `Eintrag „${auto}“` : running ? "Roboter-Werte" : "Roboter-Werte · zum Ändern tippen";
    const uni = (k) => { const s = new Set(vals.map((x) => x[k] ?? "–")); return s.size === 1 ? [...s][0] : null; };
    const chip = (lab, k, fmt = (x) => x) => { const u = uni(k); return `<span class="chip k"><b>${lab}</b> ${u !== null ? esc(fmt(u)) : "je Raum"}</span>`; };
    const seq = (this.attr(E.vac, "cleaning_sequence") || []).filter((id) => ids.includes(id)).map((id) => ROOMS.find((r) => r.id === id)?.short).filter(Boolean).join(" → ");
    const wet = vals.some((x) => x.modus !== "Saugen");
    return `<div class="strip" data-act="rooms" title="Räume einstellen"><div class="lab">Fährt mit <span class="r">${esc(src)} ${ic("mdi:chevron-right")}</span></div>
      <div class="chips">${chip("Modus", "modus")}${chip("Saugstufe", "saug")}${wet ? chip("Wasser", "wasser", (x) => x ?? "–") : ""}${chip("Wdh.", "wdh", (x) => x + "×")}${seq ? `<span class="chip k"><b>Reihenfolge</b> ${esc(seq)}</span>` : ""}</div></div>`;
  }

  _mapCard() {
    const sel = this._selRooms || new Set();
    const rooms = ROOMS.map((r) => `<button class="btn ${sel.has(r.id) ? "sel" : ""}" data-room="${r.id}">${ic(r.icon)}${r.short}</button>`).join("");
    const zc = this._rectsFromAttr(this.attr(E.map, "no_go_areas")).length + this._rectsFromAttr(this.attr(E.map, "no_mopping_areas")).length;
    const chairs = this.on(E.chairs);
    return `<div class="card"><h2>${ic("mdi:map")}Karte <span class="r">${esc(this.st(E.karte))}</span></h2>
      <div class="mapwrap"><div id="mapSlot"></div>
        <div class="tools"><button class="tb" data-act="zones">${ic("mdi:cancel")}Sperrzonen${zc ? ` · ${zc}` : ""}</button><button class="tb ${chairs ? "warn" : ""}" data-toggle="${E.chairs}" title="Sperrzone um den Esstisch ein/aus">${ic("mdi:chair-rolling")}Stühle am Boden${chairs ? " · gesperrt" : ""}</button></div></div>
      <div class="rooms" id="rooms">${rooms}</div>
      <div class="roomrun" id="roomrun" ${sel.size ? "" : "hidden"}><button class="btn primary" data-act="cleanrooms">${ic("mdi:play")}${sel.size} ${sel.size === 1 ? "Raum" : "Räume"} reinigen</button><button class="btn" data-act="clearrooms">${ic("mdi:close")}</button></div></div>`;
  }

  _consumables() {
    const items = [["Hauptbürste", "sensor.heidi_main_brush_left", "button.heidi_reset_main_brush"], ["Seitenbürste", "sensor.heidi_side_brush_left", "button.heidi_reset_side_brush"], ["Filter", "sensor.heidi_filter_left", "button.heidi_reset_filter"], ["Sensoren", "sensor.heidi_sensor_dirty_left", "button.heidi_reset_sensor"], ["Räder", "sensor.heidi_wheel_dirty_left", "button.heidi_reset_wheel"]];
    return `<div class="card"><h2>${ic("mdi:wrench")}Verschleiß</h2><div class="cons">${items.map(([n, e, b]) => { const p = this.num(e, 0); const v = p <= 10 ? "var(--bad)" : p <= 25 ? "var(--warn)" : "var(--accent)"; return `<button data-reset="${b}" data-name="${n}" title="${n}: Zähler zurücksetzen"><div class="mini" style="--p:${p};--v:${v}"><span>${p}</span></div><div class="l">${n}</div></button>`; }).join("")}</div></div>`;
  }

  _automatik() {
    const s = this.st(E.autoStatus), detail = this.attr(E.autoStatus, "detail") || "", on = this.on(E.automatik);
    const timeVal = (id) => (this.st(id) || "").slice(0, 5);
    const sel = (id, opts) => `<select data-select="${id}">${opts.map((o) => `<option ${this.st(id) === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    return `<div class="card"><div class="auto"><div><div class="t">Automatik</div><div class="s">${esc(on ? [s, detail].filter(Boolean).join(" · ") : "Aus")}</div></div><div class="sw ${on ? "on" : ""}" data-toggle="${E.automatik}" role="switch" aria-checked="${on}" tabindex="0"></div></div>
      <details data-key="regeln" ${this._open.has("regeln") ? "open" : ""}><summary>${ic("mdi:chevron-down", 'class="chev"')}Regeln</summary>
        <div class="set">
          <div class="row"><div>Homeoffice-Zeit Mo–Fr<div class="sub">Störende Person zu Hause = Homeoffice</div></div><div style="display:flex;gap:6px"><input type="time" data-time="input_datetime.heidi_arbeitszeit_start" value="${timeVal("input_datetime.heidi_arbeitszeit_start")}"><input type="time" data-time="input_datetime.heidi_arbeitszeit_ende" value="${timeVal("input_datetime.heidi_arbeitszeit_ende")}"></div></div>
          <div class="row"><div>Übliche Rückkehr</div><input type="time" data-time="input_datetime.heidi_rueckkehr" value="${timeVal("input_datetime.heidi_rueckkehr")}"></div>
          <div class="row"><div>Schnellprogramm unter</div><div style="display:flex;align-items:center;gap:8px"><input type="range" min="30" max="240" step="15" data-number="input_number.heidi_schnell_minuten" value="${this.num("input_number.heidi_schnell_minuten", 90)}"><b style="min-width:56px;text-align:right">${this.num("input_number.heidi_schnell_minuten", 90)} min</b></div></div>
          <div class="row"><div>Mindest-Akku</div><div style="display:flex;align-items:center;gap:8px"><input type="range" min="10" max="80" step="5" data-number="input_number.heidi_min_akku" value="${this.num("input_number.heidi_min_akku", 30)}"><b style="min-width:56px;text-align:right">${this.num("input_number.heidi_min_akku", 30)} %</b></div></div>
          <div class="row"><div>Bei Heimkehr</div>${sel("input_select.heidi_bei_heimkehr", this.attr("input_select.heidi_bei_heimkehr", "options") || [])}</div>
          <div class="row"><div>Zuletzt</div><div class="sub">${esc(this.st("input_text.heidi_auto_letzter_plan") === "unknown" ? "–" : this.st("input_text.heidi_auto_letzter_plan"))} · ${esc(this.st("input_datetime.heidi_letzte_auto_reinigung").startsWith("2000") ? "noch nie" : this.st("input_datetime.heidi_letzte_auto_reinigung"))}</div></div>
        </div></details></div>`;
  }

  _planer() {
    if (!this.on(E.planerBereich)) return "";
    const heute = this.st(E.heutePlan);
    const icons = ["mdi:broom", "mdi:water", "mdi:chef-hat", "mdi:shower"];
    const rows = [1, 2, 3, 4].map((n) => {
      const p = this._planRead(n), manual = !p.tage.some(Boolean), today = String(heute) === String(n);
      return `<div class="pr ${today ? "today" : ""} ${p.aktiv ? "" : "off"}">
        <div class="ic">${ic(icons[n - 1])}</div>
        <div><div class="n">${esc(p.name)}</div><div class="s">${esc(this._roomLabel(p.raeume))} · ${esc(p.modus)} · ${esc(p.wdh)}×${Object.keys(p.raum).length ? " · Räume einzeln" : ""}${p.personen.size ? " · wartet auf " + [...p.personen].map((x) => x[0].toUpperCase() + x.slice(1)).join(", ") : ""}</div></div>
        <span class="tag ${today ? "acc" : ""}">${manual ? "Manuell" : esc(this._dayLabel(p.tage) + " " + p.zeit)}</span>
        <button class="ib go" title="Jetzt starten" data-run="${n}">${ic("mdi:play")}</button><button class="ib" title="Bearbeiten" data-edit="${n}">${ic("mdi:pencil")}</button></div>`;
    }).join("");
    const app = APP_SCENES.map((a) => `<div class="pr"><div class="ic blue">${ic(a.icon)}</div><div><div class="n">${a.name}</div><div class="s">${a.sub}</div></div><span class="tag">App</span><button class="ib go" title="Starten" data-app="${a.id}" data-name="${esc(a.name)}">${ic("mdi:play")}</button><span></span></div>`).join("");
    return `<div class="card"><h2>${ic("mdi:calendar-check")}Planer</h2><div class="plan">${rows}</div>
      <details data-key="appszenen" ${this._open.has("appszenen") ? "open" : ""}><summary>${ic("mdi:chevron-down", 'class="chev"')}Dreame-App-Szenen</summary><div class="plan" style="margin-top:8px">${app}</div></details></div>`;
  }

  _prognoseCard() {
    if (!this.on(E.prognoseAktiv)) return "";
    const p = this._hass.states[E.prognose]; if (!p) return "";
    const a = p.attributes, sicher = parseInt(a.sicherheit || 0), tage = parseInt(a.tage || 0);
    const fenster = (a.freies_fenster || "–").replace(/:00/g, "").replace(/:30/g, "½");
    return `<div class="card"><h2>${ic("mdi:chart-timeline-variant")}Prognose <span class="r">${tage} Tage gelernt</span></h2><div class="tiles">
      <button class="tile" data-view="prog"><div class="k">Frei</div><div class="num">${esc(fenster)}</div></button>
      <button class="tile" data-view="prog"><div class="k">Rückkehr</div><div class="num">${esc(a.rueckkehr || "–")}${a.rueckkehr_wer && a.rueckkehr_wer !== "–" ? `<small>${esc(a.rueckkehr_wer)}</small>` : ""}</div></button>
      <button class="tile" data-view="prog"><div class="k">Sicher</div><div class="num">${sicher}<small>%</small></div><div class="bar"><i style="width:${sicher}%"></i></div></button></div></div>`;
  }

  _station() {
    const inst = (e) => this.st(e) === "installed", lowWater = this.st("sensor.heidi_low_water_warning") !== "no_warning";
    const tile = (cls, icon, k, v) => `<div class="tile ${cls}"><div class="k">${ic(icon)}${k}</div><div class="num">${v}</div></div>`;
    return `<div class="card"><h2>${ic("mdi:home-battery")}Station</h2><div class="tiles four">
      ${tile(inst("sensor.heidi_dust_bag_status") ? "" : "warn", "mdi:delete-variant", "Beutel", inst("sensor.heidi_dust_bag_status") ? "OK" : "Prüfen")}
      ${tile(lowWater || !inst("sensor.heidi_clean_water_tank_status") ? "warn" : "", "mdi:water", "Frisch", lowWater ? "Leer" : inst("sensor.heidi_clean_water_tank_status") ? "OK" : "Fehlt")}
      ${tile(inst("sensor.heidi_dirty_water_tank_status") ? "" : "warn", "mdi:water-off", "Abwasser", inst("sensor.heidi_dirty_water_tank_status") ? "OK" : "Voll")}
      ${tile(inst("sensor.heidi_detergent_status") ? "" : "warn", "mdi:bottle-tonic", "Mittel", inst("sensor.heidi_detergent_status") ? "OK" : "Leer")}
    </div><div class="stbtns">
      <button class="btn" data-press="button.heidi_start_auto_empty">${ic("mdi:tray-arrow-down")}Absaugen</button><button class="btn" data-press="button.heidi_self_clean">${ic("mdi:washing-machine")}Mopp</button>
      <button class="btn" data-press="button.heidi_manual_drying">${ic("mdi:weather-windy")}Trocknen</button><button class="btn" data-press="button.heidi_base_station_cleaning" data-confirm="Reinigung der Station starten?">${ic("mdi:broom")}Station</button>
    </div></div>`;
  }

  _stats() {
    const m = this.num("sensor.heidi_total_cleaning_time", 0);
    const last = this.st("sensor.heidi_cleaning_history"), d = new Date(last);
    const lastTxt = isNaN(d) ? "–" : d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
    const ha = this._hass.states["sensor.heidi_cleaning_history"]?.attributes || {};
    const lastRun = Object.values(ha).filter((v) => v && typeof v === "object" && v.timestamp).sort((x, y) => y.timestamp - x.timestamp)[0];
    const num = (v) => String(v ?? "").replace(/[^0-9]/g, "") || "0";
    const area = lastRun ? num(lastRun.cleaned_area) : this.st("sensor.heidi_cleaned_area"), dur = lastRun ? num(lastRun.cleaning_time) : this.st("sensor.heidi_cleaning_time");
    return `<div class="card"><h2>${ic("mdi:chart-bar")}Letzter Lauf <span class="r">${esc(this.st("sensor.heidi_cleaning_count"))} Läufe · ${esc(this.st("sensor.heidi_total_cleaned_area"))} m² · ${Math.floor(m / 60)} h</span></h2>
      <div class="tiles">
        <div class="tile"><div class="k">Fläche</div><div class="num">${esc(area)}<small>m²</small></div></div>
        <div class="tile"><div class="k">Dauer</div><div class="num">${esc(dur)}<small>min</small></div></div>
        <div class="tile"><div class="k">Wann</div><div class="num">${esc(lastTxt)}</div></div>
      </div>${this._history()}${this._robot()}</div>`;
  }

  _history() {
    const a = this._hass.states["sensor.heidi_cleaning_history"]?.attributes || {};
    const rows = Object.entries(a).filter(([k, v]) => v && typeof v === "object" && v.timestamp).sort((x, y) => y[1].timestamp - x[1].timestamp).slice(0, 30);
    if (!rows.length) return "";
    const fmt = (ts) => { const d = new Date(ts * 1000); return d.toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };
    const now = Math.floor(Date.now() / 1000);
    const li = rows.map(([, v], i) => {
      const ts = Math.floor(v.timestamp), key = String(ts), open = this._tlOpen.has(key);
      const durMin = parseInt(String(v.cleaning_time || "").replace(/[^0-9]/g, "")) || 0;
      const next = i > 0 ? Math.floor(rows[i - 1][1].timestamp) : now; // Läufe sind absteigend sortiert
      const end = Math.min(ts + durMin * 60 + 90 * 60, next, now); // + Mopp-Wäsche/Trocknung nach dem Lauf
      return `<div class="hrow ${open ? "open" : ""}" data-tl="${key}" data-start="${ts}" data-end="${end}" title="Verlauf anzeigen"><span class="hd">${esc(fmt(v.timestamp))}</span><span>${esc(String(v.cleaned_area || "").replace(/[^0-9]/g, ""))} m²</span><span>${esc(String(v.cleaning_time || "").replace(/[^0-9]/g, ""))} min</span><span class="chip ${v.completed ? "on" : "warn"}" style="padding:2px 8px">${v.completed ? "fertig" : "abgebrochen"}</span><span class="hm">${v.mop_pad === "Installed" ? ic("mdi:water") : ""}</span></div>${open ? this._timelineHtml(key) : ""}`;
    }).join("");
    // Laufender Auftrag (noch nicht im App-Protokoll): Zeitleiste live anzeigen
    const phase = this.st(E.phase), running = !PHASE_IDLE.includes(phase) && phase !== "Fehler";
    let cur = "";
    if (running) {
      const lc = this._hass.states[E.phase]?.last_changed || "";
      if (!this._tl.cur || this._tl.cur.lc !== lc) this._loadTimeline("cur", now - 8 * 3600, now, lc);
      cur = `<div class="hrow open" data-tl="cur" data-start="${now - 8 * 3600}" data-end="${now}"><span class="hd">Läuft gerade</span><span>${esc(this.st("sensor.heidi_cleaned_area"))} m²</span><span>${esc(this.st("sensor.heidi_cleaning_time"))} min</span><span class="chip on" style="padding:2px 8px">${esc(phase)}</span><span class="hm"></span></div>${this._timelineHtml("cur")}`;
    }
    return `<details data-key="protokoll" ${this._open.has("protokoll") || running ? "open" : ""}><summary>${ic("mdi:chevron-down", 'class="chev"')}Protokoll (${rows.length})</summary><div class="hist">${cur}${li}</div></details>`;
  }

  // Zeitleiste eines Laufs aus der HA-Historie von sensor.heidi_phase (Aufzeichnung durch den Recorder)
  _timelineHtml(key) {
    const c = this._tl[key];
    const line = (txt) => `<div class="tl"><div class="tlr"><span class="tt"></span><span class="tx" style="color:var(--muted)">${txt}</span><span class="td"></span></div></div>`;
    if (!c || c.loading) return line("Lade Verlauf …");
    if (c.error) return line(esc(c.error));
    if (!c.rows.length) return line("Kein Verlauf gespeichert – die Aufzeichnung läuft erst seit Karte v1.4.");
    const tm = (t) => new Date(t).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    const dur = (m) => m < 1 ? "&lt; 1 min" : m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")} min`;
    const total = (c.rows[c.rows.length - 1].t + c.rows[c.rows.length - 1].dur * 60000 - c.rows[0].t) / 60000;
    return `<div class="tl">${c.rows.map((r, i) => `<div class="tlr ${key === "cur" && i === c.rows.length - 1 ? "now" : ""}"><span class="tt">${tm(r.t)}</span><span class="tx">${esc(r.state)}</span><span class="td">${dur(r.dur)}</span></div>`).join("")}
      <div class="tlr"><span class="tt">${c.end ? tm(c.end) : ""}</span><span class="tx" style="color:var(--muted)">${c.end ? "Ende" : "läuft …"}</span><span class="td" style="color:var(--text);font-weight:500">${dur(total)}</span></div></div>`;
  }

  async _loadTimeline(key, startSec, endSec, lc = "") {
    if (this._tl[key] && !(key === "cur" && this._tl[key].lc !== lc)) return;
    this._tl[key] = { loading: true, lc };
    try {
      const s = new Date(startSec * 1000).toISOString(), e = new Date(endSec * 1000).toISOString();
      const res = await this._hass.callApi("GET", `history/period/${s}?filter_entity_id=${E.phase}&end_time=${encodeURIComponent(e)}&minimal_response&no_attributes`);
      let rows = ((res && res[0]) || []).map((x) => ({ t: new Date(x.last_changed || x.last_updated).getTime(), state: x.state }));
      rows = rows.filter((r, i) => i === 0 || r.state !== rows[i - 1].state);
      // Ein Lauf endet erst bei einem Ruhezustand von >= 3 min. Kurze Aussetzer (Stopp/Weiter, Neustart
      // durch die App: „Bereit“ für ein paar Sekunden) gehören zum Lauf und werden ausgeblendet.
      const stopAll = Math.min(endSec * 1000, Date.now());
      rows.forEach((r, i) => { r.dur = ((i + 1 < rows.length ? rows[i + 1].t : stopAll) - r.t) / 60000; r.idle = PHASE_IDLE.includes(r.state); });
      const longIdle = (r) => r.idle && r.dur >= 3;
      let end = null;
      if (key === "cur") { // nur das letzte Stück seit der letzten längeren Ruhe
        let li = -1; rows.forEach((r, i) => { if (longIdle(r)) li = i; }); rows = rows.slice(li + 1);
      } else {
        while (rows.length && rows[0].idle) rows.shift();
        const li = rows.findIndex((r, i) => i > 0 && longIdle(r));
        if (li > 0) { end = rows[li].t; rows = rows.slice(0, li); }
      }
      rows = rows.filter((r) => !r.idle || r.dur >= 1);
      rows = rows.filter((r, i) => i === 0 || r.state !== rows[i - 1].state);
      const stop = end ?? stopAll;
      rows.forEach((r, i) => { r.dur = ((i + 1 < rows.length ? rows[i + 1].t : stop) - r.t) / 60000; });
      this._tl[key] = { rows, end, lc };
    } catch (err) { this._tl[key] = { error: "Verlauf konnte nicht geladen werden", lc }; }
    this._sig = ""; this._render();
  }

  _robot() {
    const sel = (id, label) => { const o = this.attr(id, "options") || []; return `<div class="row"><div>${label}</div><select data-select="${id}">${o.map((x) => `<option value="${esc(x)}" ${this.st(id) === x ? "selected" : ""}>${esc(x.replace(/_/g, " "))}</option>`).join("")}</select></div>`; };
    const num = (id, label, unit) => `<div class="row"><div>${label}</div><div style="display:flex;align-items:center;gap:8px"><input type="range" min="${this.attr(id, "min") ?? 0}" max="${this.attr(id, "max") ?? 100}" step="${this.attr(id, "step") ?? 1}" data-number="${id}" value="${this.num(id, 0)}"><b style="min-width:50px;text-align:right">${this.num(id, 0)}${unit}</b></div></div>`;
    return `<details data-key="robot" ${this._open.has("robot") ? "open" : ""}><summary>${ic("mdi:chevron-down", 'class="chev"')}Roboter</summary>
      <div class="set">
        ${sel("select.heidi_carpet_cleaning", "Teppich")}${sel("select.heidi_water_temperature", "Wassertemperatur")}${sel("select.heidi_drying_time", "Trocknung")}${sel("select.heidi_auto_empty_mode", "Absaugen")}${sel("select.heidi_self_clean_frequency", "Mopp-Wäsche")}
        ${num("number.heidi_self_clean_area", "Mopp-Wäsche nach", " m²")}${sel("select.heidi_cleangenius", "CleanGenius")}${num("number.heidi_volume", "Lautstärke", " %")}
        <div class="row"><div>Nicht stören</div><div style="display:flex;gap:6px"><input type="time" data-time="time.heidi_dnd_start" value="${esc((this.st("time.heidi_dnd_start") || "").slice(0, 5))}"><input type="time" data-time="time.heidi_dnd_end" value="${esc((this.st("time.heidi_dnd_end") || "").slice(0, 5))}"></div></div>
        <div class="row"><div>Raum-Einstellungen<div class="sub">Modus, Saugstufe, Wasser, Route, Wiederholungen je Raum</div></div><button class="btn" data-act="rooms" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;font-size:12px">${ic("mdi:floor-plan")}Räume …</button></div>
      </div></details>`;
  }

  _refreshRooms() {
    const sel = this._selRooms || new Set();
    this.$$("#rooms [data-room]").forEach((b) => b.classList.toggle("sel", sel.has(parseInt(b.dataset.room))));
    const rr = this.$("#roomrun"); if (rr) { rr.hidden = !sel.size; const b = rr.querySelector("[data-act=cleanrooms]"); if (b) b.innerHTML = `${ic("mdi:play")}${sel.size} ${sel.size === 1 ? "Raum" : "Räume"} reinigen`; }
  }

  _renderMain() {
    const v = this.$("#viewMain");
    v.innerHTML = `<div class="grid"><div class="col">${this._hero()}${this._mapCard()}${this._consumables()}</div>
      <div class="col">${this._automatik()}${this._planer()}${this._prognoseCard()}${this._station()}${this._stats()}</div></div>`;
    this._mountMap();
  }

  async _mountMap() {
    const kind = this.st(E.karte);
    const slot = this.$("#mapSlot"); if (!slot) return;
    const cfgs = {
      "Dreame-App": { type: "custom:dreame-vacuum-map-card", entity: E.vac, title: "Heidi", theme: this.on(E.dark) ? "dark" : "light", language: "de", default_mode: "room" },
      "Xiaomi-Karte": { type: "custom:xiaomi-vacuum-map-card", entity: E.vac, vacuum_platform: "Tasshack/dreame-vacuum", title: "Heidi", language: "de", map_source: { camera: E.map }, calibration_source: { camera: true }, map_locked: true, two_finger_pan: true,
        map_modes: [
          { template: "vacuum_clean_segment", name: "Räume", icon: "mdi:floor-plan", predefined_selections: [
            { id: 7, label: { text: "Wohnzimmer", x: -3875, y: -2425, offset_y: 35 }, icon: { name: "mdi:sofa-outline", x: -3875, y: -2425 } },
            { id: 6, label: { text: "Küche", x: -575, y: -2825, offset_y: 35 }, icon: { name: "mdi:chef-hat", x: -575, y: -2825 } },
            { id: 5, label: { text: "Büro", x: -825, y: 925, offset_y: 35 }, icon: { name: "mdi:bookshelf", x: -825, y: 925 } },
            { id: 4, label: { text: "Flur", x: -4125, y: 1625, offset_y: 35 }, icon: { name: "mdi:foot-print", x: -4125, y: 1625 } },
            { id: 3, label: { text: "WC", x: -4525, y: 2975, offset_y: 35 }, icon: { name: "mdi:toilet", x: -4525, y: 2975 } },
            { id: 2, label: { text: "Schlafzimmer", x: -1675, y: 4875, offset_y: 35 }, icon: { name: "mdi:bed-king-outline", x: -1675, y: 4875 } },
            { id: 1, label: { text: "Bad", x: -4225, y: 5225, offset_y: 35 }, icon: { name: "mdi:shower", x: -4225, y: 5225 } }] },
          { template: "vacuum_clean_zone", name: "Zone reinigen", icon: "mdi:select-drag" },
          { template: "vacuum_goto", name: "Hinfahren", icon: "mdi:map-marker" },
          { name: "Sperrzonen setzen", icon: "mdi:cancel", selection_type: "manual_rectangle", max_selections: 10, coordinates_rounding: true, run_immediately: false, service_call_schema: { service: "dreame_vacuum.vacuum_set_restricted_zone", service_data: { entity_id: "[[entity_id]]", zones: "[[selection]]" } } },
          { name: "Wisch-Sperrzonen setzen", icon: "mdi:water-off", selection_type: "manual_rectangle", max_selections: 10, coordinates_rounding: true, run_immediately: false, service_call_schema: { service: "dreame_vacuum.vacuum_set_restricted_zone", service_data: { entity_id: "[[entity_id]]", no_mops: "[[selection]]" } } }] },
      "Nur Bild": { type: "picture-entity", entity: E.map, camera_image: E.map, show_name: false, show_state: false },
    };
    const key = kind + "|" + this.on(E.dark);
    if (!this._mapEls[key]) {
      try {
        const helpers = await window.loadCardHelpers();
        const el = helpers.createCardElement(cfgs[kind] || cfgs["Nur Bild"]);
        el.hass = this._hass;
        this._mapEls[key] = el;
      } catch (e) { slot.innerHTML = `<div class="hint">Karte konnte nicht geladen werden: ${esc(e.message)}</div>`; return; }
    }
    this._mapEl = this._mapEls[key];
    this._mapEl.hass = this._hass;
    const cur = this.$("#mapSlot"); if (cur && cur.firstChild !== this._mapEl) { cur.innerHTML = ""; cur.appendChild(this._mapEl); }
  }

  _renderProg() {
    const p = this._hass.states[E.prognose]; const a = p ? p.attributes : {};
    const tage = parseInt(a.tage || 0), sicher = parseInt(a.sicherheit || 0), v = encodeURIComponent(a.aktualisiert || "0");
    const conf = (n) => `<span class="conf ${n >= 60 ? "hi" : n > 0 ? "mid" : ""}">${n ? n + " % sicher" : "keine Daten"}</span>`;
    const row = (k, v2, c) => `<div class="row"><div><div class="k">${k}</div><div class="v">${esc(v2 || "–")}</div></div>${c || ""}</div>`;
    const sw = (id, t, s) => `<div class="row"><div>${t}<div class="sub">${s}</div></div><div class="sw ${this.on(id) ? "on" : ""}" data-toggle="${id}" role="switch" aria-checked="${this.on(id)}" tabindex="0"></div></div>`;
    this.$("#viewProg").innerHTML = `<div class="pgrid"><div class="col">
      <div class="card"><h2>${ic("mdi:calendar-today")}Heute <span class="r pill small">${p ? esc(p.state) : "–"} · Stand ${esc(a.aktualisiert || "–")}</span></h2>
        <div class="fc">${row("Freies Fenster (niemand zu Hause)", a.freies_fenster, conf(sicher))}${row("Erste Rückkehr erwartet", a.rueckkehr && a.rueckkehr !== "–" ? a.rueckkehr + " · " + (a.rueckkehr_wer || "") : "–", conf(sicher))}${row("Homeoffice-Wahrscheinlichkeit", a.homeoffice)}${row("Empfehlung der Automatik", a.empfehlung)}</div>
</div>
      <div class="card"><h2>${ic("mdi:school")}Lernstatus</h2>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px"><span>${tage} von ${this.num("input_number.heidi_prognose_wochen", 8) * 7} Tagen protokolliert · ${esc(a.aufloesung || 30)}-min-Raster</span><span>${tage >= this.num("input_number.heidi_prognose_mindesttage", 14) ? "aktiv" : `ab ${this.num("input_number.heidi_prognose_mindesttage", 14)} Tagen aktiv`}</span></div><div class="datab"><i style="width:${Math.min(100, tage / (this.num("input_number.heidi_prognose_wochen", 8) * 7) * 100)}%"></i></div>
        <div class="set" style="margin-top:10px">
          ${sw("input_boolean.heidi_abweichung_heute", "Abweichung heute", "Urlaub, Feiertag")}
          ${sw("input_boolean.heidi_prog_herbert", "Herbert einbeziehen", "GPS + WLAN")}${sw("input_boolean.heidi_prog_nicole", "Nicole einbeziehen", "WLAN")}${sw("input_boolean.heidi_prog_nina", "Nina einbeziehen", "WLAN")}
          <div class="row"><div>Protokoll zurücksetzen</div><button class="btn" style="padding:6px 12px;display:inline-flex;color:var(--bad)" data-shell="heidi_prognose_reset" data-confirm="Alle gelernten Anwesenheitsdaten löschen?">Löschen…</button></div>
        </div></div></div>
      <div class="col"><div class="card"><h2>${ic("mdi:chart-timeline")}Wann ist wer üblicherweise zu Hause?</h2><div class="heat">
        ${["herbert", "nicole", "nina"].map((k) => `<div class="n">${k[0].toUpperCase() + k.slice(1)}</div><img src="/local/prognose_${k}.png?v=${v}" alt="${k}">`).join("")}
</div></div></div></div>`;
  }

  // ───────── Overlays: Einstellungen & Planer-Editor ─────────
  _renderOverlay() {
    const o = this.$("#overlay");
    if (this._rooms) { o.innerHTML = this._roomsHtml(); return; }
    if (this._editing) { o.innerHTML = this._editorHtml(this._editing); return; }
    if (this._zones) { o.innerHTML = this._zonesHtml(); this._zonesBind(); return; }
    if (this._panel) { o.innerHTML = this._panelHtml(); return; }
    o.innerHTML = "";
  }

  _panelHtml() {
    const seg = (id, opts, labels) => `<div class="seg">${opts.map((v, i) => `<button data-option="${id}" data-value="${esc(v)}" class="${this.st(id) === v ? "on" : ""}">${esc(labels ? labels[i] : v)}</button>`).join("")}</div>`;
    const sw = (id, t, d) => `<div class="prow"><div>${t}${d ? `<div class="d">${d}</div>` : ""}</div><div class="sw ${this.on(id) ? "on" : ""}" data-toggle="${id}" role="switch" aria-checked="${this.on(id)}" tabindex="0"></div></div>`;
    const rng = (id, t, unit, d) => { const a = this._hass.states[id]?.attributes || {}; const v = this.num(id, a.min ?? 0); return `<div class="prow" style="flex-wrap:wrap"><div style="flex:1 1 140px">${t}${d ? `<div class="d">${d}</div>` : ""}</div><div style="display:flex;align-items:center;gap:8px"><input type="range" min="${a.min ?? 0}" max="${a.max ?? 100}" step="${a.step ?? 1}" data-number="${id}" data-unit="${esc(unit)}" value="${v}" style="width:110px"><b style="min-width:74px;text-align:right;font-variant-numeric:tabular-nums">${v}${esc(unit)}</b></div></div>`; };
    return `<div class="scrim" data-act="close"></div><aside class="panel" aria-label="Dashboard-Einstellungen">
      <h2>Dashboard-Einstellungen <button class="iconbtn" data-act="close" aria-label="Schließen">${ic("mdi:close")}</button></h2>
      <div><h3>Erscheinungsbild</h3>${seg(E.dark, ["on", "off"], ["Dunkel", "Hell"])}</div>
      <div><h3>Kartendarstellung</h3>${seg(E.karte, this.attr(E.karte, "options") || [])}
        <div class="prow"><div>Ausrichtung<div class="d">Drehung der Karte</div></div>${seg(E.rotation, this.attr(E.rotation, "options") || ["0", "90", "180", "270"], (this.attr(E.rotation, "options") || ["0", "90", "180", "270"]).map((x) => x + "°"))}</div>
</div>
      <div><h3>Sprache der Raumnamen</h3>${seg(E.raumnamen, this.attr(E.raumnamen, "options") || ["Original", "Deutsch"])}</div>
      <div><h3>Funktionen</h3>
        ${sw(E.automatik, "Automatik", "")}
        ${sw(E.planerBereich, "Planer anzeigen", "")}
        ${sw(E.prognoseAktiv, "Prognose", "Lernende Anwesenheit, eigener Tab")}
      </div>
      <div><h3>Anwesenheit</h3>${sw("input_boolean.heidi_nina_zaehlt", "Nina zählt für Anwesenheit", "")}
</div>
      <div><h3>Prognose</h3>
        ${rng("input_number.heidi_prognose_intervall", "Protokoll-Intervall", " min", "Wie oft die Anwesenheit gespeichert wird")}
        ${rng("input_number.heidi_prognose_aufloesung", "Auflösung", " min", "Rasterbreite der Heatmap und Prognose")}
        ${rng("input_number.heidi_prognose_wochen", "Lernzeitraum", " Wochen", "Ältere Daten werden verworfen")}
        ${rng("input_number.heidi_prognose_halbwert", "Gewichtung", " Tage", "Halbwertszeit – so alt zählt ein Tag nur noch halb")}
        ${rng("input_number.heidi_prognose_mindesttage", "Aktiv ab", " Tagen", "Erst dann nutzt die Automatik die Prognose")}
      </div>
      <div class="d" style="font-size:12px;color:var(--muted)">Heidi Panel v${HP_VERSION}</div></aside>`;
  }

  // ───────── Planer-Editor (v1.3) ─────────
  _planRead(n) {
    const st = (k) => this.st(`input_select.heidi_plan${n}_${k}`), tx = (k) => { const v = this.st(`input_text.heidi_plan${n}_${k}`); return ["unknown", "unavailable"].includes(v) ? "" : v; };
    const mask = tx("tage").padEnd(7, "0").slice(0, 7);
    return {
      n, name: tx("name"), aktiv: this.on(`input_boolean.heidi_plan${n}_aktiv`),
      raeume: new Set(tx("raeume").split(",").map((x) => parseInt(x)).filter((x) => x >= 1 && x <= 7)),
      modus: st("modus"), saug: st("saugstufe"), wasser: st("wasser"), route: st("route"), wdh: st("wiederholungen"),
      tage: [...mask].map((c) => c === "1"), zeit: (this.st(`input_datetime.heidi_plan${n}_zeit`) || "09:30").slice(0, 5),
      personen: new Set(tx("personen").split(",").map((x) => x.trim()).filter(Boolean)),
      ho: st("homeoffice"), hoSaug: st("ho_saug"), hoWdh: st("ho_wdh"),
      schnell: this.on(`input_boolean.heidi_plan${n}_schnell`), spSaug: st("sp_saug"), spWdh: st("sp_wdh"),
      raum: parseRaum(tx("raumwerte")), // Einzelwerte je Raum (leer = Standard des Eintrags)
      clock: null,
    };
  }

  // ───────── Untermenü Räume (v1.5) ─────────
  _roomsHtml() {
    const r = this._rooms, plan = r.mode === "plan", e = plan ? this._ed : null;
    const seg = (id, k, opts, cur, dis) => `<div class="seg s ${dis ? "dis" : ""}">${opts.map((o) => `<button data-rv="${k}" data-room="${id}" data-val="${esc(o)}" class="${String(cur) === o ? "on" : ""}">${esc(o)}${k === "wdh" ? "×" : ""}</button>`).join("")}</div>`;
    const std = () => ({ modus: e.modus, saug: e.saug, wasser: e.wasser, route: e.route, wdh: e.wdh });
    const block = (id, name, icon, v, own, avail, cls = "") => {
      const wet = v.modus !== "Saugen", mopOnly = v.modus === "Nur Wischen", dis = plan && !own;
      return `<div class="rr ${dis ? "std" : ""} ${cls}"><div class="rn">${ic(icon)}${esc(name)}${plan && id !== "all" ? `<button class="chip ${own ? "on" : ""}" data-rv="own" data-room="${id}">${own ? "eigene Werte" : "Standard des Eintrags"}</button>` : ""}</div>
        ${!avail ? `<div class="hint">Raum-Einstellungen nicht verfügbar</div>` : `<div class="rc"><span>Modus</span>${seg(id, "modus", OPT.modus, v.modus, dis)}</div>
        <div class="rc"><span>Saugstufe</span>${seg(id, "saug", OPT.saug, v.saug, dis)}</div>
        <div class="rc ${wet ? "" : "dim"}"><span>Wasser</span>${seg(id, "wasser", OPT.wasser, v.wasser, dis || !wet)}</div>
        <div class="rc ${mopOnly ? "" : "dim"}"><span>Route</span>${seg(id, "route", OPT.route, v.route, dis || !mopOnly)}</div>
        <div class="rc"><span>Wdh.</span>${seg(id, "wdh", OPT.wdh, v.wdh, dis)}</div>`}</div>`;
    };
    const ids = plan ? ROOMS.filter((x) => e.raeume.has(x.id)) : ROOMS.slice();
    const rows = ids.sort((a, b) => a.id - b.id).map((rm) => {
      if (plan) { const own = !!e.raum[rm.id]; return block(rm.id, rm.short, rm.icon, own ? e.raum[rm.id] : std(), own, true); }
      const v = this._roomVals(rm.id); return block(rm.id, rm.short, rm.icon, v || { modus: "–", saug: "–", wasser: null, route: null, wdh: "–" }, true, !!v);
    }).join("");
    // Zeile "Alle Räume": zeigt gemeinsame Werte, Klick setzt alle
    let all = "";
    if (!plan) {
      const vs = ROOMS.map((x) => this._roomVals(x.id)).filter(Boolean);
      const uni = (k) => { const s = new Set(vs.map((x) => x[k] ?? "–")); return s.size === 1 ? [...s][0] : "–"; };
      if (vs.length) all = block("all", "Alle Räume", "mdi:select-all", { modus: uni("modus"), saug: uni("saug"), wasser: uni("wasser"), route: uni("route"), wdh: uni("wdh") }, true, true, "all");
    }
    const n = r.n || this._editing;
    const modeSeg = r.back === "editor" ? `<div class="seg" style="margin-bottom:4px"><button data-act="rooms-mode" data-val="robot" class="${plan ? "" : "on"}">Roboter-Werte</button><button data-act="rooms-mode" data-val="plan" class="${plan ? "on" : ""}">Nur Eintrag ${n}</button></div>` : "";
    const hint = plan ? `Räume mit „eigene Werte“ überschreiben beim Start von Eintrag ${n} den Standard des Eintrags (${esc(e.modus)} · ${esc(e.saug)} · ${esc(e.wdh)}×). Gespeichert wird mit „Speichern“ im Eintrag.`
      : `Das sind die Raum-Einstellungen des Roboters – dieselben wie in der Dreame-App. Änderungen gelten sofort. Ein Planer-Eintrag setzt beim Start seine eigenen Werte und stellt diese hier danach wieder her.`;
    const foot = plan ? `<button class="btn" data-rv="own" data-room="none">Alle auf Standard</button><button class="btn primary" data-act="rooms-back">Zurück zum Eintrag</button>`
      : `<button class="btn primary" data-act="${r.back === "editor" ? "rooms-back" : "close"}">${r.back === "editor" ? "Zurück zum Eintrag" : "Fertig"}</button>`;
    return `<div class="scrim" data-act="${r.back === "editor" ? "rooms-back" : "close"}"></div><div class="modal"><div class="box ed" role="dialog" style="width:min(600px,100%)">
      <h2>Räume&nbsp;<span style="font-weight:400;color:var(--muted)">${plan ? `Eintrag ${n}` : "Roboter"}</span><button class="iconbtn" data-act="${r.back === "editor" ? "rooms-back" : "close"}" aria-label="Schließen" style="margin-left:auto">${ic("mdi:close")}</button></h2>
      ${modeSeg}<div class="hint">${hint}<br>Wasser nur beim Wischen · Route nur bei „Nur Wischen“.</div>
      <div class="rlist">${all}${rows}</div>
      <div class="foot">${foot}</div></div></div>`;
  }

  async _rvClick(t) {
    const r = this._rooms; if (!r) return; const k = t.dataset.rv, id = t.dataset.room, v = t.dataset.val;
    if (r.mode === "plan") {
      const e = this._ed; if (!e) return;
      const std = () => ({ modus: e.modus, saug: e.saug, wasser: e.wasser, route: e.route, wdh: e.wdh });
      if (k === "own") { if (id === "none") e.raum = {}; else { const i = parseInt(id); if (e.raum[i]) delete e.raum[i]; else e.raum[i] = std(); } }
      else { const i = parseInt(id); if (!e.raum[i]) e.raum[i] = std(); e.raum[i][k] = v; }
      this._renderOverlay(); return;
    }
    // Roboter: sofort setzen (Modus zuerst – davon hängt ab, ob Wasser/Route verfügbar sind)
    const ids = id === "all" ? ROOMS.map((x) => x.id) : [parseInt(id)];
    const opt = k === "wdh" ? v + "x" : (inv(RV_HA[k])[v] || v);
    try {
      await Promise.all(ids.map((i) => this.call("select", "select_option", { entity_id: `select.heidi_room_${i}_${RV_ENT[k]}`, option: opt })));
      this.toast(id === "all" ? "Alle Räume gesetzt" : "Gesetzt");
    } catch (err) { this.toast("Nicht möglich: " + (err?.message || err)); }
  }
  _dayLabel(tage) {
    const n = tage.filter(Boolean).length;
    if (n === 7) return "Täglich"; if (n === 0) return "Manuell";
    if (tage.every((v, i) => v === (i < 5))) return "Mo–Fr"; if (tage.every((v, i) => v === (i >= 5))) return "Sa + So";
    return DAYS.filter((d, i) => tage[i]).join(" + ");
  }
  _roomLabel(set) { if (set.size === 7) return "Alle"; if (!set.size) return "keine Räume"; return ROOMS.filter((r) => set.has(r.id)).map((r) => r.short).join(", "); }

  _editorHtml(n) {
    const e = this._ed || (this._ed = this._planRead(n));
    const seg = (key, opts, cls = "") => `<div class="seg ${cls}">${opts.map((o) => `<button data-ed="set" data-key="${key}" data-val="${esc(o)}" class="${e[key] === o ? "on" : ""}">${esc(o)}</button>`).join("")}</div>`;
    const rooms = ROOMS.map((r) => `<button class="chip ${e.raeume.has(r.id) ? "on" : ""}" data-ed="room" data-val="${r.id}" title="${e.raum[r.id] ? "eigene Werte" : ""}">${ic(r.icon)}${r.short}${e.raum[r.id] ? '<i class="dotm"></i>' : ""}</button>`).join("");
    const ownCount = Object.keys(e.raum).filter((id) => e.raeume.has(parseInt(id))).length;
    const days = DAYS.map((d, i) => `<button class="chip ${e.tage[i] ? "on" : ""}" data-ed="day" data-val="${i}">${d}</button>`).join("");
    const presets = [["Mo–Fr", "1111100"], ["Wochenende", "0000011"], ["Täglich", "1111111"], ["Nur manuell (Szene)", "0000000"]].map(([t, m]) => `<button class="chip" data-ed="preset" data-val="${m}">${t}</button>`).join("");
    const persons = E.persons.map((p) => { const k = p.name.toLowerCase(); return `<button class="chip ${e.personen.has(k) ? "warn" : ""}" data-ed="person" data-val="${k}">${ic("mdi:account")}${p.name}</button>`; }).join("");
    const manual = !e.tage.some(Boolean);
    const mini = (title, pre, help) => `<div class="mini"><div class="mlab">${title}</div>
      <div class="mrow"><span>Saugstufe</span>${seg(pre + "Saug", OPT.saug3, "s")}</div>
      <div class="mrow"><span>Wiederholungen</span>${seg(pre + "Wdh", OPT.wdh2, "s")}</div>${help ? `<div class="hint" style="margin:0">${help}</div>` : ""}</div>`;
    const schnellMin = this.num("input_number.heidi_schnell_minuten", 90);
    const az = `${(this.st("input_datetime.heidi_arbeitszeit_start") || "08:00").slice(0, 5)}–${(this.st("input_datetime.heidi_arbeitszeit_ende") || "17:00").slice(0, 5)}`;
    return `<div class="scrim" data-act="close"></div><div class="modal"><div class="box ed" role="dialog" style="width:min(660px,100%)">
      <h2>Eintrag ${n}&nbsp;<span style="font-weight:400;color:var(--muted)">bearbeiten</span><button class="iconbtn" data-act="close" aria-label="Schließen" style="margin-left:auto">${ic("mdi:close")}</button></h2>
      <div class="sec"><div class="lab">Name <span class="r" style="color:${e.aktiv ? "var(--accent)" : "var(--muted)"}">${e.aktiv ? "Aktiv" : "Inaktiv"} <span class="sw ${e.aktiv ? "on" : ""}" data-ed="bool" data-key="aktiv" role="switch" aria-checked="${e.aktiv}" tabindex="0"></span></span></div>
        <input type="text" data-ed="name" maxlength="40" value="${esc(e.name)}"></div>
      <div class="sec"><div class="lab">Räume <span class="r">${esc(this._roomLabel(e.raeume))}${ownCount ? ` · ${ownCount} mit eigenen Werten` : ""}</span></div><div class="rooms">${rooms}</div></div>
      <div class="sec"><div class="lab">Standard für alle gewählten Räume</div>${seg("modus", OPT.modus)}</div>
      <div class="two">
        <div class="sec"><div class="lab">Saugstufe</div>${seg("saug", OPT.saug)}</div>
        <div class="sec" style="opacity:${e.modus === "Saugen" ? ".4" : "1"}"><div class="lab">Wassermenge</div>${seg("wasser", OPT.wasser)}</div>
      </div>
      <div class="two">
        <div class="sec" style="opacity:${e.modus === "Nur Wischen" ? "1" : ".4"}"><div class="lab">Route <span class="r">nur bei „Nur Wischen“</span></div>${seg("route", OPT.route)}</div>
        <div class="sec"><div class="lab">Wiederholungen</div>${seg("wdh", OPT.wdh)}</div>
      </div>
      <div class="btnrow"><button class="btn" data-act="rooms-plan">${ic("mdi:floor-plan")}Räume einzeln …${ownCount ? ` (${ownCount})` : ""}</button><button class="btn" data-act="rooms-robot">${ic("mdi:robot-vacuum")}Roboter-Werte</button></div>
      <div class="sec"><div class="lab">Ausführung <span class="r">${esc(this._dayLabel(e.tage))}</span></div><div class="days">${days}</div><div class="chips">${presets}</div></div>
      <div class="sec" ${manual ? "hidden" : ""}><div class="lab">Uhrzeit</div>
        <div><button class="timebtn" data-ed="clock">${ic("mdi:clock-outline")}<span>${esc(e.zeit)}</span><small>antippen zum Ändern</small></button></div>
        ${e.clock ? this._clockHtml(e.clock) : ""}</div>
      <div class="sec"><div class="lab">Bedingungen</div>
        <div class="crow"><div class="ic on">${ic("mdi:account-off")}</div><div><div class="t">Nicht fahren, wenn zu Hause ist:</div><div class="s">Wartet, bis die gewählten Personen weg sind – heute wird nachgeholt. Keine Auswahl = fährt immer.</div></div><span></span>
          <div class="sub">${persons}</div></div>
        <div class="crow"><div class="ic ${e.personen.size ? "on" : ""}">${ic("mdi:briefcase")}</div><div><div class="t">Bei Homeoffice</div><div class="s">Mo–Fr ${az} Uhr ist eine der Personen oben zu Hause</div></div><span></span>
          <div class="sub" style="display:grid;gap:8px">${seg("ho", OPT.ho)}${e.ho === "Leise starten" ? mini("Leise starten mit", "ho", "Alle Räume des Eintrags, nur Saugen") : ""}</div></div>
        <div class="crow ${e.schnell ? "on" : ""}"><div class="ic ${e.schnell ? "on" : ""}">${ic("mdi:flash")}</div><div><div class="t">Schnellprogramm bei wenig Zeit</div><div class="s">Wenn weniger als ${schnellMin} min bis zur erwarteten Rückkehr bleiben</div></div><span class="sw ${e.schnell ? "on" : ""}" data-ed="bool" data-key="schnell" role="switch" tabindex="0"></span>
          ${e.schnell ? `<div class="sub">${mini("Schnellprogramm läuft mit", "sp", "Nur Saugen, gewählte Räume · gilt danach als erledigt")}</div>` : ""}</div>
      </div>
      <div class="foot"><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" data-act="save" data-plan="${n}">Speichern</button></div></div></div>`;
  }
  _clockHtml(c) {
    const R = 100, cx = 120, cy = 120, items = c.mode === "h" ? [...Array(24).keys()] : [...Array(12).keys()].map((i) => i * 5);
    const ns = items.map((v, i) => { const r = c.mode === "h" ? (v < 12 ? R : R - 36) : R; const ang = ((c.mode === "h" ? v % 12 : i) / 12) * 2 * Math.PI - Math.PI / 2; const sel = c.mode === "h" ? v === c.H : v === c.M; return `<button class="n ${sel ? "sel" : ""}" data-ed="clockval" data-val="${v}" style="left:${(cx + r * Math.cos(ang)).toFixed(1)}px;top:${(cy + r * Math.sin(ang)).toFixed(1)}px">${String(v).padStart(2, "0")}</button>`; }).join("");
    const selIdx = c.mode === "h" ? c.H % 12 : c.M / 5, ang = selIdx / 12 * 360, hr = c.mode === "h" && c.H >= 12 ? R - 36 : R;
    return `<div class="clock"><div class="hd"><span class="${c.mode === "h" ? "on" : ""}" data-ed="clockmode" data-val="h">${String(c.H).padStart(2, "0")}</span>:<span class="${c.mode === "m" ? "on" : ""}" data-ed="clockmode" data-val="m">${String(c.M).padStart(2, "0")}</span></div>
      <div class="dial"><div class="hand" style="height:${hr}px;transform:rotate(${ang + 180}deg)"></div><div class="hub"></div>${ns}</div>
      <div class="cfoot"><button class="btn" data-ed="clockcancel">Abbrechen</button><button class="btn primary" data-ed="clockok">OK</button></div></div>`;
  }
  _edClick(t) {
    const e = this._ed; if (!e) return; const k = t.dataset.ed, v = t.dataset.val;
    if (k === "room") { const id = parseInt(v); e.raeume.has(id) ? e.raeume.delete(id) : e.raeume.add(id); }
    else if (k === "day") { e.tage[parseInt(v)] = !e.tage[parseInt(v)]; }
    else if (k === "preset") { e.tage = [...v].map((c) => c === "1"); }
    else if (k === "person") { e.personen.has(v) ? e.personen.delete(v) : e.personen.add(v); }
    else if (k === "set") { e[t.dataset.key] = v; }
    else if (k === "bool") { e[t.dataset.key] = !e[t.dataset.key]; }
    else if (k === "clock") { const [h, m] = e.zeit.split(":").map(Number); e.clock = { mode: "h", H: h, M: m - (m % 5) }; }
    else if (k === "clockmode") { e.clock.mode = v; }
    else if (k === "clockval") { if (e.clock.mode === "h") { e.clock.H = parseInt(v); e.clock.mode = "m"; } else { e.clock.M = parseInt(v); } }
    else if (k === "clockok") { e.zeit = `${String(e.clock.H).padStart(2, "0")}:${String(e.clock.M).padStart(2, "0")}`; e.clock = null; }
    else if (k === "clockcancel") { e.clock = null; }
    const nameEl = this.$('[data-ed="name"]'); if (nameEl) e.name = nameEl.value;
    this._renderOverlay();
  }

  async _saveEditor(n) {
    const e = this._ed; if (!e) return;
    const nameEl = this.$('[data-ed="name"]'); if (nameEl) e.name = nameEl.value.trim();
    if (!e.name) { this.toast("Bitte einen Namen vergeben"); nameEl?.focus(); return; }
    if (!e.raeume.size) { this.toast("Bitte mindestens einen Raum wählen"); return; }
    const c = [], sel = (k, v) => c.push(this.call("input_select", "select_option", { entity_id: `input_select.heidi_plan${n}_${k}`, option: v }));
    const txt = (k, v) => c.push(this.call("input_text", "set_value", { entity_id: `input_text.heidi_plan${n}_${k}`, value: v }));
    const bool = (k, v) => c.push(this.call("input_boolean", v ? "turn_on" : "turn_off", { entity_id: `input_boolean.heidi_plan${n}_${k}` }));
    txt("name", e.name); txt("raeume", ROOMS.filter((r) => e.raeume.has(r.id)).map((r) => r.id).join(",")); txt("tage", e.tage.map((b) => (b ? "1" : "0")).join("")); txt("personen", [...e.personen].join(","));
    const raum = {}; Object.keys(e.raum).forEach((id) => { if (e.raeume.has(parseInt(id))) raum[id] = e.raum[id]; }); txt("raumwerte", encodeRaum(raum));
    sel("modus", e.modus); sel("saugstufe", e.saug); sel("wasser", e.wasser); sel("route", e.route); sel("wiederholungen", e.wdh);
    sel("homeoffice", e.ho); sel("ho_saug", e.hoSaug); sel("ho_wdh", e.hoWdh);
    sel("sp_saug", e.spSaug); sel("sp_wdh", e.spWdh);
    bool("aktiv", e.aktiv); bool("schnell", e.schnell);
    c.push(this.call("input_datetime", "set_datetime", { entity_id: `input_datetime.heidi_plan${n}_zeit`, time: e.zeit + ":00" }));
    try { await Promise.all(c); this.toast("Eintrag gespeichert"); } catch (err) { this.toast("Fehler beim Speichern: " + err.message); }
    this._editing = null; this._ed = null; this._sig = ""; this.hass = this._hass;
  }

  _closeOverlays() { this._editing = null; this._ed = null; this._panel = false; this._zones = null; this._rooms = null; this._sig = ""; this._render(); }

  // ───────── Sperrzonen-Editor ─────────
  _rectsFromAttr(a) {
    if (!a) return [];
    const list = Array.isArray(a) ? a : [a];
    return list.map((r) => {
      const xs = [r.x0, r.x1, r.x2, r.x3].filter((v) => v !== undefined), ys = [r.y0, r.y1, r.y2, r.y3].filter((v) => v !== undefined);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    });
  }
  _zoneCount() {
    const z = this._rectsFromAttr(this.attr(E.map, "no_go_areas")).length, m = this._rectsFromAttr(this.attr(E.map, "no_mopping_areas")).length;
    return z || m ? `${z} Sperrzone${z === 1 ? "" : "n"} · ${m} Wisch-Sperrzone${m === 1 ? "" : "n"}` : "keine gesetzt";
  }
  _openZones() {
    this._zones = { type: "zones", zones: this._rectsFromAttr(this.attr(E.map, "no_go_areas")), no_mops: this._rectsFromAttr(this.attr(E.map, "no_mopping_areas")), sel: -1, draft: null };
    this._render();
  }
  _calib() {
    const c = this.attr(E.map, "calibration_points"); if (!c || c.length < 3) return null;
    // Affine Abbildung map(px) -> vacuum(mm) aus 3 Punkten
    const [p0, p1, p2] = c;
    const A = [[p0.map.x, p0.map.y, 1], [p1.map.x, p1.map.y, 1], [p2.map.x, p2.map.y, 1]];
    const solve = (b) => { // löst A * v = b (3x3) per Cramer
      const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const d = det(A); if (!d) return null;
      return [0, 1, 2].map((i) => { const M = A.map((row, r) => row.map((v, cIdx) => (cIdx === i ? b[r] : v))); return det(M) / d; });
    };
    const vx = solve([p0.vacuum.x, p1.vacuum.x, p2.vacuum.x]), vy = solve([p0.vacuum.y, p1.vacuum.y, p2.vacuum.y]);
    if (!vx || !vy) return null;
    const toVac = (mx, my) => [vx[0] * mx + vx[1] * my + vx[2], vy[0] * mx + vy[1] * my + vy[2]];
    // Rücktransformation vacuum -> map
    const B = [[vx[0], vx[1]], [vy[0], vy[1]]]; const dd = B[0][0] * B[1][1] - B[0][1] * B[1][0];
    const toMap = (x, y) => { const rx = x - vx[2], ry = y - vy[2]; return [(rx * B[1][1] - ry * B[0][1]) / dd, (ry * B[0][0] - rx * B[1][0]) / dd]; };
    return { toVac, toMap };
  }
  _zonesHtml() {
    const z = this._zones; const pic = this.attr(E.map, "entity_picture") || ""; const src = !pic ? "" : pic.startsWith("data:") ? pic : pic + (pic.includes("?") ? "&" : "?") + "t=" + Date.now();
    const isZ = z.type === "zones";
    return `<div class="scrim" data-act="close"></div><div class="modal"><div class="box" role="dialog" style="width:min(900px,100%)">
      <h2>Sperrzonen bearbeiten <button class="iconbtn" data-act="close" aria-label="Schließen">${ic("mdi:close")}</button></h2>
      <div class="seg" style="max-width:420px"><button data-ztype="zones" class="${isZ ? "on" : ""}">Sperrzonen (${z.zones.length})</button><button data-ztype="no_mops" class="${isZ ? "" : "on"}">Wisch-Sperrzonen (${z.no_mops.length})</button></div>
      <div class="zwrap" id="zwrap"><img id="zimg" src="${esc(src)}" alt="Karte"><svg id="zsvg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg></div>
      <div class="hint" style="margin:0">Rechteck aufziehen = neue Zone · antippen = auswählen · Speichern ersetzt alle Zonen dieses Typs.</div>
      <div class="ztools"><button class="btn danger" data-zact="del" ${z.sel < 0 ? "disabled" : ""}>${ic("mdi:delete")}Ausgewählte löschen</button><button class="btn danger" data-zact="clear">${ic("mdi:delete-sweep")}Alle ${isZ ? "Sperrzonen" : "Wisch-Sperrzonen"} löschen</button><span style="flex:1"></span><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" data-zact="save">${ic("mdi:content-save")}Speichern</button></div>
    </div></div>`;
  }
  _zonesBind() {
    const wrap = this.$("#zwrap"), img = this.$("#zimg"), svg = this.$("#zsvg"); if (!wrap || !img || !svg) return;
    const cal = this._calib();
    const draw = () => {
      const W = img.naturalWidth || 1332, H = img.naturalHeight || 716; svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const z = this._zones; let out = "";
      const rectSvg = (r, cls, i) => { if (!cal) return ""; const a = cal.toMap(r[0], r[1]), b = cal.toMap(r[2], r[3]); const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), h = Math.abs(a[1] - b[1]); return `<rect class="${cls}" data-i="${i}" x="${x}" y="${y}" width="${w}" height="${h}"></rect><text x="${x + 6}" y="${y + 16}">${cls === "z" ? "Sperr" : "Wisch"} ${i + 1}</text>`; };
      z.zones.forEach((r, i) => { out += rectSvg(r, "z" + (z.type === "zones" && z.sel === i ? " sel" : ""), i); });
      z.no_mops.forEach((r, i) => { out += rectSvg(r, "m" + (z.type === "no_mops" && z.sel === i ? " sel" : ""), i); });
      if (z.draft) { const d = z.draft; out += `<rect class="draft" x="${Math.min(d[0], d[2])}" y="${Math.min(d[1], d[3])}" width="${Math.abs(d[2] - d[0])}" height="${Math.abs(d[3] - d[1])}"></rect>`; }
      svg.innerHTML = out;
    };
    const toImg = (ev) => { const r = svg.getBoundingClientRect(); const W = img.naturalWidth || 1332, H = img.naturalHeight || 716; return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H]; };
    let start = null;
    svg.addEventListener("pointerdown", (ev) => { const t = ev.target; if (t.tagName === "rect" && t.dataset.i !== undefined && !t.classList.contains("draft")) { const isZ = t.classList.contains("z"); this._zones.type = isZ ? "zones" : "no_mops"; this._zones.sel = parseInt(t.dataset.i); this._zonesRefresh(); return; } start = toImg(ev); svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener("pointermove", (ev) => { if (!start) return; const p = toImg(ev); this._zones.draft = [start[0], start[1], p[0], p[1]]; draw(); });
    svg.addEventListener("pointerup", (ev) => { if (!start) return; const p = toImg(ev); const d = [start[0], start[1], p[0], p[1]]; start = null; this._zones.draft = null; if (Math.abs(d[2] - d[0]) < 8 || Math.abs(d[3] - d[1]) < 8 || !cal) { draw(); return; } const a = cal.toVac(d[0], d[1]), b = cal.toVac(d[2], d[3]); const rect = [Math.round(Math.min(a[0], b[0])), Math.round(Math.min(a[1], b[1])), Math.round(Math.max(a[0], b[0])), Math.round(Math.max(a[1], b[1]))]; const list = this._zones[this._zones.type]; list.push(rect); this._zones.sel = list.length - 1; this._zonesRefresh(); });
    if (img.complete) draw(); else img.onload = draw;
    if (!cal) this.toast("Keine Kalibrierdaten der Karte – Zonen können nicht gezeichnet werden");
  }
  _zonesRefresh() { this._renderOverlay(); }
  async _zonesAction(act) {
    const z = this._zones;
    if (act === "del" && z.sel >= 0) { z[z.type].splice(z.sel, 1); z.sel = -1; this._zonesRefresh(); return; }
    if (act === "clear") { if (!window.confirm("Wirklich alle Zonen dieses Typs löschen?")) return; z[z.type] = []; z.sel = -1; this._zonesRefresh(); return; }
    if (act === "save") {
      try { await this.call("dreame_vacuum", "vacuum_set_restricted_zone", { entity_id: E.vac, zones: z.zones, no_mops: z.no_mops }); this.toast(`Gespeichert: ${z.zones.length} Sperrzonen, ${z.no_mops.length} Wisch-Sperrzonen`); }
      catch (e) { this.toast("Fehler: " + e.message); return; }
      this._closeOverlays();
    }
  }

  // ───────── Events ─────────
  async _onClick(e) {
    const t = e.target.closest("[data-rv],[data-act],[data-view],[data-toggle],[data-more],[data-svc],[data-reset],[data-press],[data-run],[data-app],[data-edit],[data-option],[data-shell],[data-fieldtoggle],[data-ztype],[data-zact],[data-room],[data-ed],[data-tl],summary");
    if (!t) return;
    if (t.dataset.tl) { const k = t.dataset.tl; if (k === "cur") return; if (this._tlOpen.has(k)) this._tlOpen.delete(k); else { this._tlOpen.add(k); this._loadTimeline(k, parseInt(t.dataset.start), parseInt(t.dataset.end)); } this._sig = ""; this._render(); return; }
    if (t.dataset.rv) { this._rvClick(t); return; }
    if (t.dataset.act === "rooms") { this._rooms = { mode: "robot", back: null }; this._renderOverlay(); return; }
    if (t.dataset.act === "rooms-plan") { this._rooms = { mode: "plan", n: this._editing, back: "editor" }; this._renderOverlay(); return; }
    if (t.dataset.act === "rooms-robot") { this._rooms = { mode: "robot", n: this._editing, back: "editor" }; this._renderOverlay(); return; }
    if (t.dataset.act === "rooms-mode") { this._rooms.mode = t.dataset.val; this._renderOverlay(); return; }
    if (t.dataset.act === "rooms-back") { this._rooms = null; this._renderOverlay(); return; }
    if (t.tagName === "SUMMARY") { const d = t.parentElement; const key = d.dataset.key; setTimeout(() => { if (key) { d.open ? this._open.add(key) : this._open.delete(key); } }, 0); return; }
    if (t.dataset.ed) { if (t.dataset.ed !== "name") this._edClick(t); return; }
    const confirmText = t.dataset.confirm; if (confirmText && !window.confirm(confirmText)) return;
    if (t.dataset.act === "settings") { this._panel = true; this._render(); return; }
    if (t.dataset.act === "zones") { this._openZones(); return; }
    if (t.dataset.room) { this._selRooms = this._selRooms || new Set(); const id = parseInt(t.dataset.room); this._selRooms.has(id) ? this._selRooms.delete(id) : this._selRooms.add(id); this._refreshRooms(); return; }
    if (t.dataset.act === "clearrooms") { this._selRooms = new Set(); this._refreshRooms(); return; }
    if (t.dataset.act === "cleanrooms") { const segs = Array.from(this._selRooms || []); if (!segs.length) return; const names = ROOMS.filter((r) => segs.includes(r.id)).map((r) => r.short).join(", "); if (!window.confirm(`Jetzt reinigen: ${names}?`)) return; await this.call("dreame_vacuum", "vacuum_clean_segment", { entity_id: E.vac, segments: segs }); this._selRooms = new Set(); this.toast("Gestartet: " + names); this._sig = ""; this._render(); return; }
    if (t.dataset.ztype) { this._zones.type = t.dataset.ztype; this._zones.sel = -1; this._zonesRefresh(); return; }
    if (t.dataset.zact) { this._zonesAction(t.dataset.zact); return; }
    if (t.dataset.act === "close") { this._closeOverlays(); return; }
    if (t.dataset.act === "save") { this._saveEditor(parseInt(t.dataset.plan)); return; }
    if (t.dataset.view) { this._view = t.dataset.view; this._sig = ""; this._render(); return; }
    if (t.dataset.toggle) { await this.toggle(t.dataset.toggle); return; }
    if (t.dataset.option) { const id = t.dataset.option, v = t.dataset.value; if (id === E.dark) await this.call("input_boolean", v === "on" ? "turn_on" : "turn_off", { entity_id: id }); else await this.call(id.split(".")[0], "select_option", { entity_id: id, option: v }); return; }
    if (t.dataset.more) { this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: t.dataset.more } })); return; }
    if (t.dataset.svc) { const [d, s] = t.dataset.svc.split("."); await this.call(d, s, { entity_id: E.vac }); this.toast({ start: "Heidi startet", pause: "Pause", stop: "Heidi stoppt", return_to_base: "Heidi fährt zur Station", locate: "Heidi meldet sich" }[s] || s); return; }
    if (t.dataset.press) { await this.call("button", "press", { entity_id: t.dataset.press }); this.toast("Ausgelöst"); return; }
    if (t.dataset.reset) { if (!window.confirm(`${t.dataset.name}: Zähler zurücksetzen?`)) return; await this.call("button", "press", { entity_id: t.dataset.reset }); this.toast(`${t.dataset.name} zurückgesetzt`); return; }
    if (t.dataset.run) { const n = t.dataset.run; const name = this.st(`input_text.heidi_plan${n}_name`); if (!this.on(`input_boolean.heidi_plan${n}_aktiv`)) { this.toast("Eintrag ist inaktiv"); return; } if (!window.confirm(`„${name}“ jetzt starten?`)) return; await this.call("script", "heidi_plan_starten", { plan: parseInt(n), variante: "normal" }); this.toast("Gestartet: " + name); return; }
    if (t.dataset.app) { if (!window.confirm(`„${t.dataset.name}“ starten?`)) return; await this.call("script", "heidi_app_szene", { shortcut_id: parseInt(t.dataset.app) }); this.toast("Gestartet: " + t.dataset.name); return; }
    if (t.dataset.edit) { this._editing = parseInt(t.dataset.edit); this._ed = null; this._render(); return; }
    if (t.dataset.shell) { await this.call("shell_command", t.dataset.shell, {}); this.toast("Erledigt"); return; }
  }

  async _onChange(e) {
    const t = e.target;
    if (t.dataset.ed) return; // Editor-Felder werden erst beim Speichern übernommen
    if (t.dataset.select) { const id = t.dataset.select; await this.call(id.split(".")[0], "select_option", { entity_id: id, option: t.value }); return; }
    if (t.dataset.number) { const id = t.dataset.number; let v = parseFloat(t.value); if (id.endsWith("heidi_prognose_intervall")) { v = [5, 10, 15, 20, 30, 60].reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); t.value = v; const b = t.parentElement.querySelector("b"); if (b) b.textContent = `${v}${t.dataset.unit || ""}`; } await this.call(id.split(".")[0], "set_value", { entity_id: id, value: v }); return; }
    if (t.dataset.time) { const id = t.dataset.time; if (!t.value) return; if (id.startsWith("time.")) await this.call("time", "set_value", { entity_id: id, time: t.value + ":00" }); else await this.call("input_datetime", "set_datetime", { entity_id: id, time: t.value + ":00" }); return; }
  }
}

customElements.define("heidi-panel", HeidiPanel);
window.customCards = window.customCards || [];
window.customCards.push({ type: "heidi-panel", name: "Heidi Panel", description: "Komplette Übersicht für den Dreame X60 „Heidi“" });
console.info(`%c HEIDI-PANEL %c v${HP_VERSION} `, "color:#0f151c;background:#2fd1b6;font-weight:700", "color:#2fd1b6;background:#0f151c");
