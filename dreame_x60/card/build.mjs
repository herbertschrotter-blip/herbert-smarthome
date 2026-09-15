// build.mjs – bündelt src/dreame-x60-panel.ts nach ../../ha/www/dreame_x60.js (ESM, es2022).
// Version aus package.json wird als HP_VERSION eingesetzt; deploy.ps1 übernimmt sie in ?v=.
// Aufruf: node build.mjs [--watch]   (kein Sourcemap im Deploy; --watch baut bei jeder Änderung neu)
import { build, context } from 'esbuild';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(here, 'package.json'), 'utf8'));
const outfile = resolve(here, '../../ha/www/dreame_x60.js');

const options = {
  entryPoints: [resolve(here, 'src/dreame-x60-panel.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile,
  sourcemap: false,
  minify: false,
  legalComments: 'none',
  define: { HP_VERSION: JSON.stringify(pkg.version) },
  banner: { js: `// dreame_x60 – Heidi-Karte v${pkg.version} (gebaut aus dreame_x60/card, nicht von Hand ändern)` },
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.info(`watch: ${outfile}`);
} else {
  await build(options);
  console.info(`gebaut: ${outfile} (HP_VERSION ${pkg.version})`);
}
