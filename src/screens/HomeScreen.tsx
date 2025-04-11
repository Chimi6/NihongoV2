import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {COLORS, FONTS, FONT_SIZES, SPACING} from '../constants/theme';
import CategoryIcon from '../components/CategoryIcon';
import VideoCard from '../components/VideoCard';
import FooterNav from '../components/FooterNav';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {useSQLiteContext} from 'expo-sqlite';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type ScreenName =
  | 'Home'
  | 'Favorites'
  | 'Lists'
  | 'History'
  | 'Settings'
  | 'Video';

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

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  console.log('HomeScreen rendering...');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const categories = ['All', 'Anime', 'Beauty', 'Commercial', 'Food'];
  const db = useSQLiteContext();
  useEffect(() => {
    async function setup() {
      console.log('inside setup');
      try {
        const firstRow = await db.getFirstAsync('SELECT * FROM examples');
        console.log('First row :', firstRow);
      } catch (error) {
        console.log('error :', error);
      }
    }
    setup();
  }, []);
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
          difficulty: item.video.difficulty as 1 | 2 | 3,
        },
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

  const handleVideoPress = (video: VideoData) => {
    if (navigation) {
      navigation.navigate('Video', {videoData: video});
    }
  };

  const handleNavigate = (screen: keyof Omit<RootStackParamList, 'Video'>) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Videos</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map(category => (
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
                video={item}
                onPress={() => handleVideoPress(item)}
              />
            );
          })
        )}
      </ScrollView>

      <FooterNav onNavigate={handleNavigate} currentScreen="Home" />
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
    fontFamily: FONTS.brush,
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
