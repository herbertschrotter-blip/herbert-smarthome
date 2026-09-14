// Baut heidi-live.html: die echte Karte (ha/www/heidi-panel.js) mit echten HA-Zuständen
// (heidi/tests/real_states.json) und einer nachgebildeten HA-Anbindung. Klicks wirken nur im
// Speicher der Seite. Aufruf:  node heidi/mockups/build-live.js   →  heidi/mockups/heidi-live.html
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..", "..");
const card = fs.readFileSync(path.join(root, "ha/www/heidi-panel.js"), "utf8").replace(/<\/script/g, "<\\/script");
const states = fs.readFileSync(path.join(root, "heidi/tests/real_states.json"), "utf8").replace(/<\/script/g, "<\\/script");

const harness = String.raw`
const states = __STATES__;
const now = () => new Date().toISOString();
const upd = (id, st, attrs) => { const s = states[id] || { entity_id: id, attributes: {} }; states[id] = { ...s, entity_id: id, state: st ?? s.state, attributes: { ...(s.attributes || {}), ...(attrs || {}) }, last_changed: now(), last_updated: now() }; };
const ROOMN = { 1: "Bad", 2: "Schlafzimmer", 3: "WC", 4: "Flur", 5: "Büro", 6: "Küche", 7: "Wohnzimmer" };
const PLANROOMS = { 1: [7, 6, 5, 4, 3, 2, 1], 2: [7, 6, 5, 4, 3, 2, 1], 3: [6, 4], 4: [1, 3] };

// ── Ausgangszustand: Raum-Einstellungen an, Beispielwerte je Raum, Plan 2 mit Einzelwert für das Bad ──
function reset() {
  upd("switch.heidi_customized_cleaning", "on");
  upd("sensor.heidi_phase", "Schläft", { friendly_name: "Heidi Phase" });
  const rooms = { 1: ["sweeping_and_mopping", "turbo", "2x", "wet", null], 2: ["sweeping", "quiet", "1x", null, null], 3: ["mopping", "standard", "1x", "moist", "intensive"],
    4: ["sweeping_and_mopping", "turbo", "1x", "moist", null], 5: ["sweeping", "standard", "1x", null, null], 6: ["sweeping_and_mopping", "turbo", "1x", "wet", null], 7: ["sweeping_and_mopping", "turbo", "1x", "moist", null] };
  for (const [id, [m, s, t, w, r]] of Object.entries(rooms)) {
    upd("select.heidi_room_" + id + "_cleaning_mode", m, { options: ["sweeping", "mopping", "sweeping_and_mopping"] });
    upd("select.heidi_room_" + id + "_suction_level", s, { options: ["quiet", "standard", "strong", "turbo"] });
    upd("select.heidi_room_" + id + "_cleaning_times", t, { options: ["1x", "2x", "3x"] });
    upd("select.heidi_room_" + id + "_mop_pad_humidity", w || "unavailable", { options: ["slightly_dry", "moist", "wet"] });
    upd("select.heidi_room_" + id + "_cleaning_route", r || "unavailable", { options: ["standard", "intensive", "deep"] });
  }
  for (let n = 1; n <= 4; n++) {
    upd("input_text.heidi_plan" + n + "_raumwerte", n === 2 ? "1:B/T/V/-/2" : "");
    upd("input_select.heidi_plan" + n + "_modus", undefined, { options: ["Saugen", "Saugen + Wischen", "Nur Wischen"] });
    upd("input_select.heidi_plan" + n + "_route", "Standard", { options: ["Standard", "Intensiv", "Tief"] });
    delete states["input_select.heidi_plan" + n + "_ho_route"]; delete states["input_select.heidi_plan" + n + "_sp_route"];
  }
  upd("input_text.heidi_raum_snapshot", "");
  upd("input_boolean.heidi_auto_lauf", "off");
  upd("input_text.heidi_auto_letzter_plan", "Saugen + Wischen");
  upd("vacuum.heidi", "docked", { cleaning_sequence: [1, 6, 7, 2, 4, 3, 5], active_segments: null, status: "Sleeping" });
  upd("sensor.heidi_status", "sleeping"); upd("sensor.heidi_task_status", "completed"); upd("sensor.heidi_current_room", "Wohnzimmer");
}
function roomAvail(id, mode) {
  const h = "select.heidi_room_" + id + "_mop_pad_humidity", r = "select.heidi_room_" + id + "_cleaning_route";
  upd(h, mode === "sweeping" ? "unavailable" : (states[h].state === "unavailable" ? "moist" : states[h].state));
  upd(r, mode === "mopping" ? (states[r].state === "unavailable" ? "standard" : states[r].state) : "unavailable");
}
function setVac(st, segs) {
  const phase = { cleaning: "Saugt und wischt Wohnzimmer", paused: "Pausiert", returning: "Fährt zur Station", idle: "Bereit", docked: "Schläft" }[st];
  upd("vacuum.heidi", st, { active_segments: segs === undefined ? states["vacuum.heidi"].attributes.active_segments : segs, status: st === "cleaning" ? "Room cleaning" : st });
  upd("sensor.heidi_status", st === "cleaning" ? "room_cleaning" : st === "docked" ? "sleeping" : st);
  upd("sensor.heidi_task_status", ["cleaning", "paused"].includes(st) ? "room_cleaning" : "completed");
  upd("sensor.heidi_phase", phase);
  if (st === "docked" || st === "idle") { upd("input_boolean.heidi_auto_lauf", "off"); }
}
// Planer-Eintrag "starten": wie das HA-Skript – Sicherung, Raumwerte setzen, losfahren
function runPlan(n, variante) {
  const g = (id) => states[id]?.state, rooms = (g("input_text.heidi_plan" + n + "_raeume") || "").split(",").map(Number).filter(Boolean);
  if (!g("input_text.heidi_raum_snapshot")) upd("input_text.heidi_raum_snapshot", [1,2,3,4,5,6,7].map((i) => i + ":" + ({ sweeping: "S", sweeping_and_mopping: "B", mopping: "W" })[g("select.heidi_room_" + i + "_cleaning_mode")] + "/T/-/-/1").join(";"));
  const M = { Saugen: "sweeping", "Saugen + Wischen": "sweeping_and_mopping", "Nur Wischen": "mopping" }, S = { Leise: "quiet", Standard: "standard", Stark: "strong", Turbo: "turbo" }, W = { Wenig: "slightly_dry", Mittel: "moist", Viel: "wet" }, R = { Standard: "standard", Intensiv: "intensive", Tief: "deep" };
  const RV = { modus: { S: "Saugen", B: "Saugen + Wischen", W: "Nur Wischen" }, saug: { L: "Leise", S: "Standard", K: "Stark", T: "Turbo" }, wasser: { W: "Wenig", M: "Mittel", V: "Viel" }, route: { S: "Standard", I: "Intensiv", T: "Tief" } };
  const ov = {}; (variante === "normal" ? (g("input_text.heidi_plan" + n + "_raumwerte") || "") : "").split(";").forEach((p) => { const [id, rest] = p.split(":"); if (id && rest) { const f = rest.split("/"); ov[id] = { modus: RV.modus[f[0]], saug: RV.saug[f[1]], wasser: RV.wasser[f[2]], route: RV.route[f[3]], wdh: f[4] }; } });
  const std = { modus: variante === "normal" ? g("input_select.heidi_plan" + n + "_modus") : "Saugen", saug: variante === "schnell" ? g("input_select.heidi_plan" + n + "_sp_saug") : variante === "leise" ? g("input_select.heidi_plan" + n + "_ho_saug") : g("input_select.heidi_plan" + n + "_saugstufe"), wasser: g("input_select.heidi_plan" + n + "_wasser"), route: g("input_select.heidi_plan" + n + "_route"), wdh: variante === "schnell" ? g("input_select.heidi_plan" + n + "_sp_wdh") : variante === "leise" ? g("input_select.heidi_plan" + n + "_ho_wdh") : g("input_select.heidi_plan" + n + "_wiederholungen") };
  rooms.forEach((i) => { const v = { ...std, ...(ov[i] || {}) }; upd("select.heidi_room_" + i + "_cleaning_mode", M[v.modus] || "sweeping"); roomAvail(i, M[v.modus] || "sweeping"); upd("select.heidi_room_" + i + "_suction_level", S[v.saug] || "turbo"); upd("select.heidi_room_" + i + "_cleaning_times", (v.wdh || "1") + "x"); if (v.modus !== "Saugen" && v.wasser) upd("select.heidi_room_" + i + "_mop_pad_humidity", W[v.wasser]); if (v.modus === "Nur Wischen" && v.route) upd("select.heidi_room_" + i + "_cleaning_route", R[v.route]); });
  upd("input_boolean.heidi_auto_lauf", "on"); upd("input_text.heidi_auto_letzter_plan", g("input_text.heidi_plan" + n + "_name") + (variante === "schnell" ? " (schnell)" : variante === "leise" ? " (leise, Homeoffice)" : ""));
  setVac("cleaning", rooms); upd("sensor.heidi_phase", "Wäscht Mopps vor dem Start");
}
const calls = [];
function log(txt) { calls.unshift(new Date().toLocaleTimeString("de-AT") + "  " + txt); if (calls.length > 8) calls.pop(); document.getElementById("log").textContent = calls.join("\n"); }
async function callService(domain, service, data) {
  const ids = Array.isArray(data?.entity_id) ? data.entity_id : [data?.entity_id];
  log(domain + "." + service + " " + JSON.stringify(data || {}));
  for (const id of ids) {
    if (domain === "select" && service === "select_option") { if (states[id]?.state === "unavailable") throw new Error("Entität nicht verfügbar"); upd(id, data.option); const m = id.match(/room_(\d)_cleaning_mode/); if (m) roomAvail(m[1], data.option); }
    else if (domain === "input_select") upd(id, data.option);
    else if (domain === "input_text") upd(id, data.value);
    else if (domain === "input_number" || domain === "number") upd(id, String(data.value));
    else if (domain === "input_boolean") upd(id, service === "toggle" ? (states[id]?.state === "on" ? "off" : "on") : service === "turn_on" ? "on" : "off");
    else if (domain === "input_datetime") upd(id, data.time || data.date);
    else if (domain === "time") upd(id, data.time);
    else if (domain === "vacuum") { const m = { start: "cleaning", pause: "paused", stop: "idle", return_to_base: "returning" }[service]; if (m) setVac(m, m === "cleaning" && !states["vacuum.heidi"].attributes.active_segments ? [7, 6, 5, 4, 3, 2, 1] : undefined); }
    else if (domain === "script" && service === "heidi_plan_starten") runPlan(data.plan, data.variante || "normal");
    else if (domain === "script" && service === "heidi_app_szene") { setVac("cleaning", [4]); }
    else if (domain === "dreame_vacuum" && service === "vacuum_clean_segment") setVac("cleaning", data.segments);
    else if (domain === "dreame_vacuum" && service === "vacuum_set_restricted_zone") { /* nur Log */ }
  }
  push();
}
async function callApi(m, path) {
  const t = Date.now(), mm = (min) => new Date(t - min * 60000).toISOString();
  return [[{ state: "Schläft", last_changed: mm(480) }, { state: "Wäscht Mopps vor dem Start", last_changed: mm(41) }, { state: "Saugt und wischt Wohnzimmer", last_changed: mm(36) }, { state: "Fährt zum Mopp-Waschen", last_changed: mm(19) }, { state: "Wäscht Mopps zwischendurch", last_changed: mm(17) }, { state: "Saugt und wischt Küche", last_changed: mm(12) }, { state: "Wischt WC", last_changed: mm(3) }]];
}
let el;
function push() { el.hass = { states: { ...states }, callService, callApi, language: "de" }; }
window.addEventListener("DOMContentLoaded", () => {
  reset();
  el = document.querySelector("heidi-panel"); el.setConfig({});
  el.addEventListener("hass-more-info", (e) => log("Mehr-Info: " + e.detail.entityId + " (im Mockup ohne Dialog)"));
  push();
  document.getElementById("bar").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; const s = b.dataset.s;
    if (s === "reset") { reset(); }
    else if (s === "plan2") { runPlan(2, "normal"); upd("sensor.heidi_phase", "Saugt und wischt Wohnzimmer"); }
    else if (s === "plan2s") { runPlan(2, "schnell"); upd("sensor.heidi_phase", "Saugt Wohnzimmer"); }
    else if (s === "paused") { setVac("paused"); }
    else if (s === "docked") { setVac("docked", null); }
    push();
  });
});
`;

