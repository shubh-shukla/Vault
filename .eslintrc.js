module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // Nothing in these layers may log a value, since every value that
      // passes through them is either a decrypted field or a key.
      files: [
        'src/shared/crypto/**/*.ts',
        'src/shared/storage/**/*.ts',
        'src/features/*/*Repository.ts',
      ],
      excludedFiles: ['**/__tests__/**'],
      rules: {
        'no-console': 'error',
      },
    },
  ],
};
