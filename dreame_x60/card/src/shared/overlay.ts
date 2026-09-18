// Overlay-Zustand der Shell (Bauplan Abschnitt 3): diskriminierte Union, genau ein Overlay offen, `back` als Feld.
import type { PlanNumber } from '../ha/contract';

export type Overlay =
  | { kind: 'settings' }
  | { kind: 'editor'; n: PlanNumber }
  | { kind: 'rooms'; mode: 'robot' | 'plan'; n?: PlanNumber; back?: Overlay }
  | { kind: 'estimate'; n: PlanNumber; back?: Overlay }
  | { kind: 'zones'; type: 'zones' | 'no_mops' | 'walls' }
  | { kind: 'report' } // „Fehler melden“ (F.2b, PD-018)
  | { kind: 'ticket'; nr: string } // Ticket-Ansicht (F.2b)
  | { kind: 'confirm'; text: string; sub?: string; okLabel?: string; danger?: boolean; onOk: () => void; back?: Overlay };

export type OverlayKind = Overlay['kind'];

/** Ereignis-Namen zwischen Bausteinen und Shell (Regel: dx-*). */
export const EVENTS = {
  openOverlay: 'dx-open-overlay',
  close: 'dx-close',
  back: 'dx-back',
  confirm: 'dx-confirm',
  toast: 'dx-toast',
  navigate: 'dx-navigate',
} as const;

/** Hilfe zum Auslösen: bubbles + composed, damit das Ereignis aus dem Shadow DOM bis zur Shell kommt. */
export function emit<T>(target: EventTarget, name: string, detail?: T): void {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/** Bestätigungsdialog anfordern (statt window.confirm, Regel 13). */
export function askConfirm(target: EventTarget, text: string, onOk: () => void, opts: { sub?: string; okLabel?: string; danger?: boolean } = {}): void {
  emit<Overlay>(target, EVENTS.openOverlay, { kind: 'confirm', text, onOk, ...opts });
}

/** more-info-Dialog von HA für eine Entität öffnen (erlaubte Schnittstelle, Regel 12). */
export function moreInfo(target: EventTarget, entityId: string): void {
  emit(target, 'hass-more-info', { entityId });
}
