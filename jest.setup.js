/* Native modules that have no JS implementation under Jest. */
jest.mock('@react-native-async-storage/async-storage', () => {
  const data = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k) => (data.has(k) ? data.get(k) : null)),
      setItem: jest.fn(async (k, v) => void data.set(k, v)),
      removeItem: jest.fn(async (k) => void data.delete(k)),
    },
  };
});
jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn(async () => ({ filePath: '/tmp/test.pdf' })),
}));
jest.mock('react-native-share', () => ({ __esModule: true, default: { open: jest.fn() } }));
jest.mock('react-native-image-picker', () => ({ launchCamera: jest.fn() }));
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Path: View };
});
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@react-native-vector-icons/fontawesome', () => 'FontAwesome');
jest.mock('@react-native-vector-icons/material-icons', () => 'MaterialIcons');
