import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import VideoCard from '../components/VideoCard';
import FooterNav from '../components/FooterNav';
import { ScreenName, VideoData } from '../types/video';

interface FavoritesScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onVideoPress: (videoData: VideoData) => void;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onNavigate, onVideoPress }) => {
  // Placeholder data - this would be loaded from favorites in the future
  const favoriteVideos: VideoData[] = Array.from({ length: 3 }, (_, i) => ({
    uid: `favorite-${i}`,
    video: {
      id: `video-${i}`,
      title: `Favorite Video ${i + 1}`,
      author: 'Author Name',
      duration: '10:00',
      category: 'Category',
      difficulty: 1,
    },
    transcript: {
      segments: [],
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favoriteVideos.map((videoData) => (
          <VideoCard 
            key={videoData.uid} 
            title={videoData.video.title}
            thumbnail="https://picsum.photos/200/300" // Placeholder thumbnail
            difficulty={videoData.video.difficulty}
            onPress={() => onVideoPress(videoData)}
          />
        ))}
      </ScrollView>

      <FooterNav onNavigate={onNavigate} currentScreen="Favorites" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: FONTS.brush
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
  },
});

export default FavoritesScreen; 