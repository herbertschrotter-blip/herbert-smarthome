// Platzhalter aus Aufgabe 1.1 – die eigentliche Shell entsteht in 1.2.
// HP_VERSION wird beim Build aus package.json eingesetzt (build.mjs).
declare const HP_VERSION: string;

export const VERSION: string = HP_VERSION;

console.info(`%c dreame_x60 %c v${VERSION} (Platzhalter, noch keine Karte) `, 'background:#0b1015;color:#58b7f6;font-weight:600', 'background:#0b1015;color:#e7edf3');
