import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';

jest.useFakeTimers();

test('starts on the technician login screen', async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(async () => {
    jest.runOnlyPendingTimers();
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('Nombre del técnico');
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
    jest.runOnlyPendingTimers();
  });
});
