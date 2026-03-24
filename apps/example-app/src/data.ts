/**
 * Mock data for the example TV app.
 * Replace with real API calls in production.
 */
export const MOCK_DATA = {
  featured: {
    title: 'Featured Show',
    subtitle: 'A captivating story about innovation and discovery',
    backgroundUrl: '',
  },
  rows: [
    {
      id: 'trending',
      title: 'Trending Now',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `trending-${i}`,
        title: `Trending ${i + 1}`,
        imageUrl: '',
      })),
    },
    {
      id: 'new',
      title: 'New Releases',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `new-${i}`,
        title: `New Release ${i + 1}`,
        imageUrl: '',
      })),
    },
    {
      id: 'popular',
      title: 'Popular',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `popular-${i}`,
        title: `Popular ${i + 1}`,
        imageUrl: '',
      })),
    },
  ],
};
