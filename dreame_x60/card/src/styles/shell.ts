// Stile der Shell: Overlay-Rahmen, Bestätigung, Toast (Design-Tokens, Bento-Mockup). Der echte Dialog kommt mit dx-dialog (4.2).
import { css } from 'lit';

export const shell = css`
  :host { position: relative; }
  .list { margin: 0; padding-left: 18px; }
  .preview li { color: var(--dx-text); }
  .overlay { position: fixed; inset: 0; z-index: 30; }
  .scrim { position: absolute; inset: 0; background: rgba(3, 6, 9, 0.62); animation: fade var(--dx-dur) both; }
  .dlg {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: min(640px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow: auto;
    background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-xl);
    padding: 18px 20px 20px; box-shadow: var(--dx-shadow-float); display: grid; gap: 14px; align-content: start; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  .dlg > h2 { font-size: 18px; display: flex; align-items: center; gap: 8px; }
  .dlg > h2 .iconbtn { margin-left: auto; }
  .dlg .foot { display: flex; justify-content: flex-end; gap: 8px; }
  .iconbtn { width: 40px; height: 40px; border-radius: var(--dx-radius-md); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); }
  .iconbtn:hover { background: var(--dx-surface-raised); color: var(--dx-text); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px;
    border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text);
  }
  .btn:hover { background: var(--dx-surface-active); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; }
  .alert {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(360px, calc(100% - 48px));
    background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-lg); box-shadow: var(--dx-shadow-float); overflow: hidden; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  .alert .m { padding: 20px 18px 16px; font-weight: 600; font-size: 15px; text-align: center; }
  .alert .m small { display: block; font-weight: 400; color: var(--dx-text-muted); font-size: 13px; margin-top: 6px; }
  .alert .b { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--dx-border); }
  .alert .b button { height: 48px; font-weight: 600; color: var(--dx-text-muted); }
  .alert .b button + button { border-left: 1px solid var(--dx-border); color: var(--dx-accent); }
  .alert .b button.danger { color: var(--dx-danger); }
  .toast {
    position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60;
    background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); color: var(--dx-text);
    padding: 10px 16px; border-radius: var(--dx-radius-md); font-size: 13px; font-weight: 500; box-shadow: var(--dx-shadow-float);
    max-width: min(90vw, 520px); text-align: center; pointer-events: none; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @container content (max-width: 640px) {
    .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
    .alert { top: auto; bottom: 16px; left: 16px; right: 16px; transform: none; width: auto; }
  }
`;
