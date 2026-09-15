// Navigation zwischen den Ansichten des Dashboards dreame-x60 (Bauplan 3.3): history.pushState + HA-Ereignis
// `location-changed`, wie HAs eigene navigate()-Hilfe. Einzige erlaubte HA-Navigationsschnittstelle (Regel 12).
import type { Page } from '../pages';

/** URL-Pfad des Dashboards (configuration.yaml: lovelace.dashboards.dreame-x60). */
export const DASHBOARD_PATH = '/dreame-x60';

export const pagePath = (page: Page): string => `${DASHBOARD_PATH}/${page}`;

/** Zur Seite wechseln. `replace` ersetzt den Verlaufseintrag (z. B. Rückfall auf start). */
export function navigate(page: Page, replace = false): void {
  const path = pagePath(page);
  if (replace) history.replaceState(null, '', path); else history.pushState(null, '', path);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace } }));
}

/** Zu einer HA-Seite außerhalb des Dashboards (z. B. /config/repairs) – derselbe Mechanismus wie HA selbst. */
export function navigateHa(path: string): void {
  history.pushState(null, '', path);
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
}

/** Seite aus dem aktuellen Pfad (für Tests und Rückfall); null, wenn nicht im Dashboard. */
export function pageFromLocation(pathname: string = location.pathname, pages: readonly Page[]): Page | null {
  const m = pathname.match(/^\/dreame-x60\/([a-z]+)/);
  return m && (pages as readonly string[]).includes(m[1]!) ? (m[1] as Page) : null;
}
