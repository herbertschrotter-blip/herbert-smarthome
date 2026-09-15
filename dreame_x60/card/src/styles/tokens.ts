// Design-Tokens „Automotive Dark Bento“ (Designvorgabe 14.09., Referenz dreame_x60/mockups/bento.html).
// Alle Farben, Radien, Abstände und Dauern kommen von hier – keine Sonderwerte in Komponenten (Abschnitt 27).
// Dark ist die Referenz; :host(.light) ist ein vorbereiteter Satz für später (Abschnitt 28), noch nicht abgenommen.
import { css } from 'lit';

export const tokens = css`
  :host {
    /* Flächen: Seite → Bento-Fläche → interaktive Fläche → aktiv */
    --heidi-bg: #0b1015;
    --heidi-bg-elevated: #10171e;
    --heidi-surface: #111a22;
    --heidi-surface-raised: #16212a;
    --heidi-surface-active: #1c2a36;

    --heidi-text: #e7edf3;
    --heidi-text-muted: #8a97a6;
    --heidi-text-faint: #5d6b7a;

    /* Farben mit Bedeutung (Abschnitt 3): Grün = aktiv/OK, Blau = Auswahl/Interaktion, Amber = Hinweis, Rot = Fehler */
    --heidi-accent: #58b7f6;
    --heidi-accent-soft: rgba(88, 183, 246, 0.14);
    --heidi-positive: #39d98a;
    --heidi-positive-soft: rgba(57, 217, 138, 0.14);
    --heidi-warning: #f2b544;
    --heidi-warning-soft: rgba(242, 181, 68, 0.14);
    --heidi-danger: #ef5b5b;
    --heidi-danger-soft: rgba(239, 91, 91, 0.14);
    --heidi-on-positive: #062014;
    --heidi-on-accent: #041623;

    --heidi-border: rgba(255, 255, 255, 0.08);
    --heidi-border-strong: rgba(255, 255, 255, 0.14);

    --heidi-radius-sm: 8px;
    --heidi-radius-md: 10px;
    --heidi-radius-lg: 14px;
    --heidi-radius-xl: 18px;

    --heidi-space-1: 4px;
    --heidi-space-2: 8px;
    --heidi-space-3: 12px;
    --heidi-space-4: 16px;
    --heidi-space-5: 24px;

    --heidi-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.45);
    --heidi-dur: 160ms;
    --heidi-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
    --heidi-touch: 44px;

    --heidi-font: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Hell (vorbereitet, Abschnitt 28): dieselben Rollen, andere Werte. Wird gesetzt, wenn input_boolean.heidi_dark_mode aus ist. */
  :host(.light) {
    --heidi-bg: #eef1f4;
    --heidi-bg-elevated: #f6f8fa;
    --heidi-surface: #ffffff;
    --heidi-surface-raised: #f1f4f7;
    --heidi-surface-active: #e3e9ef;
    --heidi-text: #10171e;
    --heidi-text-muted: #55636f;
    --heidi-text-faint: #8a97a6;
    --heidi-accent: #1f7fc4;
    --heidi-accent-soft: rgba(31, 127, 196, 0.12);
    --heidi-positive: #1d9a5f;
    --heidi-positive-soft: rgba(29, 154, 95, 0.12);
    --heidi-warning: #b7791f;
    --heidi-warning-soft: rgba(183, 121, 31, 0.12);
    --heidi-danger: #c8403f;
    --heidi-danger-soft: rgba(200, 64, 63, 0.12);
    --heidi-on-positive: #ffffff;
    --heidi-on-accent: #ffffff;
    --heidi-border: rgba(0, 0, 0, 0.08);
    --heidi-border-strong: rgba(0, 0, 0, 0.16);
    --heidi-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
`;
