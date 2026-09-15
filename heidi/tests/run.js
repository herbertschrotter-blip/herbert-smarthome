// `npm test`: führt alle v1-Tests nacheinander aus und endet mit Exit-Code 1, sobald einer rot ist.
const { spawnSync } = require('child_process');
const TESTS = ['test-real.js', 'test-editor.js', 'test-zones.js', 'test-timeline.js'];
let red = 0;
for (const t of TESTS) {
  const r = spawnSync(process.execPath, [t], { cwd: __dirname, stdio: 'inherit' });
  if (r.status !== 0) red++;
}
console.log(red ? `\n${red} von ${TESTS.length} Tests rot` : `\nalle ${TESTS.length} Tests grün`);
process.exit(red ? 1 : 0);
