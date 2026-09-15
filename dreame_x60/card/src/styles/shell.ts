// Stile der Shell: Knöpfe für eingeschobene Dialog-Inhalte der Shell, Toast (Design-Tokens, Bento-Mockup).
// Der Dialog-Rahmen selbst (Scrim, Fenster, Sheet, Bestätigung) ist dx-dialog (4.2).
import { css } from 'lit';

export const shell = css`
  :host { position: relative; }
  .list { margin: 0; padding-left: 18px; }
  .preview li { color: var(--dx-text); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px;
    border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text);
  }
  .btn:hover { background: var(--dx-surface-active); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; }
  .toast {
    position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60;
    background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); color: var(--dx-text);
    padding: 10px 16px; border-radius: var(--dx-radius-md); font-size: 13px; font-weight: 500; box-shadow: var(--dx-shadow-float);
    max-width: min(90vw, 520px); text-align: center; pointer-events: none; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
`;
