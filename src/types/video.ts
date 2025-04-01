export interface VideoData {
  uid: string;
  video: {
    id: string;
    title: string;
    author: string;
    duration: string;
    category: string;
    difficulty: 1 | 2 | 3;
  };
  transcript: {
    segments: Array<{
      id: string;
      startTime: string;
      endTime: string;
      text: string;
    }>;
  };
}

export type ScreenName = 'Home' | 'Favorites' | 'History' | 'Settings' | 'Video'; 