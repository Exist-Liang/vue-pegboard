module.exports = {
    env: {
      browser: true,
      es2021: true
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    globals: {
      defineProps: 'readonly',
      defineEmits: 'readonly',
      defineExpose: 'readonly',
      withDefaults: 'readonly',
      process: 'readonly'
    },
    rules: {
      // 你可以按需启用或关闭规则
    }
  }