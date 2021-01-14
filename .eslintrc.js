module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 0,
    'no-console': 0,
    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    'no-loop-func': 1,
    'max-len': 1,
    'import/prefer-default-export': 1,
  },
};
