import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { createProtoConfig } from '@protoapps/eslint-config-vue';

const consumer = fileURLToPath(new URL('.', import.meta.url));

const eslint = new ESLint({
  cwd: consumer,
  overrideConfigFile: true,
  overrideConfig: createProtoConfig({
    tsconfigRootDir: consumer,
    vueVersion: '3.5.40',
  }),
});

const results = await eslint.lintFiles(['ExampleComponent.vue']);
assert.equal(results.length, 1, 'The consumer must lint the Vue fixture.');
const formatter = await eslint.loadFormatter('stylish');

assert.equal(
  results.reduce((count, result) => count + result.fatalErrorCount + result.errorCount + result.warningCount, 0),
  0,
  formatter.format(results),
);
