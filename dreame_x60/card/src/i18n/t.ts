// Texte der Karte (Bauplan 4.14, i18n Stufe 1): alle festen Texte liegen in ./de.ts, Bausteine und Domäne holen sie
// über t(). Stufe 1 kennt nur Deutsch; die Sprachumschaltung (weitere Sprachdatei, Sprache aus hass.language) folgt
// Post-2.0 (DX-067). Texte werden ins Bundle gepackt (Regel 14), keine Abhängigkeit.
import { de } from './de';

/** Schlüssel eines festen Textes – vom Compiler geprüft (Tippfehler = Baufehler). */
export type TextKey = keyof typeof de;
export type TextParams = Record<string, string | number>;

const TABLE: Readonly<Record<string, string>> = de;

/** Platzhalter `{name}` einsetzen; unbekannte Platzhalter bleiben stehen. */
function fill(raw: string, params?: TextParams): string {
  return params ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)) : raw;
}

/** Fester Text nach Schlüssel (typsicher). */
export function t(key: TextKey, params?: TextParams): string {
  return fill(TABLE[key] ?? key, params);
}

/** Text zu einem zur Laufzeit gebauten Schlüssel (z. B. `error.<code>`); ohne Eintrag kommt der Schlüssel zurück. */
export function tx(key: string, params?: TextParams): string {
  return fill(TABLE[key] ?? key, params);
}

/** Text zu einem Wert aus HA (Status, Fehlercode, Option, Raumname …): `undefined`, wenn es keinen Eintrag gibt. */
export function lookup(prefix: string, value: string): string | undefined {
  return TABLE[`${prefix}.${value}`];
}

/** Alle Schlüssel (für Tests). */
export const textKeys = (): string[] => Object.keys(TABLE);
