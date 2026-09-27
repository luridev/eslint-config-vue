import { createProtoConfig, type ProtoConfigOptions } from '@protoapps/eslint-config-vue';

const options: ProtoConfigOptions = {
  tsconfigRootDir: '.',
  vueVersion: '3.5.40',
};

export const config = createProtoConfig(options);
