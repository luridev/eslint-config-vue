import { createProtoConfig, type ProtoConfigOptions } from '@protoapps/eslint-config-vue';

const options: ProtoConfigOptions = {
  tsconfigRootDir: '.',
  vueVersion: '3.5.40',
  languageConfigs: [[{
    files: ['**/*.vue'],
    extends: [{ rules: { 'no-alert': 'warn' } }],
  }]],
};

export const config = createProtoConfig(options,
  { files: ['**/*.vue'], extends: [[{ rules: { 'vue/html-self-closing': 'off' } }]] },
  [[{ files: ['**/*.vue'], rules: { 'no-alert': 'off' } }]]);
