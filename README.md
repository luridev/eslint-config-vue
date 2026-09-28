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

`vueVersion` is required and specifies the Vue version to check compatibility against.
Other options are inherited from [@protoapps/eslint-config](https://github.com/luridev/eslint-config#options),
including the required `tsconfigRootDir`.

## Overrides

Pass Flat Config overrides after the options to customize rules:

```ts
export default createProtoConfig(
  {
    tsconfigRootDir: import.meta.dirname,
    vueVersion: '3.5.40',
  },
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
);
```

Overrides also accept `extends` and config arrays, as in ESLint's `defineConfig`.
