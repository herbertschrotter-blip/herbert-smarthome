// HP_VERSION wird beim Build aus package.json eingesetzt (build.mjs); deploy.ps1 übernimmt sie in ?v=.
declare const HP_VERSION: string;

export const VERSION: string = HP_VERSION;
