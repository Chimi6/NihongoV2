import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import FooterNav from '../components/FooterNav';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Interface for list items (will be replaced with database items in the future)
interface ListItem {
  id: string;
  title: string;
  count: number;
  createdAt: string;
}

export const ListsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Sample data - this will be replaced with database calls in the future
  const [lists, setLists] = useState<ListItem[]>([
    { id: '1', title: 'JLPT N5 Vocabulary', count: 23, createdAt: '2024-03-15' },
    { id: '2', title: 'Basic Greetings', count: 12, createdAt: '2024-03-18' },
    { id: '3', title: 'Travel Phrases', count: 15, createdAt: '2024-03-20' },
    { id: '4', title: 'Food & Restaurants', count: 18, createdAt: '2024-03-22' },
    { id: '5', title: 'Common Verbs', count: 30, createdAt: '2024-03-25' },
  ]);

  const handleNavigate = (screen: keyof Omit<RootStackParamList, 'Video'>) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const handleAddList = () => {
    console.log('add list button pressed');
    // This will be replaced with functionality to add a new list
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    return (
      <TouchableOpacity style={styles.listItem}>
        <View style={styles.listContent}>
          <Text style={styles.listTitle}>{item.title}</Text>
          <Text style={styles.listCount}>{item.count} items</Text>
        </View>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lists</Text>
      </View>

      <View style={styles.content}>
        {lists.length === 0 ? (
          <Text style={styles.emptyText}>No lists created yet</Text>
        ) : (
          <FlatList
            data={lists}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
        <Image 
          source={require('../assets/icons/roundaddbutton.png')} 
          style={styles.addButtonImage} 
        />
      </TouchableOpacity>

      <FooterNav onNavigate={handleNavigate} currentScreen="Lists" />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
    padding: SPACING.md,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  listCount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  chevron: {
    marginLeft: SPACING.xs,
  },
  chevronText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontFamily: FONTS.regular,
  },
  addButton: {
    position: 'absolute',
    bottom: 80, // Position above the footer
    right: 20,
    zIndex: 1,
  },
  addButtonImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
}); 