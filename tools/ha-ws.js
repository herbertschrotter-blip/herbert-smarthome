// ha-ws.js – Home-Assistant-WebSocket-API (für Dinge, die die REST-API nicht kann:
// Personen, Entitäts-Register, Dashboards …). Token/URL aus HA_TOKEN / HA_URL
// (Benutzer-Umgebungsvariablen). Der Token wird nie ausgegeben.
//
//   node tools\ha-ws.js person/list
//   node tools\ha-ws.js person/update '{"person_id":"...","device_trackers":["device_tracker.x"]}'
//   node tools\ha-ws.js config/entity_registry/get '{"entity_id":"binary_sensor.x"}'
//   node tools\ha-ws.js config/entity_registry/update '{"entity_id":"a.b","new_entity_id":"a.c"}'
const { execSync } = require("node:child_process");

function userEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    return execSync(
      `powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('${name}','User')"`,
      { encoding: "utf8" }
    ).trim();
  } catch { return ""; }
}

const token = userEnv("HA_TOKEN");
const url = (userEnv("HA_URL") || "http://192.168.170.60:8123").replace(/\/$/, "");
if (!token) { console.error("HA_TOKEN fehlt (Benutzer-Umgebungsvariable)."); process.exit(1); }

const [type, jsonArg] = process.argv.slice(2);
if (!type) { console.error("Aufruf: node tools\\ha-ws.js <type> [json]"); process.exit(1); }
let extra = {};
if (jsonArg) { try { extra = JSON.parse(jsonArg); } catch (e) { console.error("JSON ungültig:", e.message); process.exit(1); } }

const ws = new WebSocket(url.replace(/^http/, "ws") + "/api/websocket");
const timer = setTimeout(() => { console.error("Zeitüberschreitung."); process.exit(1); }, 15000);

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === "auth_required") ws.send(JSON.stringify({ type: "auth", access_token: token }));
  else if (msg.type === "auth_invalid") { console.error("Token ungültig."); process.exit(1); }
  else if (msg.type === "auth_ok") ws.send(JSON.stringify({ id: 1, type, ...extra }));
  else if (msg.id === 1) {
    clearTimeout(timer);
    if (msg.success) console.log(JSON.stringify(msg.result, null, 2));
    else { console.error("Fehler:", JSON.stringify(msg.error)); process.exitCode = 1; }
    ws.close();
  }
};
ws.onerror = (e) => { console.error("WebSocket-Fehler:", e.message || e); process.exit(1); };
