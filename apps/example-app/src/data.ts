/**
 * Mock data for the example TV app.
 * Replace with real API calls in production.
 */

/** Public domain / Creative Commons sample videos for demo purposes */
const SAMPLE_VIDEOS = {
  bigBuckBunny:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephantsDream:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
};

export interface ContentItem {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
}

export const MOCK_DATA = {
  featured: {
    id: 'featured-big-buck-bunny',
    title: 'Big Buck Bunny',
    subtitle: 'A giant rabbit deals with three bullying rodents — award-winning open movie',
    backgroundUrl: '',
    videoUrl: SAMPLE_VIDEOS.bigBuckBunny,
  },
  rows: [
    {
      id: 'trending',
      title: 'Trending Now',
      items: [
        {
          id: 'trending-0',
          title: 'Big Buck Bunny',
          imageUrl: '',
          videoUrl: SAMPLE_VIDEOS.bigBuckBunny,
        },
        {
          id: 'trending-1',
          title: 'Elephants Dream',
          imageUrl: '',
          videoUrl: SAMPLE_VIDEOS.elephantsDream,
        },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `trending-${i + 2}`,
          title: `Trending ${i + 3}`,
          imageUrl: '',
        })),
      ] as ContentItem[],
    },
    {
      id: 'new',
      title: 'New Releases',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `new-${i}`,
        title: `New Release ${i + 1}`,
        imageUrl: '',
      })) as ContentItem[],
    },
    {
      id: 'popular',
      title: 'Popular',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `popular-${i}`,
        title: `Popular ${i + 1}`,
        imageUrl: '',
      })) as ContentItem[],
    },
  ],
};
