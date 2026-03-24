import React, { useState, useCallback } from 'react';
import { useRemoteControl } from '@tv-app/core';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { MOCK_DATA } from './data';

export function App() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useRemoteControl({
    onBack: useCallback(() => {
      if (selectedItem) {
        setSelectedItem(null);
      }
    }, [selectedItem]),
  });

  return (
    <div className="tv-safe-area">
      <HeroBanner
        title={MOCK_DATA.featured.title}
        subtitle={MOCK_DATA.featured.subtitle}
        backgroundUrl={MOCK_DATA.featured.backgroundUrl}
      />
      <div className="content-rows">
        {MOCK_DATA.rows.map((row) => (
          <ContentRow
            key={row.id}
            title={row.title}
            items={row.items}
            onSelect={(id) => setSelectedItem(id)}
          />
        ))}
      </div>
      {selectedItem && (
        <div className="detail-overlay">
          <p>Selected: {selectedItem}</p>
          <p className="hint">Press Back to close</p>
        </div>
      )}
    </div>
  );
}
