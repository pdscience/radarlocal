import { build } from 'esbuild';
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const functionsDir = 'functions';
const outDir = 'dist-functions';

await mkdir(outDir, { recursive: true });

const entries = await readdir(functionsDir);
const files = entries.filter((f) => f.endsWith('.ts'));

for (const file of files) {
  const slug = file.replace(/\.ts$/, '');
  await build({
    entryPoints: [join(functionsDir, file)],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    outfile: join(outDir, `${slug}.js`),
    external: ['npm:*', 'node:*'],
    minify: false,
  });
  console.log(`built ${slug}`);
}
