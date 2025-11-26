import linter from '@hacxy/eslint-config/nodejs';

export default linter({
  rules: {
    'antfu/no-import-dist': 'off',
  },
  ignores: ['CHANGELOG.md'],
});
