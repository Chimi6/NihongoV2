import { VideoData } from '../screens/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
  Video: { videoData: VideoData };
  Lists: undefined;
  Favorites: undefined;
  History: undefined;
  Settings: undefined;
  // Add more screens here as we create them
  // Example: Profile: { userId: string };
}; 