import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import WebView from 'react-native-webview';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import FooterNav from '../components/FooterNav';
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/database.js';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_HEIGHT * 0.3;

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

interface VideoScreenProps {
  videoData: VideoData;
  onBack: () => void;
}

interface SegmentPosition {
  id: string;
  y: number;
  height: number;
}

const VideoScreen: React.FC<VideoScreenProps> = ({ videoData, onBack }) => {
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const [segmentPositions, setSegmentPositions] = useState<SegmentPosition[]>([]);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const segmentRefs = useRef<{ [key: string]: View | null }>({});
  const webViewRef = useRef<WebView>(null);

  // Check if video is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        if (!videoData?.uid) return;
        const favorited = await isFavorite(videoData.uid);
        setIsFavorited(favorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    checkFavoriteStatus();
  }, [videoData?.uid]);

  const handleFavoritePress = async () => {
    try {
      if (!videoData?.uid) {
        console.error('No video UID available');
        return;
      }

      if (isFavorited) {
        await removeFromFavorites(videoData.uid);
        setIsFavorited(false);
        console.log('Removed from favorites:', videoData.uid);
      } else {
        await addToFavorites(videoData.uid);
        setIsFavorited(true);
        console.log('Added to favorites:', videoData.uid);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleViewFavorites = async () => {
    try {
      const favorites = await getFavorites();
      console.log('Current favorites:', favorites);
    } catch (error) {
      console.error('Error getting favorites:', error);
    }
  };

  // YouTube embed URL with parameters to prevent fullscreen and related videos
  const embedUrl = `https://www.youtube.com/embed/${videoData.video.id}?rel=0&showinfo=0&fs=0&playsinline=1&modestbranding=1&controls=1&disablekb=0&enablejsapi=1&origin=${encodeURIComponent('http://localhost')}`;

  // JavaScript to inject into the WebView
  const injectedJavaScript = `
    if (typeof sendTimeUpdate === 'undefined') {
      function sendTimeUpdate() {
        const player = document.querySelector('#movie_player');
        if (player && player.getCurrentTime && player.getPlayerState && player.getPlayerState() === 1) {
          window.ReactNativeWebView.postMessage('timeupdate:' + player.getCurrentTime());
        }
      }
      setInterval(sendTimeUpdate, 100);
    }
    true;
  `;

  const handlePlayPress = (segmentId: string) => {
    console.log('Play button pressed for segment:', segmentId);
    
    // Find the segment and its start time
    const segment = videoData.transcript.segments.find(s => s.id === segmentId);
    if (segment) {
      const startTime = timeToSeconds(segment.startTime);
      
      // Update the current segment immediately
      setCurrentSegmentId(segmentId);
      setIsPlaying(true);
      
      // Inject JavaScript to seek to the timestamp and play
      const seekAndPlayScript = `
        (function() {
          const player = document.querySelector('#movie_player');
          if (player) {
            player.seekTo(${startTime}, true);
            player.playVideo();
          }
        })();
        true;
      `;
      
      webViewRef.current?.injectJavaScript(seekAndPlayScript);
    }
  };

  // Function to convert time string to seconds
  const timeToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Function to handle segment layout changes
  const handleSegmentLayout = (segmentId: string, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setSegmentPositions(prev => {
      const newPositions = prev.filter(pos => pos.id !== segmentId);
      return [...newPositions, { id: segmentId, y, height }];
    });
  };

  // Function to handle video time updates
  const handleTimeUpdate = (event: any) => {
    const currentTime = event.nativeEvent.data;

    // Find the current segment based on time
    const currentSegment = videoData.transcript.segments.find(segment => {
      const startTime = timeToSeconds(segment.startTime);
      const endTime = timeToSeconds(segment.endTime);
      return currentTime >= startTime && currentTime <= endTime;
    });

    if (currentSegment) {
      setCurrentSegmentId(currentSegment.id);
      
      // Only auto-scroll if the video is playing
      if (isPlaying) {
        // Find the position of the current segment
        const segmentPosition = segmentPositions.find(pos => pos.id === currentSegment.id);
        
        if (segmentPosition) {
          // Calculate the scroll position to show the segment higher up
          const scrollPosition = segmentPosition.y - (SCREEN_HEIGHT - VIDEO_HEIGHT) / 4;
          
          // If the scroll distance is large (more than 1 screen height), scroll instantly
          const scrollDistance = Math.abs(scrollPosition - currentScrollY);
          
          if (scrollDistance > SCREEN_HEIGHT) {
            // For large distances, scroll instantly
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollPosition),
              animated: false
            });
          } else {
            // For smaller distances, use smooth scrolling
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollPosition),
              animated: true
            });
          }
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: embedUrl }}
          style={styles.video}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          bounces={false}
          scrollEnabled={false}
          injectedJavaScript={injectedJavaScript}
          onShouldStartLoadWithRequest={(request) => {
            // Prevent navigation to YouTube app or fullscreen
            return request.url.startsWith('https://www.youtube.com/embed/');
          }}
          onMessage={(event) => {
            if (event.nativeEvent.data.startsWith('timeupdate:')) {
              const time = parseFloat(event.nativeEvent.data.replace('timeupdate:', ''));
              handleTimeUpdate({ nativeEvent: { data: time } });
            }
          }}
        />
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{videoData.video.title}</Text>
        <Text style={styles.videoAuthor}>{videoData.video.author}</Text>
        <View style={styles.divider} />
        <View style={styles.difficultyContainer}>
          <View style={styles.difficultyLeft}>
            <Text style={styles.difficultyText}>Difficulty</Text>
            <View style={styles.difficultyIcons}>
              {[1, 2, 3].map((level) => (
                <Image
                  key={level}
                  source={require('../assets/icons/sushi2.png')}
                  style={[
                    styles.difficultyIcon,
                    { opacity: level <= videoData.video.difficulty ? 1 : 0.3 }
                  ]}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.favoriteButton]} 
            onPress={handleFavoritePress}
          >
            <Text style={styles.favoriteText}>
              {isFavorited ? 'Favorited' : 'Add to Favorite'}
            </Text>
            <Image 
              source={isFavorited 
                ? require('../assets/icons/favoriteheart.png')
                : require('../assets/icons/plusthick.png')
              }
              style={styles.favoriteIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => setCurrentScrollY(event.nativeEvent.contentOffset.y)}
      >
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptTitle}>Transcript</Text>
          {videoData.transcript.segments.map((segment) => (
            <View 
              key={segment.id}
              ref={ref => { segmentRefs.current[segment.id] = ref; }}
              onLayout={(event) => handleSegmentLayout(segment.id, event)}
              style={[
                styles.segmentContainer,
                currentSegmentId === segment.id ? styles.highlightedSegment : styles.nonHighlightedSegment
              ]}
            >
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => handlePlayPress(segment.id)}
              >
                <Image 
                  source={require('../assets/icons/playbutton5.png')}
                  style={styles.playButtonImage}
                />
              </TouchableOpacity>
              <Text style={styles.segmentText}>{segment.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <FooterNav onNavigate={() => {}} currentScreen="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  backButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
  },
  videoContainer: {
    height: VIDEO_HEIGHT,
    backgroundColor: COLORS.background,
  },
  videoInfo: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  videoTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  videoAuthor: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: SPACING.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  difficultyIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  favoriteText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  favoriteIcon: {
    width: 20,
    height: 20,
  },
  video: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  transcriptContainer: {
    padding: SPACING.sm,
  },
  transcriptTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.brush,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  highlightedSegment: {
    opacity: 1,
  },
  nonHighlightedSegment: {
    opacity: 0.4,
  },
  playButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
    marginTop: 2,
  },
  playButtonImage: {
    width: 24,
    height: 24,
  },
  segmentText: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text.primary,
    fontFamily: FONTS.regular,
    lineHeight: FONT_SIZES.xl * 1.5,
    marginTop: -2,
  },
});

export default VideoScreen; 