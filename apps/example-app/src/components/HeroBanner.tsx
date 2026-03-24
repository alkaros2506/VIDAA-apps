import React from 'react';
import { FocusableItem } from '@tv-app/core';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundUrl: string;
  onPlay?: () => void;
}

export function HeroBanner({ title, subtitle, backgroundUrl, onPlay }: HeroBannerProps) {
  return (
    <div
      className="hero-banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, transparent 40%, #0a0a0a), url(${backgroundUrl})`,
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="hero-actions">
          <FocusableItem focusKey="hero-play" onEnterPress={() => onPlay?.()}>
            {({ ref, focused }) => (
              <button ref={ref} className={`hero-button primary ${focused ? 'focused' : ''}`}>
                Play
              </button>
            )}
          </FocusableItem>
          <FocusableItem focusKey="hero-info" onEnterPress={() => console.log('Info pressed')}>
            {({ ref, focused }) => (
              <button ref={ref} className={`hero-button secondary ${focused ? 'focused' : ''}`}>
                More Info
              </button>
            )}
          </FocusableItem>
        </div>
      </div>
    </div>
  );
}
