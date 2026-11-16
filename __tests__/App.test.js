import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-pager-view', () => {
  const { View } = require('react-native');
  return View;
});

jest.mock('@react-native-vector-icons/fontawesome', () => 'FontAwesome');
jest.mock('@react-native-vector-icons/material-icons', () => 'MaterialIcons');

jest.useFakeTimers();

test('renders correctly', async () => {
  let renderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
  });
  // Initial state: user is outside a plantel, so the attendance screen shows.
  expect(JSON.stringify(renderer.toJSON())).toContain('Control de Asistencia');
  await ReactTestRenderer.act(() => {
    renderer.unmount();
    jest.runOnlyPendingTimers();
  });
});
