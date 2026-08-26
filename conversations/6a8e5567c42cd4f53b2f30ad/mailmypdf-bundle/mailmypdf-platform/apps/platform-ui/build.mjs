import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
const root = new URL('.', import.meta.url).pathname;
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html','app.js','styles.css']) await cp(join(root, file), join(out, file));
console.log(`Built platform UI to ${out}`);
