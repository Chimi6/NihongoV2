import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import HistoryScreen from './HistoryScreen';
import SettingsScreen from './SettingsScreen';
import VideoScreen from './VideoScreen';

type ScreenName = 'Home' | 'Favorites' | 'History' | 'Settings' | 'Video';

interface VideoData {
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

const MainScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Home');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const handleNavigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const handleVideoPress = (videoData: VideoData) => {
    setSelectedVideo(videoData);
    setCurrentScreen('Video');
  };

  const handleBack = () => {
    setCurrentScreen('Home');
    setSelectedVideo(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={handleNavigate} onVideoPress={handleVideoPress} />;
      case 'Favorites':
        return <FavoritesScreen onNavigate={handleNavigate} onVideoPress={handleVideoPress} />;
      case 'History':
        return <HistoryScreen onNavigate={handleNavigate} onVideoPress={handleVideoPress} />;
      case 'Settings':
        return <SettingsScreen onNavigate={handleNavigate} />;
      case 'Video':
        return selectedVideo ? (
          <VideoScreen videoData={selectedVideo} onBack={handleBack} />
        ) : (
          <HomeScreen onNavigate={handleNavigate} onVideoPress={handleVideoPress} />
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} onVideoPress={handleVideoPress} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainScreen; 