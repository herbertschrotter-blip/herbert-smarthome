// Design-Tokens „Automotive Dark Bento“ (Designvorgabe 14.09., Referenz dreame_x60/mockups/bento.html).
// Alle Farben, Radien, Abstände und Dauern kommen von hier – keine Sonderwerte in Komponenten (Abschnitt 27).
// Dark ist die Referenz; :host(.light) ist ein vorbereiteter Satz für später (Abschnitt 28), noch nicht abgenommen.
import { css } from 'lit';

export const tokens = css`
  :host {
    /* Flächen: Seite → Bento-Fläche → interaktive Fläche → aktiv */
    --dx-bg: #0b1015;
    --dx-bg-elevated: #10171e;
    --dx-surface: #111a22;
    --dx-surface-raised: #16212a;
    --dx-surface-active: #1c2a36;

    --dx-text: #e7edf3;
    --dx-text-muted: #8a97a6;
    --dx-text-faint: #5d6b7a;

    /* Farben mit Bedeutung (Abschnitt 3): Grün = aktiv/OK, Blau = Auswahl/Interaktion, Amber = Hinweis, Rot = Fehler */
    --dx-accent: #58b7f6;
    --dx-accent-soft: rgba(88, 183, 246, 0.14);
    --dx-positive: #39d98a;
    --dx-positive-soft: rgba(57, 217, 138, 0.14);
    --dx-warning: #f2b544;
    --dx-warning-soft: rgba(242, 181, 68, 0.14);
    --dx-danger: #ef5b5b;
    --dx-danger-soft: rgba(239, 91, 91, 0.14);
    --dx-on-positive: #062014;
    --dx-on-accent: #041623;

    --dx-border: rgba(255, 255, 255, 0.08);
    --dx-border-strong: rgba(255, 255, 255, 0.14);

    --dx-radius-sm: 8px;
    --dx-radius-md: 10px;
    --dx-radius-lg: 14px;
    --dx-radius-xl: 18px;

    --dx-space-1: 4px;
    --dx-space-2: 8px;
    --dx-space-3: 12px;
    --dx-space-4: 16px;
    --dx-space-5: 24px;

    --dx-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.45);
    --dx-dur: 160ms;
    --dx-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
    --dx-touch: 44px;

    --dx-font: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Hell (vorbereitet, Abschnitt 28): dieselben Rollen, andere Werte. Wird gesetzt, wenn input_boolean.heidi_dark_mode aus ist. */
  :host(.light) {
    --dx-bg: #eef1f4;
    --dx-bg-elevated: #f6f8fa;
    --dx-surface: #ffffff;
    --dx-surface-raised: #f1f4f7;
    --dx-surface-active: #e3e9ef;
    --dx-text: #10171e;
    --dx-text-muted: #55636f;
    --dx-text-faint: #8a97a6;
    --dx-accent: #1f7fc4;
    --dx-accent-soft: rgba(31, 127, 196, 0.12);
    --dx-positive: #1d9a5f;
    --dx-positive-soft: rgba(29, 154, 95, 0.12);
    --dx-warning: #b7791f;
    --dx-warning-soft: rgba(183, 121, 31, 0.12);
    --dx-danger: #c8403f;
    --dx-danger-soft: rgba(200, 64, 63, 0.12);
    --dx-on-positive: #ffffff;
    --dx-on-accent: #ffffff;
    --dx-border: rgba(0, 0, 0, 0.08);
    --dx-border-strong: rgba(0, 0, 0, 0.16);
    --dx-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
`;
