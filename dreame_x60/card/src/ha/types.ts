// Minimale HA-Typen (Bauplan Abschnitt 3): keine externe Typabhängigkeit. Nur das, was die Karte nutzt.
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export type States = Record<string, HassEntity | undefined>;

export interface HomeAssistant {
  states: States;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
  callApi?<T = unknown>(method: 'GET' | 'POST', path: string, data?: Record<string, unknown>): Promise<T>;
  language?: string;
  themes?: { darkMode?: boolean };
  /** Angemeldeter Benutzer (für den Tagesgruß der Übersicht, Bauplan 4.0). */
  user?: { name?: string };
}

/** Konfiguration der Karte im Dashboard-YAML. */
export interface PanelConfig {
  type?: string;
  page?: string;
}
