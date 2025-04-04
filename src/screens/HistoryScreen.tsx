import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import * as database from '../services/database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { VideoData } from './HomeScreen';
import FooterNav from '../components/FooterNav';
import VideoCard from '../components/VideoCard';
import { HistoryItem } from '../services/database';

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [historyVideos, setHistoryVideos] = useState<VideoData[]>([]);
  const [allVideos, setAllVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    loadAllVideos();
  }, []);

  useEffect(() => {
    if (allVideos.length > 0) {
      loadHistory();
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

  const loadHistory = async () => {
    try {
      console.log('Loading history from database...');
      const history = await database.getHistory();
      console.log('History data received from database:', JSON.stringify(history, null, 2));
      
      // Log the entire history table
      console.log('\n📚 ===== HISTORY TABLE =====');
      console.log('Total entries:', history.length);
      history.forEach((item: HistoryItem, index: number) => {
        console.log(`\nEntry ${index + 1}:`);
        console.log('  UID:', item.uid);
        console.log('  Timestamp:', item.timestamp);
      });
      console.log('\n========================\n');

      if (history.length === 0) {
        console.log('No history entries found');
        setHistoryVideos([]);
        return;
      }
      
      // Get all video UIDs from history
      const videoUids = history.map((item: HistoryItem) => item.uid);
      console.log('Video UIDs from history:', videoUids);
      
      // Match history UIDs with full video data
      console.log('Matching history UIDs with video data...');
      console.log('All videos available:', allVideos.length);
      
      const historyVideos = videoUids
        .map((uid: string) => {
          const video = allVideos.find((video: VideoData) => video.uid === uid);
          if (!video) {
            console.log(`Video not found for UID: ${uid}`);
          }
          return video;
        })
        .filter((video): video is VideoData => video !== undefined);
      
      console.log('Matched history videos:', historyVideos.length);

      // Sort videos by history timestamp (most recent first)
      const sortedVideos = historyVideos.sort((a: VideoData, b: VideoData) => {
        const aTimestamp = history.find((h: HistoryItem) => h.uid === a.uid)?.timestamp || '';
        const bTimestamp = history.find((h: HistoryItem) => h.uid === b.uid)?.timestamp || '';
        // Log the comparison for debugging
        console.log(`Comparing timestamps for ${a.video.title} (${aTimestamp}) and ${b.video.title} (${bTimestamp})`);
        return bTimestamp.localeCompare(aTimestamp); // Most recent first (descending order)
      });

      // Log the final sorted order
      console.log('\n📅 ===== SORTED VIDEOS BY TIMESTAMP =====');
      sortedVideos.forEach((video: VideoData, index: number) => {
        const timestamp = history.find((h: HistoryItem) => h.uid === video.uid)?.timestamp || '';
        console.log(`\n${index + 1}. ${video.video.title}`);
        console.log('   Timestamp:', timestamp);
      });
      console.log('\n=====================================\n');

      setHistoryVideos(sortedVideos);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryVideos([]);
    }
  };

  const handleVideoPress = (video: VideoData) => {
    navigation.navigate('Video', { videoData: video });
  };

  const handleNavigate = (screen: keyof Omit<RootStackParamList, 'Video'>) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView style={styles.content}>
        {historyVideos.length === 0 ? (
          <Text style={styles.emptyText}>No videos in history</Text>
        ) : (
          historyVideos.map((video) => (
            <VideoCard
              key={video.uid}
              video={video}
              onPress={() => handleVideoPress(video)}
            />
          ))
        )}
      </ScrollView>

      <FooterNav onNavigate={handleNavigate} currentScreen="History" />
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
  content: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontFamily: FONTS.regular,
  },
});

export default HistoryScreen; 