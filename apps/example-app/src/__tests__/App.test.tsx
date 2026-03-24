import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from '../App';

// Mock the core library
vi.mock('@tv-app/core', () => ({
  useRemoteControl: vi.fn(),
  FocusableItem: ({ children }: { children: (props: { ref: React.RefObject<HTMLDivElement | null>; focused: boolean }) => React.ReactNode }) => {
    const ref = { current: null };
    return <>{children({ ref, focused: false })}</>;
  },
  useFocusable: () => ({ ref: { current: null }, focusKey: 'test' }),
}));

vi.mock('@noriginmedia/norigin-spatial-navigation', () => ({
  FocusContext: { Provider: ({ children }: { children: React.ReactNode }) => <>{children}</> },
}));

describe('App', () => {
  it('renders hero banner', () => {
    render(<App />);
    expect(screen.getAllByText('Big Buck Bunny').length).toBeGreaterThan(0);
  });

  it('renders content rows', () => {
    render(<App />);
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
    expect(screen.getByText('New Releases')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('renders Play and More Info buttons', () => {
    render(<App />);
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('More Info')).toBeInTheDocument();
  });
});
