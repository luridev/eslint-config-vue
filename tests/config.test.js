import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { createProtoConfig } from '../dist/index.js';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const consumerRoot = join(packageRoot, 'tests', 'fixtures', 'consumer');
const sfcPath = join(consumerRoot, 'src/component.vue');

const createConfig = (options = {}, ...overrides) => createProtoConfig({
  tsconfigRootDir: consumerRoot,
  vueVersion: '3.5.40',
  ...options,
}, ...overrides);

const createEslint = (options = {}, ...overrides) => new ESLint({
  cwd: consumerRoot,
  overrideConfigFile: true,
  overrideConfig: createConfig(options, ...overrides),
});

const configForSfc = async (options = {}) => {
  const config = await createEslint(options).calculateConfigForFile(sfcPath);
  assert.ok(config, 'Expected an effective SFC config');

  return config;
};

test('effective Vue config includes Vue, accessibility, version, and Stylistic policies', async () => {
  const currentConfig = await configForSfc();
  const olderConfig = await configForSfc({ vueVersion: '3.4.0' });

  assert.equal(currentConfig.languageOptions.parser.meta.name, 'vue-eslint-parser');
  assert.equal(currentConfig.rules['vue/no-duplicate-attributes'][0], 2);
  assert.equal(currentConfig.rules['vuejs-accessibility/alt-text'][0], 2);
  assert.deepEqual(currentConfig.rules['vue/no-unsupported-features'], [2, { version: '3.5.40' }]);
  assert.deepEqual(olderConfig.rules['vue/no-unsupported-features'], [2, { version: '3.4.0' }]);
  assert.equal(currentConfig.rules['vue/block-tag-newline'][0], 2);
});

test('stylisticIgnores excludes SFC formatting while retaining typed and Vue checks', async () => {
  const ignoredVueStylisticConfig = await configForSfc({
    stylisticIgnores: ['**/component.vue'],
  });

  assert.equal(ignoredVueStylisticConfig.rules['@stylistic/linebreak-style'], undefined);
  assert.equal(ignoredVueStylisticConfig.rules['@stylistic/semi'], undefined);
  assert.equal(ignoredVueStylisticConfig.rules['vue/block-tag-newline'], undefined);
  assert.equal(ignoredVueStylisticConfig.rules['vue/no-duplicate-attributes'][0], 2);
  assert.equal(ignoredVueStylisticConfig.rules['vuejs-accessibility/alt-text'][0], 2);
  assert.equal(ignoredVueStylisticConfig.rules['@typescript-eslint/no-unnecessary-condition'][0], 2);
});

test('SFC imports resolve without an explicit extension', async () => {
  const config = await configForSfc();
  const resolver = config.settings['import-x/resolver-next']
    .find((candidate) => candidate.name === 'eslint-import-resolver-typescript');
  assert.ok(resolver);
  const result = resolver.resolve('@fixture/component', sfcPath);
  assert.equal(result.found, true);
  assert.equal(normalize(result.path), normalize(sfcPath));
});

const lintSfc = async (eslint) => {
  const text = readFileSync(sfcPath, 'utf8').replace(/\r?\n/g, '\r\n');
  const [result] = await eslint.lintText(text, { filePath: sfcPath });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));

  return new Set(result.messages.map(({ ruleId }) => ruleId));
};

test('SFC linting runs typed, import, formatting, Vue, and accessibility checks', async () => {
  const rules = await lintSfc(createEslint());
  for (const rule of ['@typescript-eslint/no-restricted-imports', '@typescript-eslint/no-unnecessary-condition',
    'import-x/newline-after-import', '@stylistic/semi', '@stylistic/linebreak-style',
    'vue/html-self-closing', 'vuejs-accessibility/alt-text']) {
    assert.ok(rules.has(rule), `Expected ${rule}: ${JSON.stringify([...rules])}`);
  }
});

test('final native overrides win over base, Vue, accessibility, and formatting rules', async () => {
  const overrides = {
    '@typescript-eslint/no-restricted-imports': 'off',
    'vue/html-self-closing': 'off',
    'vuejs-accessibility/alt-text': 'off',
    '@stylistic/semi': 'off',
    '@stylistic/linebreak-style': 'off',
  };
  const rules = await lintSfc(createEslint({}, [[{
    files: ['**/*.vue'],
    extends: [{ rules: overrides }],
  }]]));
  for (const rule of Object.keys(overrides)) {
    assert.ok(!rules.has(rule), `Unexpected ${rule}`);
  }
  assert.ok(rules.has('@typescript-eslint/no-unnecessary-condition'));
});

test('language configs and native extends retain policy order and file scope', async () => {
  const eslint = createEslint({
    languageConfigs: [[{
      files: ['**/*.vue'],
      extends: [{ rules: { 'vue/html-self-closing': 'off', 'no-alert': 'warn', eqeqeq: 'off' } }],
    }]],
  }, {
    files: ['**/component.vue'],
    extends: [[{ files: ['**/*.vue'], rules: { 'no-alert': 'error' } }]],
  });
  const component = await eslint.calculateConfigForFile(sfcPath);
  const other = await eslint.calculateConfigForFile(join(consumerRoot, 'src/other.vue'));
  const typescript = await eslint.calculateConfigForFile(join(consumerRoot, 'src/standard.ts'));

  assert.equal(component.rules.eqeqeq[0], 2);
  assert.equal(component.rules['vue/html-self-closing'][0], 2);
  assert.equal(component.rules['no-alert'][0], 2);
  assert.equal(other.rules['no-alert'][0], 1);
  assert.equal(typescript.rules['no-alert'], undefined);
});
