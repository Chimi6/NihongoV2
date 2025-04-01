import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';

interface CategoryIconProps {
  label: string;
  isSelected?: boolean;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ label, isSelected = false }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, isSelected && styles.selectedCircle]} />
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  circle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
  },
  selectedCircle: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  selectedLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
});

export default CategoryIcon; 