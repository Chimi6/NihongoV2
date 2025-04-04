import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';

type ScreenName = 'Home' | 'Favorites' | 'Lists' | 'History' | 'Settings';

interface FooterNavProps {
  onNavigate: (screen: ScreenName) => void;
  currentScreen: ScreenName;
}

const FooterNav: React.FC<FooterNavProps> = ({ onNavigate, currentScreen }) => {
  const navItems = [
    { label: 'Videos', icon: require('../assets/icons/monitor4.png'), screen: 'Home' as ScreenName },
    { label: 'Favorites', icon: require('../assets/icons/heart.png'), screen: 'Favorites' as ScreenName },
    { label: 'Lists', icon: require('../assets/icons/test.png'), screen: 'Lists' as ScreenName },
    { label: 'History', icon: require('../assets/icons/clock5.png'), screen: 'History' as ScreenName },
    { label: 'Settings', icon: require('../assets/icons/gearcopy.png'), screen: 'Settings' as ScreenName },
  ];

  // Create animated values for each nav item
  const [scaleAnims] = useState(() => 
    navItems.map(() => new Animated.Value(1))
  );

  const handlePress = (screen: ScreenName, index: number) => {
    // Scale down animation for the specific item
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      // Scale up animation
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onNavigate(screen);
    });
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <Animated.View 
          key={item.screen}
          style={[
            styles.navItemContainer,
            { transform: [{ scale: scaleAnims[index] }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handlePress(item.screen, index)}
            activeOpacity={0.7}
          >
            <Image source={item.icon} style={styles.icon} />
            <Text style={[
              styles.navText,
              currentScreen === item.screen && styles.navTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  navItemContainer: {
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  navText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  navTextActive: {
    color: COLORS.primary,
  },
});

export default FooterNav; 