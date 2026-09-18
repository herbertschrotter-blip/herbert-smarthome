// diag.js – Auswertung des Heidi-Diagnose-Protokolls (Bauplan F.1, DX-068).
// Liest die Tagesdateien aus H:\prognose\diag\ (heidi_diag-<Tag>.jsonl + dreame_debug-<Tag>.log, beide Ortszeit mit
// Millisekunden) und führt sie per Zeitstempel zu einer Zeitleiste zusammen.
//
//   node tools\diag.js                                  heute: Starts mit Quelle + Zahlen je Entität
//   node tools\diag.js --tag 2026-09-18                 anderer Tag
//   node tools\diag.js --von 09:25 --bis 09:40          Zeitleiste des Fensters (Zustände, Dienste, Automationen)
//   node tools\diag.js --von 09:25 --bis 09:40 --debug  dazu die Rohmeldungen der Integration (ohne „Device update“)
//   node tools\diag.js --ent vacuum.heidi               nur Zeilen, deren Entität/Dienst den Text enthält
//   node tools\diag.js --ordner <pfad>                  anderer Ordner (Standard H:\prognose\diag)
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const opt = (name, fallback = "") => { const i = args.indexOf("--" + name); return i >= 0 ? (args[i + 1] ?? "") : fallback; };
const flag = (name) => args.includes("--" + name);
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const tag = opt("tag", `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
const dir = opt("ordner", "H:\\prognose\\diag");
const von = opt("von"), bis = opt("bis"), ent = opt("ent");
const RUN = ["cleaning", "paused", "returning"];
const START_FENSTER_S = 90; // so lange vor dem Wechsel auf „cleaning“ gilt ein HA-Dienstaufruf als Auslöser

function readLines(file) {
  try { return fs.readFileSync(path.join(dir, file), "utf8").split(/\r?\n/).filter(Boolean); }
  catch { return []; }
}

const rows = readLines(`heidi_diag-${tag}.jsonl`).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
if (!rows.length) { console.error(`Keine Zeilen in ${path.join(dir, `heidi_diag-${tag}.jsonl`)}`); process.exit(1); }

const hhmm = (ts) => ts.slice(11, 23);
const inWindow = (ts) => (!von || ts.slice(11) >= von) && (!bis || ts.slice(11) <= bis + ":59.999");
const who = (r) => r.quelle === "benutzer" ? `Benutzer ${r.wer || r.user_id}` : r.quelle === "automation" ? `Automation ${r.durch || ""}`.trim() : r.quelle;

function text(r) {
  if (r.art === "zustand") {
    const attr = Object.entries(r.attr || {}).map(([k, [a, b]]) => `${k}: ${a} → ${b}`).join("; ");
    return `${r.ent}  ${r.alt === r.neu ? "" : `${r.alt} → ${r.neu}`}${attr ? `  {${attr}}` : ""}`;
  }
  if (r.art === "dienst") return `DIENST ${r.dienst} ${JSON.stringify(r.daten || {})}`;
  return `${r.art.toUpperCase()} ${r.name || r.ent}${r.ausloeser ? ` (${r.ausloeser})` : ""}`;
}

// Starts: Wechsel von vacuum.* auf „cleaning“ aus einem Zustand außerhalb des Laufs. Quelle = eigene Zeile, sonst der
// letzte HA-Dienstaufruf an den Roboter kurz davor (der Roboter meldet „cleaning“ oft später als 5 s → Kontext weg).
function starts() {
  const out = [];
  rows.forEach((r, i) => {
    if (r.art !== "zustand" || !/^vacuum\./.test(r.ent) || r.neu !== "cleaning" || RUN.includes(r.alt)) return;
    let quelle = who(r), beleg = "Kontext der Zustandsänderung";
    if (r.quelle === "extern") {
      const t = Date.parse(r.ts);
      const call = rows.slice(0, i).reverse().find((c) => c.art === "dienst" && t - Date.parse(c.ts) <= START_FENSTER_S * 1000
        && /^(vacuum|dreame_vacuum)\./.test(c.dienst) && !/pause|stop|return|locate/.test(c.dienst));
      if (call) { quelle = who(call); beleg = `${call.dienst} um ${hhmm(call.ts)}`; }
      else { quelle = "extern (Dreame-App, Knopf am Roboter oder App-Zeitplan)"; beleg = `kein HA-Dienstaufruf in den ${START_FENSTER_S} s davor`; }
    }
    out.push(`${hhmm(r.ts)}  Start  ← ${quelle}  [${beleg}]`);
  });
  return out;
}

if (!von && !bis && !ent) {
  console.log(`Diagnose ${tag}: ${rows.length} Zeilen, ${hhmm(rows[0].ts)} – ${hhmm(rows.at(-1).ts)}\n`);
  const s = starts();
  console.log(s.length ? "Starts:\n  " + s.join("\n  ") : "Starts: keine");
  const count = {};
  for (const r of rows) { const k = r.ent || r.dienst || r.art; count[k] = (count[k] || 0) + 1; }
  console.log("\nZeilen je Entität/Dienst (Top 15):");
  Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, n]) => console.log(`  ${String(n).padStart(5)}  ${k}`));
  const q = {};
  for (const r of rows) q[r.quelle] = (q[r.quelle] || 0) + 1;
  console.log("\nQuellen: " + Object.entries(q).map(([k, n]) => `${k} ${n}`).join(", "));
  console.log("\nZeitleiste eines Fensters: node tools\\diag.js --von HH:MM --bis HH:MM [--debug] [--ent text]");
} else {
  const lines = rows.filter((r) => inWindow(r.ts) && (!ent || (r.ent || r.dienst || "").includes(ent)))
    .map((r) => ({ ts: r.ts, s: `${hhmm(r.ts)}  ${who(r).padEnd(28).slice(0, 28)}  ${text(r)}` }));
  if (flag("debug")) {
    let ts = "";
    for (const l of readLines(`dreame_debug-${tag}.log`)) {
      const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}\.\d{3}) \w+ \([^)]*\) \[[^\]]+\] (.*)$/.exec(l);
      if (m) ts = `${m[1]}T${m[2]}`;
      if (!ts || !inWindow(ts) || /Device update: \d+$/.test(l)) continue;
      lines.push({ ts, s: `${hhmm(ts)}  ${"· Integration".padEnd(28)}  ${(m ? m[3] : l).replace(/\?Expires=[^\s'"]+/g, "?…")}` });
    }
  }
  lines.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  lines.forEach((l) => console.log(l.s.length > 260 ? l.s.slice(0, 260) + " …" : l.s));
  console.log(`\n${lines.length} Zeilen`);
}
