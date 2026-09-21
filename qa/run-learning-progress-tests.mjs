import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
await build({
 entryPoints: ['qa/learning-progress.test.ts'], bundle: true, platform: 'node', format: 'esm', outfile: '/tmp/learning-progress.test.mjs',
 plugins: [{ name: 'test-sdk', setup(builder) {
  builder.onResolve({ filter: /^npm:@base44\/sdk/ }, () => ({ path: 'sdk', namespace: 'mock' }));
  builder.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: 'export const createClientFromRequest = () => globalThis.__testClient;', loader: 'js' }));
 } }]
});
const result = spawnSync(process.execPath, ['--test', '/tmp/learning-progress.test.mjs'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
