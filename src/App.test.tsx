import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders EasyGo official coming soon text', () => {
  render(<App />);
  const headingElements = screen.getAllByText(/EasyGo/i);
  expect(headingElements.length).toBeGreaterThan(0);

  const comingSoonElement = screen.getAllByText(/coming very soon/i);
  expect(comingSoonElement.length).toBeGreaterThan(0);
});
