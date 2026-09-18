// Text in die Zwischenablage legen. Die moderne Schnittstelle (navigator.clipboard) gibt es nur in gesicherten Seiten
// (https oder localhost) – Home Assistant läuft im Heimnetz meist über http. Dann hilft der alte Weg: unsichtbares
// Textfeld, markieren, „copy“-Befehl des Browsers (braucht einen echten Klick als Auslöser).
export async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Rückfall unten */ }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, text.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  field.remove();
  return ok;
}

/** Letzter Ausweg: den Text eines Elements markieren, damit Strg+C ihn kopiert. */
export function selectContent(el: Element): void {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
