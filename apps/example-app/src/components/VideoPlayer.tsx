import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useRemoteControl } from '@tv-app/core';

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  onBack: () => void;
}

export function VideoPlayer({ title, videoUrl, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }, []);

  useRemoteControl({
    onBack: useCallback(() => {
      onBack();
    }, [onBack]),
    onMediaButton: useCallback(
      (action: string) => {
        if (action === 'play' || action === 'pause') {
          togglePlayback();
        }
      },
      [togglePlayback],
    ),
  });

  // Also toggle play/pause on Enter key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.keyCode === 13) {
        togglePlayback();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlayback]);

  return (
    <div className="video-player-overlay">
      <video
        ref={videoRef}
        className="video-element"
        src={videoUrl}
        autoPlay
      />
      <div className="video-title-bar">{title}</div>
      {paused && <div className="video-paused-indicator">❚❚</div>}
      <div className="video-hint">Press Back to close · Enter to play/pause</div>
    </div>
  );
}
