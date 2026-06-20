// Vendors the sql.js engine (WebAssembly SQLite) into public/ so the web app
// serves it from its own origin — no CDN, fully offline. Re-run after bumping
// the sql.js devDependency: `pnpm --filter @itqan/mobile sync:sql-wasm`.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const dist = join(dirname(require.resolve('sql.js/package.json')), 'dist');
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

mkdirSync(publicDir, { recursive: true });
for (const file of ['sql-wasm.js', 'sql-wasm.wasm']) {
  copyFileSync(join(dist, file), join(publicDir, file));
  console.log(`copied ${file} -> public/${file}`);
}
