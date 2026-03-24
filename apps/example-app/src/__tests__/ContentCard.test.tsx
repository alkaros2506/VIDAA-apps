import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ContentCard } from '../components/ContentCard';

describe('ContentCard', () => {
  it('renders title', () => {
    render(<ContentCard title="Test Card" imageUrl="" focused={false} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('applies focused class when focused', () => {
    const { container } = render(<ContentCard title="Card" imageUrl="" focused={true} />);
    expect(container.firstChild).toHaveClass('focused');
  });

  it('does not have focused class when not focused', () => {
    const { container } = render(<ContentCard title="Card" imageUrl="" focused={false} />);
    expect(container.firstChild).not.toHaveClass('focused');
  });
});
