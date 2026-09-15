// Gemeinsame Bedienstile für Bausteine (aus bento.html): Kopfzeile einer Fläche, Status-Punkt, Chips, Knöpfe, Balken, Zeilen.
// Farben nur über Tokens; Klassen: good = positiv, acc = Auswahl, warn = Hinweis, bad = Fehler.
import { css } from 'lit';

export const controls = css`
  :host { font-family: var(--dx-font); font-size: 14px; line-height: 1.4; color: var(--dx-text); }
  *, *::before, *::after { box-sizing: border-box; }
  h2, h3, p { margin: 0; }
  h2, h3 { font-weight: 600; letter-spacing: -0.01em; }
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 2px solid var(--dx-accent); outline-offset: 2px; }
  ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; display: inline-flex; flex: none; }

  .hd { display: flex; align-items: center; gap: var(--dx-space-2); min-height: 24px; }
  .hd h2 { font-size: 15px; display: flex; align-items: center; gap: 8px; }
  .hd .r { margin-left: auto; font-size: 12px; color: var(--dx-text-muted); display: inline-flex; align-items: center; gap: 4px; }
  .lbl { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dx-text-muted); font-weight: 600; }
  .hint { font-size: 12px; color: var(--dx-text-muted); line-height: 1.45; }

  /* Status-Punkt */
  .st { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
  .st i { width: 8px; height: 8px; border-radius: 50%; background: var(--dx-text-muted); flex: none; }
  .st.good i { background: var(--dx-positive); } .st.acc i { background: var(--dx-accent); } .st.warn i { background: var(--dx-warning); } .st.bad i { background: var(--dx-danger); }
  .st.good { color: var(--dx-positive); } .st.warn { color: var(--dx-warning); } .st.bad { color: var(--dx-danger); }
  .st.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; background: var(--dx-surface-raised); border: 1px solid var(--dx-border); white-space: nowrap; }

  /* Werte */
  .kv { display: flex; align-items: baseline; gap: 10px; }
  .kv .v { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums; }
  .kv .u { font-size: 14px; color: var(--dx-text-muted); }

  /* Chips */
  .chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border-radius: 999px; background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text); white-space: nowrap; }
  .chip ha-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; color: var(--dx-text-muted); }
  .chip.on { border-color: rgba(57, 217, 138, 0.45); background: var(--dx-positive-soft); } .chip.on ha-icon { color: var(--dx-positive); }
  .chip.acc { border-color: rgba(88, 183, 246, 0.5); background: var(--dx-accent-soft); } .chip.acc ha-icon { color: var(--dx-accent); }
  .chip.warn { border-color: rgba(242, 181, 68, 0.5); background: var(--dx-warning-soft); color: var(--dx-warning); } .chip.warn ha-icon { color: var(--dx-warning); }
  .chip.bad { border-color: rgba(239, 91, 91, 0.5); background: var(--dx-danger-soft); color: var(--dx-danger); } .chip.bad ha-icon { color: var(--dx-danger); }
  .chip.k { height: 26px; font-size: 11px; padding: 0 8px; }
  .chip.dim { opacity: 0.55; }
  button.chip:hover { background: var(--dx-surface-active); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }

  /* Knöpfe */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text); transition: background var(--dx-dur), border-color var(--dx-dur), transform 80ms; white-space: nowrap; }
  .btn:hover { background: var(--dx-surface-active); } .btn:active { transform: scale(0.985); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; } .btn.primary:hover { filter: brightness(1.06); }
  .btn.primary ha-icon { color: var(--dx-on-positive); }
  .btn.danger { color: var(--dx-danger); border-color: rgba(239, 91, 91, 0.35); }
  .btn.on { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); }
  .btn.sm { height: 36px; padding: 0 12px; font-size: 13px; }
  .btn.icon { width: var(--dx-touch); padding: 0; }

  /* Hinweiszeile (Streifen) */
  .note { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 13px; text-align: left; width: 100%; }
  .note > ha-icon { color: var(--dx-positive); margin-top: 1px; }
  .note b { display: block; } .note small { color: var(--dx-text-muted); font-size: 12px; }
  button.note:hover { background: var(--dx-surface-active); }

  /* Balken und Zeilen */
  .bar { height: 6px; border-radius: 999px; background: var(--dx-surface-active); overflow: hidden; }
  .bar i { display: block; height: 100%; border-radius: inherit; background: var(--dx-positive); width: calc(var(--p) * 1%); transition: width 400ms var(--dx-ease); }
  .bar.warn i { background: var(--dx-warning); } .bar.bad i { background: var(--dx-danger); } .bar.acc i { background: var(--dx-accent); }
  .meter { display: grid; grid-template-columns: minmax(84px, auto) 1fr 44px; align-items: center; gap: 10px; min-height: 32px; font-size: 13px; }
  .meter .n { color: var(--dx-text-muted); } .meter .p { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .row { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 6px 0; border-top: 1px solid var(--dx-border); }
  .row:first-child { border-top: 0; }
  .row .t { font-size: 14px; font-weight: 500; } .row .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 1px; }
  .row > div:first-child { flex: 1; min-width: 0; }
  .tag { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 3px 8px; border-radius: 6px; background: var(--dx-surface-active); color: var(--dx-text-muted); white-space: nowrap; }
  .tag.acc { color: var(--dx-accent); background: var(--dx-accent-soft); }

  /* Listenzeilen mit Symbol (Szenen, Planer), Schalter, kleine Symbolknöpfe */
  .plan { display: grid; }
  .pr { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-top: 1px solid var(--dx-border); }
  .pr:first-child { border-top: 0; }
  .pr .ic { width: 36px; height: 36px; border-radius: var(--dx-radius-sm); background: var(--dx-surface-raised); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid var(--dx-border); }
  .pr .n { font-weight: 600; font-size: 14px; } .pr .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 2px; }
  .pr .acts { display: flex; gap: 6px; }
  .crow { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); }
  .crow .ic { width: 38px; height: 38px; border-radius: var(--dx-radius-sm); background: var(--dx-surface-active); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); }
  .crow .ic.on { color: var(--dx-positive); background: var(--dx-positive-soft); }
  .crow .t { font-weight: 600; font-size: 14px; } .crow .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 1px; }
  .sw { width: 44px; height: 26px; border-radius: 999px; background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); position: relative; flex: none; transition: background var(--dx-dur), border-color var(--dx-dur); }
  .sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dx-text-muted); transition: transform var(--dx-dur) var(--dx-ease), background var(--dx-dur); }
  .sw.on { background: var(--dx-positive-soft); border-color: rgba(57, 217, 138, 0.5); } .sw.on::after { transform: translateX(18px); background: var(--dx-positive); }
  .ib { width: 40px; height: 40px; border-radius: var(--dx-radius-sm); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid var(--dx-border); background: var(--dx-surface-raised); }
  .ib:hover { color: var(--dx-text); background: var(--dx-surface-active); } .ib.go { color: var(--dx-positive); }

  @media (hover: none) { .btn:hover, button.chip:hover, button.note:hover { background: var(--dx-surface-raised); } }
`;
