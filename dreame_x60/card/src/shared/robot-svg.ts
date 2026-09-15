// Roboter-Bild aus dem Mockup bento.html (Seitenleiste, später Roboter-Panel). Reines Schmuckbild, aria-hidden.
import { svg } from 'lit';
import type { TemplateResult } from 'lit';

export const robotSvg: TemplateResult = svg`<svg viewBox="0 0 200 200" class="robotpic" aria-hidden="true">
  <defs><radialGradient id="rg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2a3a48"/><stop offset=".7" stop-color="#131c25"/><stop offset="1" stop-color="#0c1219"/></radialGradient></defs>
  <ellipse cx="100" cy="176" rx="72" ry="9" fill="rgba(0,0,0,.45)"/>
  <circle cx="100" cy="100" r="84" fill="url(#rg)" stroke="#33465a" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
  <path d="M40 130a66 66 0 0 0 120 0" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
  <circle cx="100" cy="82" r="20" fill="#0d141b" stroke="#3a4f63" stroke-width="1.5"/><circle cx="100" cy="82" r="8" fill="#1a2733" stroke="#58b7f6" stroke-width="1.2"/>
  <rect x="86" y="118" width="28" height="6" rx="3" fill="#1c2a36"/><circle cx="100" cy="150" r="3" fill="#39d98a"/>
  <path d="M60 46a56 56 0 0 1 80 0" fill="none" stroke="rgba(88,183,246,.35)" stroke-width="2" stroke-linecap="round"/></svg>`;
