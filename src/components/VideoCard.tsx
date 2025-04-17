import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import { VideoData } from '../screens/HomeScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT / 6;
const ICON_HEIGHT = CARD_HEIGHT * 0.17;

interface VideoCardProps {
  video: VideoData;
  onPress: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video,
  onPress
}) => {
  // Use a simpler thumbnail URL format without query parameters
  const thumbnail = `https://i.ytimg.com/vi/${video.video.id}/mqdefault.jpg`;

  const handleImageError = async (error: any) => {
    console.error('Thumbnail loading error:', error.nativeEvent.error);
    console.log('Failed thumbnail URL:', thumbnail);
    console.log('Video ID:', video.video.id);
    
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    console.log('Network state:', netInfo);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          onError={handleImageError}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.title}>{video.video.title}</Text>
          <Text style={styles.author}>{video.video.author}</Text>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.difficulty}>Difficulty</Text>
          <View style={styles.iconsContainer}>
            <Image 
              source={require('../../assets/icons/sushi2.png')}
              style={[styles.icon, { opacity: video.video.difficulty >= 1 ? 1 : 0.3 }]}
            />
            <Image 
              source={require('../../assets/icons/sushi2.png')}
              style={[styles.icon, { opacity: video.video.difficulty >= 2 ? 1 : 0.3 }]}
            />
            <Image 
              source={require('../../assets/icons/sushi2.png')}
              style={[styles.icon, { opacity: video.video.difficulty >= 3 ? 1 : 0.3 }]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '45%',
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    borderRadius: Platform.OS === 'android' ? 4 : 0,
  },
  textContainer: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  topTextContainer: {
    flex: 1,
  },
  bottomContainer: {
    alignItems: 'flex-start',
  },
  iconsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: SPACING.xs,
  },
  icon: {
    width: ICON_HEIGHT,
    height: ICON_HEIGHT,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  author: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  difficulty: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.text.primary,
  },
});

export default VideoCard; 