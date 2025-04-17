import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  Button
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../constants/theme';
import FooterNav from '../components/FooterNav';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { initDatabase } from '../services/database';

// Update the ListItem interface to match our database structure
interface ListItem {
  id: number;
  name: string;
  created_at: string;
}

export default function ListsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  // Load lists from database when component mounts or sort order changes
  useEffect(() => {
    const loadLists = async () => {
      try {
        const db = await initDatabase();
        const [results] = await db.executeSql(
          `SELECT id, name, created_at FROM lists ORDER BY created_at ${sortNewestFirst ? 'DESC' : 'ASC'}`
        );
        const loadedLists = [];
        for (let i = 0; i < results.rows.length; i++) {
          loadedLists.push(results.rows.item(i));
        }
        setLists(loadedLists);
      } catch (error) {
        console.error('Error loading lists:', error);
      }
    };

    loadLists();
  }, [sortNewestFirst]);

  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst);
  };

  const handleNavigate = (screen: keyof Omit<RootStackParamList, 'Video'>) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const handleAddList = () => {
    setModalVisible(true);
  };

  const handleSaveList = async () => {
    if (newListName.trim() === '') return;
    try {
      const db = await initDatabase();
      await db.executeSql(
        `INSERT INTO lists (name) VALUES (?)`,
        [newListName]
      );
      setNewListName('');
      setModalVisible(false);
      // Fetch updated lists from the database
      const [results] = await db.executeSql(
        `SELECT id, name, created_at FROM lists ORDER BY created_at DESC`
      );
      const updatedLists = [];
      for (let i = 0; i < results.rows.length; i++) {
        updatedLists.push(results.rows.item(i));
      }
      setLists(updatedLists);
    } catch (error) {
      console.error('Error saving list:', error);
    }
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    return (
      <TouchableOpacity style={styles.listItem}>
        <View style={styles.listContent}>
          <Text style={styles.listTitle}>{item.name}</Text>
          <Text style={styles.listCount}>0 items</Text>
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
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <Text style={styles.sortText}>
            {sortNewestFirst ? 'Newest First' : 'Oldest First'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {lists.length === 0 ? (
          <Text style={styles.emptyText}>No lists created yet</Text>
        ) : (
          <FlatList
            data={lists}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
        <Image 
          source={require('../../assets/icons/roundaddbutton.png')} 
          style={styles.addButtonImage} 
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter list name"
              placeholderTextColor={COLORS.text.secondary}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveList}
                disabled={!newListName.trim()}
              >
                <Text style={styles.saveButtonText}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FooterNav onNavigate={handleNavigate} currentScreen="Lists" />
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text.primary,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  sortButton: {
    backgroundColor: COLORS.background,
    padding: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text.primary,
  },
}); 