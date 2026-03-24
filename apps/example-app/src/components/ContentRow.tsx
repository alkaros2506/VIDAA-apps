import React from 'react';
import {
  useFocusable,
  FocusableItem,
} from '@tv-app/core';
import { FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { ContentCard } from './ContentCard';

interface ContentRowProps {
  title: string;
  items: Array<{ id: string; title: string; imageUrl: string }>;
  onSelect: (id: string) => void;
}

export function ContentRow({ title, items, onSelect }: ContentRowProps) {
  const { ref, focusKey } = useFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div className="content-row" ref={ref}>
        <h2 className="row-title">{title}</h2>
        <div className="row-items">
          {items.map((item) => (
            <FocusableItem
              key={item.id}
              focusKey={`card-${item.id}`}
              onEnterPress={() => onSelect(item.id)}
            >
              {({ ref: cardRef, focused }) => (
                <ContentCard
                  ref={cardRef}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  focused={focused}
                />
              )}
            </FocusableItem>
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  );
}