const html = `<title>Heidi Live-Mockup</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; background: #0c1219; color: #e8edf2; font-family: "IBM Plex Sans", system-ui, sans-serif; padding-bottom: 130px; }
  .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: rgba(12,18,25,.92); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,.1); padding: 8px 12px; display: grid; gap: 6px; font-size: 12px; }
  .bar .row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .bar .row b { color: #2fd1b6; margin-right: 4px; }
  .bar button { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: #e8edf2; border-radius: 8px; padding: 6px 10px; font: 500 12px "IBM Plex Sans", system-ui, sans-serif; cursor: pointer; }
  .bar button:hover { background: rgba(255,255,255,.12); }
  #log { margin: 0; font: 11px/1.4 ui-monospace, Consolas, monospace; color: #94a4b4; white-space: pre-wrap; max-height: 62px; overflow: auto; }
  .hint { color: #94a4b4; }
</style>
<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
<script>
  class HaIcon extends HTMLElement {
    static get observedAttributes() { return ["icon"]; }
    connectedCallback() { this.render(); } attributeChangedCallback() { this.render(); }
    render() { const i = this.getAttribute("icon") || ""; this.innerHTML = customElements.get("iconify-icon") ? '<iconify-icon icon="' + i + '" style="font-size:var(--mdc-icon-size,24px);display:inline-block;vertical-align:middle;line-height:1"></iconify-icon>' : '<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:currentColor;opacity:.5"></span>'; }
  }
  customElements.define("ha-icon", HaIcon);
  window.loadCardHelpers = async () => ({ createCardElement: (cfg) => { const d = document.createElement("div"); d.style.cssText = "height:280px;background:#1c2732;color:#9ab;display:grid;place-items:center;border-radius:12px;font-size:13px"; d.textContent = "Karte (" + cfg.type + ") – im Mockup ohne Kartenbild"; return d; } });
</script>
<heidi-panel></heidi-panel>
<div class="bar" id="bar">
  <div class="row"><b>Mockup</b><span class="hint">Klicks wirken nur hier auf der Seite. Szenario:</span>
    <button data-s="docked">Angedockt</button><button data-s="plan2">Plan 2 läuft</button><button data-s="plan2s">Plan 2 als Schnellprogramm</button><button data-s="paused">Pausiert</button><button data-s="reset">Alles zurücksetzen</button></div>
  <pre id="log">Was an Home Assistant gesendet würde, erscheint hier.</pre>
</div>
<script>${card}</script>
<script>${harness.replace("__STATES__", states)}</script>
`;
const out = path.join(__dirname, "heidi-live.html");
fs.writeFileSync(out, html, "utf8");
console.log("geschrieben:", out, Math.round(html.length / 1024) + " KB");
