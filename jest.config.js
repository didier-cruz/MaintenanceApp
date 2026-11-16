const preset = require('@react-native/jest-preset/jest-preset');

// Packages shipped as untranspiled ESM/Flow that Jest must run through Babel.
const transformModules = [
  '(jest-)?react-native',
  'react-native-[^/]+',
  '@react-native(-community)?',
  '@react-native-vector-icons/[^/]+',
  '@react-navigation/[^/]+',
  'react-redux',
  'redux',
].join('|');

module.exports = {
  ...preset,
  setupFiles: [
    ...preset.setupFiles,
    require.resolve('react-native-gesture-handler/jestSetup'),
  ],
  transformIgnorePatterns: [`node_modules/(?!(${transformModules})/)`],
};
