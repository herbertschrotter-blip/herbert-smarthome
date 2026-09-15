// Grundstile der Karte: Schrift, Gerüst (Navigation + Inhalt), Kopfzeile, Bento-Raster. Komponenten bringen ihre eigenen static styles mit.
// Container: `app` = die Karte selbst (Navigationsform), `content` = Inhaltsbereich (Bento-Spalten). Werte aus bento.html.
import { css } from 'lit';

export const base = css`
  :host {
    display: block;
    background: var(--dx-bg);
    color: var(--dx-text);
    font-family: var(--dx-font);
    font-size: 14px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    min-height: 100%;
    box-sizing: border-box;
  }
  /* Container „app“ = die Karte; Overlay und Toast liegen außerhalb (position: fixed bleibt am Viewport) */
  .root {
    container-type: inline-size;
    container-name: app;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1,
  h2,
  h3 {
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid var(--dx-accent);
    outline-offset: 2px;
  }
  ha-icon {
    --mdc-icon-size: 20px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    flex: none;
  }

  /* Gerüst: Seitenleiste | Inhalt; schmal: Inhalt / Tab-Leiste */
  .app {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    grid-template-areas: 'side content';
    min-height: calc(100vh - var(--header-height, 56px));
  }
  .content {
    grid-area: content;
    padding: var(--dx-space-5);
    display: grid;
    gap: var(--dx-space-4);
    align-content: start;
    container-type: inline-size;
    container-name: content;
    min-width: 0;
  }

  /* Kopfzeile */
  .topbar {
    display: flex;
    align-items: center;
    gap: var(--dx-space-4);
    flex-wrap: wrap;
  }
  .topbar h1 {
    font-size: 28px;
  }
  .topbar .sub {
    color: var(--dx-text-muted);
    font-size: 14px;
    margin-top: 2px;
  }
  .topbar .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding: 0 10px 0 6px;
    border-radius: var(--dx-radius-md);
    color: var(--dx-text-muted);
    font-weight: 500;
  }
  .topbar .back:hover {
    background: var(--dx-surface);
    color: var(--dx-text);
  }
  .topbar .meta {
    margin-left: auto;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .meta .mi {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-left: 1px solid var(--dx-border);
  }
  .meta .mi:first-child {
    border-left: 0;
  }
  /* Einrichtungsprüfung (PD-014): nur die Symbole mit Befund zwischen Titel und Uhr; rot pulsiert; Klick springt zur Stelle */
  .topbar .setupicons { display: flex; align-items: center; gap: 8px; margin-left: 16px; }
  .topbar .si { width: 36px; height: 36px; border-radius: 50%; display: inline-grid; place-items: center; border: 1px solid transparent; cursor: pointer; padding: 0; }
  .topbar .si ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
  .topbar .si.warn { background: color-mix(in srgb, var(--dx-warning) 22%, transparent); color: var(--dx-warning); border-color: var(--dx-warning); }
  .topbar .si.error { background: color-mix(in srgb, var(--dx-danger) 24%, transparent); color: var(--dx-danger); border-color: var(--dx-danger); animation: dx-setup-pulse 1.6s ease-in-out infinite; }
  .topbar .si:hover { filter: brightness(1.2); }
  @keyframes dx-setup-pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dx-danger) 55%, transparent); }
    50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--dx-danger) 0%, transparent); }
  }
  @media (prefers-reduced-motion: reduce) { .topbar .si.error { animation: none; } }
  .meta .mi ha-icon {
    color: var(--dx-text-muted);
  }
  .meta .mi b {
    display: block;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .meta .mi small {
    color: var(--dx-text-muted);
    font-size: 11px;
  }
  .meta .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--dx-text-faint);
    display: inline-block;
    margin-left: 6px;
  }
  .meta .dot.on {
    background: var(--dx-positive);
  }

  /* Bento-Flächen */
  .bento {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--dx-space-4);
    grid-auto-rows: min-content;
  }
  .b {
    background: var(--dx-surface);
    border: 1px solid var(--dx-border);
    border-radius: var(--dx-radius-lg);
    padding: var(--dx-space-4);
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--dx-space-3);
  }
  .b > .hd {
    display: flex;
    align-items: center;
    gap: var(--dx-space-2);
    min-height: 24px;
  }
  .b > .hd h2 {
    font-size: 15px;
  }
  .b > .hd .r {
    margin-left: auto;
    font-size: 12px;
    color: var(--dx-text-muted);
  }
  .stack {
    display: grid;
    gap: var(--dx-space-4);
    align-content: start;
    min-width: 0;
  }
  .lbl {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dx-text-muted);
    font-weight: 600;
  }
  .hint {
    font-size: 12px;
    color: var(--dx-text-muted);
    line-height: 1.45;
  }
  .span3 { grid-column: span 3; }
  .span4 { grid-column: span 4; }
  .span5 { grid-column: span 5; }
  .span6 { grid-column: span 6; }
  .span7 { grid-column: span 7; }
  .span8 { grid-column: span 8; }
  .span9 { grid-column: span 9; }
  .span12 { grid-column: span 12; }

  /* Navigationsform (Container app = die Karte) */
  @container app (max-width: 1180px) {
    .app { grid-template-columns: 72px minmax(0, 1fr); }
    .content { padding: 20px; }
    .topbar h1 { font-size: 24px; }
  }
  @container app (max-width: 760px) {
    /* Inhalt wächst mit (1fr = minmax(auto, 1fr)), Tab-Leiste ganz unten und beim Scrollen am Viewport-Rand (sticky) */
    .app { grid-template-columns: minmax(0, 1fr); grid-template-rows: 1fr auto; grid-template-areas: 'content' 'tab'; }
    .content { padding: 16px 16px 24px; }
    .topbar h1 { font-size: 22px; }
    .topbar .meta { display: none; }
  }

  /* Bento-Spalten (Container content = Inhaltsbereich) */
  @container content (max-width: 1099px) {
    .bento { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .span3, .span4, .span5 { grid-column: span 3; }
    .span6, .span7, .span8, .span9 { grid-column: span 6; }
    /* Tablet: Roboter-Panel und rechte Spalte nebeneinander, Karte darunter in voller Breite */
    [data-slot='hero'] { order: -2; }
    .rightstack { order: -1; }
  }
  @container content (max-width: 640px) {
    .bento { grid-template-columns: minmax(0, 1fr); gap: var(--dx-space-3); }
    .span3, .span4, .span5, .span6, .span7, .span8, .span9, .span12 { grid-column: span 1; }
  }
`;
