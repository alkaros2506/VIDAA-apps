import React from 'react';
import { createRoot } from 'react-dom/client';
import { TVApp } from '@tv-app/core';
import { VidaaApp } from '@tv-app/platform-vidaa';
import { App } from './App';
import './styles.css';

// Initialize VIDAA-specific features (no-op on non-VIDAA platforms)
VidaaApp({
  appName: 'TV App Example',
  onRootBack: 'exit',
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <TVApp debug={false}>
    <App />
  </TVApp>,
);
