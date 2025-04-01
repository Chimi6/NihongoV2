import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import CategoryIcon from '../components/CategoryIcon';
import VideoCard from '../components/VideoCard';
import FooterNav from '../components/FooterNav';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
  onVideoPress: (videoData: VideoData) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onVideoPress }) => {
  console.log('HomeScreen rendering...');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const categories = ['All', 'Anime', 'Beauty', 'Commercial', 'Food'];

  useEffect(() => {
    console.log('HomeScreen useEffect running...');
    
    try {
      // Import the JSON data directly in the effect
      const videoData = require('../assets/data/java_cafe.json') as VideoData[];
      console.log('Loaded video data:', videoData);
      console.log('Number of videos:', videoData.length);
      
      // Process the array of videos
      const typedVideoData = videoData.map((item: VideoData) => ({
        ...item,
        video: {
          ...item.video,
          difficulty: item.video.difficulty as 1 | 2 | 3
        }
      })) as VideoData[];
      
      console.log('Final typedVideoData:', typedVideoData);
      console.log('Number of videos:', typedVideoData.length);
      
      setVideos(typedVideoData);
    } catch (error) {
      console.error('Error processing video data:', error);
    }
  }, []);

  // Add a new useEffect to monitor videos state changes
  useEffect(() => {
    console.log('videos state updated:', videos);
    console.log('Number of videos in state:', videos.length);
  }, [videos]);

  const getYoutubeThumbnail = (videoId: string) => {
    const url = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    console.log('Generated thumbnail URL:', url);
    return url;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Videos</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryIcon
              key={category}
              label={category}
              isSelected={selectedCategory === category}
            />
          ))}
        </View>

        {!Array.isArray(videos) || videos.length === 0 ? (
          <Text style={styles.noVideosText}>No videos available</Text>
        ) : (
          videos.map((item, index) => {
            console.log(`Rendering video card ${index}:`, item.video.title);
            return (
              <VideoCard 
                key={item.uid}
                title={item.video.title}
                thumbnail={getYoutubeThumbnail(item.video.id)}
                difficulty={item.video.difficulty}
                onPress={() => onVideoPress(item)}
              />
            );
          })
        )}
      </ScrollView>

      <FooterNav onNavigate={onNavigate} currentScreen="Home" />
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
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  noVideosText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontFamily: FONTS.regular,
  },
});

export default HomeScreen; 