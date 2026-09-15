// Tiefer Sprung in HAs more-info-Dialog (PD-014, Herbert 16.09.: „wenn ich auf das rote Symbol klicke, komme ich nur zur
// Hauptkarte, nicht zur Raumzuordnung“). HA hat für die Unteransichten des Dialogs keine Adresse; sie werden nur über das
// Ereignis `show-child-view` innerhalb des Dialogs geöffnet (Frontend: show-view-vacuum-segment-mapping.ts). Wir nutzen
// genau dieses Ereignis. Ist die Ansicht in dieser Sitzung noch nicht geladen, lassen wir HA sie über seine eigenen Knöpfe
// laden (Knopf „Reinigung nach Bereich“, dann das Zahnrad). Schlägt etwas fehl, bleibt der Dialog offen und der Aufrufer
// zeigt den Restweg als Text – bewusste Ausnahme von Regel 12 mit Rückfall, dokumentiert im Bauplan Abschnitt 10.
import { moreInfo } from './overlay';

const MAPPING_TAG = 'ha-more-info-view-vacuum-segment-mapping';
const AREAS_TAG = 'ha-more-info-view-vacuum-clean-areas';
const AREAS_HEADER_TAG = 'ha-more-info-view-vacuum-clean-areas-header-action';

/** Element im Licht- und Schatten-DOM suchen (Breitensuche, begrenzt). */
export function deepFind(root: ParentNode | null | undefined, selector: string, limit = 4000): Element | null {
  if (!root) return null;
  const queue: ParentNode[] = [root];
  let seen = 0;
  while (queue.length && seen < limit) {
    const node = queue.shift()!;
    const hit = node.querySelector(selector);
    if (hit) return hit;
    for (const el of node.querySelectorAll('*')) { seen++; if (el.shadowRoot) queue.push(el.shadowRoot); }
  }
  return null;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function waitFor<T>(probe: () => T | null | undefined, timeoutMs: number): Promise<T | null> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const v = probe();
    if (v) return v;
    if (Date.now() >= end) return null;
    await sleep(100);
  }
}

const haRoot = (): ParentNode | null => document.querySelector('home-assistant')?.shadowRoot ?? null;
const findDialog = (): Element | null => haRoot()?.querySelector('ha-more-info-dialog') ?? null;

export type DeepResult = 'direct' | 'clicked' | 'fallback';

/**
 * more-info des Staubsaugers öffnen und zur Ansicht „Zuordnung von Staubsauger-Abschnitten zu Bereichen“ springen.
 * Ergebnis: 'direct' (Ansicht war geladen, per Ereignis geöffnet), 'clicked' (über HAs Knöpfe geladen), 'fallback'
 * (nur der Dialog ist offen – Aufrufer zeigt den Restweg).
 */
export async function openVacuumSegmentMapping(target: EventTarget, entityId: string): Promise<DeepResult> {
  moreInfo(target, entityId);
  if (!haRoot()) return 'fallback'; // Tests, fremde Einbettung
  const dialog = await waitFor(findDialog, 3000);
  if (!dialog) return 'fallback';
  const showMapping = (): void => {
    dialog.dispatchEvent(new CustomEvent('show-child-view', { detail: { viewTag: MAPPING_TAG, viewTitle: 'Zuordnung von Staubsauger-Abschnitten zu Bereichen', viewParams: { entityId } }, bubbles: true, composed: true }));
  };
  if (customElements.get(MAPPING_TAG)) { showMapping(); return 'direct'; }
  // Ansicht noch nicht geladen: HA über seine Knöpfe laden lassen
  const areasBtn = await waitFor(() => deepFind(dialog.shadowRoot, 'more-info-vacuum') ? deepFind(dialog.shadowRoot, 'button.clean-areas-button') as HTMLElement | null : null, 3000);
  if (!areasBtn) return 'fallback';
  areasBtn.click();
  const header = await waitFor(() => (customElements.get(AREAS_TAG) ? deepFind(dialog.shadowRoot, AREAS_HEADER_TAG) : null), 4000);
  if (!header) return 'fallback';
  const gear = await waitFor(() => deepFind(header, 'ha-icon-button, button') as HTMLElement | null, 2000);
  if (!gear) return 'fallback';
  gear.click();
  const ok = await waitFor(() => (customElements.get(MAPPING_TAG) && deepFind(dialog.shadowRoot, MAPPING_TAG) ? true : null), 4000);
  return ok ? 'clicked' : 'fallback';
}
