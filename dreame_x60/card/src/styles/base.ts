// Grundstile der Karte: Schrift, Flächen, Kopfzeile, Bento-Raster. Komponenten bringen ihre eigenen static styles mit.
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

  /* Seite */
  .page {
    padding: var(--dx-space-5);
    display: grid;
    gap: var(--dx-space-4);
    align-content: start;
    container-type: inline-size;
    container-name: content;
    min-width: 0;
  }
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
  .version {
    margin-left: auto;
    font-size: 11px;
    color: var(--dx-text-faint);
    font-variant-numeric: tabular-nums;
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
  .span6 { grid-column: span 6; }
  .span8 { grid-column: span 8; }
  .span12 { grid-column: span 12; }

  @container content (max-width: 1099px) {
    .bento { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .span3, .span4 { grid-column: span 3; }
    .span6, .span8 { grid-column: span 6; }
    .topbar h1 { font-size: 24px; }
  }
  @container content (max-width: 640px) {
    .page { padding: var(--dx-space-4); }
    .bento { grid-template-columns: minmax(0, 1fr); gap: var(--dx-space-3); }
    .span3, .span4, .span6, .span8, .span12 { grid-column: span 1; }
    .topbar h1 { font-size: 22px; }
  }
`;
