import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import VideoCard from '../components/VideoCard';
import FooterNav from '../components/FooterNav';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { VideoData } from './HomeScreen';
import { getFavorites } from '../services/database';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [favorites, setFavorites] = useState<VideoData[]>([]);
  const [allVideos, setAllVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    loadAllVideos();
  }, []);

  useEffect(() => {
    if (allVideos.length > 0) {
      loadFavorites();
    }
  }, [allVideos]);

  const loadAllVideos = async () => {
    try {
      // Load all videos from the JSON file
      const videoData = require('../assets/data/java_cafe.json') as VideoData[];
      setAllVideos(videoData);
    } catch (error) {
      console.error('Error loading all videos:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoriteUids = await getFavorites();
      // Match favorite UIDs with full video data
      const favoriteVideos = favoriteUids
        .map(uid => allVideos.find(video => video.uid === uid))
        .filter((video): video is VideoData => video !== undefined);
      
      setFavorites(favoriteVideos);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const handleVideoPress = (video: VideoData) => {
    if (navigation && video && video.video && video.video.id) {
      navigation.navigate('Video', { videoData: video });
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
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length === 0 ? (
          <Text style={styles.noFavoritesText}>No favorite videos yet</Text>
        ) : (
          favorites.map((video) => (
            <VideoCard
              key={video.uid}
              video={video}
              onPress={() => handleVideoPress(video)}
            />
          ))
        )}
      </ScrollView>

      <FooterNav onNavigate={handleNavigate} currentScreen="Favorites" />
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
  noFavoritesText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontFamily: FONTS.regular,
  },
});

export default FavoritesScreen; 