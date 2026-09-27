# @protoapps/eslint-config-vue

ESLint flat config for Vue SFCs, including all of `@protoapps/eslint-config` plus Vue rules, template formatting,
and accessibility checks.

## Installation

```sh
npm install --save-dev @protoapps/eslint-config-vue eslint typescript
```

## Usage

```ts
import { createProtoConfig } from '@protoapps/eslint-config-vue';

export default createProtoConfig({
  tsconfigRootDir: import.meta.dirname,
  vueVersion: '3.5.40',
});
```

Run `eslint .` to lint source files and package.json.

## Options

`vueVersion` is required and controls `vue/no-unsupported-features`. All
[base options](https://github.com/luridev/eslint-config#options) are also available, including the required `tsconfigRootDir`.

## Overrides

Pass native ESLint Flat Config objects after the options to override base and Vue rules:

```ts
export default createProtoConfig(
  { tsconfigRootDir: import.meta.dirname, vueVersion: '3.5.40' },
  {
    files: ['**/*.{ts,vue}'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
```
