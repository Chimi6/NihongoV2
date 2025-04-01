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

interface HistoryScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onVideoPress: (videoData: VideoData) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onNavigate, onVideoPress }) => {
  // Placeholder data - this would be loaded from history in the future
  const historyVideos: VideoData[] = Array.from({ length: 3 }, (_, i) => ({
    uid: `history-${i}`,
    video: {
      id: `video-${i}`,
      title: `History Video ${i + 1}`,
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
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {historyVideos.map((videoData) => (
          <VideoCard 
            key={videoData.uid} 
            title={videoData.video.title}
            thumbnail="https://picsum.photos/200/300" // Placeholder thumbnail
            difficulty={videoData.video.difficulty}
            onPress={() => onVideoPress(videoData)}
          />
        ))}
      </ScrollView>

      <FooterNav onNavigate={onNavigate} currentScreen="History" />
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

export default HistoryScreen; 