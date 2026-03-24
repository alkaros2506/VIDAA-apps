import React, { useState, useCallback } from 'react';
import { useRemoteControl } from '@tv-app/core';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { VideoPlayer } from './components/VideoPlayer';
import { MOCK_DATA, ContentItem } from './data';

interface PlayingVideo {
  title: string;
  videoUrl: string;
}

/** Look up a content item by ID across all rows */
function findItem(id: string): ContentItem | undefined {
  for (const row of MOCK_DATA.rows) {
    const item = row.items.find((i) => i.id === id);
    if (item) return item;
  }
  return undefined;
}

export function App() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<PlayingVideo | null>(null);

  useRemoteControl({
    onBack: useCallback(() => {
      if (playingVideo) {
        setPlayingVideo(null);
      } else if (selectedItem) {
        setSelectedItem(null);
      }
    }, [selectedItem, playingVideo]),
  });

  const handleSelect = useCallback((id: string) => {
    const item = findItem(id);
    if (item?.videoUrl) {
      setPlayingVideo({ title: item.title, videoUrl: item.videoUrl });
    } else {
      setSelectedItem(id);
    }
  }, []);

  const handlePlayFeatured = useCallback(() => {
    setPlayingVideo({
      title: MOCK_DATA.featured.title,
      videoUrl: MOCK_DATA.featured.videoUrl,
    });
  }, []);

  if (playingVideo) {
    return (
      <VideoPlayer
        title={playingVideo.title}
        videoUrl={playingVideo.videoUrl}
        onBack={() => setPlayingVideo(null)}
      />
    );
  }

  return (
    <div className="tv-safe-area">
      <HeroBanner
        title={MOCK_DATA.featured.title}
        subtitle={MOCK_DATA.featured.subtitle}
        backgroundUrl={MOCK_DATA.featured.backgroundUrl}
        onPlay={handlePlayFeatured}
      />
      <div className="content-rows">
        {MOCK_DATA.rows.map((row) => (
          <ContentRow
            key={row.id}
            title={row.title}
            items={row.items}
            onSelect={handleSelect}
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
