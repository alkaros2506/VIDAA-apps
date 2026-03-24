import React, { forwardRef } from 'react';

interface ContentCardProps {
  title: string;
  imageUrl: string;
  focused: boolean;
}

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  ({ title, imageUrl, focused }, ref) => {
    return (
      <div ref={ref} className={`content-card ${focused ? 'focused' : ''}`}>
        <div
          className="card-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <p className="card-title">{title}</p>
      </div>
    );
  },
);

ContentCard.displayName = 'ContentCard';
