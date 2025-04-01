import { Platform } from 'react-native';

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#F5A623',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  },
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  brush: Platform.select({
    ios: 'Nanum Brush Script',
    android: 'Nanum Brush Script',
  }),
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
}; 